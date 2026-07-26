export const site = {
  /** Brand: matches the registered domain glasstools.net. */
  name: "GlassTools",
  /**
   * Disambiguating name. "GlassTools" collides with physical glazing
   * equipment in search results (audit finding BRAND-001), so structured
   * data and directory listings should carry the longer form.
   */
  alternateName: "GlassTools — Private PDF & Image Tools",
  tagline: "Everyday PDF tools, beautifully simple and private by default.",
  description:
    "Free PDF tools that run locally in your browser. Merge, split, rotate, watermark, convert images and more — files are not uploaded by default.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://glasstools.net",
  /** The individual responsible for the site. A named person, not a team. */
  operator: {
    name: "Ganesh Parajuli",
    repository: "https://github.com/ganeshparajuli11/glass-docs",
  },
  contact: {
    /** Forwards to a monitored mailbox via Cloudflare Email Routing. */
    email: "glasstools@zohomail.com",
  },
  /** Date the current public legal and trust pages took effect. */
  effectiveDate: "2026-07-26",
} as const;
