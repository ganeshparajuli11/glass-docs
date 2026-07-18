import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "@/config/site";

const nav = [
  { href: "/tools", label: "Tools" },
  { href: "/learn", label: "Learn" },
  { href: "/privacy", label: "Privacy" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="glass-soft mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <svg viewBox="0 0 64 64" className="h-8 w-8 rounded-xl" aria-hidden="true" focusable="false">
            <rect x="4" y="4" width="56" height="56" rx="16" fill="var(--accent)" />
            <rect x="18" y="14" width="24" height="32" rx="4" fill="var(--accent-contrast)" opacity="0.55" />
            <rect x="24" y="20" width="24" height="32" rx="4" fill="var(--accent-contrast)" opacity="0.95" />
            <line x1="30" y1="30" x2="42" y2="30" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="37" x2="42" y2="37" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="44" x2="38" y2="44" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {site.name}
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
