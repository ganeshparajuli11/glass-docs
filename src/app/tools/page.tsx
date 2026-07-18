import { Suspense } from "react";
import type { Metadata } from "next";
import { ToolsExplorer } from "@/components/tool/ToolsExplorer";

export const metadata: Metadata = {
  title: "All PDF tools",
  description:
    "Browse every free tool: merge, split, rotate, reorder, watermark, page numbers, image conversion, text extraction and more — all processed locally in your browser.",
};

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
