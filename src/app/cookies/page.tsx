import type { Metadata } from "next";
import Link from "next/link";
import { describeAdState } from "@/config/ads";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy choices & cookies",
  description:
    "Exactly what GlassTools stores in your browser, which third-party scripts load, and what choices you have.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  const ads = describeAdState();

  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">Privacy choices</h1>
        <p className="mt-2 text-sm text-fg-subtle">
          Effective {site.effectiveDate}. Operated by {site.operator.name} —
          see the <Link href="/contact">contact page</Link>.
        </p>

        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <p>
            This page describes what actually happens in your browser right
            now, not what is planned. It is generated from the same
            configuration that controls the site, so it cannot quietly fall
            out of date.
          </p>

          <h2>Stored in your browser</h2>
          <ul>
            <li>
              <strong>Theme preference</strong> — a <code>theme</code> entry in{" "}
              <code>localStorage</code> recording whether you chose light, dark
              or system appearance. It is a functional setting, it is not sent
              anywhere, and clearing site data removes it.
            </li>
          </ul>
          <p>
            {site.name} sets no cookies of its own. Your documents are never
            stored: local tools keep file data in memory only, and the browser
            releases it when you leave the page.
          </p>

          <h2>Advertising</h2>
          <p>{ads.summary}</p>
          {ads.scriptLoaded && !ads.unitsRendered ? (
            <p>
              Before any advertisement is displayed, a consent mechanism will
              be added for regions that require one, and this page will be
              updated to describe it.
            </p>
          ) : null}

          <h2>Analytics</h2>
          <p>
            No analytics service is loaded. No product-usage events are
            collected. If that changes, this page will say so and will name the
            provider.
          </p>

          <h2>Hosting and logs</h2>
          <p>
            The site is served as static files through Cloudflare. Like any web
            host, Cloudflare processes the network requests needed to deliver a
            page, which involves your IP address, your browser user agent and
            the address you requested. That is a normal part of hosting, it
            applies to every website, and it happens whatever this site does.
            Your document contents are never part of such a request, because
            local tools do not send them.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>
              Clearing site data for glasstools.net removes the stored theme
              preference. Nothing else of yours is held here to remove.
            </li>
            <li>
              A content blocker or a browser&apos;s tracking protection can
              block the Google script described above. The tools keep working
              without it.
            </li>
            <li>
              Since there is no account and no stored personal data, there is
              no profile to request or delete — but questions are welcome at
              the <Link href="/contact">contact page</Link>.
            </li>
          </ul>

          <p>
            The <Link href="/privacy">privacy page</Link> covers how files are
            handled in more detail.
          </p>
        </div>
      </article>
    </div>
  );
}
