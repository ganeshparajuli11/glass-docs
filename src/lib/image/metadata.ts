/**
 * Lossless photo metadata removal for JPEG, PNG and WebP.
 *
 * Works on the file's bytes only: metadata blocks (EXIF, XMP, IPTC, comments,
 * text chunks, data appended after the image) are cut out and everything that
 * describes the picture itself is copied unchanged. Nothing is decoded or
 * re-encoded, so quality and pixel data are identical to the original.
 *
 * Pure and DOM-free so it is unit-tested in Node.
 */

export type ImageKind = "jpeg" | "png" | "webp";

export interface GpsPosition {
  latitude: number;
  longitude: number;
  /** Metres above (positive) or below (negative) sea level, when recorded. */
  altitude?: number;
}

export interface ExifSummary {
  make?: string;
  model?: string;
  lensModel?: string;
  software?: string;
  dateTaken?: string;
  artist?: string;
  copyright?: string;
  description?: string;
  ownerName?: string;
  serialNumber?: string;
  orientation?: number;
  /** True when a GPS block exists, even if it holds no usable coordinates. */
  hasGps: boolean;
  gps: GpsPosition | null;
  hasThumbnail: boolean;
  /** Number of tags read across IFD0, the Exif IFD and the GPS IFD. */
  tagCount: number;
}

export interface MetadataReport {
  kind: ImageKind;
  exif: ExifSummary | null;
  xmp: boolean;
  xmpHasGps: boolean;
  iptc: boolean;
  comments: number;
  /** PNG text chunk keywords (tEXt/zTXt/iTXt), e.g. "Software", "Author". */
  textKeys: string[];
  /** Bytes after the end of the image (motion-photo video, extra images…). */
  trailingBytes: number;
  /** Other removed blocks, by a short technical name. */
  other: string[];
}

export interface CleanResult {
  bytes: Uint8Array;
  report: MetadataReport;
  /** Orientation value written back into a minimal EXIF block, or null. */
  keptOrientation: number | null;
  /** True when at least one byte of metadata was removed. */
  changed: boolean;
}

export interface CleanOptions {
  /**
   * Keep the EXIF orientation flag (and nothing else) so phone photos stay
   * the right way up. Default true.
   */
  keepOrientation?: boolean;
}

export class MetadataError extends Error {
  readonly reason: "unsupported" | "heic" | "corrupt";
  constructor(message: string, reason: "unsupported" | "heic" | "corrupt") {
    super(message);
    this.name = "MetadataError";
    this.reason = reason;
  }
}

// ---------------------------------------------------------------- detection

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let s = "";
  const end = Math.min(bytes.length, start + length);
  for (let i = start; i < end; i += 1) s += String.fromCharCode(bytes[i]);
  return s;
}

