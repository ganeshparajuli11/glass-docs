import type { ReactNode } from "react";

export interface ToolContentSection {
  /** Rendered as an <h2> on the tool page, so it must read as a real heading. */
  heading: string;
  body: ReactNode;
}

/**
 * Long-form, hand-written page content for a single tool.
 *
 * This exists because a tool page whose only text is a one-line description
 * plus two FAQ entries is a thin page, both for readers who have never used
 * the tool and for search engines. Every field here must be specific to the
 * tool it belongs to: no shared boilerplate, no text that would still be true
 * if you swapped in a different tool's name.
 */
export interface ToolContent {
  /** One short paragraph under the H1, above the workspace. */
  lede: ReactNode;
  /** Ordered steps that match the controls the tool actually has. */
  steps: ReactNode[];
  /** Sections below the workspace: choosing settings, pitfalls, alternatives. */
  sections: ToolContentSection[];
}

export type ToolContentMap = Record<string, ToolContent>;
