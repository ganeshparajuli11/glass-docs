import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-3 pt-20 text-center sm:px-6">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-fg-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/tools"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
      >
        Browse all tools
      </Link>
    </div>
  );
}
