/**
 * Compress PDF: fixtures are built with pdf-lib, compressed with a fake
 * recoder (the real one needs a browser canvas), then re-parsed to check the
 * image streams were replaced — or deliberately left alone.
 */
import { describe, expect, it } from "vitest";
import {
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  type PDFDict,
} from "pdf-lib";
import {
  compressPdf,
  type ImageRecoder,
  type RecodeRequest,
} from "@/lib/pdf/operations/compress";
import { readJpegInfo } from "@/lib/pdf/image-data";
import { PdfOperationError } from "@/lib/pdf/operations/load";
import { JPEG_BIG, JPEG_CMYK, JPEG_SMALL } from "../fixtures/jpegs";
import { noise, pngFilter } from "../fixtures/pixels";

/** Returns the 20×15 fixture JPEG, which is what a 40×30 image fits to at max 20px. */
function fakeRecoder(calls: RecodeRequest[] = []): ImageRecoder {
  return async (request) => {
    calls.push(request);
    return { bytes: JPEG_SMALL, width: 20, height: 15 };
  };
}

const opts = { maxDimension: 20, quality: 0.5, minStreamBytes: 0 };

function imageStreams(doc: PDFDocument): Array<{ ref: PDFRef; dict: PDFDict; stream: PDFRawStream }> {
  return doc.context
    .enumerateIndirectObjects()
    .filter(
      (entry): entry is [PDFRef, PDFRawStream] =>
        entry[1] instanceof PDFRawStream &&
        entry[1].dict.lookup(PDFName.of("Subtype")) === PDFName.of("Image"),
    )
    .map(([ref, stream]) => ({ ref, dict: stream.dict, stream }));
}

async function pdfWithJpeg(jpeg: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const image = await doc.embedJpg(jpeg);
  const page = doc.addPage([300, 300]);
  page.drawImage(image, { x: 10, y: 10, width: 200, height: 150 });
  page.drawText("Hello, this text must survive.", { x: 10, y: 250, size: 12 });
  return doc.save();
}

describe("compressPdf — JPEG images", () => {
  it("downscales and re-encodes an embedded JPEG", async () => {
    const input = await pdfWithJpeg(JPEG_BIG);
    const calls: RecodeRequest[] = [];
    const { bytes, report } = await compressPdf(input, { ...opts, recoder: fakeRecoder(calls) });

    expect(calls).toHaveLength(1);
    expect(calls[0].source.kind).toBe("jpeg");
    expect(calls[0]).toMatchObject({ targetWidth: 20, targetHeight: 15, quality: 0.5 });

    expect(report).toMatchObject({ imagesFound: 1, imagesRecompressed: 1, reduced: true });
    expect(report.outputBytes).toBe(bytes.length);
    expect(bytes.length).toBeLessThan(input.length);

    const out = await PDFDocument.load(bytes);
    expect(out.getPageCount()).toBe(1);
    const [img] = imageStreams(out);
    expect(img.dict.lookup(PDFName.of("Width"))).toEqual(PDFNumber.of(20));
    expect(img.dict.lookup(PDFName.of("Height"))).toEqual(PDFNumber.of(15));
    expect(img.dict.lookup(PDFName.of("Filter"))).toBe(PDFName.of("DCTDecode"));
    expect(img.dict.lookup(PDFName.of("ColorSpace"))).toBe(PDFName.of("DeviceRGB"));
    expect(readJpegInfo(img.stream.contents)).toEqual({ width: 20, height: 15, components: 3 });
  });

  it("leaves CMYK JPEGs untouched", async () => {
    const input = await pdfWithJpeg(JPEG_CMYK);
    const calls: RecodeRequest[] = [];
    const { report } = await compressPdf(input, { ...opts, recoder: fakeRecoder(calls) });
    expect(calls).toHaveLength(0);
    expect(report.imagesRecompressed).toBe(0);
    expect(report.skipped["unsupported-colour"]).toBe(1);
  });

  it("keeps the original image when re-encoding does not save enough", async () => {
    const input = await pdfWithJpeg(JPEG_BIG);
    const bloated: ImageRecoder = async () => ({ bytes: JPEG_BIG, width: 40, height: 30 });
    const { report } = await compressPdf(input, { ...opts, maxDimension: 4000, recoder: bloated });
    expect(report.imagesRecompressed).toBe(0);
    expect(report.skipped["no-saving"]).toBe(1);
  });

  it("rejects a recoder result whose real size does not match its claim", async () => {
    const input = await pdfWithJpeg(JPEG_BIG);
    const liar: ImageRecoder = async () => ({ bytes: JPEG_SMALL, width: 10, height: 10 });
    const { report } = await compressPdf(input, { ...opts, recoder: liar });
    expect(report.imagesRecompressed).toBe(0);
    expect(report.skipped["decode-failed"]).toBe(1);
  });

  it("survives a recoder that throws", async () => {
    const input = await pdfWithJpeg(JPEG_BIG);
    const broken: ImageRecoder = async () => {
      throw new Error("decode error");
    };
    const { report } = await compressPdf(input, { ...opts, recoder: broken });
    expect(report.skipped["decode-failed"]).toBe(1);
  });

  it("skips small streams by default", async () => {
    const input = await pdfWithJpeg(JPEG_BIG);
    const calls: RecodeRequest[] = [];
    const { report } = await compressPdf(input, {
      maxDimension: 20,
      quality: 0.5,
      recoder: fakeRecoder(calls),
    });
    expect(calls).toHaveLength(0);
    expect(report.skipped["too-small"]).toBe(1);
  });
});

