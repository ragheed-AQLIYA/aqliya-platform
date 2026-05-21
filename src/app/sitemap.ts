import type { MetadataRoute } from "next";

const baseUrl = "https://aqliya.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "", changeFreq: "monthly" as const, priority: 1.0 },
    { path: "/about", changeFreq: "monthly" as const, priority: 0.8 },
    { path: "/products", changeFreq: "monthly" as const, priority: 0.9 },
    { path: "/products/audit", changeFreq: "monthly" as const, priority: 0.8 },
    {
      path: "/products/decision",
      changeFreq: "monthly" as const,
      priority: 0.7,
    },
    {
      path: "/products/local-content",
      changeFreq: "monthly" as const,
      priority: 0.7,
    },
    { path: "/products/sales", changeFreq: "monthly" as const, priority: 0.7 },
    {
      path: "/products/simulation",
      changeFreq: "monthly" as const,
      priority: 0.7,
    },
    { path: "/how-we-work", changeFreq: "monthly" as const, priority: 0.7 },
    { path: "/contact", changeFreq: "monthly" as const, priority: 0.6 },
    { path: "/custom-product", changeFreq: "monthly" as const, priority: 0.6 },
    { path: "/auditos", changeFreq: "monthly" as const, priority: 0.8 },
    {
      path: "/auditos/trial-balance",
      changeFreq: "monthly" as const,
      priority: 0.5,
    },
    { path: "/auditos/mapping", changeFreq: "monthly" as const, priority: 0.5 },
    {
      path: "/auditos/statements",
      changeFreq: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/auditos/evidence",
      changeFreq: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/auditos/traceability",
      changeFreq: "monthly" as const,
      priority: 0.5,
    },
  ];

  return staticPages.map(({ path, changeFreq, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority,
  }));
}
