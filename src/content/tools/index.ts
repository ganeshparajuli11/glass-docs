import { imageToolContent } from "./image";
import { pdfToolContent } from "./pdf";
import { studyToolContent } from "./study";
import { textToolContent } from "./text";
import type { ToolContent, ToolContentMap } from "./types";

export type { ToolContent, ToolContentSection, ToolContentMap } from "./types";

/** Per-tool long-form page content, keyed by tool slug. */
export const toolContent: ToolContentMap = {
  ...pdfToolContent,
  ...imageToolContent,
  ...textToolContent,
  ...studyToolContent,
};

export function getToolContent(slug: string): ToolContent | undefined {
  return toolContent[slug];
}
