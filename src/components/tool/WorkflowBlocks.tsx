import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTool } from "@/lib/tools/registry";
import type { Workflow } from "@/lib/seo/workflows";

/**
 * Renders task-shaped tool sequences. Server-rendered, so every link is in
 * the initial HTML and forms part of the crawlable internal link graph.
 */
export function WorkflowBlocks({
  items,
  heading = "Start from the task",
  intro,
}: {
  items: Workflow[];
  heading?: string;
  intro?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="workflows-heading" className="mt-14">
      <h2 id="workflows-heading" className="text-2xl font-bold">
        {heading}
      </h2>
      {intro ? (
        <p className="mt-2 max-w-2xl text-fg-muted">{intro}</p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((workflow) => (
          <div key={workflow.id} id={workflow.id} className="glass-soft p-5">
            <h3 className="font-semibold">{workflow.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">
              {workflow.description}
            </p>
            <ol className="mt-3 space-y-1.5">
              {workflow.steps.map((step, index) => {
                const tool = getTool(step.slug);
                if (!tool) return null;
                return (
                  <li key={step.slug} className="flex items-center gap-2 text-sm">
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent"
                    >
                      {index + 1}
                    </span>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                    >
                      {step.label}
                    </Link>
                    {index < workflow.steps.length - 1 ? (
                      <ArrowRight
                        className="h-3 w-3 shrink-0 text-fg-subtle"
                        aria-hidden="true"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
