import { Suspense } from "react";
import type { Metadata } from "next";
import { ToolsExplorer } from "@/components/tool/ToolsExplorer";
import { pageMeta } from "@/lib/seo/meta";

export const metadata: Metadata = pageMeta({
  title: "All tools — PDF, image, text, calculators",
  description:
    "Browse 29 free tools: merge, split, rotate and watermark PDFs, compress and convert images, count words, calculate GPA and more — processed in your browser.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 pt-10 sm:px-6">
      <h1 className="text-3xl font-bold">All tools</h1>
      <p className="mt-2 max-w-xl text-fg-muted">
        Every tool below runs locally in your browser. Your files are not
        uploaded.
      </p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <ToolsExplorer />
        </Suspense>
      </div>
    </div>
  );
}