describe("compressPdf — Flate (raw pixel) images", () => {
  async function pdfWithRawImage(options: {
    predictor: boolean;
    colorSpace?: string;
    smask?: boolean;
  }): Promise<{ input: Uint8Array; pixels: Uint8Array }> {
    const width = 40;
    const height = 30;
    const pixels = noise(width * height * 3, 11);
    const doc = await PDFDocument.create();
    const data = options.predictor ? pngFilter(pixels, width, 3) : pixels;
    const dict: Record<string, unknown> = {
      Type: "XObject",
      Subtype: "Image",
      Width: width,
      Height: height,
      ColorSpace: options.colorSpace ?? "DeviceRGB",
      BitsPerComponent: 8,
    };
    if (options.predictor) {
      dict.DecodeParms = { Predictor: 15, Colors: 3, Columns: width, BitsPerComponent: 8 };
    }
    if (options.smask) {
      const mask = doc.context.flateStream(noise(width * height, 5), {
        Type: "XObject",
        Subtype: "Image",
        Width: width,
        Height: height,
        ColorSpace: "DeviceGray",
        BitsPerComponent: 8,
      });
      dict.SMask = doc.context.register(mask);
    }
    const stream = doc.context.flateStream(data, dict as never);
    const ref = doc.context.register(stream);
    // Reference the image from a page so the fixture resembles a real file.
    doc.addPage([300, 300]).node.newXObject("Im", ref);
    return { input: await doc.save(), pixels };
  }

  it("decodes PNG-predicted pixels exactly before re-encoding", async () => {
    const { input, pixels } = await pdfWithRawImage({ predictor: true });
    const calls: RecodeRequest[] = [];
    const { bytes, report } = await compressPdf(input, { ...opts, recoder: fakeRecoder(calls) });
    expect(calls).toHaveLength(1);
    const source = calls[0].source;
    expect(source.kind).toBe("raw");
    if (source.kind !== "raw") return;
    expect(source.channels).toBe(3);
    expect(Array.from(source.pixels)).toEqual(Array.from(pixels));
    expect(report.imagesRecompressed).toBe(1);

    const out = await PDFDocument.load(bytes);
    const [img] = imageStreams(out);
    expect(img.dict.lookup(PDFName.of("Filter"))).toBe(PDFName.of("DCTDecode"));
    expect(img.dict.lookup(PDFName.of("DecodeParms"))).toBeUndefined();
  });

  it("handles Flate images without a predictor", async () => {
    const { input, pixels } = await pdfWithRawImage({ predictor: false });
    const calls: RecodeRequest[] = [];
    await compressPdf(input, { ...opts, recoder: fakeRecoder(calls) });
    expect(calls).toHaveLength(1);
    const source = calls[0].source;
    expect(source.kind === "raw" && Array.from(source.pixels)).toEqual(Array.from(pixels));
  });

  it("never re-encodes a soft mask, but keeps the link to it", async () => {
    const { input } = await pdfWithRawImage({ predictor: false, smask: true });
    const calls: RecodeRequest[] = [];
    const { bytes, report } = await compressPdf(input, { ...opts, recoder: fakeRecoder(calls) });
    expect(report.imagesFound).toBe(2);
    expect(calls).toHaveLength(1);
    expect(report.skipped.mask).toBe(1);
    const out = await PDFDocument.load(bytes);
    const main = imageStreams(out).find((i) => i.dict.get(PDFName.of("SMask")) instanceof PDFRef);
    expect(main?.dict.lookup(PDFName.of("Filter"))).toBe(PDFName.of("DCTDecode"));
  });

  it("skips colour spaces it cannot convert safely", async () => {
    const { input } = await pdfWithRawImage({ predictor: false, colorSpace: "DeviceCMYK" });
    const calls: RecodeRequest[] = [];
    const { report } = await compressPdf(input, { ...opts, recoder: fakeRecoder(calls) });
    expect(calls).toHaveLength(0);
    expect(report.skipped["unsupported-colour"]).toBe(1);
  });
});

describe("compressPdf — honest output", () => {
  it("returns the original bytes when nothing gets smaller", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([200, 200]).drawText("Only text here", { x: 10, y: 100 });
    const input = await doc.save();
    const { bytes, report } = await compressPdf(input, { ...opts, recoder: fakeRecoder() });
    expect(report.imagesFound).toBe(0);
    expect(report.outputBytes).toBeLessThanOrEqual(report.originalBytes);
    if (!report.reduced) expect(bytes).toBe(input);
  });

  it("reports progress for every image", async () => {
    const input = await pdfWithJpeg(JPEG_BIG);
    const seen: Array<[number, number]> = [];
    await compressPdf(input, {
      ...opts,
      recoder: fakeRecoder(),
      onProgress: (done, total) => seen.push([done, total]),
    });
    expect(seen).toEqual([[1, 1]]);
  });

  it("maps a non-PDF input to a safe error", async () => {
    await expect(
      compressPdf(new Uint8Array([1, 2, 3, 4]), { ...opts, recoder: fakeRecoder() }),
    ).rejects.toBeInstanceOf(PdfOperationError);
  });
});
