import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { savePdf, PdfOperationError } from "./load";
import { toolError } from "../errors";
import { z } from "zod";

export const coverPageSchema = z.object({
  institution: z.string().max(120),
  assignmentTitle: z.string().min(1).max(200),
  module: z.string().max(120),
  studentName: z.string().min(1).max(120),
  studentId: z.string().max(60),
  tutor: z.string().max(120),
  submissionDate: z.string().max(40),
  wordCount: z.string().max(20),
});

export type CoverPageFields = z.infer<typeof coverPageSchema>;

const A4: [number, number] = [595.28, 841.89];

/** Generates a clean A4 assignment cover page. Latin scripts only for now. */
export async function generateCoverPage(fields: CoverPageFields): Promise<Uint8Array> {
  const f = coverPageSchema.parse(fields);
  const doc = await PDFDocument.create();
  const page = doc.addPage(A4);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const [w, h] = A4;
  const ink = rgb(0.09, 0.1, 0.12);
  const muted = rgb(0.38, 0.4, 0.45);

  const centered = (text: string, y: number, size: number, useBold = false) => {
    const fnt = useBold ? bold : font;
    let width: number;
    try {
      width = fnt.widthOfTextAtSize(text, size);
    } catch {
      throw new PdfOperationError(toolError("OUTPUT_FAILED"));
    }
    page.drawText(text, {
      x: w / 2 - width / 2,
      y,
      size,
      font: fnt,
      color: useBold ? ink : muted,
    });
  };

  if (f.institution) centered(f.institution, h - 110, 16, true);
  page.drawLine({
    start: { x: 90, y: h - 130 },
    end: { x: w - 90, y: h - 130 },
    thickness: 1,
    color: rgb(0.8, 0.82, 0.88),
  });

  const titleSize = f.assignmentTitle.length > 60 ? 18 : 24;
  centered(f.assignmentTitle, h / 2 + 120, titleSize, true);
  if (f.module) centered(f.module, h / 2 + 88, 13);

  const rows = (
    [
      ["Student name", f.studentName],
      ["Student ID", f.studentId],
      ["Tutor", f.tutor],
      ["Submission date", f.submissionDate],
      ["Word count", f.wordCount],
    ] as Array<[string, string]>
  ).filter(([, v]) => v.length > 0);

  let y = h / 2 - 10;
  for (const [label, value] of rows) {
    page.drawText(label, { x: 150, y, size: 11, font, color: muted });
    try {
      page.drawText(value, { x: 300, y, size: 11, font: bold, color: ink });
    } catch {
      throw new PdfOperationError(toolError("OUTPUT_FAILED"));
    }
    y -= 26;
  }

  return savePdf(doc);
}
