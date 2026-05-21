import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/audit/",
          "/decisions/",
          "/login/",
          "/access-denied/",
          "/organizations/",
          "/intelligence/",
          "/settings/",
          "/sales/",
        ],
      },
    ],
    sitemap: "https://aqliya.com/sitemap.xml",
  };
}
