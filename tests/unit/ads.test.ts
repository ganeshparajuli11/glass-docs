import { describe, expect, it } from "vitest";
import { adConfig, isPlacementActive } from "@/config/ads";

describe("ad configuration", () => {
  it("ads are globally disabled by default", () => {
    expect(adConfig.enabled).toBe(false);
    expect(isPlacementActive("homepage-content-break")).toBe(false);
    expect(isPlacementActive("tool-post-workflow")).toBe(false);
  });

  it("has no invented client id", () => {
    expect(adConfig.clientId).toBeNull();
  });
});

describe("placement slot validation", () => {
  it("placements without a slot ID can never activate", () => {
    // Even if the global switch were on, empty slot IDs keep placements off.
    for (const p of Object.values(adConfig.placements)) {
      expect(p.slotId).toBe("");
    }
  });
});
