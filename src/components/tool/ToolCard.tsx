import Link from "next/link";
import {
  FileText,
  FileDown,
  Minimize2,
  Scaling,
  Crop,
  Repeat,
  UserSquare,
  WholeWord,
  CaseSensitive,
  Eraser,
  ListX,
  GitCompare,
  GraduationCap,
  Target,
  CalendarCheck,
  Percent,
  Landmark,
  BookMarked,
  Scissors,
  RotateCw,
  ArrowUpDown,
  Trash2,
  FileOutput,
  Stamp,
  Hash,
  Images,
  FileImage,
  Eye,
  Info,
  Type,
} from "lucide-react";
import type { ToolDefinition } from "@/lib/tools/registry";

const icons: Record<string, typeof FileText> = {
  "merge-pdf": FileText,
  "split-pdf": Scissors,
  "rotate-pdf": RotateCw,
  "reorder-pages": ArrowUpDown,
  "delete-pages": Trash2,
  "extract-pages": FileOutput,
  "watermark-pdf": Stamp,
  "page-numbers": Hash,
  "images-to-pdf": Images,
  "compress-pdf": FileDown,
  "pdf-to-images": FileImage,
  "pdf-viewer": Eye,
  "pdf-metadata": Info,
  "extract-text": Type,
  "image-compressor": Minimize2,
  "image-resizer": Scaling,
  "crop-image": Crop,
  "image-converter": Repeat,
  "passport-photo": UserSquare,
  "word-counter": WholeWord,
  "case-converter": CaseSensitive,
  "remove-spaces": Eraser,
  "dedupe-lines": ListX,
  "text-compare": GitCompare,
  "gpa-calculator": GraduationCap,
  "grade-calculator": Target,
  "attendance-calculator": CalendarCheck,
  "percentage-calculator": Percent,
  "emi-calculator": Landmark,
  "cover-page": BookMarked,
};

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const Icon = icons[tool.slug] ?? FileText;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="glass-soft card-hover block p-5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 font-semibold">{tool.name}</h3>
      <p className="mt-1 text-sm text-fg-muted">{tool.shortDescription}</p>
      <p className="mt-2 text-xs font-medium text-success">
        {tool.acceptedMimeTypes.length > 0 ? "Local · no upload" : "Runs in your browser"}
      </p>
    </Link>
  );
}
