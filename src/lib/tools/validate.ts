import { tools, type ToolDefinition } from "./registry";

/** Registry invariants — the build/tests fail when these are violated. */
export function validateRegistry(defs: ToolDefinition[] = tools): string[] {
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const t of defs) {
    if (slugs.has(t.slug)) problems.push(`duplicate slug: ${t.slug}`);
    slugs.add(t.slug);
    if (!/^[a-z0-9-]+$/.test(t.slug)) problems.push(`invalid slug: ${t.slug}`);
    if (t.status === "planned") problems.push(`planned tool must not be listed: ${t.slug}`);
    if (t.maxRecommendedSizeMb <= 0) problems.push(`bad size limit: ${t.slug}`);
    if (t.keywords.length === 0) problems.push(`no keywords: ${t.slug}`);
    if (t.faq.length === 0) problems.push(`no FAQ: ${t.slug}`);
  }
  for (const t of defs) {
    for (const rel of t.relatedTools) {
      if (!slugs.has(rel)) problems.push(`unknown related tool "${rel}" on ${t.slug}`);
    }
  }
  return problems;
}
