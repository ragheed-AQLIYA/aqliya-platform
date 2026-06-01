// ─── v1.0 Product Registry ───
// Runtime registry for AuditOS, LocalContentOS, and SalesOS.
// Trust: AI assists. Humans decide. Evidence governs.

import type {
  CoreServiceId,
  ProductContract,
  V1ProductKey,
} from "./product-contracts";
import { isV1ProductKey } from "./product-contracts";

const AUDIT_CORE: ProductContract["coreServices"] = [
  { service: "access", required: true, adopted: true },
  { service: "audit", required: true, adopted: true },
  { service: "evidence", required: true, adopted: true },
  { service: "workflow", required: true, adopted: true },
  { service: "export", required: true, adopted: true },
  { service: "governedAI", required: true, adopted: false },
  { service: "traceability", required: true, adopted: false },
  { service: "files", required: true, adopted: true },
];

const LC_CORE: ProductContract["coreServices"] = [
  { service: "access", required: true, adopted: true },
  { service: "audit", required: true, adopted: true },
  { service: "evidence", required: true, adopted: true },
  { service: "workflow", required: true, adopted: true },
  { service: "export", required: true, adopted: true },
  { service: "governedAI", required: false, adopted: false },
  { service: "traceability", required: true, adopted: false },
  { service: "files", required: true, adopted: true },
];

const SALES_CORE: ProductContract["coreServices"] = [
  { service: "access", required: true, adopted: false },
  { service: "audit", required: true, adopted: false },
  { service: "evidence", required: true, adopted: false },
  { service: "workflow", required: true, adopted: false },
  { service: "export", required: true, adopted: false },
  { service: "governedAI", required: false, adopted: false },
  { service: "traceability", required: false, adopted: false },
  { service: "files", required: true, adopted: false },
];

export const V1_PRODUCT_REGISTRY: readonly ProductContract[] = [
  {
    slug: "audit",
    name: "AuditOS",
    nameAr: "نظام التدقيق المحكوم",
    routePrefix: "/audit",
    marketingRoute: "/products/audit",
    maturity: "L5_pilot_ready",
    v1Target: "L5_pilot_ready",
    workflowTemplateId: "audit-engagement-lifecycle",
    evidenceTypes: [
      "trial_balance",
      "working_paper",
      "supporting_doc",
      "correspondence",
    ],
    exportTypes: [
      "financial_statements_pdf",
      "findings_report",
      "audit_trail_export",
    ],
    aiTaskTypes: [
      "notes_generation",
      "evidence_review",
      "statement_drafting",
      "audit_findings",
    ],
    tenantKey: "auditOrganizationId",
    coreServices: AUDIT_CORE,
    readinessBlockers: [
      "External pilot session not executed",
      "Partial executeGovernedAI adoption",
    ],
  },
  {
    slug: "local_content",
    name: "LocalContentOS",
    nameAr: "نظام المحتوى المحلي",
    routePrefix: "/local-content",
    marketingRoute: "/products/local-content",
    maturity: "L5_pilot_ready_with_conditions",
    v1Target: "L5_pilot_ready",
    workflowTemplateId: "localcontent-project-lifecycle",
    evidenceTypes: [
      "supplier_certificate",
      "contract",
      "attestation",
      "spend_invoice",
    ],
    exportTypes: [
      "lc_score_pdf",
      "lc_gap_report_xlsx",
      "compliance_summary_pdf",
    ],
    aiTaskTypes: [],
    tenantKey: "organizationId",
    coreServices: LC_CORE,
    readinessBlockers: [
      "Human smoke checklist pending on seed project",
      "Arabic PDF font rendering quality gap",
    ],
  },
  {
    slug: "sales",
    name: "SalesOS",
    nameAr: "نظام المبيعات المحكوم",
    routePrefix: "/sales",
    marketingRoute: "/products/sales",
    maturity: "L3_prototype",
    v1Target: "L4_usable",
    workflowTemplateId: "sales-opportunity-lifecycle",
    evidenceTypes: ["proposal", "interaction_log", "qualification_note"],
    exportTypes: ["account_brief_pdf"],
    aiTaskTypes: ["commercial_claim_review"],
    tenantKey: "organizationId",
    coreServices: SALES_CORE,
    readinessBlockers: [
      "No Prisma models or server actions",
      "Mock-only UI at /sales",
    ],
  },
] as const;

export function getV1Product(slug: V1ProductKey): ProductContract {
  const product = V1_PRODUCT_REGISTRY.find((p) => p.slug === slug);
  if (!product) {
    throw new Error(`Unknown v1 product: ${slug}`);
  }
  return product;
}

export function listV1Products(): readonly ProductContract[] {
  return V1_PRODUCT_REGISTRY;
}

export function isV1Product(slug: string): slug is V1ProductKey {
  return isV1ProductKey(slug);
}

export function getProductsByCoreService(
  service: CoreServiceId,
): ProductContract[] {
  return V1_PRODUCT_REGISTRY.filter((p) =>
    p.coreServices.some((b) => b.service === service),
  );
}

export function getV1ProductByRoutePrefix(
  pathname: string,
): ProductContract | undefined {
  return V1_PRODUCT_REGISTRY.find(
    (p) =>
      pathname === p.routePrefix || pathname.startsWith(`${p.routePrefix}/`),
  );
}

/** Alias for command-center and legacy callers expecting `productId`. */
export function getProductRegistryEntry(slug: V1ProductKey) {
  const product = getV1Product(slug);
  return { ...product, productId: product.slug };
}
