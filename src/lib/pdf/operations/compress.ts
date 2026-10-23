import {
  PDFArray,
  PDFBool,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  decodePDFRawStream,
  type PDFObject,
} from "pdf-lib";
import { loadPdf, savePdf } from "./load";
import {
  fitWithin,
  readJpegInfo,
  stripJpegApp1,
  unpredictPng,
  unpredictTiff,
} from "../image-data";

/**
 * Compress PDF by re-encoding the images inside it.
 *
 * Text, vector graphics and fonts are left exactly as they are; only raster
 * images that can be handled safely are downscaled and re-encoded as JPEG.
 * The actual pixel work is injected (`recoder`) so this module stays pure and
 * testable in Node, while the browser supplies a canvas implementation.
 */

export type CompressPreset = "light" | "balanced" | "strong";

export const compressPresets: Record<
  CompressPreset,
  { maxDimension: number; quality: number; label: string; hint: string }
> = {
  light: {
    maxDimension: 2400,
    quality: 0.82,
    label: "Light",
    hint: "Smallest quality change. Good for print-ready documents.",
  },
  balanced: {
    maxDimension: 1600,
    quality: 0.7,
    label: "Balanced",
    hint: "Readable scans and clear photos at a much smaller size.",
  },
  strong: {
    maxDimension: 1100,
    quality: 0.5,
    label: "Strong",
    hint: "Smallest file for email and upload limits; images look softer.",
  },
};

export type ImageSource =
  | { kind: "jpeg"; bytes: Uint8Array; width: number; height: number; channels: 1 | 3 }
  | { kind: "raw"; pixels: Uint8Array; width: number; height: number; channels: 1 | 3 };

export interface RecodeRequest {
  source: ImageSource;
  targetWidth: number;
  targetHeight: number;
  quality: number;
}

export interface RecodedImage {
  /** Baseline RGB JPEG bytes. */
  bytes: Uint8Array;
  width: number;
  height: number;
}

/** Decodes, resizes and JPEG-encodes one image. Return null to skip it. */
export type ImageRecoder = (request: RecodeRequest) => Promise<RecodedImage | null>;

export type SkipReason =
  | "too-small"
  | "mask"
  | "unsupported-colour"
  | "unsupported-encoding"
  | "no-saving"
  | "decode-failed";

export interface CompressReport {
  originalBytes: number;
  outputBytes: number;
  /** True when the returned file is smaller than the input. */
  reduced: boolean;
  imagesFound: number;
  imagesRecompressed: number;
  skipped: Partial<Record<SkipReason, number>>;
}

export interface CompressOptions {
  maxDimension: number;
  /** JPEG quality 0..1. */
  quality: number;
  recoder: ImageRecoder;
  /** Image streams smaller than this are left alone (default 8 KiB). */
  minStreamBytes?: number;
  /** A replacement must be at most this fraction of the original (default 0.9). */
  maxReplacementRatio?: number;
  onProgress?: (done: number, total: number) => void;
}

export interface CompressResult {
  bytes: Uint8Array;
  report: CompressReport;
}

const N = {
  Subtype: PDFName.of("Subtype"),
  Image: PDFName.of("Image"),
  Width: PDFName.of("Width"),
  Height: PDFName.of("Height"),
  BitsPerComponent: PDFName.of("BitsPerComponent"),
  ColorSpace: PDFName.of("ColorSpace"),
  Filter: PDFName.of("Filter"),
  DecodeParms: PDFName.of("DecodeParms"),
  Decode: PDFName.of("Decode"),
  ImageMask: PDFName.of("ImageMask"),
  Mask: PDFName.of("Mask"),
  SMask: PDFName.of("SMask"),
  N: PDFName.of("N"),
  Predictor: PDFName.of("Predictor"),
  Colors: PDFName.of("Colors"),
  Columns: PDFName.of("Columns"),
  DCTDecode: PDFName.of("DCTDecode"),
  FlateDecode: PDFName.of("FlateDecode"),
  DeviceRGB: PDFName.of("DeviceRGB"),
  DeviceGray: PDFName.of("DeviceGray"),
  ICCBased: PDFName.of("ICCBased"),
  CalRGB: PDFName.of("CalRGB"),
  CalGray: PDFName.of("CalGray"),
  Length: PDFName.of("Length"),
};

