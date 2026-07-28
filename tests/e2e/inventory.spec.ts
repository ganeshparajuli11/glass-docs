import { expect, test } from "@playwright/test";
import { tools } from "../../src/lib/tools/registry";

/** Unique /tools/<slug> targets linked from inside <main>. */
async function toolSlugsInMain(page: import("@playwright/test").Page) {
  const hrefs = await page
    .locator("main a[href^='/tools/']")
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    );
  return new Set(
    hrefs
      .map((href) => href.split("#")[0].split("?")[0])
      .map((href) => href.replace(/^\/tools\//, ""))
      .filter((slug) => slug.length > 0),
  );
}

/**
 * Audit finding IA-001. The tools index used to render every card inside a
 * client component, so the initial HTML carried 15 links — all of it header
 * and footer chrome — and the crawl path to 29 tool pages effectively did not
 * exist. These tests fail if that regresses.
 */
test.describe("tools index without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every tool is linked from the server-rendered HTML", async ({
    page,
  }) => {
    await page.goto("/tools");

    const linked = await toolSlugsInMain(page);
    const missing = tools
      .map((tool) => tool.slug)
      .filter((slug) => !linked.has(slug));

    expect(missing, "tools missing from server-rendered /tools").toEqual([]);
  });

  test("category headings and hub links are present", async ({ page }) => {
    await page.goto("/tools");

    await expect(
      page.locator("main").getByRole("heading", { name: "PDF tools" }),
    ).toBeVisible();
    await expect(
      page.locator("main a[href='/pdf-tools']").first(),
    ).toBeVisible();
    await expect(
      page.locator("main a[href='/image-tools']").first(),
    ).toBeVisible();
  });

  test("a tool page shows its explanatory content", async ({ page }) => {
    // The interactive workspace needs JavaScript, but the text that makes the
    // page worth indexing must not.
    await page.goto("/tools/merge-pdf");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Merge PDF",
    );
    await expect(page.getByText("Good to know")).toBeVisible();
  });
});

test.describe("category hubs", () => {
  test("every category hub is reachable from the homepage", async ({
    page,
  }) => {
    await page.goto("/");
    for (const path of [
      "/pdf-tools",
      "/image-tools",
      "/text-tools",
      "/calculators",
      "/student-tools",
    ]) {
      await expect(
        page.locator(`a[href='${path}']`).first(),
        `${path} not linked from the homepage`,
      ).toHaveCount(1);
    }
  });

  test("filtering hides cards without removing them from the page", async ({
    page,
  }) => {
    await page.goto("/tools");
    const main = page.locator("main");

    // All 29 present before filtering.
    expect((await toolSlugsInMain(page)).size).toBeGreaterThan(20);

    await page.getByRole("searchbox", { name: "Search tools" }).fill("watermark");

    // Filtered out of the accessibility tree...
    await expect(main.getByRole("link", { name: /Merge PDF/ })).toHaveCount(0);
    // ...but still in the DOM, because the server rendered it.
    await expect(main.locator("[data-tool-slug='merge-pdf']")).toHaveCount(1);
    await expect(
      main.locator("[data-tool-slug='watermark-pdf']"),
    ).toBeVisible();
  });

  test("an unmatched search shows the empty state", async ({ page }) => {
    await page.goto("/tools");
    await page
      .getByRole("searchbox", { name: "Search tools" })
      .fill("zzzznotatool");
    await expect(page.locator("#tools-empty")).toBeVisible();
  });
});
