import { describe, expect, it } from "vitest";
import {
  fitWithin,
  readJpegInfo,
  stripJpegApp1,
  unpredictPng,
  unpredictTiff,
} from "@/lib/pdf/image-data";
import { percentSaved } from "@/lib/pdf/operations/compress";
import { JPEG_BIG, JPEG_CMYK, JPEG_GRAY } from "../fixtures/jpegs";
import { noise, pngFilter } from "../fixtures/pixels";

describe("readJpegInfo", () => {
  it("reads dimensions and component count", () => {
    expect(readJpegInfo(JPEG_BIG)).toEqual({ width: 40, height: 30, components: 3 });
    expect(readJpegInfo(JPEG_GRAY)).toEqual({ width: 40, height: 30, components: 1 });
    expect(readJpegInfo(JPEG_CMYK)?.components).toBe(4);
  });

  it("returns null for data that is not a JPEG", () => {
    expect(readJpegInfo(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
    expect(readJpegInfo(new Uint8Array(0))).toBeNull();
    expect(readJpegInfo(JPEG_BIG.subarray(0, 20))).toBeNull();
  });
});

describe("stripJpegApp1", () => {
  it("removes an EXIF segment and nothing else", () => {
    const exifPayload = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 1, 2, 3, 4];
    const app1 = [0xff, 0xe1, 0x00, exifPayload.length + 2, ...exifPayload];
    const withExif = new Uint8Array([0xff, 0xd8, ...app1, ...JPEG_BIG.subarray(2)]);
    const stripped = stripJpegApp1(withExif);
    expect(Array.from(stripped)).toEqual(Array.from(JPEG_BIG));
    expect(readJpegInfo(stripped)).toEqual(readJpegInfo(JPEG_BIG));
  });

  it("returns the input unchanged when there is no APP1", () => {
    expect(stripJpegApp1(JPEG_BIG)).toBe(JPEG_BIG);
  });
});

describe("fitWithin", () => {
  it("never enlarges", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("scales the longer edge down and keeps the aspect ratio", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(2480, 3508, 1600)).toEqual({ width: 1131, height: 1600 });
  });

  it("keeps at least one pixel on extreme aspect ratios", () => {
    expect(fitWithin(10000, 1, 100)).toEqual({ width: 100, height: 1 });
  });
});

describe("unpredictPng", () => {
  it("reverses all five PNG filter types", () => {
    const pixels = noise(12 * 10 * 3);
    expect(Array.from(unpredictPng(pngFilter(pixels, 12, 3), 12, 3) ?? [])).toEqual(
      Array.from(pixels),
    );
  });

  it("works for greyscale rows", () => {
    const pixels = noise(9 * 7, 3);
    expect(Array.from(unpredictPng(pngFilter(pixels, 9, 1), 9, 1) ?? [])).toEqual(
      Array.from(pixels),
    );
  });

  it("rejects an unknown filter type", () => {
    expect(unpredictPng(new Uint8Array([9, 1, 2, 3]), 3, 1)).toBeNull();
  });
});

describe("unpredictTiff", () => {
  it("reverses horizontal differencing", () => {
    // Row [10, 20, 30] encoded as [10, 10, 10].
    expect(Array.from(unpredictTiff(new Uint8Array([10, 10, 10]), 3, 1))).toEqual([10, 20, 30]);
  });
});

describe("percentSaved", () => {
  it("is never negative and rounds down", () => {
    expect(percentSaved(1000, 1200)).toBe(0);
    expect(percentSaved(1000, 1000)).toBe(0);
    expect(percentSaved(1000, 251)).toBe(74);
    expect(percentSaved(0, 0)).toBe(0);
  });
});
