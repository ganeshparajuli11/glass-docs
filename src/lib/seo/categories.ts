/** Category landing pages — real CollectionPages with unique content. */

export interface CategoryPage {
  path: string;
  category: "pdf" | "image" | "text" | "calculator" | "student";
  title: string;
  metaTitle: string;
  description: string;
  intro: string[];
  guideSlugs: string[];
}

export const categoryPages: CategoryPage[] = [
  {
    path: "/pdf-tools",
    category: "pdf",
    title: "PDF tools",
    metaTitle: "Free PDF tools — merge, split, rotate, watermark",
    description:
      "12 free PDF tools that run in your browser: merge, split, remove pages, rotate, watermark, add page numbers, convert to images, extract text and more.",
    intro: [
      "Everything here works on your device: the PDF is read into your browser's memory, changed there, and handed back to you as a download. No account, no upload, no watermark added by us.",
      "Start with the task you need — combining files, pulling out pages, fixing rotation, or stamping a draft mark — and the tool page explains its limits honestly before you begin.",
    ],
    guideSlugs: [
      "merge-pdfs-without-uploading",
      "split-pdf-page-ranges",
      "remove-pages-from-pdf",
      "rotate-one-page-in-a-pdf",
      "pdf-too-large-to-email",
      "cannot-copy-text-from-pdf",
    ],
  },
  {
    path: "/image-tools",
    category: "image",
    title: "Image tools",
    metaTitle: "Free image tools — compress, resize, crop, convert",
    description:
      "Compress, resize, crop and convert JPG, PNG and WebP images in your browser, or build a printable passport-photo sheet — free and without uploading.",
    intro: [
      "These tools use your browser's own image engine, so photos never leave your device. Compression shows you the before-and-after size so you can pick the right quality.",
      "They pair naturally with the PDF tools: shrink or crop images first, then turn them into a single PDF with Images to PDF.",
    ],
    guideSlugs: [
      "images-to-pdf-quality",
      "shrink-images-for-email",
      "passport-photo-sizes-explained",
    ],
  },
  {
    path: "/text-tools",
    category: "text",
    title: "Text tools",
    metaTitle: "Free text tools — word counter, case converter, compare",
    description:
      "Count words and reading time, convert text case, clean extra spaces, remove duplicate lines, and compare two versions of a text — all in your browser.",
    intro: [
      "Paste text, get an answer — nothing you type is sent anywhere. The word counter includes reading time and page estimates, which makes it handy for assignment limits.",
      "The compare tool shows added and removed lines between two drafts, useful for checking what changed before you submit.",
    ],
    guideSlugs: ["cannot-copy-text-from-pdf"],
  },
  {
    path: "/calculators",
    category: "calculator",
    title: "Calculators",
    metaTitle: "Free calculators — GPA, grades, attendance, EMI",
    description:
      "Student and everyday calculators: GPA on a 4.0 scale, weighted assignment grades, attendance percentage, general percentages, and loan EMI.",
    intro: [
      "Quick answers to the questions students actually ask: what's my GPA, what do I need on the final, and how many classes can I still miss. Each result explains its formula.",
      "The EMI calculator is general information, not financial advice — it shows the standard reducing-balance formula so you can sanity-check a lender's quote.",
    ],
    guideSlugs: ["gpa-scales-explained"],
  },
  {
    path: "/student-tools",
    category: "student",
    title: "Student toolkit",
    metaTitle: "Student toolkit — assignment cover pages and helpers",
    description:
      "Purpose-built helpers for coursework: generate a clean assignment cover page PDF, then combine it with your work using the PDF tools.",
    intro: [
      "Made for submission day: generate a tidy cover page with your name, module, and word count, merge it in front of your assignment, add page numbers, and export.",
      "More student helpers — page estimators, citation templates, and checklists — are planned; only working tools are listed here.",
    ],
    guideSlugs: [
      "prepare-assignment-pdf-for-submission",
      "gpa-scales-explained",
      "remove-pages-from-pdf",
    ],
  },
];
