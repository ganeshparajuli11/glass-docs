/**
 * Ad configuration. Ads are DISABLED by default and must never be placed
 * inside the tool workspace or near upload/process/download controls.
 * See 04_UI_UX_AND_AD_PLACEMENT.md.
 */
export type AdPlacementKey =
  | "homepage-content-break"
  | "tool-post-workflow"
  | "article-content-break"
  | "desktop-side-rail";

export interface AdConfig {
  enabled: boolean;
  clientId: string | null;
  placements: Record<AdPlacementKey, { enabled: boolean; minHeight: number }>;
}

const rawClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
const validClientId = /^ca-pub-\d{10,}$/.test(rawClientId) ? rawClientId : null;

export const adConfig: AdConfig = {
  enabled:
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" && validClientId !== null,
  clientId: validClientId,
  placements: {
    "homepage-content-break": { enabled: true, minHeight: 120 },
    "tool-post-workflow": { enabled: true, minHeight: 120 },
    "article-content-break": { enabled: true, minHeight: 120 },
    "desktop-side-rail": { enabled: false, minHeight: 250 },
  },
};

export function isPlacementActive(key: AdPlacementKey): boolean {
  return adConfig.enabled && adConfig.placements[key].enabled;
}
