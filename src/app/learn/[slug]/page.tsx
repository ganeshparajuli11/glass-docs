import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticle, toolGuides } from "@/content/articles";
import { tools } from "@/lib/tools/registry";
import { AdSlot } from "@/components/ads/AdSlot";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/seo/url";

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/learn/${article.slug}` },
    openGraph: { title: article.title, description: article.description, type: "article" },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  // Reverse of toolGuides: every tool that lists this guide, in registry order.
  const guideTools = tools.filter((t) => (toolGuides[t.slug] ?? []).includes(article.slug));

  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-fg-muted">
        <Link href="/learn" className="hover:text-fg">
          Guides
        </Link>{" "}
        / <span aria-current="page">{article.title}</span>
      </nav>
      <article className="solid-reading reading-col mx-auto mt-4 p-6 sm:p-10">
        <h1 className="text-3xl font-bold">{article.title}</h1>
        <div className="article-body mt-6 space-y-4 text-fg-muted">{article.body}</div>
      </article>
      {guideTools.length > 0 ? (
        <section aria-labelledby="guide-tools-heading" className="reading-col mx-auto mt-8">
          <h2 id="guide-tools-heading" className="text-xl font-bold">
            Tools used in this guide
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {guideTools.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  className="glass-soft card-hover inline-flex min-h-11 items-center rounded-full px-4 py-2.5 text-sm font-medium"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <AdSlot placement="article-content-break" context="article" className="mt-8" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Guides", item: absoluteUrl("/learn") },
              {
                "@type": "ListItem",
                position: 2,
                name: article.title,
                item: absoluteUrl(`/learn/${article.slug}`),
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            datePublished: article.publishedAt,
            author: { "@type": "Person", name: site.operator.name },
            publisher: {
              "@type": "Organization",
              name: site.name,
              logo: {
                "@type": "ImageObject",
                url: absoluteUrl("/icon.svg"),
              },
            },
            mainEntityOfPage: absoluteUrl(`/learn/${article.slug}`),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
