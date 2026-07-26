import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who runs GlassTools, how the browser-based PDF and image tools are built and tested, and how to report a problem.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">About {site.name}</h1>
        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <p>
            {site.name} is a collection of browser-based utilities for
            everyday document work: combining PDFs, splitting them, rotating
            scans, numbering pages, shrinking images. Despite the name, it has
            nothing to do with glazing equipment or glass-cutting hardware.
          </p>
          <p>
            It exists because those tasks should not require installing
            software, creating an account, or uploading a private document to
            someone else&apos;s server.
          </p>

          <h2>Who runs it</h2>
          <p>
            {site.name} is built and maintained by{" "}
            <strong>{site.operator.name}</strong>, working alone. There is no
            company behind it and no team. If something here is wrong, one
            person is responsible for fixing it.
          </p>
          <p>
            The source code is public at{" "}
            <a
              href={site.operator.repository}
              rel="noopener noreferrer"
              target="_blank"
            >
              {site.operator.repository.replace("https://", "")}
            </a>
            . You do not have to take the privacy claims on trust — you can
            read the code that makes them.
          </p>

          <h2>How local processing works</h2>
          <p>
            Tools labelled <strong>Local</strong> read your file into browser
            memory and do the work there, using JavaScript and WebAssembly
            your browser already ships with. PDF work uses{" "}
            <code>pdf-lib</code> and <code>pdf.js</code>; image work uses the
            browser&apos;s own canvas APIs. The finished file is handed back to
            you as a download generated from memory.
          </p>
          <p>
            You can check this yourself: open your browser&apos;s network
            inspector, use any Local tool, and watch for an upload request.
            There is not one.
          </p>

          <h2>How the tools are tested</h2>
          <ul>
            <li>
              Unit tests cover page-range parsing, input validation,
              calculators and text utilities.
            </li>
            <li>
              Integration tests run the real document operations against
              generated sample PDFs and images.
            </li>
            <li>
              End-to-end tests drive the actual interface in Chromium using
              Playwright.
            </li>
            <li>
              Type checking and linting run on every change, in CI as well as
              locally.
            </li>
            <li>
              Each tool page shows a <strong>last reviewed</strong> date. That
              is when the tool was last exercised by hand, not the date of the
              most recent deploy.
            </li>
          </ul>
          <p>
            Automated tests do not catch everything. Real documents are
            stranger than test fixtures, so please report failures.
          </p>

          <h2>Browsers</h2>
          <p>
            The tools target current versions of Chrome, Edge, Firefox and
            Safari on desktop and mobile. Large files behave differently on
            phones, where available memory is smaller, so each tool states a
            recommended size. A published per-browser compatibility matrix is
            outstanding work rather than something already verified.
          </p>

          <h2>Principles</h2>
          <ul>
            <li>
              <strong>Local first.</strong> If a browser can do the work, the
              work happens in the browser.
            </li>
            <li>
              <strong>Honest labels.</strong> Every tool states its limits.
              Nothing is listed that does not work.
            </li>
            <li>
              <strong>The task is the hero.</strong> No advertisement will ever
              sit between you and your download button.
            </li>
          </ul>

          <h2>What {site.name} is not</h2>
          <p>
            It is not a replacement for professional legal, archival, or
            certified-signature software, and does not pretend to be. It holds
            no security certification. For regulated workflows, use tools
            certified for them.
          </p>

          <h2>Reporting a problem</h2>
          <p>
            Broken tool, confusing label, accessibility barrier, or a privacy
            concern? The <Link href="/contact">contact page</Link> explains
            where to send it. Bug reports are genuinely useful and are read.
          </p>
        </div>
      </article>
    </div>
  );
}
