import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { MainNav, type NavMenu } from "./MainNav";
import { site } from "@/config/site";
import { categoryPages } from "@/lib/seo/categories";
import { toolsInCategory } from "@/lib/tools/registry";

/**
 * The navigation is category-led: a visitor arrives wanting to do something to
 * a PDF or an image, not wanting to browse "Tools". Each category opens onto
 * every tool it contains, which is also the site's main internal-linking
 * surface — every tool link in the HTML of every page.
 *
 * Built here in the server component so the tool registry stays out of the
 * client bundle; MainNav only receives labels and hrefs.
 */
const menus: NavMenu[] = categoryPages.map((category) => ({
  path: category.path,
  title: category.title,
  items: toolsInCategory(category.category).map((tool) => ({
    href: `/tools/${tool.slug}`,
    label: tool.name,
  })),
}));

const links = [
  { href: "/tools", label: "All tools" },
  { href: "/learn", label: "Guides" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="header-glass relative mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:px-6 sm:py-2.5">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-fg sm:text-lg"
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

        <nav aria-label="Main navigation" className="min-w-0 flex-1">
          <MainNav menus={menus} links={links} />
        </nav>

        {/*
          The menus need JavaScript to open. Without it, this row keeps every
          hub one plain link away, which is what the category strip used to do
          before the menus replaced it (IA-002).
        */}
        <noscript>
          <ul className="flex flex-wrap items-center gap-1">
            {[...menus.map((m) => ({ href: m.path, label: m.title })), ...links].map(
              (item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-9 items-center whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-medium text-fg-subtle hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </noscript>

        <ThemeToggle />
      </div>
    </header>
  );
}
