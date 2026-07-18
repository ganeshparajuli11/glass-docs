import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How GlassTools handles your files and data: local processing by default, no accounts, minimal analytics.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">Privacy</h1>
        <p className="mt-2 text-sm text-fg-subtle">
          Draft — to be reviewed before public launch. Last updated 2026-07-18.
        </p>
        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <h2>Your files</h2>
          <p>
            Tools labelled <strong>Local</strong> process your files entirely in
            your browser, on your device. The file bytes are never transmitted
            to {site.name} servers, never stored in a database, and never
            written to persistent browser storage. When you close or reload the
            page, the browser releases them.
          </p>
          <p>
            We do not claim &ldquo;100% security&rdquo; — no one honestly can —
            but the architecture means your documents simply do not leave your
            device during local processing. You can verify this with your
            browser&apos;s network inspector.
          </p>
          <h2>What we never collect</h2>
          <ul>
            <li>File contents, file names, or extracted text</li>
            <li>Document metadata or passwords</li>
            <li>Watermark text you type</li>
          </ul>
          <h2>Analytics</h2>
          <p>
            If analytics are enabled, we collect anonymous usage events such as
            &ldquo;a merge completed&rdquo; or &ldquo;an error of type X
            occurred&rdquo; to find broken tools. These events are checked
            against an allowlist that cannot contain document data. No
            analytics are loaded where consent requirements apply until you
            consent.
          </p>
          <h2>Advertising</h2>
          <p>
            The site may show clearly-labelled advertisements on content pages
            after launch. Ads are never placed inside tool workspaces and never
            receive information about your files.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about this policy? Use the contact page and we will
            respond.
          </p>
        </div>
      </article>
    </div>
  );
}
