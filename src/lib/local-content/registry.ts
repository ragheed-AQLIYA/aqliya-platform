export const LOCALCONTENTOS_PRODUCT_ID = "localcontentos" as const;

export const LOCALCONTENTOS_PRODUCT = {
  id: LOCALCONTENTOS_PRODUCT_ID,
  name: "LocalContentOS",
  workspaceRoutes: [
    "/local-content",
    "/local-content/projects",
    "/local-content/campaigns",
    "/local-content/review",
    "/local-content/outputs",
  ],
  permissions: [
    "localcontentos:read",
    "localcontentos:create",
    "localcontentos:update",
    "localcontentos:review",
    "localcontentos:approve",
    "localcontentos:export",
  ],
  maturity: "L4" as const,
  persistence: "hybrid" as const,
};

export function isLocalContentOSRoute(pathname: string): boolean {
  return pathname === "/local-content" || pathname.startsWith("/local-content/");
}