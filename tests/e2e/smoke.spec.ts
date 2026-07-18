import { expect, test } from "@playwright/test";

test("homepage renders and navigates to a tool", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("PDF tools");
  await page.getByRole("link", { name: /Merge PDF/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Merge PDF");
  await expect(page.getByText("Local — files stay on your device")).toBeVisible();
});

test("tools index search filters results", async ({ page }) => {
  await page.goto("/tools");
  await page.getByRole("searchbox", { name: "Search tools" }).fill("watermark");
  await expect(page.getByRole("link", { name: /Add watermark/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Merge PDF/ })).toHaveCount(0);
});

test("no document upload requests during local processing page load", async ({ page }) => {
  const uploads: string[] = [];
  page.on("request", (req) => {
    if (["POST", "PUT", "PATCH"].includes(req.method())) uploads.push(req.url());
  });
  await page.goto("/tools/merge-pdf");
  await expect(page.getByText("Drop PDF files here")).toBeVisible();
  expect(uploads).toEqual([]);
});
