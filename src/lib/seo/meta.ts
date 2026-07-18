import type { Metadata } from "next";

/**
 * Central metadata builder: every indexable page gets a unique title,
 * description, self-referencing canonical, and Open Graph/Twitter fields.
 */
export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const { title, description, path } = opts;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
