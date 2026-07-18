/**
 * Ad configuration. Ads are DISABLED by default and must never be placed
 * inside the tool workspace or near upload/process/download controls.
 * See 04_UI_UX_AND_AD_PLACEMENT.md.
 *
 * To go live after AdSense approval:
 *   1. Set NEXT_PUBLIC_ADSENSE_ENABLED=true
 *   2. Set NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
 *   3. Create ad units in AdSense and paste their slot IDs below.
 *   4. Publish public/ads.txt with the exact line AdSense provides.
 */
export type AdPlacementKey =
  | "homepage-content-break"
  | "tool-post-workflow"
  | "article-content-break"
  | "desktop-side-rail";

export interface AdPlacement {
  enabled: boolean;
  minHeight: number;
  /** AdSense ad-unit slot ID (digits). Empty = placement stays hidden. */
  slotId: string;
}

export interface AdConfig {
  enabled: boolean;
  clientId: string | null;
  placements: Record<AdPlacementKey, AdPlacement>;
}

/** AdSense publisher ID for glasstools.net (public by design; env can override). */
const rawClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "ca-pub-2661645060530542";
const validClientId = /^ca-pub-\d{10,}$/.test(rawClientId) ? rawClientId : null;

export const adConfig: AdConfig = {
  enabled:
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" && validClientId !== null,
  clientId: validClientId,
  placements: {
    "homepage-content-break": { enabled: true, minHeight: 120, slotId: "" },
    "tool-post-workflow": { enabled: true, minHeight: 120, slotId: "" },
    "article-content-break": { enabled: true, minHeight: 120, slotId: "" },
    "desktop-side-rail": { enabled: false, minHeight: 250, slotId: "" },
  },
};

function isValidSlotId(slotId: string): boolean {
  return /^\d{8,12}$/.test(slotId);
}

/** True only when ads are globally on AND this placement is fully configured. */
export function isPlacementActive(key: AdPlacementKey): boolean {
  const placement = adConfig.placements[key];
  return adConfig.enabled && placement.enabled && isValidSlotId(placement.slotId);
}