function startsWith(bytes: Uint8Array, offset: number, text: string): boolean {
  if (offset + text.length > bytes.length) return false;
  for (let i = 0; i < text.length; i += 1) {
    if (bytes[offset + i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (bytes.length >= 8 && PNG_SIGNATURE.every((b, i) => bytes[i] === b)) return "png";
  if (bytes.length >= 12 && startsWith(bytes, 0, "RIFF") && startsWith(bytes, 8, "WEBP")) {
    return "webp";
  }
  return null;
}

/** HEIC/HEIF/AVIF files are ISO-BMFF with an `ftyp` box naming the brand. */
export function isHeifFamily(bytes: Uint8Array): boolean {
  if (bytes.length < 12 || !startsWith(bytes, 4, "ftyp")) return false;
  const brand = ascii(bytes, 8, 4);
  return ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1", "avif", "avis"].includes(
    brand,
  );
}

// ---------------------------------------------------------------- EXIF/TIFF

const TYPE_SIZE: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8,
};

interface IfdEntry {
  tag: number;
  type: number;
  count: number;
  /** Absolute offset (within the TIFF block) of the value bytes. */
  valueOffset: number;
}

class TiffReader {
  readonly little: boolean;
  readonly b: Uint8Array;
  constructor(b: Uint8Array) {
    this.b = b;
    if (b.length < 8) throw new Error("short tiff");
    if (b[0] === 0x49 && b[1] === 0x49) this.little = true;
    else if (b[0] === 0x4d && b[1] === 0x4d) this.little = false;
    else throw new Error("bad tiff byte order");
    if (this.u16(2) !== 42) throw new Error("bad tiff magic");
  }
  u16(o: number): number {
    if (o + 2 > this.b.length) throw new Error("out of range");
    return this.little ? this.b[o] | (this.b[o + 1] << 8) : (this.b[o] << 8) | this.b[o + 1];
  }
  u32(o: number): number {
    if (o + 4 > this.b.length) throw new Error("out of range");
    const v = this.little
      ? this.b[o] | (this.b[o + 1] << 8) | (this.b[o + 2] << 16) | (this.b[o + 3] << 24)
      : (this.b[o] << 24) | (this.b[o + 1] << 16) | (this.b[o + 2] << 8) | this.b[o + 3];
    return v >>> 0;
  }
  /** Reads an IFD; returns its entries and the next-IFD offset (0 = none). */
  ifd(offset: number): { entries: IfdEntry[]; next: number } {
    const n = this.u16(offset);
    if (n > 1000) throw new Error("implausible ifd");
    const entries: IfdEntry[] = [];
    for (let i = 0; i < n; i += 1) {
      const e = offset + 2 + i * 12;
      const tag = this.u16(e);
      const type = this.u16(e + 2);
      const count = this.u32(e + 4);
      const size = (TYPE_SIZE[type] ?? 0) * count;
      const valueOffset = size <= 4 ? e + 8 : this.u32(e + 8);
      if (size > 0 && valueOffset + size <= this.b.length) {
        entries.push({ tag, type, count, valueOffset });
      }
    }
    const nextAt = offset + 2 + n * 12;
    const next = nextAt + 4 <= this.b.length ? this.u32(nextAt) : 0;
    return { entries, next };
  }
  text(e: IfdEntry): string | undefined {
    if (e.type !== 2 && e.type !== 7 && e.type !== 1) return undefined;
    let s = "";
    for (let i = 0; i < e.count; i += 1) {
      const c = this.b[e.valueOffset + i];
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    s = s.replace(/[\u0000-\u001f]/g, " ").trim();
    return s.length > 0 ? s.slice(0, 200) : undefined;
  }
  short(e: IfdEntry): number | undefined {
    if (e.type === 3) return this.u16(e.valueOffset);
    if (e.type === 4) return this.u32(e.valueOffset);
    if (e.type === 1) return this.b[e.valueOffset];
    return undefined;
  }
  rationals(e: IfdEntry): number[] | undefined {
    if (e.type !== 5 && e.type !== 10) return undefined;
    const out: number[] = [];
    for (let i = 0; i < e.count; i += 1) {
      const num = this.u32(e.valueOffset + i * 8);
      const den = this.u32(e.valueOffset + i * 8 + 4);
      if (den === 0) return undefined;
      out.push(num / den);
    }
    return out;
  }
}

const TAG = {
  description: 0x010e,
  make: 0x010f,
  model: 0x0110,
  orientation: 0x0112,
  software: 0x0131,
  dateTime: 0x0132,
  artist: 0x013b,
  copyright: 0x8298,
  exifIfd: 0x8769,
  gpsIfd: 0x8825,
  dateTimeOriginal: 0x9003,
  ownerName: 0xa430,
  bodySerial: 0xa431,
  lensModel: 0xa434,
} as const;

function dmsToDegrees(dms: number[] | undefined, ref: string | undefined): number | null {
  if (!dms || dms.length === 0) return null;
  const [d, m = 0, s = 0] = dms;
  let deg = d + m / 60 + s / 3600;
  if (!Number.isFinite(deg)) return null;
  if (ref === "S" || ref === "W") deg = -deg;
  return deg;
}

/** Parses a TIFF-structured EXIF block. Never throws; returns a best effort. */
export function parseExif(tiff: Uint8Array): ExifSummary {
  const summary: ExifSummary = { hasGps: false, gps: null, hasThumbnail: false, tagCount: 0 };
  let r: TiffReader;
  try {
    r = new TiffReader(tiff);
  } catch {
    return summary;
  }
  const visited = new Set<number>();
  const readIfd = (offset: number) => {
    if (offset < 8 || offset >= tiff.length || visited.has(offset)) return null;
    visited.add(offset);
    try {
      return r.ifd(offset);
    } catch {
      return null;
    }
  };

  const ifd0 = readIfd(r.u32(4));
  if (!ifd0) return summary;
  summary.tagCount += ifd0.entries.length;
  let exifOffset = 0;
  let gpsOffset = 0;
  for (const e of ifd0.entries) {
    switch (e.tag) {
      case TAG.make: summary.make = r.text(e); break;
      case TAG.model: summary.model = r.text(e); break;
      case TAG.software: summary.software = r.text(e); break;
      case TAG.artist: summary.artist = r.text(e); break;
      case TAG.copyright: summary.copyright = r.text(e); break;
      case TAG.description: summary.description = r.text(e); break;
      case TAG.dateTime: summary.dateTaken ??= r.text(e); break;
      case TAG.orientation: summary.orientation = r.short(e); break;
      case TAG.exifIfd: exifOffset = r.short(e) ?? 0; break;
      case TAG.gpsIfd: gpsOffset = r.short(e) ?? 0; break;
    }
  }
  if (ifd0.next > 0) {
    const ifd1 = readIfd(ifd0.next);
    if (ifd1 && ifd1.entries.length > 0) summary.hasThumbnail = true;
  }
  const exif = exifOffset ? readIfd(exifOffset) : null;
  if (exif) {
    summary.tagCount += exif.entries.length;
    for (const e of exif.entries) {
      switch (e.tag) {
        case TAG.dateTimeOriginal: summary.dateTaken = r.text(e) ?? summary.dateTaken; break;
        case TAG.ownerName: summary.ownerName = r.text(e); break;
        case TAG.bodySerial: summary.serialNumber = r.text(e); break;
        case TAG.lensModel: summary.lensModel = r.text(e); break;
      }
    }
  }
  const gps = gpsOffset ? readIfd(gpsOffset) : null;
  if (gps) {
    summary.tagCount += gps.entries.length;
    summary.hasGps = gps.entries.length > 0;
    const byTag = new Map(gps.entries.map((e) => [e.tag, e]));
    const get = (t: number) => byTag.get(t);
    const latRef = get(1) ? r.text(get(1)!) : undefined;
    const lonRef = get(3) ? r.text(get(3)!) : undefined;
    const lat = dmsToDegrees(get(2) ? r.rationals(get(2)!) : undefined, latRef);
    const lon = dmsToDegrees(get(4) ? r.rationals(get(4)!) : undefined, lonRef);
    if (lat !== null && lon !== null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(lat === 0 && lon === 0)) {
      const position: GpsPosition = { latitude: lat, longitude: lon };
      const alt = get(6) ? r.rationals(get(6)!) : undefined;
      if (alt && alt.length > 0) {
        const below = get(5) ? r.short(get(5)!) === 1 : false;
        position.altitude = below ? -alt[0] : alt[0];
      }
      summary.gps = position;
    }
  }
  return summary;
}

/** A big-endian TIFF block holding only an Orientation tag. 26 bytes. */
export function minimalOrientationTiff(orientation: number): Uint8Array {
  const b = new Uint8Array(26);
  b.set([0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08]); // MM, 42, IFD0 at 8
  b.set([0x00, 0x01], 8); // one entry
  b.set([0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01], 10); // 0x0112 SHORT ×1
  b.set([(orientation >> 8) & 0xff, orientation & 0xff, 0x00, 0x00], 18);
  // next IFD offset = 0 (bytes 22–25 already zero)
  return b;
}

function wantedOrientation(exif: ExifSummary | null, keep: boolean): number | null {
  const o = exif?.orientation;
  return keep && o !== undefined && o >= 2 && o <= 8 ? o : null;
}

function xmpMentionsGps(bytes: Uint8Array, start: number, end: number): boolean {
  return /GPS(Latitude|Longitude)/.test(ascii(bytes, start, Math.min(end - start, 2_000_000)));
}

function emptyReport(kind: ImageKind): MetadataReport {
  return {
    kind, exif: null, xmp: false, xmpHasGps: false, iptc: false,
    comments: 0, textKeys: [], trailingBytes: 0, other: [],
  };
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

// ---------------------------------------------------------------- JPEG

const EXIF_HEADER = "Exif\0\0";
const XMP_HEADER = "http://ns.adobe.com/xap/1.0/\0";
const XMP_EXT_HEADER = "http://ns.adobe.com/xmp/extension/\0";

function cleanJpeg(bytes: Uint8Array, keep: boolean): CleanResult {
  const report = emptyReport("jpeg");
  const head: Uint8Array[] = [bytes.subarray(0, 2)]; // SOI
  const body: Uint8Array[] = [];
  let offset = 2;
  let end = -1;
  let sawScan = false;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) throw new MetadataError("Unexpected data in JPEG", "corrupt");
    let m = offset + 1;
    while (m < bytes.length && bytes[m] === 0xff) m += 1; // fill bytes
    if (m >= bytes.length) break;
    const marker = bytes[m];
    const segStart = m - 1;
    if (marker === 0xd9) {
      body.push(bytes.subarray(segStart, m + 1));
      end = m + 1;
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      body.push(bytes.subarray(segStart, m + 1));
      offset = m + 1;
      continue;
    }
    if (m + 3 > bytes.length) throw new MetadataError("Truncated JPEG", "corrupt");
    const length = (bytes[m + 1] << 8) | bytes[m + 2];
    const segEnd = m + 1 + length;
    if (length < 2 || segEnd > bytes.length) throw new MetadataError("Truncated JPEG", "corrupt");
    const data = m + 3; // first payload byte
    const payloadLength = segEnd - data;

    let keepSegment = true;
    if (marker === 0xe0) {
      keepSegment = startsWith(bytes, data, "JFIF\0") || startsWith(bytes, data, "JFXX\0");
      if (!keepSegment) report.other.push("APP0 block");
    } else if (marker === 0xe1) {
      keepSegment = false;
      if (startsWith(bytes, data, EXIF_HEADER) && report.exif === null) {
        report.exif = parseExif(bytes.subarray(data + EXIF_HEADER.length, segEnd));
      } else if (startsWith(bytes, data, EXIF_HEADER)) {
        report.other.push("Extra EXIF block");
      } else if (startsWith(bytes, data, XMP_HEADER) || startsWith(bytes, data, XMP_EXT_HEADER)) {
        report.xmp = true;
        if (xmpMentionsGps(bytes, data, segEnd)) report.xmpHasGps = true;
      } else {
        report.other.push("APP1 block");
      }
    } else if (marker === 0xe2) {
      keepSegment = startsWith(bytes, data, "ICC_PROFILE\0");
      if (!keepSegment) {
        report.other.push(startsWith(bytes, data, "MPF\0") ? "Multi-picture index (MPF)" : "APP2 block");
      }
    } else if (marker === 0xed) {
      keepSegment = false;
      if (startsWith(bytes, data, "Photoshop 3.0\0")) report.iptc = true;
      else report.other.push("APP13 block");
    } else if (marker === 0xee) {
      // Adobe APP14 tells decoders how colours are transformed — required.
      keepSegment = startsWith(bytes, data, "Adobe");
      if (!keepSegment) report.other.push("APP14 block");
    } else if (marker >= 0xe3 && marker <= 0xef) {
      keepSegment = false;
      report.other.push(`APP${marker - 0xe0} block`);
    } else if (marker === 0xfe) {
      keepSegment = false;
      if (payloadLength > 0) report.comments += 1;
    }

    if (keepSegment) {
      if (marker === 0xe0 && body.length === 0) {
        head.push(bytes.subarray(segStart, segEnd));
      } else {
        body.push(bytes.subarray(segStart, segEnd));
      }
    }

    offset = segEnd;
    if (marker === 0xda) {
      sawScan = true;
      // Entropy-coded data runs until the next marker that is not a stuffed
      // 0xFF00, a restart marker or a fill byte.
      let i = segEnd;
      while (i < bytes.length - 1) {
        if (bytes[i] === 0xff) {
          const next = bytes[i + 1];
          if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
            i += 2;
            continue;
          }
          if (next === 0xff) {
            i += 1;
            continue;
          }
          break;
        }
        i += 1;
      }
      if (i >= bytes.length - 1) i = bytes.length;
      body.push(bytes.subarray(segEnd, i));
      offset = i;
    }
  }

  if (!sawScan) throw new MetadataError("JPEG has no image data", "corrupt");
  if (end > 0) report.trailingBytes = bytes.length - end;

  const orientation = wantedOrientation(report.exif, keep);
  if (orientation !== null) {
    const tiff = minimalOrientationTiff(orientation);
    const len = 2 + EXIF_HEADER.length + tiff.length;
    const app1 = new Uint8Array(2 + len);
    app1.set([0xff, 0xe1, (len >> 8) & 0xff, len & 0xff]);
    for (let i = 0; i < EXIF_HEADER.length; i += 1) app1[4 + i] = EXIF_HEADER.charCodeAt(i);
    app1.set(tiff, 4 + EXIF_HEADER.length);
    head.push(app1);
  }
  const out = concat([...head, ...body]);
  return finish(bytes, out, report, orientation);
}

