import Link from "next/link";
import {
  FileText,
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
  "pdf-to-images": FileImage,
  "pdf-viewer": Eye,
  "pdf-metadata": Info,
  "extract-text": Type,
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
      <p className="mt-2 text-xs font-medium text-success">Local · no upload</p>
    </Link>
  );
}
