import type { ReactNode } from "react";
import Link from "next/link";

export interface Article {
  slug: string;
  title: string;
  description: string;
  /** ISO date the guide was published. Feeds Article structured data. */
  publishedAt: string;
  body: ReactNode;
}

/** Date the first seven guides were written. */
const WAVE_1 = "2026-07-18";
/** Second content wave. */
const WAVE_2 = "2026-08-12";

/* Genuinely useful guides — no thin template content. */
export const articles: Article[] = [
  {
    slug: "merge-pdfs-without-uploading",
    title: "How to merge PDFs without uploading them anywhere",
    description:
      "A step-by-step guide to combining PDF files privately in your browser, plus what to check before and after merging.",
    publishedAt: WAVE_1,
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
    publishedAt: WAVE_1,
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
    publishedAt: WAVE_1,
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
    publishedAt: WAVE_1,
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
          Server processing is not evil — some jobs (high-fidelity Word
          conversion, OCR of long documents in dozens of languages) are easier
          with server-grade software, even though everyday OCR of a page or a
          screenshot now runs fine in a browser.
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
          <li>
            Photos carry their own hidden data — often the GPS spot where they
            were taken. Before sending an original photo file to anyone, check
            and strip it with{" "}
            <Link href="/tools/remove-exif">Remove EXIF &amp; location data</Link>,
            which also runs on your device.
          </li>
        </ul>
      </>
    ),
  },
  {
    slug: "remove-pages-from-pdf",
    title: "How to remove pages from a PDF (without re-scanning anything)",
    description:
      "Delete unwanted, blank, or duplicated pages from a PDF in your browser: select thumbnails, remove, and download the cleaned file.",
    publishedAt: WAVE_1,
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
    publishedAt: WAVE_1,
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
        <p>
          If the portal also demands exact pixel dimensions, such as a 200 × 230
          photo or a signature strip, follow the step-by-step order in{" "}
          <Link href="/learn/resize-photo-for-online-form">making a photo fit an
          online form</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "prepare-assignment-pdf-for-submission",
    title: "Preparing an assignment PDF for submission",
    description:
      "A pre-submission pipeline for students: cover page, merged files, page numbers, and a final check — all in the browser.",
    publishedAt: WAVE_1,
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
          when you can — that gives the best quality for the size. If the
          finished PDF is still over the cap, run it through{" "}
          <Link href="/tools/compress-pdf">Compress PDF</Link> as the last
          step, after page numbers, and check that the smallest text in your
          scanned appendices is still readable.
        </p>
      </>
    ),
  },
  {
    slug: "rotate-one-page-in-a-pdf",
    title: "How to rotate one page in a PDF without turning the rest",
    description:
      "Why a scan comes out sideways, how to rotate only the pages that are wrong, and what to do when a document prints the wrong way round.",
    publishedAt: WAVE_2,
    body: (
      <>
        <p>
          A document feeder takes one sheet in landscape, or you photograph a
          wide table with the phone turned sideways, and now a single page in an
          otherwise perfect PDF is lying on its side. Rotating the whole file
          fixes that page and breaks every other one. The fix is to rotate a
          selection.
        </p>
        <h2>Rotate only the pages that are wrong</h2>
        <ol>
          <li>
            Open the <Link href="/tools/rotate-pdf">Rotate pages tool</Link> and
            load the PDF.
          </li>
          <li>
            Note the page numbers that need turning — positions in the file,
            counting from 1, not any number printed on the page.
          </li>
          <li>
            Turn off <strong>Rotate all pages</strong> and list those page
            numbers.
          </li>
          <li>
            Choose the rotation. 90° clockwise fixes a page whose top edge is on
            the left; 270° fixes one whose top edge is on the right; 180° fixes
            upside down.
          </li>
          <li>Apply, download, and check the pages you did not touch.</li>
        </ol>
        <h2>Which direction do I need?</h2>
        <p>
          Getting this wrong once is normal — 90° and 270° are easy to confuse
          when you are looking at a thumbnail. The reliable way to decide is to
          find the top of the text and ask where it currently points. Text
          reading bottom-to-top means the top edge is on the left, and the page
          needs 90° clockwise. Text reading top-to-bottom means the opposite.
          If a first attempt goes the wrong way, apply 180° to the result rather
          than starting over.
        </p>
        <h2>Nothing is re-compressed</h2>
        <p>
          Rotation changes a value stored on the page rather than redrawing it,
          so there is no quality loss at all, however many times you do it. That
          is worth knowing because it means experimenting costs nothing — and
          because it explains the case below.
        </p>
        <h2>When the page turns but the content does not</h2>
        <p>
          Occasionally a scan looks sideways because the image sitting inside an
          upright page is sideways. Rotating the page then turns the whole
          sheet, margins included, and you end up with a landscape page
          containing upright content. If that is unacceptable, rotate the image
          itself and rebuild the page with{" "}
          <Link href="/tools/images-to-pdf">Images to PDF</Link>.
        </p>
        <h2>Right on screen, wrong on paper</h2>
        <p>
          Some printers and older PDF processors ignore page rotation entirely.
          When a document displays correctly but prints sideways, that is what
          has happened, and no amount of re-rotating fixes it. The workaround is
          to render the pages as pictures with{" "}
          <Link href="/tools/pdf-to-images">PDF to images</Link>, which fixes
          the current appearance in place, then rebuild the PDF from those
          images. You lose selectable text, so keep it as a last resort.
        </p>
      </>
    ),
  },
  {
    slug: "passport-photo-sizes-explained",
    title: "Passport photo sizes explained: 35×45 mm, 2×2 in, and printing them correctly",
    description:
      "What the standard passport photo sizes are, which countries use which, and the printing mistake that gets photographs rejected.",
    publishedAt: WAVE_2,
    body: (
      <>
        <p>
          Passport and visa photographs are rejected for two kinds of reason:
          the picture itself breaks a rule, or the print is the wrong physical
          size. The second is entirely avoidable and, in practice, the more
          common of the two.
        </p>
        <h2>The standard sizes</h2>
        <p>
          <strong>35×45&nbsp;mm</strong> is the most widely used specification —
          Nepal, India, the United Kingdom, the European Union, Australia and
          many others. <strong>2×2 inches</strong> (about 51×51&nbsp;mm) is the
          United States format, and it is square rather than rectangular, so it
          is not interchangeable with 35×45.{" "}
          <strong>40×60&nbsp;mm</strong> appears in some national identity card
          and licence applications.
        </p>
        <p>
          Always take the size from the instructions for the exact document you
          are applying for, not from what a previous application wanted. Sizes
          differ between a country&apos;s passport, its visa, and its identity
          card.
        </p>
        <h2>Size is not the only measurement</h2>
        <p>
          Most specifications also state a head height: the distance from chin
          to the top of the head, either in millimetres or as a proportion of
          the photograph. A correctly sized print with a head that is too small
          or too large is still rejected. Crop deliberately with the{" "}
          <Link href="/tools/crop-image">crop tool</Link> before making a sheet,
          rather than accepting whatever a centre crop produces.
        </p>
        <h2>Printing: the mistake that costs you the trip</h2>
        <p>
          The <Link href="/tools/passport-photo">passport photo sheet tool</Link>{" "}
          lays out multiple copies at 300&nbsp;DPI onto a 4×6&nbsp;inch or A4
          sheet with cutting guides. That only produces true-size photographs if
          the printer prints it at 100%.
        </p>
        <ol>
          <li>
            In the print dialog, set scaling to <strong>100%</strong> or{" "}
            <strong>Actual size</strong>.
          </li>
          <li>
            Turn off &ldquo;Fit to page&rdquo;, &ldquo;Shrink oversized
            pages&rdquo;, and any automatic scaling.
          </li>
          <li>Print one sheet and measure a photo with a ruler before cutting.</li>
        </ol>
        <p>
          A photo that measures 34&nbsp;mm instead of 35 will be turned away at
          the counter, and the cause is almost always a print dialog quietly
          scaling the sheet to the printable area. If a photo shop prints the
          file for you, tell them not to crop or resize it.
        </p>
        <h2>What no tool can check</h2>
        <p>
          Background colour, even lighting, a neutral expression, no shadows,
          glasses and head coverings, and image sharpness are all judged by
          whoever receives the photograph. Read the official guidance for your
          document before printing a sheet of something that will be rejected.
        </p>
      </>
    ),
  },
  {
    slug: "gpa-scales-explained",
    title: "GPA scales explained: 4.0, percentages, and why conversions disagree",
    description:
      "How a credit-weighted GPA is calculated, why the same transcript converts to different numbers, and what to send when an application asks for a GPA.",
    publishedAt: WAVE_2,
    body: (
      <>
        <p>
          A grade point average is a simple calculation wrapped in an
          institution-specific scale, which is why two people with identical
          transcripts can honestly report different GPAs. Understanding which
          part is arithmetic and which part is local convention saves a lot of
          confusion on application forms.
        </p>
        <h2>The arithmetic, which is the same everywhere</h2>
        <p>
          Each grade is worth a number of grade points. Each course contributes
          its grade points multiplied by its credits. Add those up, divide by
          the total credits, and you have the average. The{" "}
          <Link href="/tools/gpa-calculator">GPA calculator</Link> does exactly
          this.
        </p>
        <p>
          The weighting is the part people underestimate. A B in a five-credit
          module moves the average far more than an A in a one-credit seminar,
          which is worth knowing when you are deciding where the revision time
          goes.
        </p>
        <h2>The scale, which is not</h2>
        <p>
          The 4.0 scale is a family of scales rather than one standard. Some
          institutions award 4.0 for an A and treat A+ the same; others go to
          4.3. Some use plus and minus grades at quarter-point intervals, others
          use whole letters only. Several countries use a 5.0 or 10.0 scale
          entirely, and many universities award percentages and publish their
          own bands for converting them.
        </p>
        <p>
          Those bands genuinely differ. A 75% is a first-class result in some
          systems and a middling one in others, so a percentage-to-GPA
          conversion is only meaningful alongside the institution it came from.
        </p>
        <h2>Semester GPA, cumulative GPA, and why they differ</h2>
        <p>
          A cumulative GPA is not the average of your semester GPAs unless every
          semester carried the same credits. Calculate it by entering every
          course from every semester in one list. Doing so also shows how slowly
          a cumulative average moves once several semesters are behind you — one
          strong term lifts it much less than students expect, which is an
          argument for consistency rather than a heroic final year.
        </p>
        <h2>What to put on an application</h2>
        <p>
          Report the GPA exactly as your transcript states it, with the scale it
          is on — &ldquo;3.4 / 4.0&rdquo; rather than &ldquo;3.4&rdquo;. If a
          form asks for a scale your institution does not use, use the
          institution&apos;s own published conversion, or your country&apos;s
          recognised credential evaluator, rather than a general-purpose
          converter. A calculator is the right tool for planning and for
          checking your own arithmetic; it is not a substitute for the official
          record.
        </p>
        <p>
          If your question is really about a single module rather than an
          overall average, the{" "}
          <Link href="/tools/grade-calculator">assignment grade calculator</Link>{" "}
          works out what you need on the assessments you have left.
        </p>
      </>
    ),
  },
  {
    slug: "pdf-too-large-to-email",
    title: "Your PDF is too large to email: what actually reduces the size",
    description:
      "Why a PDF is big in the first place, which fixes make a real difference, how to compress it in your browser, and what compression cannot do.",
    publishedAt: WAVE_2,
    body: (
      <>
        <p>
          Mail systems typically refuse attachments over 20–25&nbsp;MB, and
          upload forms are often far stricter. Before reaching for a compressor,
          it is worth knowing what is taking up the space, because the answer
          determines which fix works and which achieves nothing.
        </p>
        <h2>Find out what is making it big</h2>
        <p>
          Text is tiny. A hundred pages of ordinary prose is a couple of
          megabytes at most. If your PDF is large, it almost certainly contains
          images: scanned pages, photographs, or screenshots. A single page
          scanned at high resolution can be larger than a whole text document.
        </p>
        <p>
          The quick test: divide the file size by the page count. More than
          about half a megabyte per page means images are the cause.
        </p>
        <h2>What genuinely reduces the size</h2>
        <ol>
          <li>
            <strong>Send less of it.</strong> If the recipient needs three pages,
            send three pages.{" "}
            <Link href="/tools/extract-pages">Extract pages</Link> or{" "}
            <Link href="/tools/split-pdf">Split PDF</Link> will produce a fraction
            of the original, instantly and without any loss of quality.
          </li>
          <li>
            <strong>Compress the images already inside it.</strong> If the PDF
            exists and you cannot rebuild it, run it through{" "}
            <Link href="/tools/compress-pdf">Compress PDF</Link>. It downscales
            and re-encodes the scans and photos inside the file and leaves the
            text alone. Start with the Balanced level; it shows the exact before
            and after size, so you know immediately whether you are under the
            limit.
          </li>
          <li>
            <strong>Shrink the images before building the PDF.</strong> If you
            are assembling photographs with{" "}
            <Link href="/tools/images-to-pdf">Images to PDF</Link>, resize and
            compress them first with the{" "}
            <Link href="/tools/image-resizer">resizer</Link> and{" "}
            <Link href="/tools/image-compressor">compressor</Link>. Reducing a
            12-megapixel photo to about 1600 pixels wide removes most of the
            bulk and looks identical on screen.
          </li>
          <li>
            <strong>Rescan at a sensible resolution.</strong> Scanners often
            default to 600&nbsp;DPI in colour. For a text document,
            200–300&nbsp;DPI in greyscale is legible, archival, and a small
            fraction of the size.
          </li>
          <li>
            <strong>Share a link instead.</strong> For genuinely large documents
            this is what the rest of the world does, and it avoids the problem
            rather than degrading the file.
          </li>
        </ol>
        <h2>What does not help</h2>
        <p>
          Zipping a PDF saves very little, because its images are already
          compressed. Removing metadata saves kilobytes. Printing to PDF from a
          viewer sometimes helps and sometimes doubles the size, depending on
          the driver — check before trusting it.
        </p>
        <h2>What compression can and cannot do</h2>
        <p>
          A compressor can only shrink what is compressible. On a scanned
          contract or a photo-heavy report, re-encoding the images commonly
          removes half to nine-tenths of the size. On a PDF exported from a
          word processor, which is mostly text and fonts, there is almost
          nothing to take out — no honest tool will turn a 6&nbsp;MB text PDF
          into a 600&nbsp;KB one, and the ones that claim to are usually
          rasterising your text into blurry images.
        </p>
        <p>
          Compression is also lossy. Every level reduces image detail a little,
          and the Strong level visibly softens fine print in scans. Zoom into
          the smallest text in the result before sending it, and keep the
          original: compressing a copy that was already compressed adds new
          damage on top of the old.
        </p>
        <p>
          If compression alone does not get you under the limit, combine it
          with the first fix on this list: extract the pages that matter, then
          compress that smaller file.
        </p>
      </>
    ),
  },
  {
    slug: "cannot-copy-text-from-pdf",
    title: "You cannot copy text from a PDF: here is why, and what to do",
    description:
      "Scanned PDFs contain pictures of text, not text. How to tell which kind you have, how to extract what is there, and how to OCR a scan on your own device.",
    publishedAt: WAVE_2,
    body: (
      <>
        <p>
          You open a PDF, drag across a paragraph, and the selection highlights a
          blue rectangle instead of words. Nothing is broken — the document
          simply does not contain any text.
        </p>
        <h2>Two kinds of PDF that look identical</h2>
        <p>
          A PDF exported from a word processor stores real characters with fonts
          and positions. A PDF produced by a scanner or a phone camera stores a
          photograph of a page and nothing else. Both display the same way and
          only one can be copied from.
        </p>
        <p>
          The test takes two seconds: try to select a single word. If the
          selection follows the word, the text is there. If it draws a box over
          the whole page, you have a scan.
        </p>
        <h2>If the text is there</h2>
        <p>
          Use{" "}
          <Link href="/tools/extract-text">Extract text</Link> to pull the whole
          document out as plain text, or copy from the{" "}
          <Link href="/tools/pdf-viewer">viewer</Link>. Expect the formatting to
          be gone — plain text has no headings, tables, or images — and expect
          multi-column layouts to interleave, because a PDF records where text
          sits on the page rather than the order a human reads it in. Splitting
          the job page by page usually gives a cleaner result than one pass over
          a hundred pages, and{" "}
          <Link href="/tools/remove-spaces">Remove extra spaces</Link> tidies the
          ragged whitespace that extraction leaves behind.
        </p>
        <p>
          Two other quirks worth a search-and-replace: hyphens inserted at line
          breaks stay in the extracted text and split words in half, and
          ligatures such as &ldquo;fi&rdquo; occasionally arrive as unexpected
          characters. The guide to{" "}
          <Link href="/learn/clean-up-pasted-text">cleaning up pasted text</Link>{" "}
          shows how to rejoin lines that were broken at every printed line end.
        </p>
        <h2>If it is a scan</h2>
        <p>
          Converting a picture of text into text requires optical character
          recognition (OCR). Before reaching for it, ask whoever sent the
          document for the original file: the source usually still exists, and
          it is better than any conversion, because OCR reads letters by
          guessing at shapes and always makes some mistakes.
        </p>
        <p>
          If the scan is all you have, you can do the recognition on your own
          device. Open the PDF in{" "}
          <Link href="/tools/ocr-pdf">Scanned PDF to text</Link>, pick the
          language of the document (English, Nepali and Hindi are available),
          and leave the page box empty to read everything or type a range for
          a long file. Each page is rendered at about 300 DPI — OCR accuracy
          depends mostly on how many pixels each letter has — and read in your
          browser; pages that already contain real text are copied exactly
          instead of being guessed at. Copy the result or download it as a
          text file.
        </p>
        <p>
          A page with two columns is the one case worth doing by hand: export
          it with <Link href="/tools/pdf-to-images">PDF to images</Link>, crop
          each column into its own image, and read the pieces with{" "}
          <Link href="/tools/image-to-text">Image to text</Link>, so the lines
          are not read straight across both columns.
        </p>
        <p>
          Budget time for proofreading. Check every number, name and date
          against the page, since a misread digit looks perfectly plausible.
          Handwriting, faint photocopies and pages photographed at an angle
          recognise poorly; a fresh, straight, well-lit scan helps far more
          than running the same image twice.
        </p>
        <h2>A note on protected documents</h2>
        <p>
          Some PDFs contain real text but set a permission flag that asks
          viewers to disallow copying. That is a request honoured by software
          rather than encryption, and it usually accompanies a document whose
          author had a reason for it. Tools on this site do not open
          password-protected PDFs or work around document restrictions.
        </p>
      </>
    ),
  },
  {
    slug: "clean-up-pasted-text",
    title: "How to clean up pasted text: stray spaces, duplicates, capitals and line breaks",
    description:
      "A practical order for tidying text copied out of PDFs, spreadsheets and emails: which fix to run first, what each tool really changes, and the mess no tool fixes for you.",
    publishedAt: "2026-10-24",
    body: (
      <>
        <p>
          Text rarely survives a copy and paste intact. A paragraph from a PDF
          arrives broken into short lines, a column from a spreadsheet brings
          tabs and repeated entries with it, and a heading from an old document
          is in capitals throughout. Each problem has a quick fix, but the order
          you apply them in matters: run them in the wrong sequence and one fix
          quietly undoes the usefulness of the next.
        </p>
        <h2>The short version</h2>
        <ol>
          <li>Start from the cleanest source you can get.</li>
          <li>
            Remove stray whitespace with{" "}
            <Link href="/tools/remove-spaces">Remove extra spaces</Link> (unless
            the text is tab-separated columns).
          </li>
          <li>
            Fix capitalisation with the{" "}
            <Link href="/tools/case-converter">case converter</Link>, then
            correct names and acronyms by hand.
          </li>
          <li>
            Remove repeated lines with{" "}
            <Link href="/tools/dedupe-lines">Remove duplicate lines</Link>, and
            sort if order does not matter.
          </li>
          <li>
            Check what changed with{" "}
            <Link href="/tools/text-compare">Text compare</Link>, and count with
            the <Link href="/tools/word-counter">word counter</Link> last.
          </li>
        </ol>
        <p>
          The rest of this guide explains why that order works, and what to do
          with text from the three most common sources of mess.
        </p>
        <h2>Step zero: a better source beats a better clean-up</h2>
        <p>
          Every later step is easier if less damage happens on the way in. If
          the text comes from a PDF, pull it out with{" "}
          <Link href="/tools/extract-text">Extract text</Link> rather than
          dragging a selection across several pages; selections across columns
          and page breaks pick up headers, footers and page numbers in the
          middle of sentences. If the original document is a word processor file
          you can ask for, ask: the source has none of the problems below. And if
          you cannot select the text at all, the PDF is a scan, which{" "}
          <Link href="/learn/cannot-copy-text-from-pdf">
            needs a different approach
          </Link>
          .
        </p>
        <h2>Why whitespace goes first</h2>
        <p>
          Invisible differences break visible operations. To a computer,{" "}
          <code>apple</code> and <code>apple </code> with a trailing space are
          different lines, so a deduplicator keeps both and a comparison marks
          both as changed. Cleaning spaces first means every later step sees
          the text the way you do.
        </p>
        <p>
          Remove extra spaces collapses runs of spaces and tabs into a single
          space, trims the start and end of each line, and reduces three or more
          blank lines to one. It keeps single blank lines, because that is how
          plain text separates paragraphs. It does not touch your words or
          punctuation, and it does not join lines back together, which matters
          for PDF text (see below).
        </p>
        <p>
          The exception is tabular data. If you copied several spreadsheet
          columns, the columns are separated by tabs, and turning those tabs
          into spaces destroys the boundaries between cells. Skip this step for
          that kind of text, or clean one column at a time.
        </p>
        <h2>Text copied from a PDF</h2>
        <p>
          A PDF stores each line of a page as a separate run of text, so copied
          paragraphs arrive with a hard line break at the end of every printed
          line. Whitespace cleaning tidies the ragged spacing but leaves those
          breaks in place, because a tool cannot reliably tell a line that ends
          a paragraph from one that merely reached the margin.
        </p>
        <p>
          A word processor&apos;s find-and-replace can rejoin them in three
          passes. In Microsoft Word, where <code>^p</code> means a paragraph
          mark: replace <code>^p^p</code> with a placeholder such as{" "}
          <code>@@@</code> to protect real paragraph breaks, replace{" "}
          <code>^p</code> with a single space, then replace <code>@@@</code>{" "}
          with <code>^p^p</code>. Other editors offer the same through regular
          expressions. Run Remove extra spaces afterwards to catch the double
          spaces the join creates.
        </p>
        <p>
          Watch for two leftovers. Words hyphenated across a line break arrive
          as <code>infor- mation</code>, which both reads badly and counts as
          two words. And ligatures such as &ldquo;fi&rdquo; and &ldquo;fl&rdquo;
          sometimes paste as single unusual characters that look right but
          will not match a search for the ordinary letters.
        </p>
        <h2>Text copied from a spreadsheet</h2>
        <p>
          Copying a single column gives you one cell per line, which is exactly
          the format the line tools expect. That makes the spreadsheet route
          the easiest one: copy the column, paste it into Remove duplicate
          lines, and you have a list of unique values without writing a
          formula.
        </p>
        <p>
          Copying whole rows works too, with care. Each row becomes one line
          with tabs between the cells, and two rows count as duplicates only if
          every cell matches. That is often what you want for spotting repeated
          records, so deduplicate before any whitespace cleaning here. Cells
          that contain their own line breaks are the one thing that will not
          survive: they are split across several lines in plain text.
        </p>
        <h2>Lists merged from several emails or documents</h2>
        <p>
          Mailing lists, attendee lists and reference lists gathered from
          several places are where duplicates pile up. For addresses and
          usernames, leave case sensitivity off so that{" "}
          <code>Asha@Example.com</code> and <code>asha@example.com</code> count
          as one entry. Put your most trustworthy list first: when two lines
          differ only in capitalisation, the first one is the version kept.
        </p>
        <p>
          Blank lines are lines too, so only the first one survives
          deduplication. That is harmless for a list but will flatten a
          document with paragraph gaps, so deduplicate lists rather than
          prose. Sorting is applied after duplicates are removed, sorts as
          text rather than numbers (so <code>10</code> comes before{" "}
          <code>9</code>), and is mainly useful for bringing near-duplicates
          such as two spellings of one name next to each other, where you can
          spot them by eye.
        </p>
        <h2>Fixing capitals without creating new mistakes</h2>
        <p>
          Converting to lower case or upper case is completely predictable.
          Title case and sentence case are not, because they lower-case
          everything before applying their rule. Acronyms become{" "}
          <code>Pdf</code> and <code>Nasa</code>, names in sentence case lose
          their capitals, and title case capitalises every word including
          &ldquo;of&rdquo; and &ldquo;and&rdquo;, which most style guides keep
          small. Sentence case also capitalises after abbreviations such as
          &ldquo;e.g.&rdquo;, because it cannot tell them from the end of a
          sentence.
        </p>
        <p>
          Convert, then read the result once with names, acronyms and short
          words in mind. For a heading that arrived in shouting capitals, that
          is still far quicker than retyping it.
        </p>
        <h2>Check your work before you paste it anywhere</h2>
        <p>
          Paste the text from before a clean-up into the first box of Text
          compare and the result into the second. After deduplication without
          sorting, the lines marked as removed are exactly the duplicates that
          were dropped, which is a fast way to confirm nothing you needed went
          with them. After a whitespace clean, many lines will show as changed
          even though only spacing moved, so use the comparison there to look
          for anything unexpected rather than to review every line.
        </p>
        <p>
          Count words last. Stray line breaks and split hyphenated words both
          inflate a count, so a figure taken from the cleaned text is the one
          to trust against an assignment or form limit.
        </p>
        <h2>What none of these tools can fix</h2>
        <p>
          Non-breaking spaces and zero-width characters from web pages look
          like ordinary spaces, or like nothing, but are different characters,
          so lines containing them may still refuse to match. Near-duplicates
          such as &ldquo;Ram Sharma&rdquo; and &ldquo;R. Sharma&rdquo; need a
          person to decide whether they are the same. And no clean-up restores
          formatting: plain text has no bold, tables or headings, so anything
          that depended on them needs rebuilding in the destination document.
        </p>
        <p>
          All of the tools above run in your browser and the text you paste is
          not sent anywhere, which matters when the list is a class register or
          the draft is something you have not published yet.
        </p>
      </>
    ),
  },
  {
    slug: "resize-photo-for-online-form",
    title: "How to make a photo fit an online form: exact pixels, KB limits and the right format",
    description:
      "A step-by-step order for photos and signatures that an application portal keeps rejecting: crop to the shape, resize to the exact pixels, pick JPG or PNG, then get under the file-size limit.",
    publishedAt: "2026-10-26",
    body: (
      <>
        <p>
          Exam registrations, job applications, visa portals and university
          admissions often want a photo or signature that is &ldquo;200 × 230
          pixels, JPG only, between 20 and 50 KB&rdquo;. A phone photo is
          nothing like that: around 3000 × 4000 pixels, several megabytes, and
          sometimes in a format the portal has never heard of. Each rule is
          easy to meet on its own. The trick is meeting them in the right
          order, because a later step can quietly undo an earlier one.
        </p>
        <h2>The short version</h2>
        <ol>
          <li>
            <strong>Shape:</strong> crop to the portal&apos;s proportions with{" "}
            <Link href="/tools/crop-image">Crop image</Link>.
          </li>
          <li>
            <strong>Pixels:</strong> set the exact width and height with the{" "}
            <Link href="/tools/image-resizer">Image resizer</Link>.
          </li>
          <li>
            <strong>Format:</strong> save as JPG unless the portal says
            otherwise, using the{" "}
            <Link href="/tools/image-converter">Image converter</Link> if the
            file is in the wrong one.
          </li>
          <li>
            <strong>File size:</strong> bring it under the KB limit with the{" "}
            <Link href="/tools/image-compressor">Image compressor</Link>,
            which shows the new size before you download.
          </li>
        </ol>
        <p>
          Before you start, read the portal&apos;s instructions once more and
          write down four things: width and height in pixels, the allowed
          formats, the maximum (and sometimes minimum) file size, and anything
          about the picture itself, such as background colour or how much of
          the frame the face should fill.
        </p>
        <h2>Step 1: crop to the right shape first</h2>
        <p>
          Width divided by height is the shape of the picture. A phone photo is
          usually 3:4 in portrait; a portal asking for 200 × 230 wants a shape
          of about 0.87, slightly wider than 3:4; a signature box of 140 × 60
          wants a long, thin strip. If you skip this step and force a 3:4
          photo straight into 200 × 230, the resizer has to stretch it, and
          faces come out visibly wider.
        </p>
        <p>
          In <Link href="/tools/crop-image">Crop image</Link>, choose a preset
          if one matches (Square 1:1, Portrait 3:4, 4:3, 16:9). For anything
          else, choose Free and move the width and height sliders while
          watching the &ldquo;Output&rdquo; line under the preview, which shows
          the crop in pixels. You are aiming for the same ratio as the target,
          not the same numbers: for 200 × 230, an output of 2000 × 2300 or
          1740 × 2000 is ideal, and anything within a few per cent is fine
          because the next step absorbs the small difference without a visible
          stretch. Then use the offset sliders to place the face or signature
          where the portal wants it.
        </p>
        <p>
          Crop away everything that is not the subject. For signatures, that
          means a tight box around the ink with a small margin, not the whole
          sheet of paper. For photos, follow the portal&apos;s guidance on
          head size; for printed passport photos, the{" "}
          <Link href="/learn/passport-photo-sizes-explained">passport photo
          size guide</Link> covers the common specifications.
        </p>
        <h2>Step 2: resize to the exact pixels</h2>
        <p>
          Open the cropped file in the{" "}
          <Link href="/tools/image-resizer">Image resizer</Link>. With
          &ldquo;Lock aspect ratio&rdquo; ticked, typing a width fills in the
          matching height. If that height is one or two pixels away from the
          portal&apos;s number, untick the box and type both numbers exactly:
          because you already cropped to the right shape, the adjustment is too
          small to see. The downloaded file is named with its new size, such as{" "}
          <code>photo-200x230.jpg</code>, so you can tell it apart from the
          original.
        </p>
        <p>
          <strong>If the form gives centimetres and DPI instead of
          pixels,</strong> convert it: pixels = centimetres ÷ 2.54 × DPI. A
          3.5 × 4.5&nbsp;cm photo at 300&nbsp;DPI is 3.5 ÷ 2.54 × 300 ≈ 413
          pixels wide and 4.5 ÷ 2.54 × 300 ≈ 531 pixels tall. On a screen and
          in an upload checker it is the pixel size that counts. Browsers
          typically do not write a print resolution into the files they save,
          so if a portal checks a DPI value stored in the file itself, that one
          rule needs a desktop photo editor.
        </p>
        <p>
          Going smaller is always safe. Going larger is not useful: resizing a
          150-pixel signature to 600 pixels gives a bigger, blurrier version of
          the same 150 pixels. If a portal wants more pixels than you have,
          take a new photo or scan at a higher resolution.
        </p>
        <h2>Step 3: choose the format the portal accepts</h2>
        <p>
          Most portals ask for <strong>JPG</strong> (also written JPEG; the two
          are the same thing). JPG is small and suits photos. <strong>PNG</strong>{" "}
          keeps every pixel exactly and supports transparent backgrounds, which
          makes it better for logos and crisp signatures, but it is usually
          several times larger. <strong>WebP</strong> is smaller still, but
          older portals often reject it.
        </p>
        <p>
          The crop tool and the resizer both let you choose the output format,
          so you can usually pick JPG there and skip a separate conversion. If
          you start with a WebP screenshot, or a PNG the portal will not take,
          the <Link href="/tools/image-converter">Image converter</Link>{" "}
          switches between JPG, PNG and WebP. JPG cannot store transparency, so
          transparent areas become white, which is normally what a form wants
          for a signature or logo. Renaming <code>photo.png</code> to{" "}
          <code>photo.jpg</code> does not convert anything; many portals check
          the real contents and reject a renamed file.
        </p>
        <p>
          iPhone photos saved as HEIC need converting to JPG first. The
          simplest route today is the phone itself: on an iPhone, Settings →
          Camera → Formats → Most Compatible saves new photos as JPG, and
          sharing or emailing a photo often converts it on the way.
        </p>
        <h2>Step 4: get under the KB limit</h2>
        <p>
          After resizing, a 200 × 230 photo is usually already far below a
          50&nbsp;KB limit, because pixel count drives file size more than
          anything else. If it is still too big, open it in the{" "}
          <Link href="/tools/image-compressor">Image compressor</Link>. Move the
          quality slider down and watch the compressed size update next to the
          original; stop at the highest quality that fits. For photos, 70–80%
          is rarely distinguishable from the original at normal size. The
          compressor keeps the pixel dimensions exactly as they are, so it will
          not undo step 2.
        </p>
        <p>
          Two details catch people out. First, a kilobyte can mean 1,000 or
          1,024 bytes, and portals do not always say which. GlassTools shows
          sizes in units of 1,024 bytes, so aim a few KB under the limit rather
          than exactly at it. Second, some portals also set a{" "}
          <em>minimum</em>, such as &ldquo;at least 10 KB&rdquo;. If your file
          is too small, raise the quality, or save as PNG, rather than making
          the picture larger than the stated pixel size.
        </p>
        <p>
          If a signature still will not shrink, the cause is usually a grey,
          textured paper background. Rescan on plain white paper in good light,
          or crop tighter; flat white compresses to almost nothing.
        </p>
        <h2>When the portal still says no</h2>
        <ul>
          <li>
            <strong>&ldquo;Invalid dimensions&rdquo;:</strong> open the final
            file in the resizer, which shows its current width and height, and
            compare them with the requirement number by number. Instructions
            sometimes list the height first, so check which number is the
            width.
          </li>
          <li>
            <strong>&ldquo;Invalid file type&rdquo;:</strong> the file is
            probably PNG or WebP with a .jpg name, or HEIC. Convert it properly
            with the <Link href="/tools/image-converter">Image converter</Link>.
          </li>
          <li>
            <strong>&ldquo;File too large&rdquo; just under the limit:</strong>{" "}
            the portal is counting in 1,000-byte kilobytes. Compress a little
            further.
          </li>
          <li>
            <strong>The photo looks squashed:</strong> you resized with the
            aspect lock off without cropping first. Start again from the
            original and crop to the shape before resizing.
          </li>
          <li>
            <strong>The portal wants a PDF:</strong> turn the finished image
            into one with <Link href="/tools/images-to-pdf">Images to PDF</Link>.
          </li>
        </ul>
        <h2>What no tool can fix</h2>
        <p>
          Every step above changes the file, not the photograph. A blurred
          picture, a shadow across the face, a coloured background where the
          rules ask for white, or a signature on lined paper will be rejected
          however perfectly it is sized, so retaking the photo is often faster
          than trying to rescue it. Make every edit from the original, too:
          compressing an already compressed JPG again and again adds blocky
          artefacts each time.
        </p>
        <p>
          All four tools run in your browser. Your photo, ID or signature is
          processed on your own device and is never uploaded, which is worth
          knowing when the file is something you would not want stored on a
          stranger&apos;s server. For general size advice when emailing photos,
          see{" "}
          <Link href="/learn/shrink-images-for-email">shrinking images for
          email and upload portals</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "attendance-percentage-classes-you-can-miss",
    title: "How many classes can I miss? Attendance percentage, worked out",
    description:
      "The formulas behind a 75% attendance rule: your current percentage, the classes you need to recover, how many you can safely miss, and when a term can no longer be saved.",
    publishedAt: "2026-10-28",
    body: (
      <>
        <p>
          Most colleges and universities that track attendance set a minimum —
          75% is the most common, with 65%, 80% and 85% close behind — and
          missing it can mean a warning, a fine, or being barred from the final
          exam. The rule is simple to state, but the arithmetic around it
          catches people out, mostly because every class held changes the
          number whether you were there or not. This guide shows the
          calculations, so you can check where you stand and plan the rest of
          the term rather than finding out from a notice board.
        </p>

        <h2>Your current percentage</h2>
        <p>
          Attendance percentage is classes attended divided by classes held,
          times 100. If 40 classes have been held and you attended 26, you are
          on 26 ÷ 40 × 100 = 65%. Two details matter more than the division:
        </p>
        <ul>
          <li>
            <strong>Use the count your institution uses.</strong> Your own diary
            may say 28, but if the register says 26, the register decides. Many
            portals let you see the official numbers; check them early in the
            term, when a recording mistake is still easy to correct.
          </li>
          <li>
            <strong>Know what the count covers.</strong> Some institutions
            calculate per subject, others across all subjects together, and
            labs, practicals and tutorials are often tracked separately from
            lectures. A healthy overall percentage can hide one subject that is
            below the line.
          </li>
        </ul>
        <p>
          The{" "}
          <Link href="/tools/attendance-calculator">attendance calculator</Link>{" "}
          shows this figure as soon as you type the two numbers, along with the
          two answers below.
        </p>

        <h2>How many classes you need to get back above the line</h2>
        <p>
          If you are below the requirement, the useful question is how many
          classes in a row you must attend to cross it. Write the requirement as
          a decimal, <em>r</em> (75% is 0.75). Then:
        </p>
        <p>
          <code>classes needed = (r × held − attended) ÷ (1 − r)</code>, rounded
          up to a whole class.
        </p>
        <p>
          For 26 out of 40 at 75%: (0.75 × 40 − 26) ÷ 0.25 = 4 ÷ 0.25 = 16. After
          16 more classes, all attended, you have 42 out of 56, which is exactly
          75%. Each class you attend adds one to both numbers, which is why it
          takes far more than four classes to make up a gap of four.
        </p>
        <p>
          The requirement itself changes the answer sharply. Someone on 18 out
          of 25 (72%) needs 3 classes to reach 75%, 10 to reach 80%, and 22 to
          reach 85%. If your course has a higher threshold for one subject, run
          that subject separately.
        </p>

        <h2>The real cost of one absence</h2>
        <p>
          Missing a class adds one to the classes held and nothing to the
          classes attended. Undoing that takes <em>r ÷ (1 − r)</em> consecutive
          attended classes — three at 75%. The higher the requirement, the more
          expensive each absence becomes:
        </p>
        <div className="table-wrap" role="region" aria-label="Cost of an absence by attendance requirement" tabIndex={0}>
          <table>
            <caption>
              Classes you must attend to make up for one absence, and the most
              absences a 60-class term allows
            </caption>
            <thead>
              <tr>
                <th scope="col">Required</th>
                <th scope="col">Classes to recover one absence</th>
                <th scope="col">Absences allowed in 60</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>60%</td><td>1.5</td><td>24</td></tr>
              <tr><td>65%</td><td>≈ 1.9</td><td>21</td></tr>
              <tr><td>70%</td><td>≈ 2.3</td><td>18</td></tr>
              <tr><td>75%</td><td>3</td><td>15</td></tr>
              <tr><td>80%</td><td>4</td><td>12</td></tr>
              <tr><td>85%</td><td>≈ 5.7</td><td>9</td></tr>
              <tr><td>90%</td><td>9</td><td>6</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The recovery figures assume you were sitting exactly on the line
          before the absence; you cannot attend part of a class, so in practice
          you round up. The last column is the whole term&apos;s allowance:
          multiply the total classes in the term by (1 − <em>r</em>) and round
          down. At 75% of 60 classes, that is 15 absences for the entire term —
          illness included.
        </p>

        <h2>How many classes you can miss</h2>
        <p>
          If you are above the requirement, the reverse question is how many of
          the next classes you could miss and still stay at or above it:
        </p>
        <p>
          <code>classes you can miss = attended ÷ r − held</code>, rounded down.
        </p>
        <p>
          For 45 out of 52 (86.5%) at 75%: 45 ÷ 0.75 − 52 = 60 − 52 = 8. Miss
          the next eight and you are on 45 out of 60, exactly 75%; miss a ninth
          and you are below. That buffer is not fixed. Each class you attend
          adds (1 − <em>r</em>) ÷ <em>r</em> to it — a third of a class at
          75% — so attending the next four lifts it from 8 to 9. Each class you
          miss uses up a whole one.
        </p>
        <p>
          Treat the buffer as cover for illness, travel and emergencies you have
          not had yet, rather than a number of free days. Students who spend it
          in the first half of the term are the ones who have nothing left when
          they actually fall ill in the second.
        </p>

        <h2>Check whether the term can still be saved</h2>
        <p>
          The classes-needed figure is only useful if there are that many
          classes left. Find out how many classes the term will have in total —
          the timetable usually tells you — and work out the best percentage you
          could finish with by attending every remaining one:
        </p>
        <p>
          <code>best possible = (attended + classes remaining) ÷ total classes in the term × 100</code>
        </p>
        <p>
          Back to 26 out of 40. If the term has 60 classes, 20 remain, and
          attending all of them gives 46 out of 60, or 76.7% — recoverable, but
          only with no further absences. If the term has 50 classes, 10 remain,
          and the best possible finish is 36 out of 50, or 72%. No amount of
          attendance now reaches 75%, and the useful step is a conversation with
          your department, not more arithmetic. The{" "}
          <Link href="/tools/percentage-calculator">percentage calculator</Link>{" "}
          does this sum in its &ldquo;Part as % of Whole&rdquo; row: enter the
          best-case attended count as the part and the term&apos;s total
          classes as the whole.
        </p>

        <h2>Rounding: is 74.5% enough?</h2>
        <p>
          Sometimes, but do not plan on it. Some institutions round to the
          nearest whole number, some cut off the decimals, and some require the
          exact figure to be at or above the line. On 149 out of 200 you are on
          74.5%: rounded, that might pass; truncated or exact, it does not. Four
          more attended classes take you to 153 out of 204, exactly 75%, which
          passes under every method. The attendance calculator never rounds you
          up — it treats the requirement as a hard line — so its answers are the
          safe ones.
        </p>

        <h2>Rules no calculator knows</h2>
        <p>
          The formulas are the same everywhere; the regulations are not. Before
          relying on any figure, read your handbook or academic regulations for
          these points:
        </p>
        <ul>
          <li>
            Whether medical, sports or compassionate leave is removed from the
            count, and what proof is needed and by when. Keep certificates and
            letters, and submit them promptly rather than at the end of term.
          </li>
          <li>
            Whether there is a lower threshold below which a shortfall can be
            excused (often called condonation) and what that involves.
          </li>
          <li>
            Whether being late counts as absent, and whether a double period
            counts as one class or two.
          </li>
          <li>
            Whether the count starts from the first day of term or from your
            registration date, if you joined late.
          </li>
          <li>
            Whether warnings and exam eligibility use different thresholds.
          </li>
        </ul>
        <p>
          If you are behind for a reason your institution would accept, raise it
          as soon as you know rather than after the cut-off. Departments can
          usually do far more for a student who comes to them in week six than
          for one who appears after the eligibility list is published.
        </p>

        <h2>A five-minute routine for the rest of the term</h2>
        <ol>
          <li>
            Note the official attended and held counts for each subject that has
            its own requirement.
          </li>
          <li>
            Put each pair into the{" "}
            <Link href="/tools/attendance-calculator">attendance calculator</Link>{" "}
            with your institution&apos;s required percentage.
          </li>
          <li>
            For any subject below the line, compare the classes needed with the
            classes left in the term.
          </li>
          <li>
            For any subject above it, write down the buffer and keep it for
            illness.
          </li>
          <li>Repeat every couple of weeks; the numbers change with every class held.</li>
        </ol>
        <p>
          The calculator runs entirely in your browser and nothing you type is
          sent or saved. If marks are the bigger worry than attendance, the{" "}
          <Link href="/tools/grade-calculator">assignment grade calculator</Link>{" "}
          works out what you need on the assessments you have left, and{" "}
          <Link href="/learn/gpa-scales-explained">GPA scales explained</Link>{" "}
          covers how those marks turn into an overall average.
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
  "rotate-pdf": ["rotate-one-page-in-a-pdf", "remove-pages-from-pdf"],
  "reorder-pages": ["rotate-one-page-in-a-pdf", "prepare-assignment-pdf-for-submission"],
  "watermark-pdf": ["are-online-pdf-tools-safe"],
  "page-numbers": ["prepare-assignment-pdf-for-submission"],
  "compress-pdf": ["pdf-too-large-to-email", "prepare-assignment-pdf-for-submission", "are-online-pdf-tools-safe"],
  "images-to-pdf": ["images-to-pdf-quality", "shrink-images-for-email", "pdf-too-large-to-email"],
  "pdf-to-images": ["images-to-pdf-quality", "rotate-one-page-in-a-pdf"],
  "pdf-viewer": ["cannot-copy-text-from-pdf", "are-online-pdf-tools-safe"],
  "pdf-metadata": ["are-online-pdf-tools-safe"],
  "extract-text": ["cannot-copy-text-from-pdf", "clean-up-pasted-text", "are-online-pdf-tools-safe"],
  "ocr-pdf": ["cannot-copy-text-from-pdf", "clean-up-pasted-text", "are-online-pdf-tools-safe"],
  "image-to-text": ["cannot-copy-text-from-pdf", "clean-up-pasted-text", "are-online-pdf-tools-safe"],
  "image-compressor": ["shrink-images-for-email", "resize-photo-for-online-form", "pdf-too-large-to-email"],
  "image-resizer": ["resize-photo-for-online-form", "shrink-images-for-email", "passport-photo-sizes-explained"],
  "image-converter": ["resize-photo-for-online-form", "shrink-images-for-email"],
  "crop-image": ["resize-photo-for-online-form", "passport-photo-sizes-explained"],
  "passport-photo": ["passport-photo-sizes-explained", "shrink-images-for-email"],
  "remove-exif": ["are-online-pdf-tools-safe", "shrink-images-for-email"],
  "word-counter": ["prepare-assignment-pdf-for-submission", "clean-up-pasted-text"],
  "case-converter": ["clean-up-pasted-text"],
  "remove-spaces": ["clean-up-pasted-text", "cannot-copy-text-from-pdf"],
  "dedupe-lines": ["clean-up-pasted-text"],
  "text-compare": ["clean-up-pasted-text"],
  "cover-page": ["prepare-assignment-pdf-for-submission"],
  "gpa-calculator": ["gpa-scales-explained"],
  "grade-calculator": ["gpa-scales-explained"],
  "attendance-calculator": ["attendance-percentage-classes-you-can-miss", "gpa-scales-explained"],
  "percentage-calculator": ["attendance-percentage-classes-you-can-miss"],
};
