import Link from "next/link";
import { site } from "@/config/site";
import { categoryPages } from "@/lib/seo/categories";

/**
 * Footer link groups.
 *
 * Grouped by the job a visitor is doing rather than by our internal
 * categories, and kept deliberately short. A footer stuffed with every tool
 * would dilute the links that matter and read as keyword padding — the point
 * is a few useful paths into each hub, not a sitemap (audit finding IA-002).
 */
const groups = [
  {
    title: "PDF tasks",
    links: [
      { href: "/tools/merge-pdf", label: "Merge PDF" },
      { href: "/tools/split-pdf", label: "Split PDF" },
      { href: "/tools/delete-pages", label: "Remove pages" },
      { href: "/tools/pdf-to-images", label: "PDF to images" },
    ],
  },
  {
    title: "Image tasks",
    links: [
      { href: "/tools/image-compressor", label: "Compress an image" },
      { href: "/tools/image-resizer", label: "Resize an image" },
      { href: "/tools/images-to-pdf", label: "Images to PDF" },
      { href: "/tools/passport-photo", label: "Passport photo sheet" },
    ],
  },
  {
    title: "Student workflows",
    links: [
      { href: "/tools/cover-page", label: "Cover page" },
      { href: "/tools/word-counter", label: "Word counter" },
      { href: "/tools/gpa-calculator", label: "GPA calculator" },
      { href: "/tools#prepare-assignment", label: "Prepare an assignment" },
    ],
  },
  {
    title: "Site",
    links: [
      { href: "/tools", label: "All tools" },
      { href: "/learn", label: "Guides" },
      { href: "/about", label: "About & how we test" },
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <p className="text-lg font-semibold">{site.name}</p>
            <p className="mt-2 max-w-md text-sm text-fg-muted">
              Everyday PDF and image tools that run on your device. Files
              marked Local are not uploaded. Built and maintained by{" "}
              {site.operator.name}.
            </p>
            <nav
              aria-label="Tool categories"
              className="mt-4 flex flex-wrap gap-2"
            >
              {categoryPages.map((category) => (
                <Link
                  key={category.path}
                  href={category.path}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-fg"
                  style={{ borderColor: "var(--glass-soft-border)" }}
                >
                  {category.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
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

        <p
          className="mt-8 border-t pt-4 text-xs text-fg-subtle"
          style={{ borderColor: "var(--glass-soft-border)" }}
        >
          © {new Date().getFullYear()} {site.name}. Local tools process files in
          your browser; nothing is uploaded by default.
        </p>
      </div>
    </footer>
  );
}
