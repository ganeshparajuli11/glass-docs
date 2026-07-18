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
