import Link from "next/link";
import { ShieldCheck, Zap, BadgeCheck } from "lucide-react";
import { tools } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tool/ToolCard";
import { ToolSearch } from "@/components/tool/ToolSearch";
import { AdSlot } from "@/components/ads/AdSlot";
import { site } from "@/config/site";

const popularSlugs = [
  "merge-pdf",
  "split-pdf",
  "images-to-pdf",
  "pdf-to-images",
  "rotate-pdf",
  "watermark-pdf",
];

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
      <section aria-label="Why GlassDocs" className="mx-auto max-w-4xl">
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

      <AdSlot placement="homepage-content-break" context="homepage" className="mt-12" />

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
    </div>
  );
}
