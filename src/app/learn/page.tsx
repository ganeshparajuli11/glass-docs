import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/content/articles";

import { pageMeta } from "@/lib/seo/meta";

export const metadata: Metadata = pageMeta({
  title: "Guides — practical help for PDF and document tasks",
  description:
    "Short, practical guides for PDF, image, and document tasks — written around what the tools actually do, including their limits.",
  path: "/learn",
});

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <h1 className="text-3xl font-bold">Guides</h1>
      <p className="mt-2 max-w-xl text-fg-muted">
        Short, practical articles about getting PDF tasks done well.
      </p>
      <ul className="mt-6 space-y-4">
        {articles.map((a) => (
          <li key={a.slug} className="glass-soft card-hover p-5">
            <Link href={`/learn/${a.slug}`} className="block">
              <h2 className="text-lg font-semibold">{a.title}</h2>
              <p className="mt-1 text-sm text-fg-muted">{a.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
