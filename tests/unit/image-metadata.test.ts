import { describe, expect, it } from "vitest";
import {
  cleanFileName,
  cleanImageMetadata,
  crc32,
  describeFindings,
  detectImageKind,
  formatExifDate,
  formatGps,
  isHeifFamily,
  MetadataError,
  minimalOrientationTiff,
  parseExif,
} from "@/lib/image/metadata";
import { JPEG_EXIF, PNG_EXIF, PNG_PLAIN, WEBP_EXIF, WEBP_PLAIN } from "../fixtures/metadata";
import { JPEG_SMALL } from "../fixtures/jpegs";

const text = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const has = (bytes: Uint8Array, s: string) => {
  const needle = text(s);
  outer: for (let i = 0; i + needle.length <= bytes.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) if (bytes[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
};
const cat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};
function segment(marker: number, payload: Uint8Array): Uint8Array {
  const len = payload.length + 2;
  return cat(new Uint8Array([0xff, marker, len >> 8, len & 0xff]), payload);
}
/** Offset of the first SOS marker. */
function sosOffset(b: Uint8Array): number {
  for (let i = 2; i < b.length - 1; i += 1) if (b[i] === 0xff && b[i + 1] === 0xda) return i;
  return -1;
}
/** Everything from SOS to EOI — the compressed pixels. */
function scanData(b: Uint8Array): Uint8Array {
  const s = sosOffset(b);
  let e = b.length;
  for (let i = b.length - 2; i > s; i -= 1) {
    if (b[i] === 0xff && b[i + 1] === 0xd9) {
      e = i + 2;
      break;
    }
  }
  return b.subarray(s, e);
}
/** Marker list before SOS. */
function markers(b: Uint8Array): number[] {
  const out: number[] = [];
  let o = 2;
  while (o < b.length) {
    const m = b[o + 1];
    out.push(m);
    if (m === 0xda) break;
    o += 2 + ((b[o + 2] << 8) | b[o + 3]);
  }
  return out;
}

describe("detectImageKind / isHeifFamily", () => {
  it("recognises JPEG, PNG and WebP by signature", () => {
    expect(detectImageKind(JPEG_EXIF)).toBe("jpeg");
    expect(detectImageKind(PNG_EXIF)).toBe("png");
    expect(detectImageKind(WEBP_EXIF)).toBe("webp");
    expect(detectImageKind(text("GIF89a......"))).toBeNull();
  });

  it("spots HEIC files so the tool can say why it cannot clean them", () => {
    const heic = cat(new Uint8Array([0, 0, 0, 24]), text("ftypheic"), new Uint8Array(12));
    expect(isHeifFamily(heic)).toBe(true);
    expect(() => cleanImageMetadata(heic)).toThrow(MetadataError);
    try {
      cleanImageMetadata(heic);
    } catch (err) {
      expect((err as MetadataError).reason).toBe("heic");
    }
    expect(() => cleanImageMetadata(text("hello world, not an image"))).toThrow(MetadataError);
  });
});

describe("parseExif", () => {
  it("reads camera, date, serial, orientation and GPS from a phone-style block", () => {
    const { report } = cleanImageMetadata(JPEG_EXIF);
    const e = report.exif!;
    expect(e.make).toBe("Apple");
    expect(e.model).toBe("iPhone 15");
    expect(e.orientation).toBe(6);
    expect(e.dateTaken).toBe("2026:10:29 14:03:22");
    expect(e.serialNumber).toBe("SN12345");
    expect(e.hasGps).toBe(true);
    expect(e.gps!.latitude).toBeCloseTo(27 + 42 / 60 + 30 / 3600, 6);
    expect(e.gps!.longitude).toBeCloseTo(85 + 19 / 60 + 26.4 / 3600, 6);
    expect(e.gps!.altitude).toBeCloseTo(1400, 3);
  });

  it("never throws on garbage and reports nothing", () => {
    expect(parseExif(text("not tiff at all")).tagCount).toBe(0);
    const loop = new Uint8Array([0x49, 0x49, 42, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0]);
    expect(() => parseExif(loop)).not.toThrow();
  });

  it("builds a minimal orientation-only TIFF that parses back", () => {
    const tiff = minimalOrientationTiff(6);
    expect(tiff.length).toBe(26);
    const e = parseExif(tiff);
    expect(e.orientation).toBe(6);
    expect(e.tagCount).toBe(1);
    expect(e.hasGps).toBe(false);
  });
});

describe("JPEG cleaning", () => {
  it("removes EXIF, GPS and comments but leaves the compressed pixels byte-identical", () => {
    const r = cleanImageMetadata(JPEG_EXIF);
    expect(r.changed).toBe(true);
    expect(has(r.bytes, "iPhone")).toBe(false);
    expect(has(r.bytes, "SN12345")).toBe(false);
    expect(has(r.bytes, "shot by Ram")).toBe(false);
    expect(r.report.comments).toBe(1);
    expect(scanData(r.bytes)).toEqual(scanData(JPEG_EXIF));
    expect(r.bytes.length).toBeLessThan(JPEG_EXIF.length);
  });

  it("keeps only the orientation flag by default so photos stay upright", () => {
    const r = cleanImageMetadata(JPEG_EXIF);
    expect(r.keptOrientation).toBe(6);
    const after = cleanImageMetadata(r.bytes);
    expect(after.report.exif?.orientation).toBe(6);
    expect(after.report.exif?.tagCount).toBe(1);
    expect(after.report.exif?.gps).toBeNull();
  });

  it("drops orientation too when asked", () => {
    const r = cleanImageMetadata(JPEG_EXIF, { keepOrientation: false });
    expect(r.keptOrientation).toBeNull();
    expect(cleanImageMetadata(r.bytes).report.exif).toBeNull();
    expect(cleanImageMetadata(r.bytes).changed).toBe(false);
  });

  it("is idempotent: cleaning a clean file changes nothing", () => {
    const once = cleanImageMetadata(JPEG_EXIF).bytes;
    const twice = cleanImageMetadata(once);
    expect(twice.changed).toBe(false);
    expect(twice.bytes).toEqual(once);
  });

  it("removes XMP, IPTC, MPF, unknown APPn and appended data; keeps JFIF, ICC and Adobe", () => {
    const soi = JPEG_SMALL.subarray(0, 2);
    const rest = JPEG_SMALL.subarray(2);
    const icc = segment(0xe2, cat(text("ICC_PROFILE\0"), new Uint8Array([1, 1, 9, 9, 9])));
    const adobe = segment(0xee, cat(text("Adobe"), new Uint8Array([0, 100, 0, 0, 0, 0, 1])));
    const xmp = segment(0xe1, text('http://ns.adobe.com/xap/1.0/\0<x exif:GPSLongitude="85,19E"/>'));
    const iptc = segment(0xed, text("Photoshop 3.0\x008BIM caption Kathmandu"));
    const mpf = segment(0xe2, text("MPF\0MM\0*"));
    const app5 = segment(0xe5, text("vendor stuff"));
    const input = cat(soi, rest.subarray(0, 18), icc, adobe, xmp, iptc, mpf, app5, rest.subarray(18), text("MOTION-PHOTO-VIDEO"));
    // rest.subarray(0, 18) is the JFIF APP0 segment of the fixture.
    expect(markers(input).slice(0, 2)).toEqual([0xe0, 0xe2]);
    const r = cleanImageMetadata(input);
    expect(r.report.xmp).toBe(true);
    expect(r.report.xmpHasGps).toBe(true);
    expect(r.report.iptc).toBe(true);
    expect(r.report.trailingBytes).toBe("MOTION-PHOTO-VIDEO".length);
    expect(r.report.other).toEqual(expect.arrayContaining(["Multi-picture index (MPF)", "APP5 block"]));
    expect(has(r.bytes, "Kathmandu")).toBe(false);
    expect(has(r.bytes, "GPSLongitude")).toBe(false);
    expect(has(r.bytes, "MOTION")).toBe(false);
    expect(has(r.bytes, "ICC_PROFILE")).toBe(true);
    expect(has(r.bytes, "Adobe")).toBe(true);
    expect(markers(r.bytes)[0]).toBe(0xe0);
    expect(r.bytes.subarray(-2)).toEqual(new Uint8Array([0xff, 0xd9]));
    expect(scanData(r.bytes)).toEqual(scanData(JPEG_SMALL));
  });

  it("rejects a JPEG with no image data", () => {
    expect(() => cleanImageMetadata(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]))).toThrow(MetadataError);
  });
});

