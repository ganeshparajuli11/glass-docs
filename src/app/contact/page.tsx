import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the GlassTools team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">Contact</h1>
        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <p>
            Found a broken tool, a confusing label, or an accessibility
            problem? We want to know.
          </p>
          <p>
            A contact email address will be published here before public
            launch. Until then, this page is a placeholder kept deliberately
            honest: we would rather show no address than one that is not
            monitored.
          </p>
        </div>
      </article>
    </div>
  );
}