// ---------------------------------------------------------------- PNG

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i += 1) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/** Chunks that describe how to draw the image. Everything else ancillary goes. */
const PNG_KEEP = new Set([
  "IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB", "iCCP", "sBIT",
  "bKGD", "pHYs", "hIST", "sPLT", "cICP", "mDCV", "cLLI", "acTL", "fcTL", "fdAT",
]);

function cleanPng(bytes: Uint8Array, keep: boolean): CleanResult {
  const report = emptyReport("png");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const kept: Uint8Array[] = [];
  let offset = 8;
  let ihdrEnd = -1;
  let end = -1;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    const chunkEnd = offset + 12 + length;
    if (chunkEnd > bytes.length || !/^[A-Za-z]{4}$/.test(type)) {
      throw new MetadataError("Truncated PNG", "corrupt");
    }
    const data = offset + 8;
    const critical = type.charCodeAt(0) < 0x61; // upper-case first letter
    if (PNG_KEEP.has(type) || critical) {
      kept.push(bytes.subarray(offset, chunkEnd));
      if (type === "IHDR") ihdrEnd = kept.length;
    } else if (type === "eXIf") {
      if (report.exif === null) report.exif = parseExif(bytes.subarray(data, data + length));
    } else if (type === "tEXt" || type === "zTXt" || type === "iTXt") {
      let k = data;
      while (k < data + length && k < data + 80 && bytes[k] !== 0) k += 1;
      const key = ascii(bytes, data, k - data) || type;
      if (key === "XML:com.adobe.xmp") {
        report.xmp = true;
        if (xmpMentionsGps(bytes, data, data + length)) report.xmpHasGps = true;
      } else if (key === "Raw profile type exif" || key === "Raw profile type APP1") {
        report.other.push("EXIF text block");
      } else if (!report.textKeys.includes(key)) {
        report.textKeys.push(key);
      }
    } else if (type === "tIME") {
      report.other.push("Last-modified time (tIME)");
    } else {
      report.other.push(`${type} chunk`);
    }
    offset = chunkEnd;
    if (type === "IEND") {
      end = chunkEnd;
      break;
    }
  }
  if (ihdrEnd < 0) throw new MetadataError("PNG has no header", "corrupt");
  if (end < 0) throw new MetadataError("PNG has no end chunk", "corrupt");
  report.trailingBytes = bytes.length - end;

  const orientation = wantedOrientation(report.exif, keep);
  const parts = [bytes.subarray(0, 8), ...kept];
  if (orientation !== null) {
    // eXIf must come before the image data; put it straight after IHDR.
    parts.splice(1 + ihdrEnd, 0, pngChunk("eXIf", minimalOrientationTiff(orientation)));
  }
  return finish(bytes, concat(parts), report, orientation);
}

