"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavMenuItem {
  href: string;
  label: string;
}

export interface NavMenu {
  /** Category hub, e.g. /pdf-tools. */
  path: string;
  title: string;
  /** Every tool in the category. */
  items: NavMenuItem[];
}

interface MainNavProps {
  menus: NavMenu[];
  /** Plain links shown after the category menus. */
  links: NavMenuItem[];
}

/**
 * Category-led navigation with every tool one click away.
 *
 * One markup tree serves both breakpoints: below `xl` the whole thing is a
 * disclosure panel with inline accordions, above it the same buttons open
 * absolutely-positioned dropdowns. The switch is at `xl` rather than `lg`
 * because eight labels plus the logo and theme toggle wrap at 1024px, and a
 * wrapped nav bar looks broken. Panels are hidden with CSS rather than
 * conditionally rendered, so every tool link is present in the served HTML on
 * every page — the crawlable-path requirement that ruled out a scripted
 * dropdown before (IA-002) is still met.
 */
export function MainNav({ menus, links }: MainNavProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const idBase = useId();

  // Navigating away must not leave a menu hanging open behind the new page.
  // Adjusted during render rather than in an effect: React re-runs this
  // component before painting, so the menu never flashes on the new route.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpen(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!open && !mobileOpen) return;

    const close = () => {
      setOpen(null);
      setMobileOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      // Return focus to something predictable rather than the document body.
      navRef.current?.querySelector("button")?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, mobileOpen]);

  return (
    <div ref={navRef} className="flex items-center xl:flex-1 xl:justify-end">
      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls={`${idBase}-menu`}
        onClick={() => {
          setMobileOpen((wasOpen) => !wasOpen);
          setOpen(null);
        }}
        className="flex min-h-11 items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg xl:hidden"
      >
        {mobileOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
        {mobileOpen ? "Close" : "Menu"}
      </button>

      <div
        id={`${idBase}-menu`}
        className={cn(
          // Mobile: a panel that drops out of the header bar.
          "absolute inset-x-0 top-full z-50 mt-1 max-h-[75vh] overflow-y-auto",
          // Desktop: an ordinary inline nav strip.
          "xl:static xl:mt-0 xl:max-h-none xl:overflow-visible",
          mobileOpen ? "block" : "hidden xl:block",
        )}
      >
        <ul className="nav-shell flex flex-col gap-0.5 xl:flex-row xl:items-center">
          {menus.map((menu) => {
            const panelId = `${idBase}-${menu.path.replace(/\W/g, "")}`;
            const isOpen = open === menu.path;
            return (
              <li key={menu.path} className="xl:relative">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : menu.path)}
                  onPointerEnter={(event) => {
                    // Menubar behaviour: once one menu is open, moving the
                    // mouse across the row switches between them. Hover does
                    // NOT open the first one — that would fight the click
                    // handler, which would then read as "click does nothing".
                    if (event.pointerType === "mouse" && open !== null) {
                      setOpen(menu.path);
                    }
                  }}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent-soft hover:text-fg",
                    "xl:w-auto xl:min-h-10 xl:rounded-full xl:px-2.5",
                    isOpen ? "bg-accent-soft text-fg" : "text-fg-muted",
                  )}
                >
                  {menu.title}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={panelId}
                  className={cn(
                    "pb-1 pl-2 xl:absolute xl:left-0 xl:top-full xl:z-50 xl:w-max xl:max-w-[min(34rem,90vw)] xl:pb-0 xl:pl-0 xl:pt-2",
                    isOpen ? "block" : "hidden",
                  )}
                >
                  <div className="nav-panel">
                    <ul
                      className={cn(
                        "flex flex-col",
                        menu.items.length > 6 && "xl:grid xl:grid-cols-2 xl:gap-x-2",
                      )}
                    >
                      {menu.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            // 44px on touch; the desktop dropdown can be denser.
                            className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg xl:min-h-10"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={menu.path}
                      className="mt-1 flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft xl:min-h-10"
                    >
                      Browse {menu.title} ({menu.items.length})
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}

          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-11 items-center whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg xl:min-h-10 xl:rounded-full xl:px-2.5"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
