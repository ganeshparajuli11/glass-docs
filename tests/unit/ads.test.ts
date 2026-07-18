import { describe, expect, it } from "vitest";
import { adConfig, isPlacementActive } from "@/config/ads";

describe("ad configuration", () => {
  it("ad display is globally disabled by default", () => {
    expect(adConfig.enabled).toBe(false);
    expect(isPlacementActive("homepage-content-break")).toBe(false);
    expect(isPlacementActive("tool-post-workflow")).toBe(false);
  });

  it("uses the real glasstools.net publisher ID format", () => {
    expect(adConfig.clientId).toMatch(/^ca-pub-\d{10,}$/);
  });

  it("placements cannot activate without slot IDs even if enabled", () => {
    for (const p of Object.values(adConfig.placements)) {
      expect(p.slotId).toBe("");
    }
  });
});
