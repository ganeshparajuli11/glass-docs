/**
 * Ad configuration.
 *
 * Three states are tracked SEPARATELY, because they answer different
 * questions and conflating them is what caused audit finding PRIV-001:
 *
 *   1. `clientId`   — do we have a syntactically valid publisher ID at all?
 *   2. `verifying`  — is Google still reviewing the site? During review the
 *                     loader script must be present in the served HTML, but
 *                     no ad unit may render.
 *   3. `enabled`    — are we actually monetising? Only then do ad units
 *                     render, and only where a valid slot ID exists.
 *
 * A valid publisher ID on its own is NOT permission to display advertising.
 *
 * Ads must never be placed inside the tool workspace or near
 * upload/process/download controls. See 04_UI_UX_AND_AD_PLACEMENT.md.
 *
 * To go live after AdSense approval:
 *   1. Implement the consent gate for regions that require one before
 *      personalised advertising (see `consentRequiredBeforeAds`).
 *   2. Create ad units in AdSense and paste their slot IDs below.
 *   3. Set NEXT_PUBLIC_ADSENSE_VERIFYING=false
 *   4. Set NEXT_PUBLIC_ADSENSE_ENABLED=true
 *   5. Confirm public/ads.txt matches the exact line AdSense provides.
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
  /** True only when ad UNITS may render. */
  enabled: boolean;
  /** True while Google is verifying/reviewing the site. Loader script only. */
  verifying: boolean;
  /** True when the AdSense loader <script> belongs in the served HTML. */
  loadScript: boolean;
  /**
   * True when a consent decision must be collected before ad units render.
   * The banner is not implemented yet, so this deliberately documents an
   * outstanding requirement rather than implying one already exists.
   */
  consentRequiredBeforeAds: boolean;
  clientId: string | null;
  placements: Record<AdPlacementKey, AdPlacement>;
}

/** AdSense publisher ID for glasstools.net (public by design; env can override). */
const rawClientId =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "ca-pub-2661645060530542";
const validClientId = /^ca-pub-\d{10,}$/.test(rawClientId) ? rawClientId : null;

/** Monetisation is opt-in and requires a valid publisher ID. */
const adsEnabled =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" && validClientId !== null;

/**
 * Verification defaults to ON so a fresh deploy can be reviewed by Google.
 * Set NEXT_PUBLIC_ADSENSE_VERIFYING=false once the account is approved.
 * Implied false once ads are enabled — the loader is already being loaded.
 */
const verifying =
  !adsEnabled &&
  process.env.NEXT_PUBLIC_ADSENSE_VERIFYING !== "false" &&
  validClientId !== null;

export const adConfig: AdConfig = {
  enabled: adsEnabled,
  verifying,
  loadScript: adsEnabled || verifying,
  consentRequiredBeforeAds: true,
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

export interface AdStateDescription {
  scriptLoaded: boolean;
  unitsRendered: boolean;
  summary: string;
}

/**
 * Human-readable description of the current advertising state. The cookies
 * page renders this, so public policy copy cannot drift away from runtime
 * behaviour (audit findings PRIV-001 and TRUST-002).
 */
export function describeAdState(): AdStateDescription {
  if (adConfig.enabled) {
    return {
      scriptLoaded: true,
      unitsRendered: true,
      summary:
        "Google AdSense is active. Advertisements are shown on content pages, and Google may set advertising cookies in your browser.",
    };
  }
  if (adConfig.verifying) {
    return {
      scriptLoaded: true,
      unitsRendered: false,
      summary:
        "No advertisements are shown anywhere on this site. Google's AdSense loader script is included on each page so that Google can verify site ownership and review the site. That script is served by Google, so Google can receive your IP address, browser user agent and the address of the page you are viewing, and may set cookies.",
    };
  }
  return {
    scriptLoaded: false,
    unitsRendered: false,
    summary:
      "No advertisements are shown and no advertising script is loaded on this site.",
  };
}
