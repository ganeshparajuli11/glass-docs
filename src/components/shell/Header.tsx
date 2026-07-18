import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { BrandMark } from "./BrandMark";
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
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-contrast">
            <BrandMark className="h-4.5 w-4.5" />
          </span>
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
