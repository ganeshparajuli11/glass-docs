/** Deterministic pixel helpers for image-stream tests. */

/** PNG-filters rows the way an encoder would, cycling through every filter type. */
export function pngFilter(pixels: Uint8Array, columns: number, colors: number): Uint8Array {
  const rowLength = columns * colors;
  const rows = pixels.length / rowLength;
  const out = new Uint8Array(rows * (rowLength + 1));
  for (let r = 0; r < rows; r += 1) {
    const type = r % 5;
    out[r * (rowLength + 1)] = type;
    for (let i = 0; i < rowLength; i += 1) {
      const x = pixels[r * rowLength + i];
      const a = i >= colors ? pixels[r * rowLength + i - colors] : 0;
      const b = r > 0 ? pixels[(r - 1) * rowLength + i] : 0;
      const c = r > 0 && i >= colors ? pixels[(r - 1) * rowLength + i - colors] : 0;
      let pred = 0;
      if (type === 1) pred = a;
      if (type === 2) pred = b;
      if (type === 3) pred = (a + b) >> 1;
      if (type === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[r * (rowLength + 1) + 1 + i] = (x - pred) & 0xff;
    }
  }
  return out;
}

export function noise(length: number, seed = 7): Uint8Array {
  const out = new Uint8Array(length);
  let s = seed;
  for (let i = 0; i < length; i += 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    out[i] = s >> 16;
  }
  return out;
}
