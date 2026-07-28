import type { ToolDefinition } from "./registry";

/**
 * The text a tool can be matched against, as one lowercase string.
 *
 * The server writes this into a `data-search` attribute on each rendered
 * card so the client filter can match without shipping the registry again,
 * and — more importantly — without the card markup only existing once
 * JavaScript has run. See `searchTools()` in registry.ts: the fields and the
 * substring semantics are deliberately identical, so filtering on the client
 * gives the same answer as filtering on the server.
 */
export function toolHaystack(tool: ToolDefinition): string {
  return [
    tool.name,
    tool.shortDescription,
    tool.category,
    ...tool.keywords,
  ]
    .join(" ")
    .toLowerCase();
}
