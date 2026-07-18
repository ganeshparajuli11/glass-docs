"use client";

/** Maps registry slugs to lazily-loaded client tool components. */

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const loading = () => (
  <p role="status" className="py-10 text-center text-sm text-fg-muted">
    Loading tool…
  </p>
);

function lazy(loader: () => Promise<{ default: ComponentType<object> }>) {
  return dynamic(loader, { ssr: false, loading });
}

const OrganizeTool = dynamic(() => import("@/features/organize/OrganizeTool"), {
  ssr: false,
  loading,
});

const components: Record<string, ComponentType<object>> = {
  "merge-pdf": lazy(() => import("@/features/merge-pdf/MergePdfTool")),
  "split-pdf": lazy(() => import("@/features/split-pdf/SplitPdfTool")),
  "watermark-pdf": lazy(() => import("@/features/watermark-pdf/WatermarkTool")),
  "page-numbers": lazy(() => import("@/features/page-numbers/PageNumbersTool")),
  "images-to-pdf": lazy(() => import("@/features/images-to-pdf/ImagesToPdfTool")),
  "pdf-to-images": lazy(() => import("@/features/pdf-to-images/PdfToImagesTool")),
  "extract-text": lazy(() => import("@/features/extract-text/ExtractTextTool")),
  "pdf-metadata": lazy(() => import("@/features/metadata/MetadataTool")),
  "pdf-viewer": lazy(() => import("@/features/pdf-viewer/PdfViewerTool")),
};

const organizeModes: Record<string, "rotate" | "reorder" | "delete" | "extract"> = {
  "rotate-pdf": "rotate",
  "reorder-pages": "reorder",
  "delete-pages": "delete",
  "extract-pages": "extract",
};

export function ToolHost({ slug }: { slug: string }) {
  const mode = organizeModes[slug];
  if (mode) return <OrganizeTool mode={mode} />;
  const Component = components[slug];
  if (!Component) return null;
  return <Component />;
}
