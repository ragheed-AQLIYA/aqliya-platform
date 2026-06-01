// AQLIYA Product Registry — LocalContentOS registration

export interface ProductDefinition {
  id: string;
  name: string;
  nameAr: string;
  module: string;
  workspaceHref: string;
  marketingHref?: string;
  permissions: string[];
  maturityLevel: string;
  description: string;
}

export const PRODUCT_REGISTRY: ProductDefinition[] = [
  {
    id: "auditos",
    name: "AuditOS",
    nameAr: "نظام التدقيق المالي",
    module: "audit",
    workspaceHref: "/audit",
    marketingHref: "/products/audit",
    permissions: ["auditos:read", "auditos:create", "auditos:approve"],
    maturityLevel: "L5",
    description: "Governed financial audit workflows",
  },
  {
    id: "localcontentos",
    name: "LocalContentOS",
    nameAr: "المحتوى المحلي",
    module: "localContent",
    workspaceHref: "/local-content",
    marketingHref: "/products/local-content",
    permissions: [
      "localcontentos:read",
      "localcontentos:create",
      "localcontentos:update",
      "localcontentos:review",
      "localcontentos:approve",
      "localcontentos:export",
    ],
    maturityLevel: "L4",
    description:
      "Local content compliance workspace + Content Studio (campaigns, sources, review, outputs)",
  },
  {
    id: "decisionos",
    name: "DecisionOS",
    nameAr: "نظام القرارات",
    module: "decision",
    workspaceHref: "/decisions",
    permissions: ["decisionos:read", "decisionos:create"],
    maturityLevel: "L4",
    description: "Governed decision intelligence",
  },
  {
    id: "workflowos",
    name: "WorkflowOS",
    nameAr: "سير العمل الذكي",
    module: "workflowos",
    workspaceHref: "/workflowos",
    permissions: ["workflowos:read"],
    maturityLevel: "L4",
    description: "Governed workflow workspace",
  },
  {
    id: "salesos",
    name: "SalesOS",
    nameAr: "ذكاء الإيرادات",
    module: "sales",
    workspaceHref: "/sales",
    marketingHref: "/products/sales",
    permissions: ["salesos:read", "salesos:create", "salesos:update"],
    maturityLevel: "L4",
    description: "Governed revenue intelligence — accounts, deals, pipeline",
  },
];

export function getProductById(id: string): ProductDefinition | undefined {
  return PRODUCT_REGISTRY.find((p) => p.id === id);
}

export function isRegisteredProduct(id: string): boolean {
  return PRODUCT_REGISTRY.some((p) => p.id === id);
}
