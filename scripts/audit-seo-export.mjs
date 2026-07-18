// Audits the static export: unique titles/descriptions, single h1, canonical.
import { readFileSync, readdirSync, statSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const root = "out";
const pages = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".html") && !name.startsWith("_") && name !== "404.html") pages.push(p);
  }
}
walk(root);

const titles = new Map();
const descs = new Map();
let problems = [];
for (const p of pages) {
  const html = readFileSync(p, "utf8");
  const title = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "";
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1] ?? "";
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) ?? [])[1] ?? "";
  if (!title) problems.push(`${p}: missing title`);
  if (!desc) problems.push(`${p}: missing description`);
  if (h1s !== 1) problems.push(`${p}: ${h1s} h1 elements`);
  if (!canonical.startsWith("https://glasstools.net")) problems.push(`${p}: bad canonical "${canonical}"`);
  if (titles.has(title)) problems.push(`${p}: duplicate title with ${titles.get(title)}`);
  if (descs.has(desc)) problems.push(`${p}: duplicate description with ${descs.get(desc)}`);
  titles.set(title, p);
  descs.set(desc, p);
}
const summary = `\n---\nAudit run ${new Date().toISOString()}: ${pages.length} pages, ${problems.length} problems\n${problems.map((x) => `- ${x}`).join("\n")}\n`;
console.log(summary);
appendFileSync("docs/seo/SEO-TEST-RESULTS.md", summary);
process.exit(problems.length > 0 ? 1 : 0);