function num(dict: PDFDict, key: PDFName): number | undefined {
  const value = dict.lookup(key);
  return value instanceof PDFNumber ? value.asNumber() : undefined;
}

/** Number of colour channels for colour spaces we can safely re-encode as RGB. */
function channelsOf(dict: PDFDict): 1 | 3 | null {
  const cs = dict.lookup(N.ColorSpace);
  if (cs === N.DeviceRGB) return 3;
  if (cs === N.DeviceGray) return 1;
  if (cs instanceof PDFArray && cs.size() >= 1) {
    const family = cs.lookup(0);
    if (family === N.CalRGB) return 3;
    if (family === N.CalGray) return 1;
    if (family === N.ICCBased && cs.size() >= 2) {
      const profile = cs.lookup(1);
      const dictOf = profile instanceof PDFRawStream ? profile.dict : profile instanceof PDFDict ? profile : null;
      const n = dictOf ? num(dictOf, N.N) : undefined;
      if (n === 3) return 3;
      if (n === 1) return 1;
    }
  }
  return null;
}

/** The single filter name of a stream, "none", or null when there is a chain. */
function singleFilter(dict: PDFDict): PDFName | "none" | null {
  const filter = dict.lookup(N.Filter);
  if (filter === undefined) return "none";
  if (filter instanceof PDFName) return filter;
  if (filter instanceof PDFArray) {
    if (filter.size() === 0) return "none";
    if (filter.size() === 1) {
      const only = filter.lookup(0);
      return only instanceof PDFName ? only : null;
    }
  }
  return null;
}

function decodeParms(dict: PDFDict): PDFDict | undefined {
  const parms = dict.lookup(N.DecodeParms);
  if (parms instanceof PDFDict) return parms;
  if (parms instanceof PDFArray && parms.size() === 1) {
    const only = parms.lookup(0);
    if (only instanceof PDFDict) return only;
  }
  return undefined;
}

type Analysis = { ok: true; source: ImageSource } | { ok: false; reason: SkipReason };

function analyse(
  stream: PDFRawStream,
  ref: PDFRef,
  maskRefs: Set<string>,
  minStreamBytes: number,
): Analysis {
  const { dict } = stream;
  if (dict.lookup(N.ImageMask) === PDFBool.True || maskRefs.has(ref.toString())) {
    return { ok: false, reason: "mask" };
  }
  // Colour-key masks rely on exact pixel values, which lossy JPEG destroys.
  if (dict.lookup(N.Mask) instanceof PDFArray) return { ok: false, reason: "mask" };
  if (dict.lookup(N.Decode) !== undefined) return { ok: false, reason: "unsupported-colour" };

  const width = num(dict, N.Width);
  const height = num(dict, N.Height);
  if (!width || !height || width < 1 || height < 1) {
    return { ok: false, reason: "unsupported-encoding" };
  }
  if (stream.contents.length < minStreamBytes) return { ok: false, reason: "too-small" };

  const channels = channelsOf(dict);
  if (channels === null) return { ok: false, reason: "unsupported-colour" };
  if ((num(dict, N.BitsPerComponent) ?? 8) !== 8) {
    return { ok: false, reason: "unsupported-colour" };
  }

  const filter = singleFilter(dict);
  if (filter === N.DCTDecode) {
    const info = readJpegInfo(stream.contents);
    if (!info || info.components !== channels || info.width !== width || info.height !== height) {
      return { ok: false, reason: "unsupported-colour" };
    }
    return {
      ok: true,
      source: { kind: "jpeg", bytes: stripJpegApp1(stream.contents), width, height, channels },
    };
  }

  if (filter === N.FlateDecode || filter === "none") {
    let pixels: Uint8Array;
    try {
      pixels = filter === "none" ? stream.contents : decodePDFRawStream(stream).decode();
    } catch {
      return { ok: false, reason: "decode-failed" };
    }
    const parms = decodeParms(dict);
    const predictor = parms ? (num(parms, N.Predictor) ?? 1) : 1;
    if (predictor > 1) {
      const colors = parms ? (num(parms, N.Colors) ?? 1) : 1;
      const columns = parms ? (num(parms, N.Columns) ?? 1) : 1;
      const bpc = parms ? (num(parms, PDFName.of("BitsPerComponent")) ?? 8) : 8;
      if (colors !== channels || columns !== width || bpc !== 8) {
        return { ok: false, reason: "unsupported-encoding" };
      }
      if (predictor >= 10) {
        const unfiltered = unpredictPng(pixels, columns, colors);
        if (!unfiltered) return { ok: false, reason: "decode-failed" };
        pixels = unfiltered;
      } else if (predictor === 2) {
        pixels = unpredictTiff(pixels, columns, colors);
      } else {
        return { ok: false, reason: "unsupported-encoding" };
      }
    }
    const expected = width * height * channels;
    if (pixels.length < expected) return { ok: false, reason: "decode-failed" };
    return {
      ok: true,
      source: { kind: "raw", pixels: pixels.subarray(0, expected), width, height, channels },
    };
  }

  return { ok: false, reason: "unsupported-encoding" };
}

