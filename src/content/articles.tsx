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
  {
    slug: "are-online-pdf-tools-safe",
    title: "Are online PDF tools safe? How to check before you upload",
    description:
      "Most online PDF tools upload your file to a server. Here is how to tell what a tool really does with your document, and when that matters.",
    body: (
      <>
        <p>
          &ldquo;Free online PDF tool&rdquo; usually means one of two very
          different things. Some tools upload your document to a company
          server, process it there, and send the result back. Others — like
          the tools on this site — do the work inside your browser, on your
          own device. For a flyer the difference is academic. For a contract,
          a medical record, or an ID scan, it is the whole question.
        </p>
        <h2>How to check what a tool actually does</h2>
        <ol>
          <li>
            Open your browser&apos;s developer tools (F12), switch to the
            <strong> Network</strong> tab, and use the tool. If the file is
            uploaded you will see a large POST request when you add or process
            it. A genuinely local tool makes no such request — try it on our{" "}
            <Link href="/tools/merge-pdf">Merge PDF</Link> page.
          </li>
          <li>
            Read the privacy label. A trustworthy site states per tool whether
            processing is local or on a server, and what happens to uploads.
            Vague wording like &ldquo;files are deleted after processing&rdquo;
            still means the file left your device.
          </li>
          <li>
            Beware absolute claims. &ldquo;100% secure&rdquo; is a marketing
            phrase, not a technical property — no honest engineer says it.
          </li>
        </ol>
        <h2>When a server-based tool is fine</h2>
        <p>
          Server processing is not evil — some jobs (OCR of scanned documents,
          high-fidelity Word conversion) currently need server-grade software.
          The fair standard is disclosure: you should know before uploading
          that the file will leave your device, why, and for how long it is
          kept. Tools on this site that would ever need a server will say so
          on the page before you pick a file; today, every listed tool is
          local.
        </p>
        <h2>Practical rules of thumb</h2>
        <ul>
          <li>Sensitive document + unclear privacy label = find another tool.</li>
          <li>Local processing keeps you safe even on public Wi-Fi, because nothing is transmitted.</li>
          <li>Whatever tool you use, keep your original file until you have verified the result.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "remove-pages-from-pdf",
    title: "How to remove pages from a PDF (without re-scanning anything)",
    description:
      "Delete unwanted, blank, or duplicated pages from a PDF in your browser: select thumbnails, remove, and download the cleaned file.",
    body: (
      <>
        <p>
          Scans and exports often pick up baggage — blank backs of pages, a
          duplicated sheet, or a cover page you do not want to send. Removing
          pages does not require the original document or any re-scanning: the{" "}
          <Link href="/tools/delete-pages">Delete pages tool</Link> edits the
          PDF you already have, on your device.
        </p>
        <h2>Steps</h2>
        <ol>
          <li>Open the <Link href="/tools/delete-pages">Delete pages tool</Link> and drop your PDF in.</li>
          <li>Wait for the page thumbnails to appear so you can see what each page is.</li>
          <li>Click the bin icon on each page you want gone. The tool refuses to delete the final remaining page — a PDF needs at least one.</li>
          <li>Select <strong>Save without deleted pages</strong> and download the result.</li>
        </ol>
        <h2>Removing one page vs extracting a few</h2>
        <p>
          If you want to <em>keep</em> only a handful of pages, deleting
          twenty of them one by one is the slow way round. Use{" "}
          <Link href="/tools/extract-pages">Extract pages</Link> instead and
          tick the pages you want, or <Link href="/tools/split-pdf">Split PDF</Link>{" "}
          with a range like <code>1-3, 7</code>.
        </p>
        <h2>Common problems</h2>
        <p>
          A password-protected PDF cannot be edited — remove the password in
          the app that created it first. And deletion is by position, so if
          you re-export the file from elsewhere afterwards, double-check page
          numbers before repeating the operation.
        </p>
      </>
    ),
  },
  {
    slug: "shrink-images-for-email",
    title: "Shrinking images for email and upload portals",
    description:
      "Attachment too large? How to compress photos below common email and portal limits without wrecking the quality.",
    body: (
      <>
        <p>
          Most email providers cap attachments around 20–25 MB, and many
          application portals enforce per-file limits of 1–2 MB. A single
          phone photo can be 4–8 MB, so &ldquo;attachment too large&rdquo; is
          usually an image problem. Two levers fix it: dimensions and quality.
        </p>
        <h2>Dimensions first</h2>
        <p>
          A modern phone photo is ~4000 pixels wide; screens and documents
          rarely need more than 1600. Halving the dimensions roughly quarters
          the file size before quality even enters the picture. Use the{" "}
          <Link href="/tools/image-resizer">Image resizer</Link> and try the
          50% preset.
        </p>
        <h2>Then quality</h2>
        <p>
          The <Link href="/tools/image-compressor">Image compressor</Link>{" "}
          shows the original and compressed sizes side by side while you move
          the quality slider. For photos, JPEG at 70–80% quality is usually
          indistinguishable at normal viewing size; below 60% you will start
          seeing artefacts in smooth areas like skies.
        </p>
        <h2>Portal checklist</h2>
        <ul>
          <li>Check the portal&apos;s stated limit and format (many demand JPG).</li>
          <li>Resize to sensible dimensions first, compress second.</li>
          <li>WebP is smaller than JPEG, but older portals may reject it — JPEG is the safe choice.</li>
          <li>For multi-page requirements, convert the finished images with <Link href="/tools/images-to-pdf">Images to PDF</Link>.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "prepare-assignment-pdf-for-submission",
    title: "Preparing an assignment PDF for submission",
    description:
      "A pre-submission pipeline for students: cover page, merged files, page numbers, and a final check — all in the browser.",
    body: (
      <>
        <p>
          Most submission-portal disasters are formatting, not content: a
          missing cover page, files uploaded in the wrong order, or no page
          numbers when the brief demanded them. This five-minute pipeline
          fixes all three without installing anything.
        </p>
        <h2>The pipeline</h2>
        <ol>
          <li>
            Generate a cover page with the{" "}
            <Link href="/tools/cover-page">Assignment cover page tool</Link> —
            name, ID, module, tutor, date, word count.
          </li>
          <li>
            Combine cover + assignment (+ appendices) with{" "}
            <Link href="/tools/merge-pdf">Merge PDF</Link>, checking the file
            order in the list before merging.
          </li>
          <li>
            Add numbering with <Link href="/tools/page-numbers">Add page numbers</Link>,
            setting <em>skip first pages</em> to 1 so the cover stays clean.
          </li>
          <li>
            Open the result in the <Link href="/tools/pdf-viewer">PDF viewer</Link>{" "}
            and flip through every page once. Thirty seconds here catches the
            upside-down scan on page 7.
          </li>
        </ol>
        <h2>Word count honesty</h2>
        <p>
          If the cover page asks for a word count, paste your text into the{" "}
          <Link href="/tools/word-counter">Word counter</Link> rather than
          guessing — markers do check.
        </p>
        <h2>Size limits</h2>
        <p>
          Portals with size caps usually choke on scanned appendices. Shrink
          the images before they go into the PDF (see{" "}
          <Link href="/learn/shrink-images-for-email">the image-shrinking guide</Link>)
          rather than trying to fix the finished file.
        </p>
      </>
    ),
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}


/** Tool slug → related guide slugs (contextual internal links). */
export const toolGuides: Record<string, string[]> = {
  "merge-pdf": ["merge-pdfs-without-uploading", "prepare-assignment-pdf-for-submission", "are-online-pdf-tools-safe"],
  "split-pdf": ["split-pdf-page-ranges", "remove-pages-from-pdf"],
  "extract-pages": ["split-pdf-page-ranges", "remove-pages-from-pdf"],
  "delete-pages": ["remove-pages-from-pdf"],
  "rotate-pdf": ["remove-pages-from-pdf"],
  "reorder-pages": ["prepare-assignment-pdf-for-submission"],
  "watermark-pdf": ["are-online-pdf-tools-safe"],
  "page-numbers": ["prepare-assignment-pdf-for-submission"],
  "images-to-pdf": ["images-to-pdf-quality", "shrink-images-for-email"],
  "pdf-to-images": ["images-to-pdf-quality"],
  "pdf-viewer": ["are-online-pdf-tools-safe"],
  "pdf-metadata": ["are-online-pdf-tools-safe"],
  "extract-text": ["are-online-pdf-tools-safe"],
  "image-compressor": ["shrink-images-for-email"],
  "image-resizer": ["shrink-images-for-email"],
  "image-converter": ["shrink-images-for-email"],
  "passport-photo": ["shrink-images-for-email"],
  "word-counter": ["prepare-assignment-pdf-for-submission"],
  "cover-page": ["prepare-assignment-pdf-for-submission"],
};
