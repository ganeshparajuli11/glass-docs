import { StandardFonts, degrees, rgb } from "pdf-lib";
import { loadPdf, savePdf, PdfOperationError } from "./load";
import { toolError } from "../errors";
import { z } from "zod";

export const watermarkOptionsSchema = z.object({
  text: z.string().min(1).max(120),
  fontSize: z.number().min(8).max(144),
  opacity: z.number().min(0.05).max(1),
  angle: z.number().min(-90).max(90),
  position: z.enum(["center", "tile"]),
  /** Zero-based page indices; empty/undefined = all pages. */
  pages: z.array(z.number().int().min(0)).optional(),
});

export type WatermarkOptions = z.infer<typeof watermarkOptionsSchema>;

/**
 * Text watermark using the standard Helvetica font (WinAnsi character set).
 * Non-Latin scripts are a known limitation until font embedding ships.
 */
export async function watermarkPdf(
  source: Uint8Array,
  options: WatermarkOptions,
): Promise<Uint8Array> {
  const opts = watermarkOptionsSchema.parse(options);
  const doc = await loadPdf(source);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  let textWidth: number;
  try {
    textWidth = font.widthOfTextAtSize(opts.text, opts.fontSize);
  } catch {
    // Characters outside WinAnsi cannot be encoded by the standard font.
    throw new PdfOperationError(toolError("OUTPUT_FAILED"));
  }

  const targets = new Set(
    opts.pages && opts.pages.length > 0
      ? opts.pages
      : doc.getPageIndices(),
  );

  doc.getPages().forEach((page, index) => {
    if (!targets.has(index)) return;
    const { width, height } = page.getSize();
    const color = rgb(0.45, 0.45, 0.5);
    if (opts.position === "center") {
      page.drawText(opts.text, {
        x: width / 2 - textWidth / 2,
        y: height / 2 - opts.fontSize / 2,
        size: opts.fontSize,
        font,
        color,
        opacity: opts.opacity,
        rotate: degrees(opts.angle),
      });
    } else {
      const stepX = textWidth + 120;
      const stepY = opts.fontSize + 110;
      for (let y = 40; y < height; y += stepY) {
        for (let x = 20; x < width; x += stepX) {
          page.drawText(opts.text, {
            x,
            y,
            size: opts.fontSize,
            font,
            color,
            opacity: opts.opacity,
            rotate: degrees(opts.angle),
          });
        }
      }
    }
  });

  return savePdf(doc);
}
