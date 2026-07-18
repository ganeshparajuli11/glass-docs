import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms that apply when you use GlassTools tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">Terms of use</h1>
        <p className="mt-2 text-sm text-fg-subtle">
          Draft — to be reviewed before public launch. Last updated 2026-07-18.
        </p>
        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <h2>The service</h2>
          <p>
            {site.name} provides browser-based document utilities free of
            charge. Tools labelled Local run on your device; we provide the
            software, you provide the computer.
          </p>
          <h2>Acceptable use</h2>
          <p>
            Use the tools only with documents you have the right to process.
            Do not attempt to disrupt the service or misuse it to infringe
            others&apos; rights.
          </p>
          <h2>No warranty</h2>
          <p>
            The tools are provided &ldquo;as is&rdquo; without warranty of any
            kind. Always keep your original files; verify results before
            relying on them. {site.name} is not a substitute for legal,
            compliance, or certified digital-signature software.
          </p>
          <h2>Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, {site.name} is not liable
            for damages arising from use of the tools, including data loss
            resulting from processing errors.
          </p>
          <h2>Changes</h2>
          <p>
            These terms may change as the service develops; the date above
            reflects the current revision.
          </p>
        </div>
      </article>
    </div>
  );
}