describe("PNG cleaning", () => {
  it("removes eXIf, text and XMP chunks, keeps image chunks and valid CRCs", () => {
    const r = cleanImageMetadata(PNG_EXIF);
    expect(r.report.exif?.gps).not.toBeNull();
    expect(r.report.textKeys).toEqual(["Author", "Software"]);
    expect(r.report.xmp).toBe(true);
    expect(has(r.bytes, "Author")).toBe(false);
    expect(has(r.bytes, "iPhone")).toBe(false);
    expect(has(r.bytes, "IDAT")).toBe(true);
    // Walk the output and check every CRC.
    const view = new DataView(r.bytes.buffer, r.bytes.byteOffset);
    const types: string[] = [];
    for (let o = 8; o < r.bytes.length; ) {
      const len = view.getUint32(o);
      const type = String.fromCharCode(...r.bytes.subarray(o + 4, o + 8));
      types.push(type);
      expect(view.getUint32(o + 8 + len)).toBe(crc32(r.bytes.subarray(o + 4, o + 8 + len)));
      o += 12 + len;
    }
    expect(types[0]).toBe("IHDR");
    expect(types[1]).toBe("eXIf"); // orientation only, before IDAT
    expect(types.at(-1)).toBe("IEND");
    expect(cleanImageMetadata(r.bytes).report.exif?.tagCount).toBe(1);
  });

  it("leaves a PNG with no metadata untouched", () => {
    const r = cleanImageMetadata(PNG_PLAIN);
    expect(r.changed).toBe(false);
    expect(describeFindings(r.report)).toEqual([]);
  });

  it("computes the standard CRC-32", () => {
    expect(crc32(text("IEND"))).toBe(0xae426082);
  });
});

