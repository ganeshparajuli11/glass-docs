import type { NextConfig } from "next";

/**
 * DEPLOY_TARGET=static produces a fully static site in `out/` for
 * Cloudflare Pages or any static host. Cloudflare Pages also exposes
 * CF_PAGES during builds, so we opt into static export automatically there.
 * Default is the normal Next server build (used for local `next start`).
 */
const isStatic =
  process.env.DEPLOY_TARGET === "static" || process.env.CF_PAGES === "1";

const nextConfig: NextConfig = {
  ...(isStatic ? { output: "export" as const } : {}),
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
