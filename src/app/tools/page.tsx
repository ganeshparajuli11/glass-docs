import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ToolsFilter } from "@/components/tool/ToolsFilter";
import { ToolCard } from "@/components/tool/ToolCard";
import { WorkflowBlocks } from "@/components/tool/WorkflowBlocks";
import { pageMeta } from "@/lib/seo/meta";
import { absoluteUrl } from "@/lib/seo/url";
import { categoryPages } from "@/lib/seo/categories";
import { workflows } from "@/lib/seo/workflows";
import { tools } from "@/lib/tools/registry";
import { toolHaystack } from "@/lib/tools/haystack";

export const metadata: Metadata = pageMeta({
  title: "All Tools — PDF, Image, Text and Calculators",
  description:
    "Browse 29 free tools: merge, split, rotate and watermark PDFs, compress and convert images, count words, calculate GPA and more — all processed in your browser.",
  path: "/tools",
});

export default function ToolsPage() {
  const grouped = categoryPages.map((category) => ({
    category,
    items: tools.filter((tool) => tool.category === category.category),
  }));

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Browser-based document tools",
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: absoluteUrl(`/tools/${tool.slug}`),
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-3 pt-10 sm:px-6">
      <h1 className="text-3xl font-bold">All tools</h1>
      <p className="mt-2 max-w-2xl text-fg-muted">
        Every tool below runs locally in your browser: the file is read into
        memory on your own device, changed there, and handed back as a
        download. Nothing is uploaded, there is no account, and closing the tab
        clears everything.
      </p>

      <nav aria-label="Tool categories" className="mt-6 flex flex-wrap gap-2">
        {categoryPages.map((category) => (
          <Link
            key={category.path}
            href={category.path}
            className="glass-soft card-hover min-h-11 rounded-full px-4 py-2.5 text-sm font-medium"
          >
            {category.title}
          </Link>
        ))}
      </nav>

      {/*
        Controls only. The inventory below is server-rendered so the complete
        list of tools is in the initial HTML (audit finding IA-001). The filter
        hides and shows that markup; it never becomes the only source of cards.
      */}
      <div className="mt-6">
        <Suspense fallback={null}>
          <ToolsFilter
            items={tools.map((tool) => ({
              slug: tool.slug,
              category: tool.category,
              search: toolHaystack(tool),
            }))}
          />
        </Suspense>
      </div>

      <div id="tool-inventory" className="mt-8 space-y-12">
        {grouped.map(({ category, items }) => (
          <section
            key={category.path}
            data-category-section={category.category}
            aria-labelledby={`category-${category.category}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id={`category-${category.category}`}
                className="text-2xl font-bold"
              >
                {category.title}
              </h2>
              <Link
                href={category.path}
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                More about {category.title.toLowerCase()} →
              </Link>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-fg-muted">
              {category.intro[0]}
            </p>

            <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((tool) => (
                <li
                  key={tool.slug}
                  data-tool-slug={tool.slug}
                  data-category={tool.category}
                  data-search={toolHaystack(tool)}
                >
                  <ToolCard tool={tool} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div
        id="tools-empty"
        hidden
        className="solid-reading mt-8 p-8 text-center"
      >
        <p className="font-medium">No tools match that search.</p>
        <p className="mt-1 text-sm text-fg-muted">
          Try a simpler word like &ldquo;merge&rdquo;, &ldquo;split&rdquo;, or
          &ldquo;image&rdquo;.
        </p>
      </div>

      <WorkflowBlocks
        items={workflows}
        intro="Most jobs need two or three tools in sequence. These are the orders that work."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemList).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
