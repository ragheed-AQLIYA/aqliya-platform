import type { Metadata } from "next";
import { SecurityDepthPage } from "@/components/marketing/v2/security-depth-page";
import {
  aiGovernanceRulesAr,
  securityControlsAr,
  securityPdfLinksAr,
  securityPillarsAr,
} from "@/lib/marketing/security-page-content";

export const metadata: Metadata = {
  title: "الأمن المؤسسي | AQLIYA",
  description:
    "RBAC، سجل تدقيقي، تتبع الأدلة، عزل المستأجرين، وموافقة بشرية — حوكمة مدمجة في البنية.",
};

export default function SecurityPage() {
  return (
    <SecurityDepthPage
      locale="ar"
      pillars={securityPillarsAr}
      controls={securityControlsAr}
      aiRules={aiGovernanceRulesAr}
      pdfLinks={securityPdfLinksAr}
    />
  );
}
