import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/tools/registry";
import { articles } from "@/content/articles";
import { ToolCard } from "@/components/tool/ToolCard";
import { pageMeta } from "@/lib/seo/meta";
import { absoluteUrl } from "@/lib/seo/url";
import { categoryPages, type CategoryPage } from "@/lib/seo/categories";
import { workflowsForCategory } from "@/lib/seo/workflows";
import { WorkflowBlocks } from "@/components/tool/WorkflowBlocks";

export function categoryMetadata(page: CategoryPage): Metadata {
  return pageMeta({ title: page.metaTitle, description: page.description, path: page.path });
}

export function CategoryLanding({ page }: { page: CategoryPage }) {
  const categoryTools = tools.filter((t) => t.category === page.category);
  const guides = page.guideSlugs
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Tools", item: absoluteUrl("/tools") },
        { "@type": "ListItem", position: 2, name: page.title, item: absoluteUrl(page.path) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: page.metaTitle,
      description: page.description,
      url: absoluteUrl(page.path),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-3 pt-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-fg-muted">
        <Link href="/tools" className="hover:text-fg">
          Tools
        </Link>{" "}
        / <span aria-current="page">{page.title}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-bold">{page.title}</h1>
      <div className="mt-3 max-w-2xl space-y-3 text-fg-muted">
        {page.intro.map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
      <WorkflowBlocks
        items={workflowsForCategory(page.category)}
        heading="Common jobs these tools are used for"
        intro="Few of these tasks are done with a single tool. These are the sequences that work."
      />

      {guides.length > 0 ? (
        <section aria-labelledby={`${page.category}-guides`} className="mt-10">
          <h2 id={`${page.category}-guides`} className="text-xl font-bold">
            Helpful guides
          </h2>
          <ul className="mt-3 space-y-2">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={`/learn/${g.slug}`} className="text-accent underline hover:no-underline">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby={`${page.category}-other`} className="mt-10">
        <h2 id={`${page.category}-other`} className="text-xl font-bold">
          Other categories
        </h2>
        <nav aria-label="Other tool categories" className="mt-3 flex flex-wrap gap-2">
          {categoryPages
            .filter((other) => other.path !== page.path)
            .map((other) => (
              <Link
                key={other.path}
                href={other.path}
                className="glass-soft card-hover min-h-11 rounded-full px-4 py-2.5 text-sm font-medium"
              >
                {other.title}
              </Link>
            ))}
          <Link
            href="/tools"
            className="glass-soft card-hover min-h-11 rounded-full px-4 py-2.5 text-sm font-medium"
          >
            All {tools.length} tools
          </Link>
        </nav>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
