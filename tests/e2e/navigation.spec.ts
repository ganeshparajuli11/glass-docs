import { expect, test } from "@playwright/test";
import { categoryPages } from "../../src/lib/seo/categories";
import { tools } from "../../src/lib/tools/registry";

/**
 * The header is the site's main internal-linking surface: every tool is one
 * click from every page. These tests cover both halves of that claim — the
 * links exist in the served HTML (crawl path), and a person can actually
 * reach them (menus open, on both breakpoints).
 */

test.describe("header links without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every tool is linked from the header of an unrelated page", async ({
    page,
  }) => {
    // /privacy has no tool content of its own, so anything found here came
    // from the chrome.
    await page.goto("/privacy");

    const hrefs = await page
      .locator("header a[href^='/tools/']")
      .evaluateAll((links) => links.map((l) => l.getAttribute("href") ?? ""));
    const linked = new Set(hrefs.map((h) => h.replace("/tools/", "")));

    const missing = tools.map((t) => t.slug).filter((slug) => !linked.has(slug));
    expect(missing, "tools missing from the header HTML").toEqual([]);
  });

  test("every category hub is reachable when the menus cannot open", async ({
    page,
  }) => {
    await page.goto("/privacy");
    for (const category of categoryPages) {
      // The collapsed menu panels also contain a hub link, so require one that
      // is actually on screen — that is the <noscript> row.
      await expect(
        page.locator(`header a[href='${category.path}']:visible`).first(),
        `${category.path} unreachable without JavaScript`,
      ).toBeVisible();
    }
  });
});

test.describe("header menus on a wide screen", () => {
  // The menu strip only appears from the xl breakpoint up, so pin the width
  // rather than inheriting whatever the project device is.
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a category menu opens and its tools are usable", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    const trigger = header.getByRole("button", { name: "PDF tools" });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(header.getByRole("link", { name: "Merge PDF" })).toHaveCount(0);

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(header.getByRole("link", { name: "Merge PDF" })).toBeVisible();
    await expect(
      header.getByRole("link", { name: /Browse PDF tools/ }),
    ).toBeVisible();

    await header.getByRole("link", { name: "Split PDF" }).click();
    // `npm run dev` compiles a route on first visit; on a cold cache with two
    // workers that alone can exceed the default 5 s, so allow for it here.
    await expect(page).toHaveURL(/\/tools\/split-pdf$/, { timeout: 30_000 });
    // The menu must not still be hanging open over the new page.
    await expect(
      header.getByRole("button", { name: "PDF tools" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("Escape closes an open menu", async ({ page }) => {
    await page.goto("/");
    const trigger = page.locator("header").getByRole("button", {
      name: "Calculators",
    });

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("clicking outside closes an open menu", async ({ page }) => {
    await page.goto("/");
    const trigger = page.locator("header").getByRole("button", {
      name: "Text tools",
    });

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.locator("main").click({ position: { x: 5, y: 5 } });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("header menus on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the menu button reveals the categories and their tools", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header");
    const menuButton = header.getByRole("button", { name: "Menu" });

    await expect(menuButton).toBeVisible();
    await expect(
      header.getByRole("button", { name: "Image tools" }),
    ).toBeHidden();

    await menuButton.click();

    const categoryTrigger = header.getByRole("button", { name: "Image tools" });
    await expect(categoryTrigger).toBeVisible();

    await categoryTrigger.click();
    await expect(
      header.getByRole("link", { name: "Passport photo sheet" }),
    ).toBeVisible();
  });

  test("the page does not scroll sideways with the menu open", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Menu" }).click();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