function collectImages(doc: Awaited<ReturnType<typeof loadPdf>>) {
  const images: Array<{ ref: PDFRef; stream: PDFRawStream }> = [];
  const maskRefs = new Set<string>();
  for (const [ref, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    if (object.dict.lookup(N.Subtype) !== N.Image) continue;
    images.push({ ref, stream: object });
    for (const key of [N.SMask, N.Mask]) {
      const target: PDFObject | undefined = object.dict.get(key);
      if (target instanceof PDFRef) maskRefs.add(target.toString());
    }
  }
  return { images, maskRefs };
}

export async function compressPdf(
  input: Uint8Array,
  options: CompressOptions,
): Promise<CompressResult> {
  const {
    maxDimension,
    quality,
    recoder,
    minStreamBytes = 8 * 1024,
    maxReplacementRatio = 0.9,
    onProgress,
  } = options;

  const doc = await loadPdf(input);
  const { images, maskRefs } = collectImages(doc);
  const skipped: CompressReport["skipped"] = {};
  const skip = (reason: SkipReason) => {
    skipped[reason] = (skipped[reason] ?? 0) + 1;
  };
  let recompressed = 0;

  for (let i = 0; i < images.length; i += 1) {
    const { ref, stream } = images[i];
    const analysis = analyse(stream, ref, maskRefs, minStreamBytes);
    if (!analysis.ok) {
      skip(analysis.reason);
    } else {
      const { source } = analysis;
      const target = fitWithin(source.width, source.height, maxDimension);
      let recoded: RecodedImage | null = null;
      try {
        recoded = await recoder({
          source,
          targetWidth: target.width,
          targetHeight: target.height,
          quality,
        });
      } catch {
        recoded = null;
      }
      const info = recoded ? readJpegInfo(recoded.bytes) : null;
      if (!recoded || !info || info.width !== recoded.width || info.height !== recoded.height) {
        skip("decode-failed");
      } else if (
        info.components !== 3 && info.components !== 1
      ) {
        skip("decode-failed");
      } else if (recoded.bytes.length > stream.contents.length * maxReplacementRatio) {
        skip("no-saving");
      } else {
        const dict = stream.dict.clone(doc.context);
        dict.set(N.Filter, N.DCTDecode);
        dict.delete(N.DecodeParms);
        dict.delete(N.Length);
        dict.set(N.Width, PDFNumber.of(recoded.width));
        dict.set(N.Height, PDFNumber.of(recoded.height));
        dict.set(N.BitsPerComponent, PDFNumber.of(8));
        dict.set(N.ColorSpace, info.components === 1 ? N.DeviceGray : N.DeviceRGB);
        doc.context.assign(ref, PDFRawStream.of(dict, recoded.bytes));
        recompressed += 1;
      }
    }
    onProgress?.(i + 1, images.length);
  }

  const saved = await savePdf(doc);
  const reduced = saved.length < input.length;
  return {
    bytes: reduced ? saved : input,
    report: {
      originalBytes: input.length,
      outputBytes: reduced ? saved.length : input.length,
      reduced,
      imagesFound: images.length,
      imagesRecompressed: recompressed,
      skipped,
    },
  };
}

/** Percentage saved, rounded down, never negative. */
export function percentSaved(originalBytes: number, outputBytes: number): number {
  if (originalBytes <= 0 || outputBytes >= originalBytes) return 0;
  return Math.floor((1 - outputBytes / originalBytes) * 100);
}
