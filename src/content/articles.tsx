import type { ReactNode } from "react";
import Link from "next/link";

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: ReactNode;
}

/* Genuinely useful guides — no thin template content. */
export const articles: Article[] = [
  {
    slug: "merge-pdfs-without-uploading",
    title: "How to merge PDFs without uploading them anywhere",
    description:
      "A step-by-step guide to combining PDF files privately in your browser, plus what to check before and after merging.",
    body: (
      <>
        <p>
          Most online PDF mergers work by uploading your documents to a server,
          processing them there, and sending a result back. That is fine for a
          flyer, but risky for contracts, medical records, or anything with
          personal data. The good news: modern browsers can merge PDFs entirely
          on your own device.
        </p>
        <h2>Steps</h2>
        <ol>
          <li>Open the <Link href="/tools/merge-pdf">Merge PDF tool</Link>.</li>
          <li>Drop in two or more PDF files, or pick them with the file browser.</li>
          <li>Arrange the order with the up/down buttons — the first file in the list becomes the first pages of the result.</li>
          <li>Select <strong>Merge</strong> and wait for the progress bar to finish.</li>
          <li>Download the combined file and open it once to confirm the page order.</li>
        </ol>
        <h2>Common mistakes</h2>
        <p>
          The most frequent problem is page order: double-check the file list
          before merging, not after. Another is password-protected input — a
          protected PDF cannot be read by the merger, so remove the password in
          the app that created it first. Finally, merging very large scanned
          files can be slow on phones; if a merge feels stuck, try it on a
          laptop.
        </p>
        <h2>What merging preserves — and what it does not</h2>
        <p>
          Page content, size, and rotation are preserved exactly. Bookmarks and
          form fields from source files are not carried over, which matters if
          you rely on a table of contents. If you need those, merge in the
          original authoring tool instead.
        </p>
      </>
    ),
  },
  {
    slug: "split-pdf-page-ranges",
    title: "Splitting a PDF: page ranges explained",
    description:
      "How to write page ranges like 1-3, 5, 8-10, and how to choose between the three split modes.",
    body: (
      <>
        <p>
          Splitting a PDF sounds simple until you meet a range box. This guide
          explains the little language used by the{" "}
          <Link href="/tools/split-pdf">Split PDF tool</Link> and when each
          split mode is the right choice.
        </p>
        <h2>Writing ranges</h2>
        <p>
          A range expression is a comma-separated list. Each item is either a
          single page (<code>5</code>) or a span (<code>8-10</code>). So{" "}
          <code>1-3, 5, 8-10</code> selects pages 1, 2, 3, 5, 8, 9, and 10 — in
          that order. Pages you list twice are only included once, and a span
          must run forward: <code>7-4</code> is rejected rather than guessed.
        </p>
        <h2>The three modes</h2>
        <ol>
          <li>
            <strong>Selected pages → one PDF.</strong> Good for pulling a
            chapter or an appendix into a single document.
          </li>
          <li>
            <strong>One PDF per range.</strong> Write <code>1-4, 5-9</code> and
            you get two files. Good for breaking a report into sections.
          </li>
          <li>
            <strong>Every page separately.</strong> One file per page — useful
            before re-assembling pages in a different order, or for sending a
            single signed page back.
          </li>
        </ol>
        <h2>Privacy note</h2>
        <p>
          The splitting happens in your browser. If your document is
          confidential, that matters: nothing is transmitted, and there is no
          server-side copy to worry about deleting afterwards.
        </p>
      </>
    ),
  },
  {
    slug: "images-to-pdf-quality",
    title: "Turning photos into a PDF without ruining quality",
    description:
      "Page sizes, fit modes, and orientation — how to get a clean PDF from JPG, PNG, or WebP images.",
    body: (
      <>
        <p>
          Converting images to a PDF looks trivial, but three small choices
          decide whether the result looks professional: page size, fit mode,
          and margins. The{" "}
          <Link href="/tools/images-to-pdf">Images to PDF tool</Link> exposes
          all three.
        </p>
        <h2>Page size</h2>
        <p>
          <strong>Auto</strong> makes each page exactly as large as its image —
          best for screenshots and digital images, because nothing is scaled.
          <strong> A4</strong> or <strong>Letter</strong> are better when the
          PDF is destined for printing; the tool automatically flips the page
          to landscape for wide images.
        </p>
        <h2>Fit mode</h2>
        <p>
          <strong>Fit inside page</strong> shrinks the image until it fits with
          nothing cropped — the safe default. <strong>Fill page</strong> covers
          the whole page and crops the overflow, which suits full-bleed photo
          pages. <strong>Original size</strong> keeps the image&apos;s own
          dimensions where possible.
        </p>
        <h2>Sideways photos</h2>
        <p>
          Phones record orientation in EXIF metadata rather than rotating the
          actual pixels. The tool reads that metadata during conversion, so
          photos that display upright on your phone come out upright in the
          PDF — no manual rotation needed.
        </p>
        <h2>A note on file size</h2>
        <p>
          A PDF made from twenty 12-megapixel photos will be large. If the
          result only needs to be read on screen, resize the photos before
          converting; a width of around 1600 pixels is plenty for viewing and
          dramatically smaller.
        </p>
      </>
    ),
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
