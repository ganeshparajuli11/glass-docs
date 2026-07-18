import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools/registry";
import { articles } from "@/content/articles";
import { site } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tools", "/learn", "/about", "/contact", "/privacy", "/terms", "/cookies"];
  return [
    ...staticRoutes.map((path) => ({
      url: `${site.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.6,
    })),
    ...tools.map((t) => ({
      url: `${site.url}/tools/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: `${site.url}/learn/${a.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
