import type {
  SalesAIBriefDraft,
  SalesAccount,
  SalesContact,
  SalesInteractionLog,
  SalesOpportunity,
} from "../types";
import type { SalesEvidenceRef } from "../store";
import { buildAccountIntelligence } from "../vnext/account-intelligence";
import { buildOpportunityIntelligence } from "../vnext/opportunity-intelligence";

const COMPETITOR_BY_INDUSTRY: Record<string, string[]> = {
  Technology: ["Salesforce", "HubSpot"],
  "Financial Services": ["Microsoft Dynamics", "SAP CRM"],
  "Data Analytics": ["Pipedrive", "Zoho CRM"],
};

export function buildAccountProfileEnrichment(input: {
  account: SalesAccount;
  contacts: SalesContact[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  evidence: SalesEvidenceRef[];
}): {
  meetings: SalesInteractionLog[];
  signals: ReturnType<typeof buildAccountIntelligence>["signals"];
  objections: Array<{ id: string; labelAr: string; severity: string }>;
  competitors: string[];
  proofAssets: SalesEvidenceRef[];
  aiBriefDraft: SalesAIBriefDraft;
} {
  const { account, contacts, opportunities, interactions, evidence } = input;

  const meetings = interactions.filter(
    (i) => i.type === "meeting" || i.type === "call",
  );

  const intel = buildAccountIntelligence({
    account,
    opportunities,
    interactionCount: interactions.length,
    daysSinceLastInteraction:
      interactions.length > 0
        ? Math.floor(
            (Date.now() - new Date(interactions[0].loggedAt).getTime()) /
              86400000,
          )
        : undefined,
  });

  const objections: Array<{ id: string; labelAr: string; severity: string }> =
    [];
  for (const opp of opportunities) {
    const oppIntel = buildOpportunityIntelligence({
      opportunity: opp,
      evidenceCount: evidence.filter((e) => e.opportunityId === opp.id).length,
      interactionCount: interactions.filter((i) => i.opportunityId === opp.id)
        .length,
      hasApprovedClaims: opp.approvalStatus === "Approved",
    });
    for (const gap of oppIntel.qualificationGap) {
      objections.push({
        id: `obj-${opp.id}-${gap.slice(0, 8)}`,
        labelAr: gap,
        severity: gap.includes("High-value") ? "high" : "medium",
      });
    }
  }

  const competitors =
    COMPETITOR_BY_INDUSTRY[account.industry ?? ""] ?? ["منافس عام — CRM"];

  const proofAssets = evidence;

  const primaryContact = contacts[0]?.name ?? "—";
  const topOpp = opportunities.sort(
    (a, b) => (b.valueEstimate ?? 0) - (a.valueEstimate ?? 0),
  )[0];

  const aiBriefDraft: SalesAIBriefDraft = {
    status: "DRAFT",
    generatedAt: new Date().toISOString(),
    summaryAr: `مسودة ذكاء تجاري لـ ${account.nameAr ?? account.name} — صحة ${intel.healthScore}%، ${opportunities.length} فرص، ${interactions.length} تفاعلات.`,
    sections: [
      {
        titleAr: "نظرة عامة",
        bodyAr: `الحساب في حالة ${account.status}${account.industry ? ` — قطاع ${account.industry}` : ""}. جهة الاتصال الرئيسية: ${primaryContact}.`,
      },
      {
        titleAr: "الفرصة الأبرز",
        bodyAr: topOpp
          ? `${topOpp.name} — ${topOpp.stage} — ${(topOpp.valueEstimate ?? 0).toLocaleString("ar-SA")} ر.س`
          : "لا توجد فرص نشطة — يُوصى بالتأهيل.",
      },
      {
        titleAr: "المخاطر والاعتراضات",
        bodyAr:
          objections.length > 0
            ? objections.map((o) => o.labelAr).join("؛ ")
            : "لا اعتراضات مسجّلة — متابعة الاكتشاف.",
      },
      {
        titleAr: "الخطوات التالية",
        bodyAr: intel.nextActions.join("؛ ") || "جدولة متابعة.",
      },
    ],
    disclaimerAr:
      "⚠️ DRAFT — مسودة ذكاء اصطناعي. لا تُستخدم كعرض أو قرار تجاري نهائي. مراجعة بشرية مطلوبة.",
  };

  return {
    meetings,
    signals: intel.signals,
    objections,
    competitors,
    proofAssets,
    aiBriefDraft,
  };
}
