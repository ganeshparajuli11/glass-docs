"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

const categories = [
  { key: "all", label: "All" },
  { key: "pdf", label: "PDF" },
  { key: "image", label: "Images" },
  { key: "text", label: "Text" },
  { key: "calculator", label: "Calculators" },
  { key: "student", label: "Student" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

/**
 * Minimal, serialisable description of a tool. Deliberately not the registry
 * type: this component must never gain the ability to render cards, because
 * the cards are the server's job.
 */
export interface ToolSummary {
  slug: string;
  category: string;
  /** Lowercased searchable text, from `toolHaystack()`. */
  search: string;
}

/**
 * Search and category filtering for the tools index.
 *
 * Renders CONTROLS ONLY. Every tool card is server-rendered by the page, so
 * the complete inventory is in the initial HTML for crawlers and for anyone
 * without working JavaScript (audit finding IA-001). Filtering hides and
 * shows that existing markup rather than rendering a second copy of the grid.
 *
 * Which tools match is derived during render from `items`. The effect's only
 * job is to push that result into the DOM — synchronising an external system,
 * which is what effects are for. No state is set inside it.
 *
 * Hidden cards get both the `hidden` attribute and an inline `display: none`,
 * which takes them out of the accessibility tree, so screen readers and
 * `getByRole` locators agree with what is on screen.
 */
export function ToolsFilter({ items }: { items: ToolSummary[] }) {
  const params = useSearchParams();
  const initialCategory = params.get("c");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<CategoryKey>(
    categories.some((c) => c.key === initialCategory)
      ? (initialCategory as CategoryKey)
      : "all",
  );

  const visibleSlugs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return new Set(
      items
        .filter(
          (item) =>
            (q.length === 0 || item.search.includes(q)) &&
            (category === "all" || item.category === category),
        )
        .map((item) => item.slug),
    );
  }, [items, query, category]);

  useEffect(() => {
    const setShown = (element: HTMLElement, shown: boolean) => {
      element.hidden = !shown;
      element.style.display = shown ? "" : "none";
    };

    for (const card of document.querySelectorAll<HTMLElement>(
      "[data-tool-slug]",
    )) {
      setShown(card, visibleSlugs.has(card.dataset.toolSlug ?? ""));
    }

    // A category heading with nothing under it is noise.
    for (const section of document.querySelectorAll<HTMLElement>(
      "[data-category-section]",
    )) {
      setShown(
        section,
        section.querySelector("[data-tool-slug]:not([hidden])") !== null,
      );
    }

    const empty = document.getElementById("tools-empty");
    if (empty) setShown(empty, visibleSlugs.size === 0);
  }, [visibleSlugs]);

  return (
    <div>
      <div className="glass-strong flex items-center gap-2 p-2">
        <Search
          className="ml-2 h-5 w-5 shrink-0 text-fg-subtle"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or task…"
          aria-label="Search tools"
          aria-controls="tool-inventory"
          className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-fg-subtle"
        />
      </div>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by category"
      >
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            aria-pressed={category === c.key}
            className={
              category === c.key
                ? "min-h-11 rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast"
                : "min-h-11 rounded-full border px-5 text-sm font-medium text-fg-muted hover:text-fg"
            }
            style={
              category === c.key
                ? undefined
                : { borderColor: "var(--glass-strong-border)" }
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-fg-muted" aria-live="polite">
        {visibleSlugs.size} of {items.length} tools
      </p>
    </div>
  );
}
