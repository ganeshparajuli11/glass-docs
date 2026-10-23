/**
 * Pure helpers for working with images embedded in PDFs. No DOM, no pdf-lib:
 * everything here is byte-level and unit-tested in Node.
 */

export interface JpegInfo {
  width: number;
  height: number;
  /** Colour components: 1 = grey, 3 = YCbCr/RGB, 4 = CMYK/YCCK. */
  components: number;
}

const SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

/** Walks JPEG marker segments up to the start of scan. */
function* jpegSegments(
  bytes: Uint8Array,
): Generator<{ marker: number; start: number; end: number }> {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return;
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return;
    const marker = bytes[offset + 1];
    // Fill bytes (0xFF 0xFF) — skip one.
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    // Standalone markers without a length.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2) return;
    const end = offset + 2 + length;
    if (end > bytes.length) return;
    yield { marker, start: offset, end };
    if (marker === 0xda) return; // start of scan: entropy-coded data follows
    offset = end;
  }
}

/** Reads dimensions and component count from a JPEG header, or null. */
export function readJpegInfo(bytes: Uint8Array): JpegInfo | null {
  for (const seg of jpegSegments(bytes)) {
    if (SOF_MARKERS.has(seg.marker) && seg.end - seg.start >= 10) {
      const p = seg.start + 4;
      const height = (bytes[p + 1] << 8) | bytes[p + 2];
      const width = (bytes[p + 3] << 8) | bytes[p + 4];
      const components = bytes[p + 5];
      if (width === 0 || height === 0) return null;
      return { width, height, components };
    }
  }
  return null;
}

/**
 * Removes APP1 (EXIF/XMP) segments. PDF viewers ignore EXIF orientation, but
 * browsers honour it when decoding — so a JPEG must lose its EXIF before the
 * browser decodes it, or the re-encoded image would come out rotated.
 */
export function stripJpegApp1(bytes: Uint8Array): Uint8Array {
  const drop: Array<[number, number]> = [];
  let scanStart = -1;
  for (const seg of jpegSegments(bytes)) {
    if (seg.marker === 0xe1) drop.push([seg.start, seg.end]);
    if (seg.marker === 0xda) scanStart = seg.start;
  }
  if (drop.length === 0 || scanStart < 0) return bytes;
  const removed = drop.reduce((n, [s, e]) => n + (e - s), 0);
  const out = new Uint8Array(bytes.length - removed);
  let read = 0;
  let write = 0;
  for (const [s, e] of drop) {
    out.set(bytes.subarray(read, s), write);
    write += s - read;
    read = e;
  }
  out.set(bytes.subarray(read), write);
  return out;
}

/** Scales (width, height) so the longer edge is at most maxDimension. */
export function fitWithin(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * Reverses PNG row predictors (PDF /Predictor 10–15) for 8-bit samples.
 * Each input row is one filter-type byte followed by `columns * colors` bytes.
 * Returns null when the data does not fit the declared shape.
 */
export function unpredictPng(
  data: Uint8Array,
  columns: number,
  colors: number,
): Uint8Array | null {
  const bpp = colors;
  const rowLength = columns * colors;
  const stride = rowLength + 1;
  if (rowLength <= 0 || data.length < stride) return null;
  const rows = Math.floor(data.length / stride);
  const out = new Uint8Array(rows * rowLength);
  for (let r = 0; r < rows; r += 1) {
    const type = data[r * stride];
    const src = r * stride + 1;
    const dst = r * rowLength;
    const prev = dst - rowLength;
    for (let i = 0; i < rowLength; i += 1) {
      const x = data[src + i];
      const left = i >= bpp ? out[dst + i - bpp] : 0;
      const up = r > 0 ? out[prev + i] : 0;
      const upLeft = r > 0 && i >= bpp ? out[prev + i - bpp] : 0;
      let value: number;
      switch (type) {
        case 0:
          value = x;
          break;
        case 1:
          value = x + left;
          break;
        case 2:
          value = x + up;
          break;
        case 3:
          value = x + ((left + up) >> 1);
          break;
        case 4:
          value = x + paeth(left, up, upLeft);
          break;
        default:
          return null;
      }
      out[dst + i] = value & 0xff;
    }
  }
  return out;
}

/** Reverses the TIFF horizontal predictor (PDF /Predictor 2) for 8-bit samples. */
export function unpredictTiff(
  data: Uint8Array,
  columns: number,
  colors: number,
): Uint8Array {
  const rowLength = columns * colors;
  const out = new Uint8Array(data);
  for (let start = 0; start + rowLength <= out.length; start += rowLength) {
    for (let i = colors; i < rowLength; i += 1) {
      out[start + i] = (out[start + i] + out[start + i - colors]) & 0xff;
    }
  }
  return out;
}
