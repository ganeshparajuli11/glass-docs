import Link from "next/link";
import type { ToolContentMap } from "./types";

/** Long-form content for the image tools. See ./types.ts for the contract. */
export const imageToolContent: ToolContentMap = {
  "images-to-pdf": {
    lede: (
      <>
        This turns photos and screenshots into a single PDF — the format that
        offices, universities, and government portals actually accept when they
        ask you to &ldquo;attach the document&rdquo;.
      </>
    ),
    steps: [
      <>
        Add your images. JPG, PNG, and WebP are accepted, and you can add several
        at once.
      </>,
      <>
        Put them in order. Each image becomes one page, top to bottom in the
        list.
      </>,
      <>
        Choose a page size — Auto, A4, or Letter — then a fit mode and a margin.
      </>,
      <>Build the PDF and download it. Open it once to check the page order.</>,
    ],
    sections: [
      {
        heading: "Page size: Auto, A4, or Letter",
        body: (
          <>
            <p>
              <strong>Auto</strong> makes every page exactly the size of its
              image. Nothing is scaled, cropped, or padded, so a screenshot looks
              precisely as it did on screen. This is the right choice for
              anything that will be read on a device rather than printed, and for
              mixed images where a uniform page would waste space.
            </p>
            <p>
              <strong>A4</strong> and <strong>Letter</strong> produce a
              consistent printable document, which is what you want when the PDF
              is a submission. Pages are oriented to suit each image, so a
              landscape photo gets a landscape page rather than being squeezed
              into portrait. If a form specifies a paper size, use the one it
              asks for — this is the setting it means.
            </p>
          </>
        ),
      },
      {
        heading: "Fit and margins",
        body: (
          <>
            <p>
              Fit decides what happens when an image and its page are different
              shapes. Fitting the whole image inside the page keeps everything
              visible and leaves blank bands on two sides; filling the page
              crops the overflowing edges instead. For documents, receipts, and
              anything where the content reaches the edge, fit rather than fill —
              a cropped-off signature is much worse than a white margin.
            </p>
            <p>
              Margins matter more than they look. Most printers cannot print to
              the physical edge of the sheet, and many document scanners and
              markers expect a few millimetres of clear border. A small margin
              also stops a dark photograph from bleeding into the page edge, which
              looks like a printing fault. Zero margin is right for full-bleed
              images and wrong for almost everything else.
            </p>
          </>
        ),
      },
      {
        heading: "Making phone photos of documents usable",
        body: (
          <>
            <p>
              Photographing a page rather than scanning it is normal now, and
              three habits make the result acceptable. Shoot straight down in
              even light so the page is not a trapezoid with a shadow across it.
              Crop to the page edges with{" "}
              <Link href="/tools/crop-image">Crop image</Link> before building
              the PDF, so the desk does not become part of the document. And if
              the file has to fit an upload limit, compress the images with{" "}
              <Link href="/tools/image-compressor">Image compressor</Link> first
              — reducing them before assembly is far more effective than trying
              to shrink the finished PDF.
            </p>
            <p>
              One caveat: a PDF built from photographs contains pictures of text,
              not text. It cannot be searched or copied from, and if the
              recipient needs to do either, a real scan or an exported document
              is the better answer.
            </p>
          </>
        ),
      },
    ],
  },

  "image-compressor": {
    lede: (
      <>
        Compression makes an image file smaller by re-encoding it at a lower
        quality. A before-and-after readout shows you exactly what you saved and
        what it cost, so you can stop at the point where the picture still looks
        right.
      </>
    ),
    steps: [
      <>Add a JPG, PNG, or WebP image.</>,
      <>Pick an output format — JPEG for compatibility, WebP for smaller files.</>,
      <>
        Adjust the quality and watch the original and compressed sizes update.
      </>,
      <>
        Compare the preview against the original before downloading, then keep
        your original file.
      </>,
    ],
    sections: [
      {
        heading: "Finding the quality setting that is good enough",
        body: (
          <>
            <p>
              The relationship between quality and file size is not a straight
              line. Dropping from maximum quality to around 80% typically removes
              more than half the bytes while being difficult to see; dropping
              from 80% to 60% saves much less and starts to show. That makes the
              70–85% range the useful part of the scale for photographs, and the
              reason the tool shows both sizes live rather than making you guess.
            </p>
            <p>
              What the image contains changes the answer. Photographs with soft
              gradients, foliage, and texture hide compression well.
              Screenshots, logos, and anything with flat colour and hard edges
              show it immediately as smudges around the edges — for those,
              compress gently or use{" "}
              <Link href="/tools/image-resizer">resizing</Link> instead, since
              fewer pixels beats uglier pixels.
            </p>
          </>
        ),
      },
      {
        heading: "Compression is lossy, and it accumulates",
        body: (
          <>
            <p>
              Re-encoding throws information away permanently. Raising the
              quality afterwards cannot bring detail back — it only produces a
              larger file containing the same damage. Always keep your original,
              and compress a copy.
            </p>
            <p>
              Repeated rounds are worse than one. Compressing an already
              compressed file adds new artefacts on top of old ones, which is why
              a photo that has been through several chat apps looks blocky. If
              you need a smaller version of something you already compressed, go
              back to the original and compress it once, harder.
            </p>
            <p>
              PNG input is converted to JPEG or WebP, because PNG&apos;s lossless
              compression cannot deliver the size reduction people come here for.
              That conversion replaces transparency with a solid background, so
              if your PNG has a transparent area, resize it instead or convert it
              deliberately with the{" "}
              <Link href="/tools/image-converter">format converter</Link>.
            </p>
          </>
        ),
      },
      {
        heading: "Hitting a specific upload limit",
        body: (
          <>
            <p>
              Application portals frequently demand something like &ldquo;under
              200&nbsp;KB&rdquo;, which is a small target for a modern phone
              photograph. Attack the dimensions before the quality: a 12-megapixel
              photo resized to about 1200 pixels on its long edge is already a
              fraction of the size, and no upload form needs more than that.
              Compress the resized copy and you will usually land under the limit
              at a quality that still looks fine.
            </p>
            <p>
              Doing it the other way round — crushing the quality of a full-size
              image until it fits — produces a file that is technically small and
              visibly poor. If a portal also caps dimensions, satisfy that
              constraint first, then compress.
            </p>
          </>
        ),
      },
    ],
  },

  "image-resizer": {
    lede: (
      <>
        Resizing changes how many pixels an image has. It is the most effective
        way to make a file smaller, and the setting that upload forms mean when
        they specify a maximum width or height.
      </>
    ),
    steps: [
      <>Add the image. Its current dimensions are shown.</>,
      <>
        Enter a new width or height in pixels, or scale by percentage. With the
        aspect ratio locked, the other dimension follows automatically.
      </>,
      <>Check the preview, especially if you unlocked the ratio.</>,
      <>Download the resized copy.</>,
    ],
    sections: [
      {
        heading: "Choosing a target size",
        body: (
          <>
            <p>
              Work backwards from where the image will be seen. A full-width
              photograph on a web page rarely needs more than about 1600 pixels
              across, and an image in a document or a slide needs less. A profile
              picture is usually displayed at a few hundred pixels regardless of
              what you upload. Anything beyond what the display uses is bytes
              that cost loading time and buy nothing.
            </p>
            <p>
              Printing is the exception, and it works in physical units rather
              than pixels. As a rough guide, good print quality wants around 300
              pixels for every inch of paper — so a photo printed 6 inches wide
              wants about 1800 pixels across. Resizing below that will show when
              it is printed even though it looked perfect on screen.
            </p>
          </>
        ),
      },
      {
        heading: "Why enlarging disappoints",
        body: (
          <>
            <p>
              Making an image bigger cannot add detail that was never captured.
              The tool interpolates — it invents intermediate pixels by averaging
              neighbours — and the result is a softer, sometimes slightly
              plasticky version of the original at a larger size. Small
              enlargements, up to perhaps 150%, are usually acceptable. Doubling
              or tripling is visible, and no setting here changes that.
            </p>
            <p>
              If you genuinely need a larger version, look for a bigger original
              first: phone galleries often hold a full-resolution file behind a
              downscaled copy, and messaging apps almost always shrink what they
              send. The original is nearly always somewhere.
            </p>
          </>
        ),
      },
      {
        heading: "The aspect ratio lock",
        body: (
          <>
            <p>
              With the lock on, changing one dimension updates the other so the
              proportions are preserved. Leave it on unless you have a specific
              reason not to — unlocking it and setting both numbers stretches the
              picture, which is immediately obvious on anything containing a face
              or a circle.
            </p>
            <p>
              When you need an exact shape that the image does not have, the
              answer is to crop rather than to stretch.{" "}
              <Link href="/tools/crop-image">Crop image</Link> has ratio presets
              for the common cases, and cropping to shape and then resizing to
              size is the reliable two-step for &ldquo;exactly 800×800&rdquo;
              requirements.
            </p>
          </>
        ),
      },
    ],
  },

  "crop-image": {
    lede: (
      <>
        Cropping cuts an image down to the part that matters — removing the desk
        around a photographed document, straightening up a screenshot, or
        reshaping a photo to the ratio a form demands.
      </>
    ),
    steps: [
      <>Add the image you want to crop.</>,
      <>
        Choose a free crop, or a fixed aspect ratio such as 1:1 for a square.
      </>,
      <>
        Set the crop position and size with the sliders, watching the live
        preview.
      </>,
      <>Download the cropped copy. The original is untouched.</>,
    ],
    sections: [
      {
        heading: "Sliders instead of drag handles",
        body: (
          <>
            <p>
              The crop area is positioned with sliders rather than by dragging a
              box. That is a deliberate trade: sliders work with a keyboard, work
              with assistive technology, and behave predictably on a phone, where
              dragging a handle inside a scrolling page is genuinely awkward.
              Drag handles are planned as an addition for pointer devices, not as
              a replacement.
            </p>
            <p>
              For precise work, the sliders are often better anyway — nudging one
              step at a time gets you to an exact edge more reliably than a
              fingertip does.
            </p>
          </>
        ),
      },
      {
        heading: "Cropping to a required shape",
        body: (
          <>
            <p>
              Forms that ask for a square profile picture, a 4:3 photograph, or a
              banner of a particular shape are asking about aspect ratio. Pick
              the matching preset and the crop area is constrained to it, so
              whatever you select is guaranteed to be the right shape. Then use{" "}
              <Link href="/tools/image-resizer">Image resizer</Link> to bring it
              to the exact pixel dimensions.
            </p>
            <p>
              Doing it in that order matters. Cropping to shape and then resizing
              gives you exactly the pixels you asked for. Resizing first and then
              cropping tends to leave you short, and stretching to fit distorts
              the picture.
            </p>
          </>
        ),
      },
      {
        heading: "Cropping is not a privacy measure — except when it is",
        body: (
          <>
            <p>
              Cropping this way produces a genuinely new, smaller image: the
              removed pixels are not stored in the file and cannot be recovered
              from it. That is a real difference from cropping inside some photo
              apps and document editors, which keep the full picture and simply
              hide the parts outside the frame — a habit that has leaked plenty
              of information over the years.
            </p>
            <p>
              What cropping does not do is remove anything outside the picture
              itself. If the shot needs a person or a document number taken out
              of the middle of the frame, cropping cannot help — that needs
              editing, or a different photograph.
            </p>
          </>
        ),
      },
    ],
  },

  "image-converter": {
    lede: (
      <>
        Converts between JPG, PNG, and WebP. Most conversions happen because
        something downstream refuses a format — an upload form, an old
        application, or a printer — rather than because the picture needs
        changing.
      </>
    ),
    steps: [
      <>Add an image in any of the three supported formats.</>,
      <>Choose the format you need to convert to.</>,
      <>Convert, and check the preview if transparency is involved.</>,
      <>Download the converted copy.</>,
    ],
    sections: [
      {
        heading: "What each format is actually for",
        body: (
          <>
            <p>
              <strong>JPEG</strong> is built for photographs. Its compression
              exploits the fact that eyes forgive small errors in complex,
              continuous images, and it is accepted absolutely everywhere. It
              cannot store transparency, and it degrades flat colour and sharp
              edges.
            </p>
            <p>
              <strong>PNG</strong> is lossless and supports transparency, which
              makes it correct for logos, icons, diagrams, and screenshots of
              text. Its files are much larger for photographs, because lossless
              compression has very little to work with in a picture of leaves.
            </p>
            <p>
              <strong>WebP</strong> does both jobs and produces files roughly a
              quarter to a third smaller than the equivalent JPEG or PNG. Every
              current browser supports it. Older desktop software, some printing
              services, and a number of upload forms still do not, which is the
              main reason people convert away from it.
            </p>
          </>
        ),
      },
      {
        heading: "Transparency disappears when you convert to JPG",
        body: (
          <>
            <p>
              JPEG has no way to record transparent pixels, so converting a
              transparent PNG or WebP to JPG fills those areas with white. A logo
              designed to sit on a coloured background will arrive with a white
              rectangle around it, and there is no setting that avoids this —
              it is a limitation of the format, not of the tool.
            </p>
            <p>
              If you need transparency, stay with PNG or WebP. If you need JPEG
              and the white box is wrong, place the image on the intended
              background colour before converting.
            </p>
          </>
        ),
      },
      {
        heading: "Conversion is not compression",
        body: (
          <>
            <p>
              Converting a JPEG to PNG will usually make the file <em>larger</em>{" "}
              without improving it: the compression damage already in the picture
              gets stored losslessly, artefacts and all. Converting to WebP is
              the conversion that genuinely reduces size, and even then a
              re-encode from an already-lossy source loses a little more.
            </p>
            <p>
              When the goal is a smaller file rather than a different format, the{" "}
              <Link href="/tools/image-compressor">image compressor</Link> is the
              right tool, and{" "}
              <Link href="/tools/image-resizer">resizing</Link> beats both.
              Animated WebP is also worth a warning: only the first frame is
              converted, so an animation becomes a still.
            </p>
          </>
        ),
      },
    ],
  },

  "passport-photo": {
    lede: (
      <>
        This lays out multiple copies of your photo at an official size onto a
        single printable sheet with cutting guides, so a normal photo print
        yields several usable passport photographs.
      </>
    ),
    steps: [
      <>Add a head-and-shoulders photo, ideally already cropped and straight.</>,
      <>
        Choose the photo size your application requires — 35×45&nbsp;mm,
        US&nbsp;2×2&nbsp;in, or 40×60&nbsp;mm.
      </>,
      <>Choose the sheet: 4×6&nbsp;inch photo paper, or A4.</>,
      <>
        Download the sheet and print it at 100% scale. Cut along the guides.
      </>,
    ],
    sections: [
      {
        heading: "Printing at the right size",
        body: (
          <>
            <p>
              This is where sheets go wrong. The layout is generated at
              300&nbsp;DPI so that the photographs come out at their true
              physical dimensions, and that only holds if the printer does not
              rescale it. Turn off &ldquo;fit to page&rdquo;, &ldquo;shrink to
              fit&rdquo;, and any automatic scaling, and print at 100% or
              &ldquo;actual size&rdquo;.
            </p>
            <p>
              Check the result with a ruler before cutting. A photograph that
              measures 34&nbsp;mm instead of 35&nbsp;mm will be rejected at the
              counter, and the cause is nearly always a print dialog quietly
              scaling to the printable area. Photo shops that print from a file
              usually get this right if you tell them not to crop.
            </p>
          </>
        ),
      },
      {
        heading: "Which size to choose",
        body: (
          <>
            <p>
              35×45&nbsp;mm is the standard for passports and visas in Nepal, the
              United Kingdom, the European Union, India, and much of the rest of
              the world. The United States uses 2×2 inches, which is squarer and
              not interchangeable with it. 40×60&nbsp;mm turns up in some
              national identity and licence applications.
            </p>
            <p>
              Always take the size from the instructions for your specific
              application rather than from what a previous form wanted. Where the
              instructions also state a head height — the distance from chin to
              crown as a proportion of the photo — check that too, because a
              correctly sized photograph with a wrongly sized head is still
              rejected.
            </p>
          </>
        ),
      },
      {
        heading: "The rules this tool cannot check for you",
        body: (
          <>
            <p>
              The sheet is a layout, not a compliance check. Background colour,
              lighting and shadows, expression, head position, glasses,
              headwear, and image sharpness are all assessed by whoever receives
              the photograph, and none of them are verified here. Read the
              official guidance for your document before printing a sheet of
              something that will be turned away.
            </p>
            <p>
              Your photo is centre-cropped to the chosen shape, so if the framing
              matters — and for a passport photo it does — set it deliberately
              with{" "}
              <Link href="/tools/crop-image">Crop image</Link> first, then bring
              the cropped file here. As with every tool on this site, the
              photograph is processed in your browser and is not uploaded, which
              is a reasonable thing to want for a picture of your own face.
            </p>
          </>
        ),
      },
    ],
  },

  "image-to-text": {
    lede: (
      <>
        Optical character recognition (OCR) turns a picture of words — a
        photographed notice, a screenshot of a slide, a scanned page — back
        into text you can copy, search and edit. Here it runs entirely on your
        device, and reads printed English, Nepali and Hindi.
      </>
    ),
    steps: [
      <>
        Add an image: drop a JPG, PNG or WebP, choose one from your files, or
        press Ctrl+V (⌘V on a Mac) to paste a screenshot straight from your
        clipboard.
      </>,
      <>
        Tick the language that is actually in the image. Use two only when the
        image really mixes them, such as an English heading over Nepali text.
      </>,
      <>
        Choose how to handle line breaks — keep them exactly as printed, or
        join wrapped lines into paragraphs — then select Extract text.
      </>,
      <>
        Read the confidence note, correct any mistakes in the text box, then
        copy the text or download it as a .txt file.
      </>,
    ],
    sections: [
      {
        heading: "What makes OCR accurate (and what ruins it)",
        body: (
          <>
            <p>
              The engine is the open-source Tesseract recogniser, and like every
              OCR system it is only as good as the picture it is given. The
              single biggest factor is the size of the letters in pixels: text
              where a capital letter is roughly 20 to 40 pixels tall reads well,
              while a tiny screenshot or a whole page photographed from across
              the room does not. Small images are enlarged automatically before
              recognition, but enlarging cannot invent detail that was never
              captured.
            </p>
            <p>
              After size come contrast and geometry. Dark text on a plain light
              background is ideal; text over a photograph, a coloured gradient
              or a shadow falling across the page is hard. Shoot documents
              straight down rather than at an angle, so lines stay level and
              letters are not stretched, and avoid flash glare on glossy paper.
              If only part of the image matters, cut it out first with{" "}
              <Link href="/tools/crop-image">Crop image</Link> — logos, borders
              and photos around the text are where most of the stray characters
              in a result come from.
            </p>
            <p>
              Choosing the right language matters more than it sounds. The
              English model does not know Devanagari letters at all, and the
              Nepali and Hindi models will try to read English words as
              Devanagari. Each extra language also gives the engine more wrong
              answers to choose between, which is why the tool limits you to two.
            </p>
          </>
        ),
      },
      {
        heading: "Line breaks, paragraphs and the confidence score",
        body: (
          <>
            <p>
              OCR reports text line by line, exactly as it was printed, so a
              paragraph from a book comes out with a hard break at the end of
              every printed line. <strong>Keep as in the image</strong> is the
              right choice for receipts, addresses, lists, poems and anything
              where the lines mean something. <strong>Join into
              paragraphs</strong> is for prose you are going to paste into a
              document: wrapped lines are joined with a space, words split with
              a hyphen at a line end are rejoined, blank lines stay as paragraph
              breaks, and lines that start like a bullet or a numbered item keep
              their own line. You can switch between the two after reading
              without running recognition again.
            </p>
            <p>
              The confidence figure is Tesseract&apos;s own average certainty
              across the words it found. Treat it as a guide to how much
              proofreading to do, not as a guarantee: a high score can still
              hide a misread digit, which is the error that matters most in a
              phone number, an amount or a date. Always check numbers and names
              against the image before you rely on them.
            </p>
          </>
        ),
      },
      {
        heading: "Scanned PDFs, tables and handwriting",
        body: (
          <>
            <p>
              A scanned PDF is a set of page images, so the route is two steps:
              turn the pages into images with{" "}
              <Link href="/tools/pdf-to-images">PDF to images</Link> at the
              highest resolution, then read each page image here. Before you do,
              check whether the PDF really is a scan — if you can select a word
              in a PDF viewer, the text is already there and{" "}
              <Link href="/tools/extract-text">Extract text</Link> will give you
              an exact copy instantly, with no recognition errors at all. The
              guide to{" "}
              <Link href="/learn/cannot-copy-text-from-pdf">
                PDFs you cannot copy text from
              </Link>{" "}
              explains how to tell the difference.
            </p>
            <p>
              The output is plain text. Tables come out as rows of words
              separated by spaces, multi-column layouts may be read across the
              columns rather than down them, and bold, italics and font sizes
              are not kept. For a two-column article, cropping each column into
              its own image gives a much cleaner result than reading the page in
              one go. Handwriting is outside what this engine was trained for:
              neat capitals occasionally work, joined-up writing does not.
            </p>
          </>
        ),
      },
      {
        heading: "Where the OCR engine and your image actually go",
        body: (
          <>
            <p>
              Many free OCR websites send your image to a server for
              processing, which is a real concern for ID cards, bank letters,
              medical notes and exam papers. Here, recognition happens in a
              background worker inside your browser tab using a WebAssembly
              build of Tesseract. The engine (about 4 MB) and each language
              model (1.4–2.9 MB) are downloaded from this site the first time you
              use them and then kept in your browser, so later runs start
              faster and need no download.
            </p>
            <p>
              Your image is never part of that traffic: it is read from your
              disk or clipboard into the page, recognised, and discarded when
              you leave. If you want to confirm that for yourself, open your
              browser&apos;s developer tools, watch the network panel and run
              the tool — the only requests it makes are for the engine files on
              this domain.
            </p>
          </>
        ),
      },
    ],
  },
};
