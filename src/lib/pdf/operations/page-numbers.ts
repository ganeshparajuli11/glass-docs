import { StandardFonts, rgb } from "pdf-lib";
import { loadPdf, savePdf } from "./load";
import { z } from "zod";

export const pageNumberOptionsSchema = z.object({
  position: z.enum(["top", "bottom"]),
  alignment: z.enum(["left", "center", "right"]),
  startNumber: z.number().int().min(0).max(99999),
  prefix: z.string().max(24),
  suffix: z.string().max(24),
  skipFirst: z.number().int().min(0).max(9999),
  fontSize: z.number().min(6).max(48),
});

export type PageNumberOptions = z.infer<typeof pageNumberOptionsSchema>;

export async function addPageNumbers(
  source: Uint8Array,
  options: PageNumberOptions,
): Promise<Uint8Array> {
  const opts = pageNumberOptionsSchema.parse(options);
  const doc = await loadPdf(source);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const margin = 28;

  doc.getPages().forEach((page, index) => {
    if (index < opts.skipFirst) return;
    const label = `${opts.prefix}${opts.startNumber + (index - opts.skipFirst)}${opts.suffix}`;
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, opts.fontSize);
    let x: number;
    if (opts.alignment === "left") x = margin;
    else if (opts.alignment === "right") x = width - margin - textWidth;
    else x = width / 2 - textWidth / 2;
    const y = opts.position === "bottom" ? margin : height - margin - opts.fontSize;
    page.drawText(label, { x, y, size: opts.fontSize, font, color: rgb(0.2, 0.2, 0.25) });
  });

  return savePdf(doc);
}
