import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticle } from "@/content/articles";
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
      <AdSlot placement="article-content-break" context="article" className="mt-8" />
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
