import { PDFDocument } from "pdf-lib";
import { savePdf, PdfOperationError } from "./load";
import { mapEngineError } from "../errors";
import { z } from "zod";

export interface ImageInput {
  /** WebP must be transcoded to PNG by the caller (browser canvas) first. */
  kind: "jpg" | "png";
  bytes: Uint8Array;
}

export const imagesToPdfOptionsSchema = z.object({
  pageSize: z.enum(["auto", "a4", "letter"]),
  fit: z.enum(["contain", "cover", "original"]),
  marginPt: z.number().min(0).max(144),
});

export type ImagesToPdfOptions = z.infer<typeof imagesToPdfOptionsSchema>;

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
} as const;

export async function imagesToPdf(
  images: ImageInput[],
  options: ImagesToPdfOptions,
): Promise<Uint8Array> {
  const opts = imagesToPdfOptionsSchema.parse(options);
  const doc = await PDFDocument.create();

  for (const image of images) {
    let embedded;
    try {
      embedded =
        image.kind === "jpg"
          ? await doc.embedJpg(image.bytes)
          : await doc.embedPng(image.bytes);
    } catch (err) {
      throw new PdfOperationError(mapEngineError(err));
    }

    const imgW = embedded.width;
    const imgH = embedded.height;

    let pageW: number;
    let pageH: number;
    if (opts.pageSize === "auto") {
      pageW = imgW + opts.marginPt * 2;
      pageH = imgH + opts.marginPt * 2;
    } else {
      const base = PAGE_SIZES[opts.pageSize];
      // Match page orientation to the image.
      const landscape = imgW > imgH;
      pageW = landscape ? base.height : base.width;
      pageH = landscape ? base.width : base.height;
    }

    const page = doc.addPage([pageW, pageH]);
    const availW = pageW - opts.marginPt * 2;
    const availH = pageH - opts.marginPt * 2;

    let drawW = imgW;
    let drawH = imgH;
    if (opts.fit !== "original" || opts.pageSize === "auto") {
      const scaleContain = Math.min(availW / imgW, availH / imgH);
      const scaleCover = Math.max(availW / imgW, availH / imgH);
      const scale = opts.fit === "cover" ? scaleCover : scaleContain;
      drawW = imgW * scale;
      drawH = imgH * scale;
    } else if (drawW > availW || drawH > availH) {
      const scale = Math.min(availW / drawW, availH / drawH);
      drawW *= scale;
      drawH *= scale;
    }

    page.drawImage(embedded, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  }

  return savePdf(doc);
}