describe("WebP cleaning", () => {
  it("removes EXIF and XMP chunks, fixes the VP8X flags and RIFF size", () => {
    const r = cleanImageMetadata(WEBP_EXIF, { keepOrientation: false });
    expect(r.report.exif?.model).toBe("iPhone 15");
    expect(r.report.xmp).toBe(true);
    expect(has(r.bytes, "EXIF")).toBe(false);
    expect(has(r.bytes, "XMP ")).toBe(false);
    const view = new DataView(r.bytes.buffer, r.bytes.byteOffset);
    expect(view.getUint32(4, true)).toBe(r.bytes.length - 8);
    expect(String.fromCharCode(...r.bytes.subarray(12, 16))).toBe("VP8X");
    expect(r.bytes[20] & 0x0c).toBe(0);
  });

  it("keeps orientation as a tiny EXIF chunk with the flag set", () => {
    const r = cleanImageMetadata(WEBP_EXIF);
    expect(r.keptOrientation).toBe(6);
    expect(r.bytes[20] & 0x08).toBe(0x08);
    expect(r.bytes[20] & 0x04).toBe(0);
    const again = cleanImageMetadata(r.bytes);
    expect(again.report.exif?.orientation).toBe(6);
    expect(again.changed).toBe(false);
  });

  it("leaves a simple WebP untouched", () => {
    expect(cleanImageMetadata(WEBP_PLAIN).changed).toBe(false);
  });
});

describe("reporting helpers", () => {
  it("lists location and identity first, in plain language", () => {
    const findings = describeFindings(cleanImageMetadata(JPEG_EXIF).report);
    expect(findings[0].label).toBe("GPS location");
    expect(findings[0].detail).toBe("27.70833° N, 85.32400° E, 1400 m altitude");
    expect(findings.map((f) => f.label)).toEqual(
      expect.arrayContaining(["Date taken", "Camera serial number", "Camera / phone", "Comments"]),
    );
    expect(findings.find((f) => f.label === "Camera / phone")?.detail).toBe("Apple iPhone 15");
    const firstSafe = findings.findIndex((f) => !f.sensitive);
    expect(findings.slice(firstSafe).every((f) => !f.sensitive)).toBe(true);
  });

  it("formats coordinates and EXIF dates", () => {
    expect(formatGps({ latitude: -33.8688, longitude: -151.2093 })).toBe("33.86880° S, 151.20930° W");
    expect(formatExifDate("2026:10:29 14:03:22")).toBe("2026-10-29 14:03");
    expect(formatExifDate("unknown")).toBe("unknown");
  });

  it("names the output after the input, keeping a valid extension", () => {
    expect(cleanFileName("IMG_2041.JPG", "jpeg")).toBe("IMG_2041-clean.jpg");
    expect(cleanFileName("photo.jpeg", "jpeg")).toBe("photo-clean.jpeg");
    expect(cleanFileName("scan.png", "png")).toBe("scan-clean.png");
    expect(cleanFileName("wrong.png", "jpeg")).toBe("wrong-clean.jpg");
    expect(cleanFileName("noext", "webp")).toBe("noext-clean.webp");
  });
});
