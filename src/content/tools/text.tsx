import Link from "next/link";
import type { ToolContentMap } from "./types";

/** Long-form content for the text tools. See ./types.ts for the contract. */
export const textToolContent: ToolContentMap = {
  "word-counter": {
    lede: (
      <>
        Paste your text and get the counts that matter for a word limit: words,
        characters with and without spaces, sentences, paragraphs, an estimated
        reading time, and a rough page count.
      </>
    ),
    steps: [
      <>Type or paste your text into the box. Counts update as you go.</>,
      <>
        Read the count that your limit is actually expressed in — words and
        characters are not interchangeable.
      </>,
      <>
        Edit in place until you are inside the limit. Nothing is saved or sent
        anywhere.
      </>,
    ],
    sections: [
      {
        heading: "What counts as a word",
        body: (
          <>
            <p>
              A word here is a run of characters separated by whitespace, which
              is the same rule word processors use and the reason two tools
              rarely disagree by much. They can still differ at the edges:
              hyphenated compounds count as one word, an em dash with spaces
              around it counts as a word on its own, and numbers and standalone
              symbols each count as words.
            </p>
            <p>
              If you are close to a hard limit, count what your marker will
              count. Academic word limits usually exclude the reference list, and
              often the abstract, tables, and footnotes as well — so paste only
              the body text rather than the whole document. Character limits, the
              norm for application forms and personal statements, almost always
              include spaces, which is why the tool reports both figures.
            </p>
          </>
        ),
      },
      {
        heading: "Reading time and page estimates",
        body: (
          <>
            <p>
              Reading time uses 200 words per minute for silent reading and 130
              for reading aloud. Those are common averages rather than facts
              about you: adults reading straightforward prose range widely, and
              dense technical material is much slower for everyone. Use the
              figure for planning a talk or judging whether an email is a
              five-minute read, not as a measurement.
            </p>
            <p>
              The page estimate is a rougher instrument still, because a page
              depends on font, size, spacing, and margins — settings this tool
              cannot see. It is useful for &ldquo;about three pages or about
              thirty?&rdquo; and useless for a strict page limit. When a
              submission specifies pages, format the document properly and count
              them there.
            </p>
          </>
        ),
      },
      {
        heading: "Cutting text down to a limit",
        body: (
          <>
            <p>
              Being over a limit is a structural problem more often than a
              wording one. Look for whole sentences that restate the previous
              one, introductions that announce what you are about to say before
              you say it, and quotations that could be summarised. Those cuts
              remove far more than trimming adverbs, and they usually improve the
              piece.
            </p>
            <p>
              For the last few percent, sentence-level editing is fine: replace
              &ldquo;in order to&rdquo; with &ldquo;to&rdquo;, cut
              &ldquo;very&rdquo;, and turn passive constructions around. If your
              text has accumulated stray spacing from being pasted between
              applications,{" "}
              <Link href="/tools/remove-spaces">Remove extra spaces</Link> will
              tidy it — and occasionally change the count enough to matter.
            </p>
          </>
        ),
      },
    ],
  },

  "case-converter": {
    lede: (
      <>
        Switch text between UPPERCASE, lowercase, Title Case, and Sentence case
        without retyping it — for a heading that was pasted in shouting capitals,
        or a name that arrived from a database entirely in lower case.
      </>
    ),
    steps: [
      <>Paste the text you want to change.</>,
      <>Choose the case you want. The result appears immediately.</>,
      <>Copy the result, and check any names and acronyms before using it.</>,
    ],
    sections: [
      {
        heading: "Which case is which",
        body: (
          <>
            <p>
              <strong>UPPERCASE</strong> raises everything. It is worth
              remembering that long stretches of capitals are measurably slower
              to read, because the word shapes that readers recognise disappear —
              fine for a short label, poor for a sentence.
            </p>
            <p>
              <strong>lowercase</strong> lowers everything, which is the quickest
              way to normalise text that arrived shouting before you recase it
              properly.
            </p>
            <p>
              <strong>Title Case</strong> capitalises the first letter of every
              word. <strong>Sentence case</strong> capitalises the first letter
              of each sentence and leaves the rest alone — the correct choice for
              body text, and for headings in the many house styles that prefer
              it.
            </p>
          </>
        ),
      },
      {
        heading: "Where automatic title case goes wrong",
        body: (
          <>
            <p>
              Style guides do not agree about title case, and no automatic
              conversion can satisfy all of them. Most guides keep short
              conjunctions, articles, and prepositions in lower case unless they
              begin or end the title, so &ldquo;The Rise of the Machines&rdquo;
              is conventional while &ldquo;The Rise Of The Machines&rdquo; is
              what a naive converter produces. This tool capitalises every word,
              so a title destined for anything formal needs a read-through
              afterwards.
            </p>
            <p>
              Acronyms are the other casualty. NASA, PDF, and iPhone all survive
              a conversion to upper case and none survive title case or sentence
              case intact. Scan the output for them — a document that refers to
              &ldquo;a Pdf file&rdquo; announces that nobody read it.
            </p>
          </>
        ),
      },
      {
        heading: "Other alphabets",
        body: (
          <>
            <p>
              Conversion uses the browser&apos;s own Unicode case rules, so
              scripts with upper and lower case — Latin, Cyrillic, Greek and
              others — are handled correctly, including accented characters.
              Scripts that have no concept of case, such as Devanagari, Arabic,
              Hebrew, Chinese, Japanese, and Korean, pass through unchanged,
              which is the correct behaviour rather than a failure.
            </p>
            <p>
              Mixed-script text is therefore safe: converting a paragraph that
              contains both English and Nepali will recase the English and leave
              the Nepali exactly as it was.
            </p>
          </>
        ),
      },
    ],
  },

  "remove-spaces": {
    lede: (
      <>
        Cleans up the whitespace that text collects on its way between
        applications: doubled spaces, stray tabs, trailing spaces at line ends,
        and long runs of blank lines.
      </>
    ),
    steps: [
      <>Paste the text you want to clean.</>,
      <>Read the cleaned result beside it.</>,
      <>Copy the output and paste it where it needs to go.</>,
    ],
    sections: [
      {
        heading: "Exactly what gets changed",
        body: (
          <>
            <p>
              Runs of spaces and tabs inside a line collapse to a single space.
              Spaces and tabs at the start and end of a line are removed. Three
              or more consecutive blank lines collapse to one. Everything else —
              your words, punctuation, and single blank lines between paragraphs
              — is left alone.
            </p>
            <p>
              Single blank lines are kept deliberately. They are how plain text
              separates paragraphs, and a cleaner that removes them turns a
              readable document into a wall. If you want no blank lines at all,
              that is a different operation and one you should do knowingly.
            </p>
          </>
        ),
      },
      {
        heading: "Where the mess comes from",
        body: (
          <>
            <p>
              Two spaces after a full stop is a typewriter convention that
              survives in a great deal of pasted text; every modern typeface
              handles the spacing itself, so the extra space is now just noise.
              Copying out of a PDF introduces its own kind: text extracted from a
              laid-out page arrives with the gaps between columns and around
              images rendered as spaces and blank lines.
            </p>
            <p>
              Tabs usually mean the text came from a spreadsheet or a code
              editor, where they were structural. Collapsing them is right for
              prose and wrong for data — if your text is tab-separated columns,
              cleaning it here destroys the column boundaries.
            </p>
          </>
        ),
      },
      {
        heading: "Cleaning before counting or comparing",
        body: (
          <>
            <p>
              Whitespace quietly breaks other operations, so this is often the
              first step rather than the last.{" "}
              <Link href="/tools/text-compare">Text compare</Link> will report
              two lines as different when the only difference is a trailing
              space, which buries the real changes in noise. Deduplication has
              the same problem: <code>apple </code> and <code>apple</code> are
              not the same line, so{" "}
              <Link href="/tools/dedupe-lines">Remove duplicate lines</Link>{" "}
              keeps both.
            </p>
            <p>
              Running text through here first makes both of those behave the way
              you expected in the first place. It is also worth doing before a{" "}
              <Link href="/tools/word-counter">word count</Link> when the text
              has been pasted out of a PDF.
            </p>
            <p>
              One category this cannot reach is invisible characters that are not
              ordinary spaces. Web pages and word processors insert non-breaking
              spaces, zero-width joiners, and other Unicode oddities that look
              exactly like a space, or like nothing at all, while being different
              characters entirely. If two lines still refuse to match after a
              clean, that is usually the reason — and retyping the line by hand
              is faster than hunting for the culprit.
            </p>
          </>
        ),
      },
    ],
  },

  "dedupe-lines": {
    lede: (
      <>
        Removes repeated lines from a list — email addresses, tags, references,
        or anything else that has been merged from several places and now
        contains the same entry more than once.
      </>
    ),
    steps: [
      <>Paste your list, one item per line.</>,
      <>
        Decide whether capitalisation should make two lines different, and set
        case sensitivity accordingly.
      </>,
      <>Optionally sort the result alphabetically.</>,
      <>Copy the deduplicated list.</>,
    ],
    sections: [
      {
        heading: "Case sensitivity changes the answer",
        body: (
          <>
            <p>
              With case sensitivity on, <code>Apple</code> and <code>apple</code>{" "}
              are two different lines and both are kept. With it off, they are
              treated as the same and only the first survives. Neither is
              correct in general — it depends entirely on what your lines are.
            </p>
            <p>
              For email addresses, usernames, and tags, turn it off: the case
              difference is almost always accidental and you want one entry. For
              anything where capitalisation carries meaning — product codes,
              identifiers, case-sensitive keys, proper nouns you are counting —
              leave it on, because merging them loses real distinctions.
            </p>
          </>
        ),
      },
      {
        heading: "The first occurrence is the one that stays",
        body: (
          <>
            <p>
              When duplicates differ only in case and you have case sensitivity
              off, the version that appears first in your list is the one kept.
              That is worth knowing when the list is ordered meaningfully: if you
              have pasted an authoritative list above a scrappier one, the good
              versions win, and if you pasted them the other way round, they do
              not. Order your input accordingly.
            </p>
            <p>
              Sorting is applied after deduplication, so it changes the order of
              the output but never which lines survive.
            </p>
          </>
        ),
      },
      {
        heading: "Why some obvious duplicates are not removed",
        body: (
          <>
            <p>
              Matching is exact, character for character. Lines that look
              identical but are not — one with a trailing space, one with a
              non-breaking space pasted from a web page, one ending in a
              different kind of line break — are genuinely different strings and
              both are kept. This is the single most common surprise, and it is
              not a bug so much as a consequence of what &ldquo;the same&rdquo;
              has to mean.
            </p>
            <p>
              Running the list through{" "}
              <Link href="/tools/remove-spaces">Remove extra spaces</Link> first
              removes the invisible differences, after which deduplication does
              what you expected. For a list where entries differ in punctuation
              or word order rather than whitespace, no automatic tool will help —
              those need reading.
            </p>
            <p>
              Near-duplicates are the harder version of this problem and they are
              genuinely out of scope. Two spellings of the same name, an address
              with and without a middle initial, or the same person under a work
              and a personal email are different strings, and treating them as
              equal would mean guessing. Sorting the output alphabetically at
              least brings near-duplicates next to each other, which makes them
              quick to spot by eye — often the fastest route to a clean list.
            </p>
          </>
        ),
      },
    ],
  },

  "text-compare": {
    lede: (
      <>
        Puts two versions of a text side by side and marks which lines were
        added and which were removed — for checking what changed between drafts,
        or what a collaborator actually edited.
      </>
    ),
    steps: [
      <>Paste the original version into the first box.</>,
      <>Paste the changed version into the second.</>,
      <>
        Read the marked lines, and use the similarity score for a quick sense of
        how much moved.
      </>,
    ],
    sections: [
      {
        heading: "The comparison works line by line",
        body: (
          <>
            <p>
              A line is either matched between the two versions or reported as
              added or removed. There is no highlighting of individual words
              within a line, so changing one word in a long paragraph shows the
              whole paragraph as removed and re-added. Word-level comparison is
              planned; until it arrives, this is the behaviour to expect.
            </p>
            <p>
              That granularity suits some material very well and others poorly.
              Lists, configuration, references, and anything with short lines
              compare cleanly. Prose written as long unwrapped paragraphs
              compares badly, because each paragraph is a single enormous line.
              Splitting prose so that each sentence sits on its own line before
              comparing makes the output dramatically more useful.
            </p>
          </>
        ),
      },
      {
        heading: "Reading the similarity score",
        body: (
          <>
            <p>
              The score is the proportion of lines that are identical between the
              two versions. It is a coarse indicator of how much has changed, not
              a measure of how much the meaning has changed: replacing
              &ldquo;approved&rdquo; with &ldquo;rejected&rdquo; in one line of a
              long document barely moves the number while completely reversing
              the document.
            </p>
            <p>
              Use it to decide how carefully to read, not as a verdict. A high
              score with one flagged line in a contract deserves more attention
              than a low score on a reformatted draft.
            </p>
          </>
        ),
      },
      {
        heading: "Getting a clean comparison",
        body: (
          <>
            <p>
              Formatting differences swamp real ones. Text pasted from two
              different sources often differs in trailing spaces, indentation, or
              blank lines throughout, and every one of those registers as a
              change. Run both versions through{" "}
              <Link href="/tools/remove-spaces">Remove extra spaces</Link> first
              and the output usually shrinks to the handful of lines you actually
              wanted to see.
            </p>
            <p>
              Comparison is limited to 3000 lines per side, which is generous for
              documents and restrictive for logs and exported data. For longer
              material, compare the relevant section rather than the whole file —
              and remember that both texts stay in your browser, which is the
              point when you are comparing two versions of something
              confidential.
            </p>
          </>
        ),
      },
    ],
  },
};
