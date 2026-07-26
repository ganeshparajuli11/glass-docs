import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The terms that apply when you use the free GlassTools browser-based document tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">Terms of use</h1>
        <p className="mt-2 text-sm text-fg-subtle">
          Effective {site.effectiveDate}. {site.name} is operated by{" "}
          {site.operator.name}. Contact:{" "}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>

        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <h2>The service</h2>
          <p>
            {site.name} provides browser-based document utilities free of
            charge. Tools labelled Local run on your own device: the software
            is provided here, the computing is done by your browser. There is
            no account, no subscription and no payment.
          </p>

          <h2>Acceptable use</h2>
          <p>
            Use the tools only with documents you have the right to process.
            Do not attempt to disrupt the service, and do not use it to
            infringe anyone else&apos;s rights. Because processing happens in
            your browser, what you do with the tools is largely invisible from
            here — which makes it your responsibility rather than something
            that can be policed.
          </p>

          <h2>No warranty</h2>
          <p>
            The tools are provided &ldquo;as is&rdquo;, without warranty of any
            kind. Keep your original files and check the results before relying
            on them. {site.name} is not a substitute for legal, compliance, or
            certified digital-signature software, and holds no certification
            for such use.
          </p>
          <p>
            Availability is not guaranteed. Tools may change or be withdrawn.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, {site.name} and its
            operator are not liable for damages arising from use of the tools,
            including data loss resulting from processing errors. Since the
            service is free and processes files on your device, this limitation
            is a plain statement of the arrangement rather than fine print
            hiding a paid guarantee.
          </p>
          <p>
            Nothing here excludes liability that cannot be excluded under
            applicable law.
          </p>

          <h2>Source code</h2>
          <p>
            The site&apos;s source is published at{" "}
            <a
              href={site.operator.repository}
              rel="noopener noreferrer"
              target="_blank"
            >
              {site.operator.repository.replace("https://", "")}
            </a>{" "}
            and is governed by the licence stated in that repository. These
            terms cover use of the hosted site, not reuse of the code.
          </p>

          <h2>Privacy</h2>
          <p>
            How files and data are handled is described on the{" "}
            <Link href="/privacy">privacy page</Link> and the{" "}
            <Link href="/cookies">privacy choices page</Link>.
          </p>

          <h2>Changes</h2>
          <p>
            These terms may change as the service develops. The effective date
            above reflects the current revision; continuing to use the site
            after a change means the current version applies.
          </p>
        </div>
      </article>
    </div>
  );
}
