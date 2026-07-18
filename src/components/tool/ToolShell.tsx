import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

/** Tool workspace container: glass-strong, the hero of the page. */
export function ToolShell({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Tool workspace"
      className="glass-strong mx-auto mt-6 w-full max-w-[1100px] p-5 sm:p-8"
    >
      {children}
    </section>
  );
}

export function LocalBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-success"
      style={{ background: "var(--success-soft)" }}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      Local — files stay on your device
    </span>
  );
}
