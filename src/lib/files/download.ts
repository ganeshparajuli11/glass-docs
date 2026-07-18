"use client";

/** Object-URL lifecycle helpers. Revoke on reset/unmount to free memory. */

export interface DownloadableResult {
  blob: Blob;
  fileName: string;
  url: string;
}

export function makeResult(
  bytes: Uint8Array | ArrayBuffer | Blob,
  fileName: string,
  mime: string,
): DownloadableResult {
  const blob =
    bytes instanceof Blob
      ? bytes
      : new Blob([bytes instanceof Uint8Array ? (bytes.slice().buffer as ArrayBuffer) : bytes], { type: mime });
  return { blob, fileName, url: URL.createObjectURL(blob) };
}

export function revokeResult(result: DownloadableResult | null | undefined): void {
  if (result) URL.revokeObjectURL(result.url);
}

export function triggerDownload(result: DownloadableResult): void {
  const a = document.createElement("a");
  a.href = result.url;
  a.download = result.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function fileToBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}
