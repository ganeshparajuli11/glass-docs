import type { ToolError } from "./errors";
import type { DownloadableResult } from "@/lib/files/download";

export interface ProgressState {
  stage: "parsing" | "processing" | "serializing";
  /** 0..1 when measurable, otherwise null (indeterminate). */
  fraction: number | null;
  label: string;
}

/** Discriminated workflow state — no loose booleans. */
export type ToolState =
  | { status: "idle" }
  | { status: "processing"; progress: ProgressState }
  | { status: "success"; results: DownloadableResult[]; note?: string }
  | { status: "error"; error: ToolError };
