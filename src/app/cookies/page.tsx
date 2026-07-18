import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy choices & cookies",
  description: "What is stored in your browser and what choices you have.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">Privacy choices</h1>
        <p className="mt-2 text-sm text-fg-subtle">
          Draft — to be reviewed before public launch. Last updated 2026-07-18.
        </p>
        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <h2>What is stored in your browser today</h2>
          <ul>
            <li>
              <strong>Theme preference</strong> — whether you chose light or
              dark mode. This is a functional setting, not tracking.
            </li>
          </ul>
          <p>
            Your documents are never stored: local tools keep file data in
            memory only, and it is released when you leave the page.
          </p>
          <h2>Analytics and advertising cookies</h2>
          <p>
            None are set at present. If analytics or advertising are enabled in
            the future, a consent banner will be shown where required, and your
            choice will be stored — nothing more.
          </p>
        </div>
      </article>
    </div>
  );
}
