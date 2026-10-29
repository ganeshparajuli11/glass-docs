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
  "compress-pdf": lazy(() => import("@/features/compress-pdf/CompressPdfTool")),
  "pdf-to-images": lazy(() => import("@/features/pdf-to-images/PdfToImagesTool")),
  "extract-text": lazy(() => import("@/features/extract-text/ExtractTextTool")),
  "ocr-pdf": lazy(() => import("@/features/ocr-pdf/OcrPdfTool")),
  "pdf-metadata": lazy(() => import("@/features/metadata/MetadataTool")),
  "pdf-viewer": lazy(() => import("@/features/pdf-viewer/PdfViewerTool")),
  "image-compressor": lazy(() => import("@/features/image-compressor/ImageCompressorTool")),
  "image-resizer": lazy(() => import("@/features/image-resizer/ImageResizerTool")),
  "crop-image": lazy(() => import("@/features/crop-image/CropImageTool")),
  "image-converter": lazy(() => import("@/features/image-converter/ImageConverterTool")),
  "image-to-text": lazy(() => import("@/features/image-to-text/ImageToTextTool")),
  "remove-exif": lazy(() => import("@/features/remove-exif/RemoveExifTool")),
  "passport-photo": lazy(() => import("@/features/passport-photo/PassportPhotoTool")),
  "word-counter": lazy(() => import("@/features/word-counter/WordCounterTool")),
  "case-converter": lazy(() => import("@/features/case-converter/CaseConverterTool")),
  "remove-spaces": lazy(() => import("@/features/remove-spaces/RemoveSpacesTool")),
  "dedupe-lines": lazy(() => import("@/features/dedupe-lines/DedupeLinesTool")),
  "text-compare": lazy(() => import("@/features/text-compare/TextCompareTool")),
  "gpa-calculator": lazy(() => import("@/features/gpa-calculator/GpaCalculatorTool")),
  "grade-calculator": lazy(() => import("@/features/grade-calculator/GradeCalculatorTool")),
  "attendance-calculator": lazy(() => import("@/features/attendance-calculator/AttendanceCalculatorTool")),
  "percentage-calculator": lazy(() => import("@/features/percentage-calculator/PercentageCalculatorTool")),
  "emi-calculator": lazy(() => import("@/features/emi-calculator/EmiCalculatorTool")),
  "cover-page": lazy(() => import("@/features/cover-page/CoverPageTool")),
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
