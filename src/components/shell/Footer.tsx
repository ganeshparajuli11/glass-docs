import Link from "next/link";
import { site } from "@/config/site";

const groups = [
  {
    title: "Popular tools",
    links: [
      { href: "/tools/merge-pdf", label: "Merge PDF" },
      { href: "/tools/split-pdf", label: "Split PDF" },
      { href: "/tools/images-to-pdf", label: "Images to PDF" },
      { href: "/tools/pdf-to-images", label: "PDF to images" },
    ],
  },
  {
    title: "Site",
    links: [
      { href: "/tools", label: "All tools" },
      { href: "/learn", label: "Guides" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Privacy choices" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 px-3 pb-6 sm:px-6">
      <div className="glass-soft mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold">{site.name}</p>
            <p className="mt-2 max-w-xs text-sm text-fg-muted">
              Everyday PDF tools that run on your device. Files marked Local
              are not uploaded.
            </p>
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-sm font-semibold">{group.title}</p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-8 border-t pt-4 text-xs text-fg-subtle" style={{ borderColor: "var(--glass-soft-border)" }}>
          © {new Date().getFullYear()} {site.name}. Local tools process files in
          your browser; nothing is uploaded by default.
        </p>
      </div>
    </footer>
  );
}
