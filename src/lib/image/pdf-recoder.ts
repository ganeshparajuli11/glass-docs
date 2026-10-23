"use client";

import type { ImageRecoder } from "@/lib/pdf/operations/compress";

/**
 * Browser implementation of the PDF image recoder: decodes with the browser's
 * own image engine, resizes on a canvas and encodes a JPEG. Nothing leaves the
 * device.
 */
export const canvasRecoder: ImageRecoder = async ({ source, targetWidth, targetHeight, quality }) => {
  let bitmap: ImageBitmap;
  if (source.kind === "jpeg") {
    const blob = new Blob([source.bytes.slice().buffer as ArrayBuffer], { type: "image/jpeg" });
    bitmap = await createImageBitmap(blob);
  } else {
    const { pixels, width, height, channels } = source;
    const rgba = new Uint8ClampedArray(width * height * 4);
    for (let p = 0, s = 0, d = 0; p < width * height; p += 1, s += channels, d += 4) {
      const r = pixels[s];
      rgba[d] = r;
      rgba[d + 1] = channels === 3 ? pixels[s + 1] : r;
      rgba[d + 2] = channels === 3 ? pixels[s + 2] : r;
      rgba[d + 3] = 255;
    }
    bitmap = await createImageBitmap(new ImageData(rgba, width, height));
  }

  try {
    // The decoded image must match what the PDF declares; anything else means
    // the browser interpreted it differently and we must not replace it.
    if (bitmap.width !== source.width || bitmap.height !== source.height) return null;

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) return null;
    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      width: targetWidth,
      height: targetHeight,
    };
  } finally {
    bitmap.close();
  }
};
