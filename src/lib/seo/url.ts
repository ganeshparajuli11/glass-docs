import { site } from "@/config/site";

/**
 * Absolute URL for an internal path, resolved against the configured origin.
 *
 * Structured data, Open Graph tags and canonicals must all agree, and they
 * must follow NEXT_PUBLIC_SITE_URL rather than a domain typed into a
 * component (audit finding SCHEMA-002). Preview and staging builds otherwise
 * emit production URLs.
 *
 *   absoluteUrl()                   -> "https://glasstools.net"
 *   absoluteUrl("/")                -> "https://glasstools.net"
 *   absoluteUrl("/tools/merge-pdf") -> "https://glasstools.net/tools/merge-pdf"
 *
 * The root is returned without a trailing slash so it matches the canonical
 * form already used in the sitemap.
 */
export function absoluteUrl(path = "/"): string {
  const origin = site.url.replace(/\/+$/, "");
  if (!path || path === "/") return origin;
  return `${origin}/${path.replace(/^\/+/, "")}`;
}
