import { adConfig, isPlacementActive, type AdPlacementKey } from "@/config/ads";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  placement: AdPlacementKey;
  className?: string;
  context?: "homepage" | "tool" | "article";
}

/**
 * Renders nothing when ads are disabled (the default). When enabled, it
 * reserves a bounded area to prevent layout shift and is clearly labelled.
 * Never rendered inside the tool workspace.
 */
export function AdSlot({ placement, className }: AdSlotProps) {
  if (!isPlacementActive(placement)) return null;

  const { minHeight } = adConfig.placements[placement];

  return (
    <aside
      aria-label="Advertisements"
      className={cn("mx-auto w-full max-w-3xl", className)}
      style={{
        minHeight,
        background: "var(--ad-bg)",
        border: "1px dashed var(--ad-border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <p className="p-2 text-center text-xs text-fg-subtle">Advertisements</p>
      {/* AdSense ins tag is injected here only after approval and policy review. */}
    </aside>
  );
}
