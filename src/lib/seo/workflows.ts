/**
 * Task-shaped groupings of tools.
 *
 * A flat A-Z grid tells a crawler nothing about which tools belong together,
 * and tells a visitor nothing about what to do next. These blocks link tools
 * in the order someone actually uses them, which gives both an internal link
 * graph that follows real intent (audit finding IA-002).
 *
 * Every slug here is checked against the registry by the SEO tests, so a
 * renamed or removed tool fails the build rather than shipping a dead link.
 */
export interface Workflow {
  /** Stable id, used for anchors. */
  id: string;
  /** Phrased as the job the visitor is trying to finish. */
  title: string;
  description: string;
  /** Which category hubs this workflow is relevant to. */
  categories: Array<"pdf" | "image" | "text" | "calculator" | "student">;
  steps: Array<{ slug: string; label: string }>;
}

export const workflows: Workflow[] = [
  {
    id: "prepare-assignment",
    title: "Prepare an assignment for submission",
    description:
      "Build a cover page, combine your sections into one PDF, number the pages, then shrink it if the upload portal has a size limit.",
    categories: ["pdf", "student"],
    steps: [
      { slug: "cover-page", label: "Make a cover page" },
      { slug: "merge-pdf", label: "Merge the sections" },
      { slug: "page-numbers", label: "Add page numbers" },
      { slug: "compress-pdf", label: "Compress it under the limit" },
    ],
  },
  {
    id: "clean-a-scan",
    title: "Clean up a scanned document",
    description:
      "Scans arrive sideways, with blank pages and in the wrong order. Fix the rotation first, then remove and reorder pages before combining anything.",
    categories: ["pdf"],
    steps: [
      { slug: "rotate-pdf", label: "Fix the rotation" },
      { slug: "delete-pages", label: "Remove blank pages" },
      { slug: "reorder-pages", label: "Put pages in order" },
      { slug: "merge-pdf", label: "Combine with other files" },
    ],
  },
  {
    id: "photos-by-email",
    title: "Send photos by email or upload them",
    description:
      "Most attachment limits are about size, not resolution. Resize first, compress second, and turn the set into a single PDF if the recipient wants one file.",
    categories: ["image", "pdf"],
    steps: [
      { slug: "image-resizer", label: "Resize to sensible dimensions" },
      { slug: "image-compressor", label: "Compress to fit the limit" },
      { slug: "images-to-pdf", label: "Combine into one PDF" },
    ],
  },
  {
    id: "get-content-out",
    title: "Get content out of a PDF",
    description:
      "Read it first to find what you need, then pull out the text or save just the pages that matter as a new file.",
    categories: ["pdf", "text"],
    steps: [
      { slug: "pdf-viewer", label: "Open and read it" },
      { slug: "extract-text", label: "Pull out the text" },
      { slug: "extract-pages", label: "Save selected pages" },
      { slug: "split-pdf", label: "Split by page range" },
    ],
  },
  {
    id: "check-your-marks",
    title: "Work out where you stand",
    description:
      "Credit-weighted GPA, what you need on the final, and whether your attendance still clears the threshold.",
    categories: ["calculator", "student"],
    steps: [
      { slug: "gpa-calculator", label: "Calculate your GPA" },
      { slug: "grade-calculator", label: "Work out the grade you need" },
      { slug: "attendance-calculator", label: "Check attendance" },
      { slug: "percentage-calculator", label: "Convert percentages" },
    ],
  },
  {
    id: "tidy-text",
    title: "Tidy up text before you submit it",
    description:
      "Check the length against the word limit, then strip the stray spacing and duplicate lines that copying from a PDF leaves behind.",
    categories: ["text", "student"],
    steps: [
      { slug: "word-counter", label: "Count words and reading time" },
      { slug: "remove-spaces", label: "Strip extra spacing" },
      { slug: "dedupe-lines", label: "Remove duplicate lines" },
      { slug: "text-compare", label: "Compare two drafts" },
    ],
  },
];

/** Workflows worth showing on a given category hub. */
export function workflowsForCategory(category: Workflow["categories"][number]) {
  return workflows.filter((w) => w.categories.includes(category));
}
