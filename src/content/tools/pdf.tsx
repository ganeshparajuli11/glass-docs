import Link from "next/link";
import type { ToolContentMap } from "./types";

/** Long-form content for the PDF tools. See ./types.ts for the contract. */
export const pdfToolContent: ToolContentMap = {
  "merge-pdf": {
    lede: (
      <>
        Merging joins several PDFs end to end so they open as one document, in
        the order you set. It is the right tool when a scanner produced one file
        per page, when a form and its attachments arrived separately, or when a
        report needs a cover page in front of it.
      </>
    ),
    steps: [
      <>
        Drop your PDFs onto the file area, or select them with the file browser.
        You can add more files later without starting over.
      </>,
      <>
        Check the order in the file list. The first file becomes the first pages
        of the result, and the move buttons shift a file up or down one place.
      </>,
      <>
        Select <strong>Merge</strong>. Everything happens on your own device, so
        the time it takes depends on your computer or phone, not on a connection
        speed.
      </>,
      <>
        Download the combined PDF and open it once. Checking the joins between
        documents takes ten seconds and catches the mistake people actually make
        — a file in the wrong position.
      </>,
    ],
    sections: [
      {
        heading: "Getting the page order right the first time",
        body: (
          <>
            <p>
              Almost every merge problem is an ordering problem, and it is much
              easier to fix before merging than after. Two habits help. First,
              rename your files so that they sort the way you want before you
              add them — <code>01-cover.pdf</code>, <code>02-report.pdf</code>,{" "}
              <code>03-appendix.pdf</code>. Second, if a file contains pages that
              belong in two different places, split it first with the{" "}
              <Link href="/tools/split-pdf">Split PDF tool</Link> and add the two
              parts separately, rather than merging and trying to shuffle pages
              afterwards.
            </p>
            <p>
              If you do end up with pages out of order in the merged file, you do
              not need to redo the merge — open the result in{" "}
              <Link href="/tools/reorder-pages">Reorder pages</Link> and move
              them there.
            </p>
          </>
        ),
      },
      {
        heading: "What is preserved, and what is lost",
        body: (
          <>
            <p>
              Page content, page size, and page rotation carry over exactly. Each
              page keeps its own dimensions, so merging an A4 report with a
              Letter-sized invoice gives you a document with mixed page sizes
              rather than a rescaled mess. That is usually what you want on
              screen, and occasionally surprising when printing.
            </p>
            <p>
              Bookmarks, form fields, and document-level structure from the
              source files are not carried into the result. If your PDF relies on
              a clickable table of contents or on fillable fields, merge it in
              the application that produced it instead. Annotations and links
              that live on a page generally survive; anything stored at the
              document level does not.
            </p>
          </>
        ),
      },
      {
        heading: "When merging will not work",
        body: (
          <>
            <p>
              A password-protected PDF cannot be read, so it cannot be merged.
              Remove the protection in the program that applied it, then merge
              the unprotected copy. There is no way around this that does not
              involve breaking the protection, which this tool deliberately does
              not do.
            </p>
            <p>
              Large scanned documents are the other common obstacle. A merge runs
              in your browser using your device&apos;s memory, so several hundred
              megabytes of scans can be slow on a phone and may simply run out of
              memory. Keep the combined size under about 50&nbsp;MB for a
              comfortable experience, and move to a laptop for anything much
              larger.
            </p>
          </>
        ),
      },
    ],
  },

  "split-pdf": {
    lede: (
      <>
        Splitting takes one PDF apart into smaller ones — a chapter you need to
        send on its own, a single signed page, or one file per page of a scanned
        batch. Three split modes cover the cases that come up in practice.
      </>
    ),
    steps: [
      <>Add the PDF you want to split. The page count appears once it loads.</>,
      <>
        Choose a <strong>Split mode</strong>: selected pages into one PDF, one
        PDF per range, or every page separately.
      </>,
      <>
        For the first two modes, type your pages in the range box — for example{" "}
        <code>1-3, 5, 8-10</code>.
      </>,
      <>
        Split, then download. Multiple output files download individually, so
        allow your browser to save more than one file if it asks.
      </>,
    ],
    sections: [
      {
        heading: "How to write a page range",
        body: (
          <>
            <p>
              A range expression is a comma-separated list, and each item is
              either a single page (<code>5</code>) or a span (<code>8-10</code>
              ). So <code>1-3, 5, 8-10</code> means pages 1, 2, 3, 5, 8, 9 and
              10. Pages are numbered as they appear in the document, starting at
              1 — not by any numbering printed on the page itself, which is why a
              report whose body starts at &ldquo;page 1&rdquo; after four
              front-matter pages needs <code>5</code>, not <code>1</code>.
            </p>
            <p>
              A span has to run forwards: <code>7-4</code> is rejected rather
              than quietly reversed, because guessing what you meant is a good
              way to produce a wrong document silently. Listing the same page
              twice is harmless; it is included once.
            </p>
          </>
        ),
      },
      {
        heading: "Choosing between the three modes",
        body: (
          <>
            <p>
              <strong>Selected pages → one PDF</strong> gathers everything you
              listed into a single new document, in the order you listed it. Use
              it to pull a chapter, an appendix, or the three pages of a contract
              that someone actually needs.
            </p>
            <p>
              <strong>One PDF per range</strong> gives you one file for each
              comma-separated item. Writing <code>1-4, 5-9, 10-14</code> produces
              three files, which is how you break a long report into sections in
              one pass.
            </p>
            <p>
              <strong>Every page separately</strong> ignores the range box and
              produces one file per page. It is most useful before reassembling
              pages in a new order, or when a form has to be submitted one page
              at a time.
            </p>
          </>
        ),
      },
      {
        heading: "Splitting versus extracting and deleting",
        body: (
          <>
            <p>
              Three tools overlap here and picking the right one saves a step. If
              you want to <em>keep</em> a handful of pages and discard the rest,{" "}
              <Link href="/tools/extract-pages">Extract pages</Link> is more
              direct — you tick pages from thumbnails instead of typing numbers.
              If you want to <em>drop</em> a few pages from an otherwise complete
              document,{" "}
              <Link href="/tools/delete-pages">Delete pages</Link> is the
              shortest route. Splitting is the right choice when you need more
              than one output file, or when you already know the ranges and would
              rather type than click.
            </p>
          </>
        ),
      },
    ],
  },

  "extract-pages": {
    lede: (
      <>
        Extracting pulls the pages you choose into a new PDF and leaves the
        original untouched. It suits the common request to &ldquo;just send me
        the signature page&rdquo; without forwarding a fifty-page contract.
      </>
    ),
    steps: [
      <>Load the PDF. Page thumbnails appear so you can see what you are picking.</>,
      <>
        Select the pages you want to keep, either by clicking thumbnails or with
        the bulk selection controls.
      </>,
      <>Extract, then download the new file.</>,
      <>
        Open the result and confirm the page count matches what you selected —
        the fastest sanity check there is.
      </>,
    ],
    sections: [
      {
        heading: "Extracted pages are copies, not moves",
        body: (
          <>
            <p>
              Extraction never modifies the file you loaded. The original stays
              on your device exactly as it was, and you get a second, smaller
              document alongside it. That matters when the source is the only
              signed copy of something: there is no operation here that can
              damage it.
            </p>
            <p>
              If your goal is actually to remove pages from a document you will
              keep using,{" "}
              <Link href="/tools/delete-pages">Delete pages</Link> expresses that
              intent directly and saves you from extracting twenty-eight of
              thirty pages by hand.
            </p>
          </>
        ),
      },
      {
        heading: "Selection order and page order",
        body: (
          <>
            <p>
              Extracted pages appear in document order, not in the order you
              clicked them. Selecting page 9 and then page 2 gives you a file
              with page 2 first. This is almost always what people expect, but if
              you specifically need a different sequence — an appendix in front
              of the summary, say — extract first and then rearrange with{" "}
              <Link href="/tools/reorder-pages">Reorder pages</Link>.
            </p>
          </>
        ),
      },
      {
        heading: "Why the file is not always much smaller",
        body: (
          <>
            <p>
              Pulling three pages out of a hundred-page PDF does not reliably
              produce a file that is three percent of the size. Fonts, embedded
              colour profiles, and images that several pages share all have to
              come along for the extracted pages to render correctly, and a
              single full-page scan can be larger than ninety pages of text. If
              size is the real problem, look at what is on the pages: scanned
              images respond to{" "}
              <Link href="/tools/image-compressor">image compression</Link>{" "}
              before they are turned into a PDF, whereas text-based pages are
              already about as small as they will get.
            </p>
          </>
        ),
      },
      {
        heading: "Sending one page instead of the whole document",
        body: (
          <>
            <p>
              &ldquo;Can you send me the signature page?&rdquo; is the request
              this tool exists for, and answering it by forwarding the entire
              agreement is a habit worth breaking. A contract, a payslip, or a
              bank statement contains a great deal that the person asking does
              not need and, in many cases, should not have — account numbers,
              other parties, commercial terms.
            </p>
            <p>
              Extracting the page they asked for takes a few seconds, gives them
              a smaller file, and limits what you have handed over. Since the
              extraction happens on your own device, the document does not pass
              through anyone else&apos;s server on the way. Check the extracted
              file before sending it: information that appears in a header or a
              footer travels with the page it is printed on.
            </p>
          </>
        ),
      },
    ],
  },

  "rotate-pdf": {
    lede: (
      <>
        Rotation fixes pages that arrive sideways or upside down — the usual
        result of a phone scan or a document feeder that took a landscape sheet
        the wrong way round. You can turn every page at once or only the ones
        that need it.
      </>
    ),
    steps: [
      <>Load the PDF and look at the thumbnails to see which pages are wrong.</>,
      <>
        Pick the rotation: 90° clockwise, 180°, or 270°. Two 90° turns and one
        180° turn reach the same place, so pick whichever is easier to reason
        about.
      </>,
      <>
        Either leave <strong>Rotate all pages</strong> on, or turn it off and
        list the pages that need turning.
      </>,
      <>Apply the rotation and download the corrected file.</>,
    ],
    sections: [
      {
        heading: "Rotation is a property of the page, not a redraw",
        body: (
          <>
            <p>
              A PDF page carries a rotation value that viewers honour when they
              display it. Rotating here changes that value rather than
              re-rendering the page, which has two useful consequences: nothing
              is re-compressed, so there is no loss of quality at all, and the
              operation is fast even on a large document.
            </p>
            <p>
              It also explains a common surprise. If a scan looks sideways
              because the <em>image inside the page</em> is sideways while the
              page itself is upright, rotating the page turns the whole sheet,
              including its margins. The result is correct but the page becomes
              landscape. When that is not acceptable, rotate the image before
              building the PDF with{" "}
              <Link href="/tools/images-to-pdf">Images to PDF</Link>.
            </p>
          </>
        ),
      },
      {
        heading: "Mixed orientations in one document",
        body: (
          <>
            <p>
              Reports frequently mix portrait text pages with landscape tables
              and charts, and that is a deliberate choice rather than a fault.
              Before rotating everything, check whether the sideways pages are
              wide tables that were meant to be read by turning your head — or by
              turning the printed page. Rotating those makes the printed document
              worse, not better.
            </p>
            <p>
              When only some pages are genuinely wrong, turn off{" "}
              <strong>Rotate all pages</strong> and list them. The page numbers
              are positions in the file, counting from 1.
            </p>
          </>
        ),
      },
      {
        heading: "If your viewer shows it correctly but a printer does not",
        body: (
          <>
            <p>
              Some older printers and a few PDF processors ignore the page
              rotation value. If a document looks right on screen and prints
              sideways, the rotation is being dropped somewhere in that chain.
              The reliable workaround is to convert the pages to images with{" "}
              <Link href="/tools/pdf-to-images">PDF to images</Link>, which bakes
              the current appearance in, and rebuild a PDF from those images.
              Quality drops slightly because the page becomes a picture, so keep
              this as a fallback rather than a first move.
            </p>
          </>
        ),
      },
    ],
  },

  "reorder-pages": {
    lede: (
      <>
        Reordering moves pages within a single document — pulling a summary to
        the front, putting an appendix at the back, or fixing a scan that fed
        pages in the wrong sequence. Thumbnails show you the document as you
        rearrange it.
      </>
    ),
    steps: [
      <>Load the PDF. Every page appears as a numbered thumbnail.</>,
      <>
        Move a page with its up and down controls. The numbering updates as you
        go, so what you see is the order the file will have.
      </>,
      <>
        Keep going until the sequence is right. Nothing is written until you ask
        for the file, so you can experiment freely.
      </>,
      <>Save the reordered PDF and open it once to confirm.</>,
    ],
    sections: [
      {
        heading: "Working without a mouse",
        body: (
          <>
            <p>
              Every page has move buttons that are reachable with the Tab key and
              activated with Enter or Space, so the whole reordering job can be
              done from the keyboard. This is not only an accessibility
              requirement — on a long document, tabbing to a page and pressing
              Enter twice is often faster and far more precise than dragging a
              thumbnail across a scrolling list.
            </p>
            <p>
              On a phone, the same buttons avoid the fiddliest interaction on
              small screens: drag-and-drop inside a scroll container. Moving a
              page several positions takes several taps, which is a fair trade
              for not dropping it in the wrong place.
            </p>
          </>
        ),
      },
      {
        heading: "Large moves are easier as two operations",
        body: (
          <>
            <p>
              Shifting one page from position 60 to position 2 by stepping it up
              fifty-eight times is nobody&apos;s idea of a good afternoon. For
              moves like that, it is usually quicker to{" "}
              <Link href="/tools/split-pdf">split</Link> the document at the
              relevant boundaries and{" "}
              <Link href="/tools/merge-pdf">merge</Link> the parts back in the
              order you want. Reordering is at its best for local tidying — a
              handful of pages that ended up near, but not exactly at, the right
              place.
            </p>
          </>
        ),
      },
      {
        heading: "What reordering leaves alone",
        body: (
          <>
            <p>
              Page contents are moved untouched: text stays selectable, images
              are not re-compressed, and rotation travels with the page it
              belongs to. Numbers printed on the pages themselves do not update,
              because they are part of the page artwork rather than something the
              document computes. If a reordered document now reads 1, 2, 5, 3, 4
              in its footers, add fresh numbering with{" "}
              <Link href="/tools/page-numbers">Add page numbers</Link> once the
              order is final.
            </p>
          </>
        ),
      },
    ],
  },

  "delete-pages": {
    lede: (
      <>
        Deleting removes pages you do not want and gives you back the rest as a
        new file — blank sheets a scanner picked up, an internal cover page, or
        the fax header nobody needs to see.
      </>
    ),
    steps: [
      <>Load the PDF and review the page thumbnails.</>,
      <>
        Mark the pages to remove. Bulk selection helps when the unwanted pages
        follow a pattern, such as every blank verso in a duplex scan.
      </>,
      <>Delete, then download the result.</>,
      <>
        Confirm the new page count. If it is not the original count minus the
        number you removed, something was selected that you did not intend.
      </>,
    ],
    sections: [
      {
        heading: "The original file is never modified",
        body: (
          <>
            <p>
              Deleting produces a new PDF and leaves the file you loaded exactly
              as it was on your device. Nothing is overwritten, so there is no
              undo to worry about: if the result is wrong, discard it and start
              again from the original. It is still worth keeping the source file
              until you have opened the result and checked it, particularly for
              anything signed or legally significant.
            </p>
            <p>
              A PDF must keep at least one page, so the tool will not let you
              remove everything. If you genuinely want none of it, you want to
              delete the file, not its pages.
            </p>
          </>
        ),
      },
      {
        heading: "Deleted pages are gone, not hidden",
        body: (
          <>
            <p>
              This is a real removal: the page objects are not written into the
              output, so the content cannot be recovered by scrolling, searching,
              or inspecting the new file. That makes deletion a reasonable way to
              drop a page you do not want to circulate.
            </p>
            <p>
              It is not, however, redaction. Removing a page does nothing about
              sensitive text that also appears on the pages you kept, and it does
              not touch document metadata — check that separately with{" "}
              <Link href="/tools/pdf-metadata">Metadata &amp; info</Link>, which
              can hold an author name or an original filename you would rather
              not share. Blacking out text on a page you are keeping needs a
              dedicated redaction tool, because drawing a black rectangle over
              text in most editors leaves the text underneath.
            </p>
          </>
        ),
      },
      {
        heading: "Cleaning up a scan efficiently",
        body: (
          <>
            <p>
              Duplex scanners produce a blank page for every single-sided sheet
              in the stack, which is the most common reason to delete in bulk.
              Those blanks are usually every second page, so select them as a
              run rather than one at a time. Watch for near-blank pages that
              carry a faint scanner artefact or a page number — they look empty
              in a small thumbnail but are not, and deleting them can quietly
              remove content. Zoom in before committing when the document
              matters.
            </p>
          </>
        ),
      },
    ],
  },

  "watermark-pdf": {
    lede: (
      <>
        A watermark stamps text across your pages — DRAFT, CONFIDENTIAL, a
        client name, a date. It marks the status of a document at a glance and
        makes it obvious when an old copy is circulating.
      </>
    ),
    steps: [
      <>Load the PDF and type your watermark text.</>,
      <>
        Set the appearance: font size, opacity, and the angle in degrees. Around
        45° is the conventional diagonal.
      </>,
      <>
        Choose a layout — a single centred stamp, or tiled repeatedly across each
        page.
      </>,
      <>
        Apply to every page, or list specific pages, then download the stamped
        PDF.
      </>,
    ],
    sections: [
      {
        heading: "Choosing an opacity you can actually read through",
        body: (
          <>
            <p>
              The whole point of a watermark is to be noticed without making the
              document unreadable, and opacity is the setting that decides
              whether you succeed. Somewhere between 10% and 25% works for most
              text documents: visible on screen, clearly present on paper, and
              not competing with body text. Go higher only when the mark is
              meant to discourage use of the copy rather than merely label it.
            </p>
            <p>
              Two things push the right value around. Printed output looks
              lighter than the screen, so a mark that is subtle on a monitor can
              vanish on paper — test-print one page before stamping a hundred.
              And dense pages need lower opacity than sparse ones, because the
              watermark has more to compete with.
            </p>
          </>
        ),
      },
      {
        heading: "Centred or tiled",
        body: (
          <>
            <p>
              A single centred stamp is the better default. It reads as a
              deliberate status label, stays out of the margins where headers and
              page numbers live, and survives being photocopied.
            </p>
            <p>
              Tiling repeats the text across the whole page, which is harder to
              crop out of a screenshot and makes a document visibly unpleasant to
              reuse. That is exactly right for a preview copy or a document you
              are circulating for comment only, and wrong for something people
              have to read carefully. If you tile, drop the opacity further than
              you think you need to — the density of a tiled pattern is much
              higher than a single mark at the same setting.
            </p>
          </>
        ),
      },
      {
        heading: "Current limits worth knowing",
        body: (
          <>
            <p>
              Watermarks are text only for now; there is no image or logo stamp.
              Non-Latin scripts may not render correctly, because the standard
              PDF fonts used here do not cover them and font embedding has not
              shipped yet — if you need Devanagari, Arabic, or CJK text in a
              watermark, check the output before relying on it.
            </p>
            <p>
              A watermark is also not a security control. It is drawn onto the
              page as ordinary content, so anyone determined to remove it can,
              and it places no restriction on copying, printing, or editing.
              Treat it as a label, not a lock.
            </p>
          </>
        ),
      },
    ],
  },

  "page-numbers": {
    lede: (
      <>
        Page numbering adds a consistent number to each page — the thing a
        merged, split, or rearranged document almost always needs before anyone
        can refer to &ldquo;page 12&rdquo; and be understood.
      </>
    ),
    steps: [
      <>Load the finished PDF. Number it last, after any merging or reordering.</>,
      <>
        Choose the position and alignment — bottom centre is the safest default
        for documents that will be printed.
      </>,
      <>
        Set the start number, and how many pages to skip so that a cover page
        stays unnumbered.
      </>,
      <>
        Add a prefix or suffix if you want &ldquo;Page 4&rdquo; or
        &ldquo;4 of 20&rdquo; rather than a bare numeral, then download.
      </>,
    ],
    sections: [
      {
        heading: "Skipping the cover, and starting where you mean to",
        body: (
          <>
            <p>
              Two settings interact here and mixing them up is the usual source
              of confusion. <strong>Skip first pages</strong> controls which
              pages get a number printed at all: set it to 1 and the cover stays
              clean. <strong>Start number</strong> controls what the first
              numbered page says.
            </p>
            <p>
              So a report with an unnumbered cover whose body should begin at 1
              needs skip&nbsp;=&nbsp;1 and start&nbsp;=&nbsp;1. A second volume
              continuing from a document that ended at page 84 needs
              start&nbsp;=&nbsp;85. And a submission where the cover counts as
              page 1 but must not show a number needs skip&nbsp;=&nbsp;1 with
              start&nbsp;=&nbsp;2 — a combination worth checking on the output
              rather than assuming.
            </p>
          </>
        ),
      },
      {
        heading: "Position, margins, and binding",
        body: (
          <>
            <p>
              Bottom centre is the position that survives everything: it is
              unaffected by whether a document is bound on the left, it never
              collides with a header, and it is where readers look. Corner
              positions look tidier in a report but need thought — a number in
              the bottom-left corner of every page ends up in the binding margin
              of a double-sided document, where a staple or a spiral can eat it.
            </p>
            <p>
              Check the bottom margin of your pages before numbering. Documents
              exported from slide software often have almost none, and a number
              placed in a two-millimetre margin either overlaps content or falls
              outside the printable area of a desktop printer.
            </p>
          </>
        ),
      },
      {
        heading: "Numbers already on the page",
        body: (
          <>
            <p>
              If the pages were numbered when they were created, adding numbers
              here puts a second set on top of the first. Nothing removes the
              original ones — they are part of the page artwork, not a field the
              document can recalculate. When an existing numbering has gone wrong
              because pages were merged or reordered, the honest options are to
              re-export from the source application, or to accept a visible
              second number and place it somewhere the old one is not. Numbering
              as the last step, after the document is final, avoids the problem
              entirely.
            </p>
          </>
        ),
      },
    ],
  },

  "pdf-to-images": {
    lede: (
      <>
        This renders each PDF page as a PNG or JPEG picture. Use it when
        something needs an image rather than a document — a slide deck, a
        website, a chat message, or a form that only accepts photos.
      </>
    ),
    steps: [
      <>Load the PDF. It is rendered locally, page by page.</>,
      <>
        Pick an output format: PNG for text and line art, JPEG for pages that are
        mostly photographs.
      </>,
      <>
        Choose a resolution preset. Higher presets are sharper and much larger.
      </>,
      <>Export, and save the images. Each page arrives as its own file.</>,
    ],
    sections: [
      {
        heading: "PNG or JPEG",
        body: (
          <>
            <p>
              PNG is lossless, so text edges and thin lines stay crisp with no
              compression artefacts. That makes it the right choice for the
              typical document page — text, tables, diagrams — and for anything
              you will crop or annotate afterwards. The cost is file size,
              particularly at high resolutions.
            </p>
            <p>
              JPEG is much smaller for pages dominated by photographs or scanned
              images, where its compression is doing the job it was designed for.
              On a page of small text it is a poor trade: the artefacts land
              exactly on the letter edges you need to read. When in doubt, export
              one page each way and compare at 100% zoom.
            </p>
          </>
        ),
      },
      {
        heading: "Picking a resolution",
        body: (
          <>
            <p>
              Resolution here means how many pixels are rendered per page, and
              the right answer depends entirely on where the image will be seen.
              For a page embedded in a slide or a document, the lowest preset is
              usually indistinguishable from the highest once it has been scaled
              down. For something that will be zoomed into, or printed, or read
              on a high-density phone screen, go up.
            </p>
            <p>
              Memory is the practical ceiling. Rendering a large document at the
              top preset means holding a full-resolution bitmap of each page in
              your browser, and a phone will run out well before a laptop does.
              If an export stalls or the tab reloads, that is what happened —
              drop a preset, or export a range of pages at a time.
            </p>
          </>
        ),
      },
      {
        heading: "Images do not keep the text",
        body: (
          <>
            <p>
              A rendered page is a picture of text, not text. It cannot be
              searched, selected, or copied, screen readers cannot read it, and
              converting it back into a PDF does not restore what was lost. That
              is a genuine downgrade in accessibility, so avoid this route for
              documents other people need to read properly.
            </p>
            <p>
              If you want the words rather than the appearance,{" "}
              <Link href="/tools/extract-text">Extract text</Link> is the tool
              you want. If you need a page that looks identical everywhere and
              cannot be edited, images are a reasonable answer — just not the
              only file you keep.
            </p>
          </>
        ),
      },
    ],
  },

  "pdf-viewer": {
    lede: (
      <>
        A plain PDF reader that runs in the browser tab you already have open.
        Nothing is uploaded, nothing is installed, and no account is involved —
        useful on a borrowed or locked-down computer.
      </>
    ),
    steps: [
      <>Drop a PDF onto the page, or pick one from your device.</>,
      <>Move through the document with the page navigation controls.</>,
      <>
        Zoom in or out to suit the screen. On a phone, the pinch gesture works as
        usual.
      </>,
      <>
        Close the tab when you are finished. The document is not stored anywhere
        by the site.
      </>,
    ],
    sections: [
      {
        heading: "Why open a PDF here rather than in your browser",
        body: (
          <>
            <p>
              Most browsers have a built-in PDF viewer, and for a file already on
              your machine it is perfectly good. This viewer earns its place in
              narrower situations: a device where the built-in viewer has been
              disabled by policy, a shared computer where you would rather not
              leave a document in the downloads folder, or a workflow where you
              want to read a file and then immediately act on it with another
              tool on the same site.
            </p>
            <p>
              Rendering happens in your browser using a JavaScript PDF engine.
              The file is read from your device and never sent anywhere, which is
              the same guarantee every tool here makes and the reason this one
              exists at all.
            </p>
          </>
        ),
      },
      {
        heading: "What this viewer does not do",
        body: (
          <>
            <p>
              It reads; it does not edit. There is no annotation, no
              highlighting, no form filling, and no signing. Password-protected
              documents cannot be opened, since the tool does not prompt for or
              handle document passwords.
            </p>
            <p>
              Very large documents load lazily but still need memory, so a
              hundred-megabyte scan is slow on a phone. If a file will not open,
              its size is the first thing to check and the second is whether it
              is actually a PDF — files renamed to <code>.pdf</code> are more
              common than you would think.
            </p>
          </>
        ),
      },
      {
        heading: "From reading to doing",
        body: (
          <>
            <p>
              Reading a document usually reveals what you need to do with it.
              Pages in the wrong order go to{" "}
              <Link href="/tools/reorder-pages">Reorder pages</Link>; a section
              worth sending on its own goes to{" "}
              <Link href="/tools/extract-pages">Extract pages</Link>; a document
              whose properties look wrong goes to{" "}
              <Link href="/tools/pdf-metadata">Metadata &amp; info</Link>. Each
              of those loads the file the same way, from your device, so nothing
              you read here has to leave it.
            </p>
          </>
        ),
      },
    ],
  },

  "pdf-metadata": {
    lede: (
      <>
        Every PDF carries document properties — title, author, subject,
        keywords, and the software that produced it. This tool shows you what
        yours says and lets you correct the parts that are wrong or too
        revealing.
      </>
    ),
    steps: [
      <>Load the PDF. The current document information appears immediately.</>,
      <>Read through it. The author field is the one that surprises people.</>,
      <>Edit the title, author, subject, or keywords, or clear them entirely.</>,
      <>Save the updated PDF and use that copy from then on.</>,
    ],
    sections: [
      {
        heading: "What your document is telling people",
        body: (
          <>
            <p>
              Document properties are filled in automatically by whatever created
              the file, and they travel with it. The author field usually
              contains the account name of whoever installed the software, which
              on a personal machine is often a real full name. The title is
              frequently the name of the template the document started from,
              which is how a proposal ends up announcing that it was built from
              another client&apos;s file.
            </p>
            <p>
              None of this is visible when you read the document, and all of it
              is one right-click away for anyone who receives it. Checking these
              fields before sending a CV, a tender, or anything anonymous takes a
              few seconds and occasionally saves real embarrassment.
            </p>
          </>
        ),
      },
      {
        heading: "Which fields you can change here",
        body: (
          <>
            <p>
              Title, author, subject, and keywords are editable. These are the
              standard document-information fields, and they are the ones that
              file managers, search indexes, and PDF readers display.
            </p>
            <p>
              Creation and modification timestamps, and the producer and creator
              entries that name the originating software, are left as they are.
              Other XMP metadata embedded by the producing application is
              preserved rather than rewritten. So this is a tool for correcting
              and clearing the visible fields, not for stripping a document of
              every trace of its origin — if that is the requirement, rebuild the
              document from its content rather than editing its properties.
            </p>
          </>
        ),
      },
      {
        heading: "Useful metadata, not just risky metadata",
        body: (
          <>
            <p>
              Filling these fields in properly is worth the minute it takes. A
              meaningful title is what a reader&apos;s PDF viewer shows in its
              window and tab, what most systems use when the document is shared,
              and what assistive technology announces when the file opens. A
              document whose title is <code>Untitled-3</code> is harder to find
              later, for you and for everyone you send it to. Subject and
              keywords are worth setting on anything filed in a shared drive,
              where search runs over exactly these fields.
            </p>
          </>
        ),
      },
    ],
  },

  "extract-text": {
    lede: (
      <>
        This pulls the selectable text out of a PDF and hands it back as plain
        text you can paste anywhere or download as a <code>.txt</code> file.
        Formatting is deliberately dropped; the words are what you get.
      </>
    ),
    steps: [
      <>Load the PDF. Text is read page by page in your browser.</>,
      <>Review the preview — it shows exactly what was recovered.</>,
      <>Copy what you need, or download the whole thing as a text file.</>,
      <>
        If the preview is empty or garbled, read the two sections below before
        concluding the tool failed.
      </>,
    ],
    sections: [
      {
        heading: "Why the result is sometimes empty",
        body: (
          <>
            <p>
              PDFs come in two very different kinds. A digital PDF exported from
              a word processor contains real text: characters, positions, fonts.
              A scanned PDF contains a photograph of a page and no text
              whatsoever, even though your eyes read it perfectly well. Extraction
              can only return what is actually stored, so a scan yields nothing.
            </p>
            <p>
              The quick test is to open the file in any viewer and try to select
              a word with your cursor. If the selection highlights a rectangle
              rather than the word, it is a scan. Turning that into text requires
              optical character recognition: convert the pages to images with{" "}
              <Link href="/tools/pdf-to-images">PDF to images</Link>, then read
              each one with{" "}
              <Link href="/tools/image-to-text">Image to text (OCR)</Link>, which
              also runs on your device. Expect to proofread the result — OCR
              guesses at letters, whereas extraction copies them exactly.
            </p>
          </>
        ),
      },
      {
        heading: "Why the order is sometimes strange",
        body: (
          <>
            <p>
              A PDF stores where each piece of text sits on the page, not the
              order in which a human would read it. For a single column of prose,
              reconstructing the reading order is straightforward and the output
              is clean. For a two-column academic paper, a page with sidebars, or
              a table, the extracted text can interleave columns or scatter cells
              in ways that look like nonsense.
            </p>
            <p>
              There is no setting that fixes this in general — it is a property of
              the format. In practice, extracting a page at a time and
              reassembling is more reliable than trying to clean up a hundred
              interleaved pages, and{" "}
              <Link href="/tools/remove-spaces">Remove extra spaces</Link> handles
              the ragged whitespace that extraction tends to leave behind.
            </p>
          </>
        ),
      },
      {
        heading: "What gets lost on the way out",
        body: (
          <>
            <p>
              Plain text has no bold, no headings, no tables, and no images, so
              all of that is discarded. Ligatures such as &ldquo;fi&rdquo; usually
              come through correctly but occasionally arrive as odd characters,
              and hyphens that a layout engine inserted at line ends stay in the
              text, splitting words in half. Both are worth a search-and-replace
              pass before you reuse the output.
            </p>
            <p>
              If you need the layout rather than the words, exporting pages as
              pictures with{" "}
              <Link href="/tools/pdf-to-images">PDF to images</Link> preserves
              appearance instead — the opposite trade, and the right one for
              quoting a page as it looked.
            </p>
          </>
        ),
      },
    ],
  },
  "compress-pdf": {
    lede: (
      <>
        Most oversized PDFs are big because of the pictures inside them:
        scanned pages, phone photos, screenshots. This tool finds those images,
        scales them down to a sensible resolution and re-encodes them, while the
        text, fonts and drawings in the document are copied across untouched.
        You see the exact size before and after, and the work happens on your
        own device.
      </>
    ),
    steps: [
      <>
        Drop the PDF onto the file area. The page count and current size appear
        so you can check you picked the right file.
      </>,
      <>
        Choose a compression level. <strong>Balanced</strong> is the right
        starting point for most documents; <strong>Light</strong> keeps more
        detail for printing, and <strong>Strong</strong> squeezes hardest for
        email and upload limits.
      </>,
      <>
        Select <strong>Compress PDF</strong>. A progress bar counts through the
        images it finds. Large scans take a few seconds each on a phone.
      </>,
      <>
        Compare the original and compressed sizes, then download the result. If
        the file could not be made smaller, the tool says so instead of giving
        you a copy that is the same size or bigger.
      </>,
      <>
        Open the download and zoom into the smallest text on a scanned page.
        If it is still easy to read, you are done; if not, go back and use a
        lighter level.
      </>,
    ],
    sections: [
      {
        heading: "Why some PDFs shrink a lot and others barely move",
        body: (
          <>
            <p>
              The saving depends entirely on what the PDF is made of. A
              ten-page scan straight from a phone or office scanner is
              essentially ten large photographs, and downscaling those to a
              screen-and-print friendly size typically removes well over half
              the file. A report exported from Word or Google Docs is mostly
              text and fonts, which are already compact; the tool leaves them
              alone, so there is very little to save.
            </p>
            <p>
              A quick way to predict the result: divide the file size by the
              number of pages. Anything above roughly 300&nbsp;KB per page is
              almost always images, and compression will help. A text document
              at 50&nbsp;KB per page will hardly change — for that kind of file,
              sending fewer pages with{" "}
              <Link href="/tools/extract-pages">Extract pages</Link> is the
              fix that works.
            </p>
          </>
        ),
      },
      {
        heading: "Choosing between Light, Balanced and Strong",
        body: (
          <>
            <p>
              Each level sets two things: the largest size an image may have
              (its longest edge in pixels) and the JPEG quality it is saved at.
              Light keeps images up to 2400 pixels at high quality, which is
              about 200&nbsp;DPI on an A4 page and safe for printing. Balanced
              allows 1600 pixels, roughly 140&nbsp;DPI on A4 — sharp on any
              screen and fine for printed text of normal size. Strong drops to
              1100 pixels at a lower quality, which suits email attachments and
              strict portal limits but makes small print in scans look soft.
            </p>
            <p>
              Images that are already smaller than the chosen limit are not
              enlarged; they are only re-encoded, and only kept if that actually
              saves space. If an image comes out bigger than it went in, the
              original stays in the file.
            </p>
          </>
        ),
      },
      {
        heading: "What this compressor deliberately leaves alone",
        body: (
          <>
            <p>
              Real text stays real text. Some online compressors turn every page
              into a single flat image, which produces impressive numbers but
              destroys text selection, search and accessibility, and blurs the
              writing. This tool never does that; fonts, vector drawings, links
              and page structure pass through unchanged.
            </p>
            <p>
              Some images are skipped on purpose because re-encoding them would
              risk changing how the page looks: images in CMYK or with a limited
              colour palette, transparency masks, images with special decoding
              rules, and very small images such as logos where the saving would
              be negligible. The result screen tells you how many images were
              re-encoded out of how many were found, so a small saving is never
              a mystery.
            </p>
          </>
        ),
      },
      {
        heading: "Compressing without uploading the document",
        body: (
          <>
            <p>
              The PDFs people most want to shrink — signed contracts, payslips,
              scanned IDs, medical letters — are exactly the ones that should not
              be sent to an unknown server. Here the file is read into your
              browser&apos;s memory, its images are decoded and re-encoded by the
              browser&apos;s own image engine, and the new PDF is assembled on
              your device. Nothing is uploaded, and once the page has loaded it
              keeps working with the network switched off. Our guide to{" "}
              <Link href="/learn/are-online-pdf-tools-safe">whether online PDF
              tools are safe</Link> explains how to check this kind of claim for
              yourself.
            </p>
            <p>
              The trade-off is that your device does the work. Very large PDFs
              (hundreds of megabytes, or hundreds of high-resolution scans) can
              exhaust the memory of a phone. Splitting the file with{" "}
              <Link href="/tools/split-pdf">Split PDF</Link>, compressing the
              parts and merging them back with{" "}
              <Link href="/tools/merge-pdf">Merge PDF</Link> gets around it.
            </p>
          </>
        ),
      },
      {
        heading: "Better results by fixing the source",
        body: (
          <>
            <p>
              Compression after the fact is always a compromise, because it
              re-encodes images that were already compressed once. If you are
              building the PDF yourself, you get a smaller and cleaner file by
              starting right: scan text documents at 200–300&nbsp;DPI in
              greyscale rather than 600&nbsp;DPI colour, and shrink photos with
              the <Link href="/tools/image-compressor">image compressor</Link>{" "}
              before combining them with{" "}
              <Link href="/tools/images-to-pdf">Images to PDF</Link>.
            </p>
            <p>
              And keep your original. Running a compressed file through again,
              or through a different compressor, stacks new artefacts on top of
              old ones. If you need it smaller still, go back to the original and
              use a stronger level once.
            </p>
          </>
        ),
      },
    ],
  },
};
