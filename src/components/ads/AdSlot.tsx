"use client";

import { useEffect, useRef } from "react";
import { adConfig, isPlacementActive, type AdPlacementKey } from "@/config/ads";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  placement: AdPlacementKey;
  className?: string;
  context?: "homepage" | "tool" | "article";
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Renders nothing when ads are disabled (the default) or when the
 * placement/client/slot configuration is invalid. When enabled, it loads the
 * AdSense script once, reserves a bounded area to prevent layout shift, and
 * is clearly labelled. Never rendered inside the tool workspace, never
 * auto-refreshed.
 */
export function AdSlot({ placement, className }: AdSlotProps) {
  const active = isPlacementActive(placement);
  const pushed = useRef(false);

  useEffect(() => {
    if (!active || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Ad blocker or script not loaded — the page must keep working.
    }
  }, [active]);

  if (!active) {
    if (process.env.NODE_ENV !== "production" && adConfig.enabled) {
      console.warn(`AdSlot "${placement}" inactive: missing/invalid slot ID.`);
    }
    return null;
  }

  const { minHeight, slotId } = adConfig.placements[placement];

  return (
    <aside
      aria-label="Advertisements"
      className={cn("mx-auto w-full max-w-3xl", className)}
      style={{
        minHeight,
        background: "var(--ad-bg)",
        border: "1px solid var(--ad-border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      <p className="p-1 text-center text-[11px] text-fg-subtle">Advertisements</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: minHeight - 24 }}
        data-ad-client={adConfig.clientId ?? undefined}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
