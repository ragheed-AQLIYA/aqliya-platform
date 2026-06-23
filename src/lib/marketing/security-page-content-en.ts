import type { SecurityControlRow, SecurityPillar } from "./security-page-content";

export const securityPillarsEn: SecurityPillar[] = [
  {
    id: "rbac",
    title: "Role-Based Access Control",
    body: "Permissions by role and organization — no lateral access across departments or tenants.",
  },
  {
    id: "audit",
    title: "Immutable audit trail",
    body: "Every request, decision, and export logged with user identity — not deletable.",
  },
  {
    id: "evidence",
    title: "Evidence traceability",
    body: "Every output linked to source. No recommendation or figure without reviewable evidence.",
  },
  {
    id: "isolation",
    title: "Tenant isolation",
    body: "Data, permissions, and audit boundaries enforced per organization.",
  },
  {
    id: "human",
    title: "Human approval gates",
    body: "AI assists — humans decide. Exports and critical actions require explicit authorization.",
  },
  {
    id: "data",
    title: "Data ownership",
    body: "TLS in transit, encryption at rest, documented deletion rights. No customer data for external model training.",
  },
];

export const securityControlsEn: SecurityControlRow[] = [
  { area: "Authentication", control: "NextAuth v5 · protected sessions · SSO (SAML/OIDC) available" },
  { area: "Isolation", control: "organizationId on governed paths · RBAC in middleware" },
  { area: "Audit", control: "AuditEvent on state changes · export for compliance" },
  { area: "Files", control: "Upload scanning · permissioned downloads · checksum when available" },
  { area: "SOC2 / ISO", control: "Roadmap — no certification claim until earned" },
  { area: "Residency", control: "Saudi/GCC cloud by default — see /en/deployment" },
];

export const aiGovernanceRulesEn = [
  "No final decision without a human",
  "No export without authorization",
  "No recommendation without evidence",
  "No access without identity",
];

export const securityPdfLinksEn = [
  { label: "Security summary (PDF)", href: "/print/security-summary" },
  { label: "Data residency (PDF)", href: "/print/data-residency" },
  { label: "DPA summary (PDF)", href: "/print/dpa-summary" },
  { label: "Subprocessors (PDF)", href: "/print/subprocessors" },
];
