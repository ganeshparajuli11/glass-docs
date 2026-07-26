import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

const email = site.contact.email;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to report a broken tool, an accessibility barrier, a privacy question or a security issue with GlassTools.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-10 sm:px-6">
      <article className="solid-reading reading-col mx-auto p-6 sm:p-10">
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="mt-2 text-sm text-fg-subtle">
          {site.name} is run by {site.operator.name}. Every message below
          reaches the same monitored mailbox.
        </p>

        <div className="article-body mt-6 space-y-4 text-fg-muted">
          <p className="text-lg">
            <a href={`mailto:${email}`} className="font-semibold">
              {email}
            </a>
          </p>
          <p>
            This is a personal project rather than a support desk, so replies
            are not instant. Messages are read and most get an answer within a
            few days.
          </p>

          <div
            className="rounded-md border p-4"
            style={{
              borderColor: "var(--ad-border, currentColor)",
              background: "var(--ad-bg, transparent)",
            }}
          >
            <p className="m-0">
              <strong>Please do not email your documents.</strong> Never attach
              the PDF, image or file that went wrong, and never send passwords.
              The tools are built so that your files never reach a server, and
              emailing one would undo exactly the thing this site is for.
              Describe the problem instead — or, if a file is genuinely needed
              to reproduce it, create a harmless substitute that fails the same
              way.
            </p>
          </div>

          <h2>Reporting a broken tool</h2>
          <p>
            A useful bug report usually contains:
          </p>
          <ul>
            <li>the tool page address, for example /tools/merge-pdf;</li>
            <li>what you expected to happen, and what happened instead;</li>
            <li>
              your browser and version, and whether you were on a phone,
              tablet or computer;
            </li>
            <li>
              the rough shape of the file — how many pages, roughly how large,
              whether it was a scan, whether it was password-protected — with
              no file attached;
            </li>
            <li>any error message shown on screen, copied as text.</li>
          </ul>
          <p>
            If you would rather report it in public and the problem is
            reproducible, open an issue on{" "}
            <a
              href={`${site.operator.repository}/issues`}
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            . The source code is public.
          </p>

          <h2>Accessibility</h2>
          <p>
            If something cannot be reached by keyboard, is unreadable with a
            screen reader, or fails at high zoom or with reduced motion, that
            is a bug and is treated as one. Say which page and which assistive
            technology you were using.
          </p>

          <h2>Privacy questions</h2>
          <p>
            Questions about what the site does with data go to the same
            address. The <Link href="/privacy">privacy page</Link> and the{" "}
            <Link href="/cookies">privacy choices page</Link> describe current
            behaviour; if you find a statement there that does not match what
            the site actually does, that is worth reporting and will be fixed.
          </p>

          <h2>Security reports</h2>
          <p>
            Email suspected vulnerabilities to the address above with{" "}
            <strong>&ldquo;security&rdquo;</strong> in the subject line, and
            include enough detail to reproduce the issue. Please give a
            reasonable amount of time for a fix before disclosing it publicly.
            There is no bug-bounty programme and no payment — this is a free
            project run by one person — but reports are taken seriously and
            credited if you would like.
          </p>
        </div>
      </article>
    </div>
  );
}
