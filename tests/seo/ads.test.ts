import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { adConfig, describeAdState, isPlacementActive } from "@/config/ads";

const layoutSource = readFileSync(
  join(process.cwd(), "src", "app", "layout.tsx"),
  "utf8",
);
const cookiesSource = readFileSync(
  join(process.cwd(), "src", "app", "cookies", "page.tsx"),
  "utf8",
);

/**
 * Audit finding PRIV-001: a valid publisher ID is not permission to display
 * advertising. Verification, monetisation and consent are separate states and
 * these tests exist to stop them collapsing back into one boolean.
 */
describe("AdSense state separation", () => {
  it("ad units are off by default", () => {
    expect(adConfig.enabled).toBe(false);
    for (const key of Object.keys(adConfig.placements) as Array<
      keyof typeof adConfig.placements
    >) {
      expect(isPlacementActive(key)).toBe(false);
    }
  });

  it("no placement can activate without a slot ID even once ads are enabled", () => {
    for (const placement of Object.values(adConfig.placements)) {
      expect(placement.slotId).toBe("");
    }
  });

  it("uses a well-formed publisher ID", () => {
    expect(adConfig.clientId).toMatch(/^ca-pub-\d{10,}$/);
  });

  it("verification mode loads the loader script but renders no units", () => {
    // Default environment: not enabled, still being verified by Google.
    expect(adConfig.verifying).toBe(true);
    expect(adConfig.loadScript).toBe(true);
    expect(adConfig.enabled).toBe(false);
  });

  it("still requires a consent decision before units may render", () => {
    expect(adConfig.consentRequiredBeforeAds).toBe(true);
  });
});

describe("the layout gates the loader script correctly", () => {
  it("gates on loadScript, never on the mere presence of a client ID", () => {
    expect(layoutSource).toContain("adConfig.loadScript");
    expect(layoutSource).not.toMatch(/\{\s*adConfig\.clientId\s*\?/);
  });

  it("renders the loader as a prerendered script tag, not next/script", () => {
    // next/script injects after hydration and would be invisible to Google's
    // verification crawler, which reads the static HTML.
    expect(layoutSource).toContain("pagead2.googlesyndication.com");
    expect(layoutSource).not.toContain('from "next/script"');
  });

  it("references the loader exactly once", () => {
    const occurrences = layoutSource.split("adsbygoogle.js").length - 1;
    expect(occurrences).toBe(1);
  });
});

describe("public copy matches the runtime advertising state", () => {
  it("the cookies page renders the generated state description", () => {
    expect(cookiesSource).toContain("describeAdState");
  });

  it("the description admits the script is loaded while verifying", () => {
    const state = describeAdState();
    expect(state.scriptLoaded).toBe(true);
    expect(state.unitsRendered).toBe(false);
    expect(state.summary.toLowerCase()).toContain("google");
    expect(state.summary.toLowerCase()).toContain("no advertisements");
  });

  it("the cookies page does not claim that nothing third-party is loaded", () => {
    expect(cookiesSource).not.toMatch(/none are set at present/i);
  });
});
