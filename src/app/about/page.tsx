import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: "Why GlassDocs exists and the principles it is built on.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">About {site.name}</h1>
        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <p>
            {site.name} exists because everyday PDF tasks — combining two
            files, rotating a scan, numbering pages — should not require
            installing software, creating an account, or uploading private
            documents to someone else&apos;s server.
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
          <h2>What we are not</h2>
          <p>
            {site.name} is not a replacement for professional legal, archival,
            or certified-signature software, and does not pretend to be. For
            regulated workflows, use tools certified for them.
          </p>
        </div>
      </article>
    </div>
  );
}
