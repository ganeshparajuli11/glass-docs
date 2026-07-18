"use client";

/** Shared browser image helpers — canvas based, nothing leaves the device. */

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

export async function loadImage(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  return { bitmap, width: bitmap.width, height: bitmap.height };
}

export function drawToCanvas(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  crop?: { x: number; y: number; w: number; h: number },
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.imageSmoothingQuality = "high";
  if (crop) {
    ctx.drawImage(bitmap, crop.x, crop.y, crop.w, crop.h, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

export type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

export async function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality?: number,
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, format, format === "image/png" ? undefined : quality),
  );
  if (!blob) throw new Error("encode failed");
  return blob;
}

export function extensionFor(format: OutputFormat): string {
  return format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";
}
