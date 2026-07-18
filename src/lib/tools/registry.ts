/** Typed tool registry — single source of truth for routes, search, SEO. */

export type ProcessingMode = "local" | "hybrid" | "server";
export type ToolStatus = "stable" | "beta" | "experimental" | "planned";

export interface ToolDefinition {
  slug: string;
  name: string;
  shortDescription: string;
  category: "pdf" | "image" | "document";
  processingMode: ProcessingMode;
  status: ToolStatus;
  engine: "pdf-lib" | "pdfjs" | "browser-canvas" | "combined";
  acceptedMimeTypes: string[];
  outputMimeTypes: string[];
  maxRecommendedSizeMb: number;
  supportsMultipleFiles: boolean;
  keywords: string[];
  relatedTools: string[];
  knownLimitations: string[];
  faq: Array<{ q: string; a: string }>;
  lastVerifiedAt: string;
}

const VERIFIED = "2026-07-18";
const PDF = "application/pdf";

export const tools: ToolDefinition[] = [
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    shortDescription: "Combine multiple PDFs into one file, in the order you choose.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "pdf-lib",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 50,
    supportsMultipleFiles: true,
    keywords: ["merge", "combine", "join", "append", "concatenate"],
    relatedTools: ["split-pdf", "reorder-pages", "delete-pages"],
    knownLimitations: [
      "Password-protected PDFs are not supported.",
      "Bookmarks from source files are not carried over.",
    ],
    faq: [
      {
        q: "Are my files uploaded?",
        a: "No. Merging happens in your browser; the files never leave your device.",
      },
      {
        q: "Is there a file limit?",
        a: "There is no hard limit, but we recommend keeping the combined size under 50 MB for smooth processing.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    shortDescription: "Split a PDF by page ranges, or into one file per page.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "pdf-lib",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 50,
    supportsMultipleFiles: false,
    keywords: ["split", "separate", "divide", "ranges", "pages"],
    relatedTools: ["extract-pages", "merge-pdf", "delete-pages"],
    knownLimitations: ["Password-protected PDFs are not supported."],
    faq: [
      {
        q: "How do I write a page range?",
        a: "Use commas and dashes, for example: 1-3, 5, 8-10.",
      },
      {
        q: "Can I get each page as a separate file?",
        a: "Yes — choose the “every page separately” mode.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "extract-pages",
    name: "Extract pages",
    shortDescription: "Pick specific pages and save them as a new PDF.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "combined",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 50,
    supportsMultipleFiles: false,
    keywords: ["extract", "select", "pages", "keep"],
    relatedTools: ["split-pdf", "delete-pages", "reorder-pages"],
    knownLimitations: ["Password-protected PDFs are not supported."],
    faq: [
      {
        q: "Does extraction change the original file?",
        a: "No. A new PDF is produced; your original file is untouched.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "rotate-pdf",
    name: "Rotate pages",
    shortDescription: "Rotate all pages or only the ones you select.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "combined",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 50,
    supportsMultipleFiles: false,
    keywords: ["rotate", "turn", "orientation", "landscape", "portrait"],
    relatedTools: ["reorder-pages", "delete-pages", "merge-pdf"],
    knownLimitations: ["Password-protected PDFs are not supported."],
    faq: [
      {
        q: "Which rotations are supported?",
        a: "90°, 180°, and 270°, applied to all pages or a selection.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "reorder-pages",
    name: "Reorder pages",
    shortDescription: "Change the page order with thumbnails and keyboard controls.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "combined",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 50,
    supportsMultipleFiles: false,
    keywords: ["reorder", "rearrange", "move", "sort", "organize"],
    relatedTools: ["delete-pages", "extract-pages", "rotate-pdf"],
    knownLimitations: ["Password-protected PDFs are not supported."],
    faq: [
      {
        q: "Can I move pages without a mouse?",
        a: "Yes. Every page has move buttons that work with the keyboard.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "delete-pages",
    name: "Delete pages",
    shortDescription: "Remove unwanted pages and download the cleaned-up PDF.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "combined",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 50,
    supportsMultipleFiles: false,
    keywords: ["delete", "remove", "pages", "clean"],
    relatedTools: ["extract-pages", "reorder-pages", "split-pdf"],
    knownLimitations: [
      "Password-protected PDFs are not supported.",
      "At least one page must remain in the document.",
    ],
    faq: [
      {
        q: "Can I delete every page?",
        a: "No — a PDF needs at least one page, so the tool keeps you from removing all of them.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "watermark-pdf",
    name: "Add watermark",
    shortDescription: "Stamp a text watermark across all or selected pages.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "pdf-lib",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 50,
    supportsMultipleFiles: false,
    keywords: ["watermark", "stamp", "draft", "confidential", "text"],
    relatedTools: ["page-numbers", "merge-pdf"],
    knownLimitations: [
      "Text watermark only; image watermarks are planned.",
      "Non-Latin scripts may not render until font embedding ships.",
      "Password-protected PDFs are not supported.",
    ],
    faq: [
      {
        q: "Can I control the look?",
        a: "Yes — size, opacity, angle, and a centered or tiled layout.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "page-numbers",
    name: "Add page numbers",
    shortDescription: "Number pages with custom position, start value, and format.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "pdf-lib",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 50,
    supportsMultipleFiles: false,
    keywords: ["page numbers", "numbering", "pagination", "footer", "header"],
    relatedTools: ["watermark-pdf", "merge-pdf"],
    knownLimitations: ["Password-protected PDFs are not supported."],
    faq: [
      {
        q: "Can I skip the cover page?",
        a: "Yes — set “skip first pages” to 1 (or more) and numbering starts after them.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    shortDescription: "Turn JPG, PNG, or WebP images into a single PDF.",
    category: "image",
    processingMode: "local",
    status: "stable",
    engine: "combined",
    acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 25,
    supportsMultipleFiles: true,
    keywords: ["jpg to pdf", "png to pdf", "webp", "image", "convert", "photo"],
    relatedTools: ["pdf-to-images", "merge-pdf"],
    knownLimitations: [
      "Animated WebP uses only the first frame.",
      "Very large images may be slow on low-memory devices.",
    ],
    faq: [
      {
        q: "What page sizes are available?",
        a: "Auto (match the image), A4, or Letter, with adjustable margins and fit.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "pdf-to-images",
    name: "PDF to images",
    shortDescription: "Export PDF pages as PNG or JPEG images.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "pdfjs",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: ["image/png", "image/jpeg"],
    maxRecommendedSizeMb: 40,
    supportsMultipleFiles: false,
    keywords: ["pdf to jpg", "pdf to png", "convert", "export", "image"],
    relatedTools: ["images-to-pdf", "pdf-viewer"],
    knownLimitations: [
      "Pages are downloaded as individual image files.",
      "High resolutions on large documents use a lot of memory.",
    ],
    faq: [
      {
        q: "What quality can I choose?",
        a: "Three resolution presets; higher presets produce sharper but larger images.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "pdf-viewer",
    name: "PDF viewer",
    shortDescription: "Read a PDF privately with zoom and page navigation.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "pdfjs",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [],
    maxRecommendedSizeMb: 60,
    supportsMultipleFiles: false,
    keywords: ["view", "read", "open", "preview"],
    relatedTools: ["extract-text", "pdf-metadata"],
    knownLimitations: ["Password-protected PDFs are not supported."],
    faq: [
      {
        q: "Is the document uploaded to view it?",
        a: "No. Rendering happens entirely in your browser.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "pdf-metadata",
    name: "Metadata & info",
    shortDescription: "Inspect document info and edit title, author, subject, keywords.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "combined",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: [PDF],
    maxRecommendedSizeMb: 50,
    supportsMultipleFiles: false,
    keywords: ["metadata", "properties", "title", "author", "info", "inspect"],
    relatedTools: ["pdf-viewer", "extract-text"],
    knownLimitations: [
      "Only standard document-information fields can be edited.",
      "Password-protected PDFs are not supported.",
    ],
    faq: [
      {
        q: "Which fields can I edit?",
        a: "Title, author, subject, and keywords. Other XMP metadata is preserved as-is.",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
  {
    slug: "extract-text",
    name: "Extract text",
    shortDescription: "Pull selectable text out of a PDF and download it as .txt.",
    category: "pdf",
    processingMode: "local",
    status: "stable",
    engine: "pdfjs",
    acceptedMimeTypes: [PDF],
    outputMimeTypes: ["text/plain"],
    maxRecommendedSizeMb: 40,
    supportsMultipleFiles: false,
    keywords: ["extract text", "copy", "txt", "content"],
    relatedTools: ["pdf-viewer", "pdf-metadata"],
    knownLimitations: [
      "Scanned/image-only PDFs contain no selectable text; OCR is a planned server capability.",
      "Reading order can differ from the visual layout in complex documents.",
    ],
    faq: [
      {
        q: "Why is my result empty?",
        a: "The PDF is probably a scan. It has pictures of text rather than selectable text, which requires OCR (not available yet).",
      },
    ],
    lastVerifiedAt: VERIFIED,
  },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.slug === slug);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return tools;
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.category.includes(q) ||
      t.keywords.some((k) => k.includes(q)),
  );
}
