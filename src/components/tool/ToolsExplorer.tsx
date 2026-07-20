"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { searchTools, tools } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tool/ToolCard";

const categories = [
  { key: "all", label: "All" },
  { key: "pdf", label: "PDF" },
  { key: "image", label: "Images" },
  { key: "text", label: "Text" },
  { key: "calculator", label: "Calculators" },
  { key: "student", label: "Student" },
] as const;

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getLocationSearch() {
  return window.location.search;
}

function getServerLocationSearch() {
  return "";
}

export function ToolsExplorer() {
  const locationSearch = useSyncExternalStore(
    subscribeToLocation,
    getLocationSearch,
    getServerLocationSearch,
  );
  const params = new URLSearchParams(locationSearch);
  const paramCategory = params.get("c");
  const initialCategory = categories.some((item) => item.key === paramCategory)
    ? (paramCategory as (typeof categories)[number]["key"])
    : "all";
  const [queryOverride, setQueryOverride] = useState<string | null>(null);
  const [categoryOverride, setCategoryOverride] =
    useState<(typeof categories)[number]["key"] | null>(null);
  const query = queryOverride ?? params.get("q") ?? "";
  const category = categoryOverride ?? initialCategory;

  const results = useMemo(() => {
    const byQuery = searchTools(query);
    return category === "all" ? byQuery : byQuery.filter((t) => t.category === category);
  }, [query, category]);

  return (
    <div>
      <div className="glass-strong flex items-center gap-2 p-2">
        <Search className="ml-2 h-5 w-5 shrink-0 text-fg-subtle" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQueryOverride(e.target.value)}
          placeholder="Search by name or task…"
          aria-label="Search tools"
          className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-fg-subtle"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategoryOverride(c.key)}
            aria-pressed={category === c.key}
            className={
              category === c.key
                ? "min-h-11 rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast"
                : "min-h-11 rounded-full border px-5 text-sm font-medium text-fg-muted hover:text-fg"
            }
            style={category === c.key ? undefined : { borderColor: "var(--glass-strong-border)" }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-fg-muted" aria-live="polite">
        {results.length} of {tools.length} tools
      </p>
      {results.length === 0 ? (
        <div className="solid-reading mt-4 p-8 text-center">
          <p className="font-medium">No tools match “{query}”.</p>
          <p className="mt-1 text-sm text-fg-muted">
            Try a simpler word like “merge”, “split”, or “image”.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
