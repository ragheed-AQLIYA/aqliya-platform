export const SALESOS_PRODUCT_ID = "salesos" as const;

export const SALESOS_PRODUCT = {
  id: SALESOS_PRODUCT_ID,
  name: "SalesOS",
  workspaceRoutes: [
    "/sales",
    "/sales/deals",
    "/sales/accounts",
    "/sales/pipeline",
  ],
  permissions: [
    "salesos:read",
    "salesos:create",
    "salesos:update",
  ] as const,
  maturity: "L4" as const,
  persistence: "prisma" as const,
};

export function isSalesOSRoute(pathname: string): boolean {
  return pathname === "/sales" || pathname.startsWith("/sales/");
}
