import Link from "next/link";
import { ShieldCheck, Zap, BadgeCheck } from "lucide-react";
import { tools } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tool/ToolCard";
import { ToolSearch } from "@/components/tool/ToolSearch";
import { AdSlot } from "@/components/ads/AdSlot";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo/meta";
import type { Metadata } from "next";

/**
 * The root layout's `title.template` does NOT apply to this segment — Next.js
 * only applies a template to CHILD segments — so the homepage title must
 * carry the brand itself. It appears exactly once, at the end, matching the
 * shape the template produces on every other page (audit finding META-001).
 */
export const metadata: Metadata = pageMeta({
  title: `Free Private PDF & Image Tools in Your Browser — ${site.name}`,
  description:
    `${tools.length} free tools that run on your device: merge, split and compress PDFs, shrink images, count words, calculate GPA and more. No signup, no upload by default.`,
  path: "/",
});

const popularSlugs = [
  "merge-pdf",
  "split-pdf",
  "images-to-pdf",
  "image-compressor",
  "word-counter",
  "gpa-calculator",
];

const categorySections = [
  { key: "pdf", href: "/pdf-tools", title: "PDF tools", blurb: "Merge, split, organise, watermark, convert." },
  { key: "image", href: "/image-tools", title: "Image tools", blurb: "Compress, resize, crop, convert, passport sheets." },
  { key: "text", href: "/text-tools", title: "Text tools", blurb: "Count, clean, convert, and compare text." },
  { key: "calculator", href: "/calculators", title: "Calculators", blurb: "GPA, grades, attendance, percentages, EMI." },
  { key: "student", href: "/student-tools", title: "Student toolkit", blurb: "Cover pages and assignment helpers." },
] as const;

export default function HomePage() {
  const popular = popularSlugs
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  return (
    <div className="px-3 sm:px-6">
      {/* Hero */}
      <section className="mx-auto max-w-3xl pt-14 pb-10 text-center sm:pt-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Everyday PDF tools,{" "}
          <span className="text-accent">private by default</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-fg-muted">
          {site.tagline} Files are processed on your device and are not
          uploaded by default.
        </p>
        <div className="mx-auto mt-7 max-w-xl">
          <ToolSearch />
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Why GlassTools" className="mx-auto max-w-4xl">
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Processed on your device",
              text: "Local tools never upload your files.",
            },
            {
              icon: Zap,
              title: "No signup required",
              text: "Open a tool and get to work immediately.",
            },
            {
              icon: BadgeCheck,
              title: "Clear limits, honest labels",
              text: "Every tool states what it can and cannot do.",
            },
          ].map((item) => (
            <li key={item.title} className="glass-soft flex items-start gap-3 p-4">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-sm text-fg-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Popular tools */}
      <section aria-labelledby="popular-heading" className="mx-auto mt-12 max-w-6xl">
        <div className="flex items-baseline justify-between">
          <h2 id="popular-heading" className="text-2xl font-bold">
            Popular tools
          </h2>
          <Link href="/tools" className="text-sm font-medium text-accent hover:underline">
            All tools →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* Category exploration */}
      <section aria-labelledby="categories-heading" className="mx-auto mt-12 max-w-6xl">
        <h2 id="categories-heading" className="text-2xl font-bold">
          Browse by category
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorySections.map((cat) => {
            const count = tools.filter((t) => t.category === cat.key).length;
            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="glass-soft card-hover block p-5"
              >
                <h3 className="font-semibold">{cat.title}</h3>
                <p className="mt-1 text-sm text-fg-muted">{cat.blurb}</p>
                <p className="mt-2 text-xs font-medium text-accent">{count} tools →</p>
              </Link>
            );
          })}
        </div>
      </section>

      <AdSlot placement="homepage-content-break" context="homepage" className="mt-12" />

      {/* Common tasks with descriptive anchors */}
      <section aria-labelledby="tasks-heading" className="mx-auto mt-12 max-w-4xl">
        <h2 id="tasks-heading" className="text-2xl font-bold">
          Jump straight to a task
        </h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-[15px] sm:grid-cols-2">
          <li><Link className="text-accent underline hover:no-underline" href="/tools/merge-pdf">Merge PDF files into one document</Link></li>
          <li><Link className="text-accent underline hover:no-underline" href="/tools/split-pdf">Split a PDF by page ranges</Link></li>
          <li><Link className="text-accent underline hover:no-underline" href="/tools/delete-pages">Remove pages from a PDF</Link></li>
          <li><Link className="text-accent underline hover:no-underline" href="/tools/images-to-pdf">Convert JPG images to PDF</Link></li>
          <li><Link className="text-accent underline hover:no-underline" href="/tools/pdf-to-images">Convert PDF pages to JPG or PNG</Link></li>
          <li><Link className="text-accent underline hover:no-underline" href="/tools/image-compressor">Compress an image for email</Link></li>
          <li><Link className="text-accent underline hover:no-underline" href="/tools/word-counter">Count words and reading time</Link></li>
          <li><Link className="text-accent underline hover:no-underline" href="/tools/gpa-calculator">Calculate your GPA</Link></li>
        </ul>
      </section>

      {/* How local processing works */}
      <section aria-labelledby="how-heading" className="mx-auto mt-12 max-w-4xl">
        <div className="solid-reading p-6 sm:p-8">
          <h2 id="how-heading" className="text-2xl font-bold">
            How local processing works
          </h2>
          <p className="mt-3 text-fg-muted">
            When you pick a file in a tool marked <strong>Local</strong>, your
            browser reads it into memory on your own device. The processing —
            merging, splitting, rotating, converting — happens right there,
            using JavaScript and WebAssembly technology built into modern
            browsers. The finished file is offered back to you as a download
            from your own memory. No document bytes are sent to our servers,
            and closing the tab clears everything.
          </p>
          <p className="mt-3 text-fg-muted">
            This is not a marketing claim; it is how the site is built. You can
            verify it yourself: open your browser&apos;s network inspector
            while using a tool and you will see that no upload request is made.
          </p>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: site.name,
              alternateName: site.alternateName,
              url: site.url,
              description: site.description,
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: site.name,
              alternateName: site.alternateName,
              url: site.url,
              logo: `${site.url}/icon.svg`,
              description:
                "GlassTools is a browser-based collection of private PDF and image utilities. Supported tools process files locally on the user's device.",
              founder: {
                "@type": "Person",
                name: site.operator.name,
              },
              sameAs: [site.operator.repository],
            },
          ]).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
