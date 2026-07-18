export const site = {
  /** Brand: matches the registered domain glasstools.net. */
  name: "GlassTools",
  tagline: "Everyday PDF tools, beautifully simple and private by default.",
  description:
    "Free PDF tools that run locally in your browser. Merge, split, rotate, watermark, convert images and more — files are not uploaded by default.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://glasstools.net",
} as const;
