import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";

/**
 * Robots policy for the public marketing site.
 *
 * Public marketing routes (AR + /en/*) stay crawlable. Every authenticated
 * application surface and API is disallowed. Kept in sync with the private
 * route prefixes enforced by middleware (`routeMinRoles`) and the auth
 * public-paths allowlist.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = [
    "/api/",
    "/login",
    "/signup",
    "/invite/",
    "/access-denied",
    "/settings/",
    "/organizations/",
    "/operator/",
    "/monitoring/",
    "/overview/",
    "/notifications/",
    // Product / application workspaces (authenticated)
    "/audit/",
    "/decisions/",
    "/local-content/",
    "/assistant/",
    "/contacts/",
    "/content-studio/",
    "/risk/",
    "/office-ai/",
    "/sampling/",
    "/sales/",
    "/workflowos/",
    "/sunbul/",
    "/intelligence/",
    "/institutional-memory/",
    "/knowledge-foundation/",
    "/knowledge-review/",
    "/governance-hub/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
