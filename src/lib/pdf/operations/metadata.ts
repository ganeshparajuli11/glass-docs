import { loadPdf, savePdf } from "./load";
import { z } from "zod";

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  pageCount: number;
}

export async function readMetadata(source: Uint8Array): Promise<PdfMetadata> {
  const doc = await loadPdf(source);
  return {
    title: doc.getTitle() ?? "",
    author: doc.getAuthor() ?? "",
    subject: doc.getSubject() ?? "",
    keywords: doc.getKeywords() ?? "",
    creator: doc.getCreator() ?? "",
    producer: doc.getProducer() ?? "",
    pageCount: doc.getPageCount(),
  };
}

export const metadataUpdateSchema = z.object({
  title: z.string().max(300),
  author: z.string().max(300),
  subject: z.string().max(300),
  keywords: z.string().max(500),
});

export type MetadataUpdate = z.infer<typeof metadataUpdateSchema>;

export async function writeMetadata(
  source: Uint8Array,
  update: MetadataUpdate,
): Promise<Uint8Array> {
  const fields = metadataUpdateSchema.parse(update);
  const doc = await loadPdf(source);
  doc.setTitle(fields.title);
  doc.setAuthor(fields.author);
  doc.setSubject(fields.subject);
  doc.setKeywords(fields.keywords.length > 0 ? fields.keywords.split(/,\s*/) : []);
  return savePdf(doc);
}
