"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

/** Hero search — submits to the tools index with a query. */
export function ToolSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(query.trim() ? `/tools?q=${encodeURIComponent(query.trim())}` : "/tools");
      }}
      className="glass-strong flex items-center gap-2 p-2"
    >
      <Search className="ml-2 h-5 w-5 shrink-0 text-fg-subtle" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tools — merge, split, watermark…"
        aria-label="Search tools"
        className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-fg-subtle"
      />
      <button
        type="submit"
        className="min-h-11 shrink-0 rounded-full bg-accent px-4 text-sm font-semibold text-accent-contrast hover:bg-accent-hover sm:px-5"
      >
        Search
      </button>
    </form>
  );
}
