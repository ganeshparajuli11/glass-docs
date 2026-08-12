import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools/registry";
import { articles } from "@/content/articles";
import { absoluteUrl } from "@/lib/seo/url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "", "/tools", "/pdf-tools", "/image-tools", "/text-tools", "/calculators",
    "/student-tools", "/learn", "/about", "/contact", "/privacy", "/terms", "/cookies",
  ];
  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.6,
    })),
    ...tools.map((t) => ({
      url: absoluteUrl(`/tools/${t.slug}`),
      // Real per-tool review dates. Not the deploy date — a rebuild is not a
      // content change, and stamping every URL with "today" is a lie Google
      // will learn to ignore.
      lastModified: new Date(t.lastVerifiedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: absoluteUrl(`/learn/${a.slug}`),
      lastModified: new Date(a.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
