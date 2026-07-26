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
  // Scope to <main>. The site-wide footer lists Merge PDF under "Popular
  // tools", so a page-wide locator finds it no matter what the filter does —
  // which is exactly how this assertion failed in CI.
  const main = page.locator("main");
  await page.getByRole("searchbox", { name: "Search tools" }).fill("watermark");
  await expect(main.getByRole("link", { name: /Add watermark/ })).toBeVisible();
  await expect(main.getByRole("link", { name: /Merge PDF/ })).toHaveCount(0);
});

/**
 * Third-party origins allowed to receive a body-carrying request.
 *
 * Only the AdSense loader is listed. It is present so Google can verify and
 * review the site (see src/config/ads.ts) and it sends its own telemetry
 * beacons. That is disclosed on /cookies and /privacy. It never receives
 * document data — the assertions below are what keep that honest.
 *
 * Adding an entry here is a privacy decision, not a test fix. If a new host
 * appears, update the public copy in the same change.
 */
const ALLOWED_THIRD_PARTY_ORIGINS = ["https://pagead2.googlesyndication.com"];

test("no document upload requests during local processing page load", async ({
  page,
}) => {
  const sent: string[] = [];
  page.on("request", (req) => {
    if (["POST", "PUT", "PATCH"].includes(req.method())) sent.push(req.url());
  });

  await page.goto("/tools/merge-pdf");
  await expect(page.getByText("Drop PDF files here")).toBeVisible();

  const origin = new URL(page.url()).origin;

  // The claim on every tool page is that files are not uploaded. A document
  // upload would go to our own origin, so nothing may be sent there at all.
  const firstParty = sent.filter((url) => new URL(url).origin === origin);
  expect(firstParty, "something was posted to our own origin").toEqual([]);

  // Anything else leaving the page must be a host we have consciously
  // accepted and disclosed.
  const undisclosed = sent.filter(
    (url) => !ALLOWED_THIRD_PARTY_ORIGINS.includes(new URL(url).origin),
  );
  expect(undisclosed, "an undisclosed third party received a request").toEqual(
    [],
  );
});
