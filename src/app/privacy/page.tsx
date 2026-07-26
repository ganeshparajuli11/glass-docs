import type { Metadata } from "next";
import Link from "next/link";
import { describeAdState } from "@/config/ads";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How GlassTools handles your files: local processing in your browser, no accounts, no analytics, and a plain account of the third-party scripts that do load.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const ads = describeAdState();

  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">Privacy</h1>
        <p className="mt-2 text-sm text-fg-subtle">
          Effective {site.effectiveDate}. {site.name} is operated by{" "}
          {site.operator.name}. Contact:{" "}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>

        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <p>
            This policy describes what the site does today. Where something is
            planned but not built, it says so rather than describing it in the
            present tense.
          </p>

          <h2>Your files</h2>
          <p>
            Tools labelled <strong>Local</strong> process your files entirely
            in your browser, on your device. The document bytes are not sent to
            a {site.name} processing server, are not stored in a database, and
            are not written to persistent browser storage. When you close or
            reload the page, the browser releases them.
          </p>
          <p>
            Every tool currently listed on this site is a Local tool. If a
            server-based tool is ever added, it will be labelled differently
            and this page will describe it before it ships.
          </p>
          <p>
            {site.name} does not claim to keep you &ldquo;100%
            secure&rdquo; — no one honestly can, and your own device and
            network are outside anyone else&apos;s control. The narrower and
            checkable claim is this: during local processing your documents do
            not leave your device. Open your browser&apos;s network inspector
            while using a tool and confirm it for yourself.
          </p>

          <h2>What is never collected</h2>
          <ul>
            <li>File contents, file names, or extracted text</li>
            <li>Document metadata or passwords</li>
            <li>Watermark or cover-page text you type</li>
            <li>Page thumbnails or previews</li>
          </ul>
          <p>
            There are no accounts, so there is no name, email address or
            history stored about you.
          </p>

          <h2>Third-party scripts</h2>
          <p>{ads.summary}</p>
          <p>
            No analytics service is loaded, and no product-usage events are
            collected. No external fonts, tag managers or embedded widgets are
            loaded. The <Link href="/cookies">privacy choices page</Link> lists
            browser storage in detail.
          </p>

          <h2>Hosting</h2>
          <p>
            The site is a set of static files served through Cloudflare.
            Delivering a page necessarily involves your IP address, your
            browser user agent and the address you requested; Cloudflare
            processes these as the host, as any web host does. This is
            separate from your documents, which are not part of those
            requests. {site.name} does not run its own analytics over these
            logs.
          </p>

          <h2>Email you send</h2>
          <p>
            If you email{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>,
            that message and your address sit in a mailbox so it can be
            answered. Please do not attach documents — see the{" "}
            <Link href="/contact">contact page</Link> for what to send instead.
          </p>

          <h2>Children</h2>
          <p>
            The tools are general-purpose utilities and collect nothing about
            anyone, including children. There is no account system and no
            age-gated content.
          </p>

          <h2>Changes</h2>
          <p>
            When behaviour changes — a new script, analytics, or advertising
            going live — this page is updated in the same change that ships it,
            and the effective date above moves. Wording that describes runtime
            behaviour is generated from the site&apos;s own configuration so
            that it cannot silently drift.
          </p>

          <h2>Questions</h2>
          <p>
            Email{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
            If you find a statement on this page that does not match what the
            site actually does, that is a bug worth reporting.
          </p>
        </div>
      </article>
    </div>
  );
}
