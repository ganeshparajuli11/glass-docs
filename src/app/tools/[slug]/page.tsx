import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTool, tools } from "@/lib/tools/registry";
import { ToolHost } from "@/components/tool/ToolHost";
import { ToolShell, LocalBadge } from "@/components/tool/ToolShell";
import { ToolCard } from "@/components/tool/ToolCard";
import { AdSlot } from "@/components/ads/AdSlot";

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — free & private, in your browser`,
    description: `${tool.shortDescription} Runs locally in your browser; your file is not uploaded.`,
  };
}

export default async function ToolPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const related = tool.relatedTools
    .map((s) => tools.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="px-3 sm:px-6">
      <div className="mx-auto max-w-[1100px] pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-fg-muted">
          <Link href="/tools" className="hover:text-fg">
            Tools
          </Link>{" "}
          / <span aria-current="page">{tool.name}</span>
        </nav>
        <h1 className="mt-3 text-3xl font-bold">{tool.name}</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">{tool.shortDescription}</p>
        <div className="mt-3">
          <LocalBadge fileless={tool.acceptedMimeTypes.length === 0} />
        </div>
      </div>

      <ToolShell>
        <ToolHost slug={tool.slug} />
      </ToolShell>

      {/* Informational sections — clearly separated from the workspace */}
      <div className="mx-auto mt-10 max-w-[1100px] space-y-6">
        <section aria-labelledby="limits-heading" className="solid-reading p-6">
          <h2 id="limits-heading" className="text-xl font-bold">
            Good to know
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg-muted">
            {tool.acceptedMimeTypes.length > 0 ? (
              <li>
                Recommended file size: up to {tool.maxRecommendedSizeMb} MB for
                smooth in-browser processing.
              </li>
            ) : null}
            {tool.knownLimitations.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq-heading" className="solid-reading p-6">
          <h2 id="faq-heading" className="text-xl font-bold">
            Frequently asked questions
          </h2>
          <dl className="mt-3 space-y-4">
            {tool.faq.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1 text-sm text-fg-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {related.length > 0 ? (
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-bold">
              Related tools
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ToolCard key={r.slug} tool={r} />
              ))}
            </div>
          </section>
        ) : null}

        <AdSlot placement="tool-post-workflow" context="tool" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
