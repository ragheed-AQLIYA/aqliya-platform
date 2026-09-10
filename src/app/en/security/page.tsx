import type { Metadata } from "next";
import { SecurityDepthPage } from "@/components/marketing/v2/security-depth-page";
import {
  aiGovernanceRulesEn,
  securityControlsEn,
  securityPdfLinksEn,
  securityPillarsEn,
} from "@/lib/marketing/security-page-content-en";
import { buildAlternates } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: "Enterprise Security | AQLIYA",
  description:
    "RBAC, immutable audit trail, evidence traceability, tenant isolation, and mandatory human-in-the-loop.",
  alternates: buildAlternates("/en/security"),
};

export default function EnglishSecurityPage() {
  return (
    <SecurityDepthPage
      locale="en"
      pillars={securityPillarsEn}
      controls={securityControlsEn}
      aiRules={aiGovernanceRulesEn}
      pdfLinks={securityPdfLinksEn}
    />
  );
}