// ---------------------------------------------------------------- WebP

function cleanWebp(bytes: Uint8Array, keep: boolean): CleanResult {
  const report = emptyReport("webp");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const riffEnd = Math.min(bytes.length, 8 + view.getUint32(4, true));
  const kept: Uint8Array[] = [];
  let vp8xIndex = -1;
  let offset = 12;
  while (offset + 8 <= riffEnd) {
    const type = ascii(bytes, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const padded = size + (size & 1);
    const chunkEnd = Math.min(offset + 8 + padded, riffEnd);
    if (offset + 8 + size > riffEnd) throw new MetadataError("Truncated WebP", "corrupt");
    const data = offset + 8;
    if (type === "EXIF") {
      let start = data;
      if (startsWith(bytes, start, EXIF_HEADER)) start += EXIF_HEADER.length;
      if (report.exif === null) report.exif = parseExif(bytes.subarray(start, data + size));
    } else if (type === "XMP ") {
      report.xmp = true;
      if (xmpMentionsGps(bytes, data, data + size)) report.xmpHasGps = true;
    } else if (["VP8X", "VP8 ", "VP8L", "ALPH", "ANIM", "ANMF", "ICCP"].includes(type)) {
      if (type === "VP8X") vp8xIndex = kept.length;
      kept.push(bytes.slice(offset, chunkEnd));
    } else {
      report.other.push(`${type.trim()} chunk`);
    }
    offset = chunkEnd;
  }
  if (kept.length === 0) throw new MetadataError("WebP has no image data", "corrupt");
  report.trailingBytes = bytes.length - riffEnd;

  const orientation = vp8xIndex >= 0 ? wantedOrientation(report.exif, keep) : null;
  if (vp8xIndex >= 0) {
    const vp8x = kept[vp8xIndex];
    // Flags: 0x08 = EXIF present, 0x04 = XMP present.
    vp8x[8] = (vp8x[8] & ~0x0c) | (orientation !== null ? 0x08 : 0);
  }
  if (orientation !== null) {
    const tiff = minimalOrientationTiff(orientation);
    const chunk = new Uint8Array(8 + tiff.length);
    chunk.set([0x45, 0x58, 0x49, 0x46]); // "EXIF"
    new DataView(chunk.buffer).setUint32(4, tiff.length, true);
    chunk.set(tiff, 8);
    kept.push(chunk); // 26 bytes: already even, no padding
  }
  const header = bytes.slice(0, 12);
  const out = concat([header, ...kept]);
  new DataView(out.buffer).setUint32(4, out.length - 8, true);
  return finish(bytes, out, report, orientation);
}

// ---------------------------------------------------------------- public

function finish(
  original: Uint8Array,
  out: Uint8Array,
  report: MetadataReport,
  orientation: number | null,
): CleanResult {
  const changed = out.length !== original.length || out.some((b, i) => b !== original[i]);
  return { bytes: changed ? out : original, report, keptOrientation: orientation, changed };
}

export function cleanImageMetadata(bytes: Uint8Array, options: CleanOptions = {}): CleanResult {
  const keep = options.keepOrientation ?? true;
  const kind = detectImageKind(bytes);
  if (kind === "jpeg") return cleanJpeg(bytes, keep);
  if (kind === "png") return cleanPng(bytes, keep);
  if (kind === "webp") return cleanWebp(bytes, keep);
  if (isHeifFamily(bytes)) throw new MetadataError("HEIC/HEIF/AVIF is not supported", "heic");
  throw new MetadataError("Not a JPEG, PNG or WebP file", "unsupported");
}

// ---------------------------------------------------------------- reporting

export interface Finding {
  label: string;
  detail: string;
  /** Could identify a person or place. */
  sensitive: boolean;
}

export function formatGps(gps: GpsPosition): string {
  const lat = `${Math.abs(gps.latitude).toFixed(5)}° ${gps.latitude >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(gps.longitude).toFixed(5)}° ${gps.longitude >= 0 ? "E" : "W"}`;
  return `${lat}, ${lon}`;
}

/** Turns a raw EXIF date ("2026:10:29 14:03:22") into "2026-10-29 14:03". */
export function formatExifDate(value: string): string {
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  return m ? `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}` : value;
}

/** Plain-language list of what was found (and removed), most sensitive first. */
export function describeFindings(report: MetadataReport): Finding[] {
  const out: Finding[] = [];
  const e = report.exif;
  if (e?.gps) {
    const alt = e.gps.altitude !== undefined ? `, ${Math.round(e.gps.altitude)} m altitude` : "";
    out.push({ label: "GPS location", detail: `${formatGps(e.gps)}${alt}`, sensitive: true });
  } else if (e?.hasGps || report.xmpHasGps) {
    out.push({ label: "GPS location", detail: "Location fields present", sensitive: true });
  }
  if (e?.dateTaken) {
    out.push({ label: "Date taken", detail: formatExifDate(e.dateTaken), sensitive: true });
  }
  if (e?.ownerName) out.push({ label: "Camera owner", detail: e.ownerName, sensitive: true });
  if (e?.artist) out.push({ label: "Author", detail: e.artist, sensitive: true });
  if (e?.serialNumber) {
    out.push({ label: "Camera serial number", detail: e.serialNumber, sensitive: true });
  }
  const camera = [e?.make, e?.model].filter(Boolean).join(" ");
  if (camera) {
    // Phones often repeat the brand in the model ("Apple iPhone 15").
    const tidy = e?.make && e.model?.startsWith(e.make) ? e.model : camera;
    out.push({ label: "Camera / phone", detail: tidy, sensitive: false });
  }
  if (e?.lensModel) out.push({ label: "Lens", detail: e.lensModel, sensitive: false });
  if (e?.software) out.push({ label: "Software", detail: e.software, sensitive: false });
  if (e?.copyright) out.push({ label: "Copyright note", detail: e.copyright, sensitive: false });
  if (e?.description) out.push({ label: "Description", detail: e.description, sensitive: false });
  if (e?.hasThumbnail) {
    out.push({
      label: "Embedded thumbnail",
      detail: "A small preview copy of the photo (can show the original before edits)",
      sensitive: false,
    });
  }
  if (e && out.length === 0) {
    out.push({ label: "EXIF data", detail: `${e.tagCount} technical tags`, sensitive: false });
  }
  if (report.xmp) {
    out.push({
      label: "XMP metadata",
      detail: "Editing history and descriptive fields added by apps",
      sensitive: report.xmpHasGps,
    });
  }
  if (report.iptc) {
    out.push({
      label: "IPTC / Photoshop data",
      detail: "Caption, keywords, creator or location fields",
      sensitive: true,
    });
  }
  if (report.comments > 0) {
    out.push({
      label: "Comments",
      detail: report.comments === 1 ? "1 comment block" : `${report.comments} comment blocks`,
      sensitive: false,
    });
  }
  if (report.textKeys.length > 0) {
    out.push({ label: "Text fields", detail: report.textKeys.slice(0, 6).join(", "), sensitive: false });
  }
  if (report.trailingBytes > 0) {
    out.push({
      label: "Hidden data after the image",
      detail: "Extra bytes appended to the file, such as a motion-photo video or a second image",
      sensitive: false,
    });
  }
  const others = [...new Set(report.other)];
  if (others.length > 0) {
    out.push({ label: "Other blocks", detail: others.slice(0, 6).join(", "), sensitive: false });
  }
  return out.sort((a, b) => Number(b.sensitive) - Number(a.sensitive));
}

/** The output file name: same stem, "-clean", original extension when valid. */
export function cleanFileName(name: string, kind: ImageKind): string {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
  const valid: Record<ImageKind, string[]> = {
    jpeg: ["jpg", "jpeg", "jpe", "jfif"],
    png: ["png"],
    webp: ["webp"],
  };
  const useExt = valid[kind].includes(ext) ? ext : kind === "jpeg" ? "jpg" : kind;
  return `${stem || "photo"}-clean.${useExt}`;
}
