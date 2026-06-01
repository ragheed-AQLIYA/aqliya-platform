import type { SalesAccount, SalesICPHypothesis, SalesOpportunity } from "../types";

const TARGET_INDUSTRIES = [
  "Financial Services",
  "Technology",
  "Data Analytics",
];

export function buildICPHypothesis(input: {
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
}): SalesICPHypothesis {
  const { accounts, opportunities } = input;

  const industryWins = new Map<string, { count: number; value: number }>();
  for (const account of accounts) {
    const industry = account.industry ?? "Unknown";
    const opps = opportunities.filter((o) => o.accountId === account.id);
    const value = opps.reduce((s, o) => s + (o.valueEstimate ?? 0), 0);
    const existing = industryWins.get(industry) ?? { count: 0, value: 0 };
    industryWins.set(industry, {
      count: existing.count + (opps.length > 0 ? 1 : 0),
      value: existing.value + value,
    });
  }

  const topIndustry = [...industryWins.entries()].sort(
    (a, b) => b[1].value - a[1].value,
  )[0];

  const fitDistribution = [
    { label: "strong", labelAr: "ملاءمة قوية", min: 75 },
    { label: "moderate", labelAr: "ملاءمة متوسطة", min: 55 },
    { label: "weak", labelAr: "ملاءمة ضعيفة", min: 1 },
    { label: "unknown", labelAr: "غير محدد", min: 0 },
  ].map((bucket) => {
    let count = 0;
    for (const account of accounts) {
      const opps = opportunities.filter((o) => o.accountId === account.id);
      const avg =
        opps.length === 0
          ? 0
          : opps.reduce((s, o) => s + (o.qualificationScore ?? 40), 0) /
            opps.length;
      if (bucket.label === "strong" && avg >= 75) count++;
      else if (bucket.label === "moderate" && avg >= 55 && avg < 75) count++;
      else if (bucket.label === "weak" && avg >= 1 && avg < 55) count++;
      else if (bucket.label === "unknown" && avg === 0) count++;
    }
    const total = accounts.length || 1;
    return {
      label: bucket.label,
      labelAr: bucket.labelAr,
      count,
      pct: Math.round((count / total) * 100),
    };
  });

  const evidenceAr: string[] = [];
  if (topIndustry) {
    evidenceAr.push(
      `أعلى قيمة مسار في قطاع ${topIndustry[0]} (${topIndustry[1].value.toLocaleString("ar-SA")} ر.س)`,
    );
  }
  const qualified = accounts.filter((a) =>
    ["qualified", "active"].includes(a.status),
  ).length;
  evidenceAr.push(`${qualified} من ${accounts.length} حسابات مؤهلة/نشطة`);
  const avgQual =
    opportunities.length === 0
      ? 0
      : Math.round(
          opportunities.reduce((s, o) => s + (o.qualificationScore ?? 40), 0) /
            opportunities.length,
        );
  evidenceAr.push(`متوسط درجة التأهيل: ${avgQual}%`);

  const matchingTarget = accounts.filter((a) =>
    TARGET_INDUSTRIES.includes(a.industry ?? ""),
  ).length;
  const confidence = Math.min(
    0.85,
    0.4 + matchingTarget / Math.max(accounts.length, 1) * 0.3 + avgQual / 200,
  );

  return {
    hypothesisAr:
      "العملاء المثاليون: مؤسسات متوسطة-كبيرة في الخدمات المالية والتقنية تبحث عن حوكمة الإيرادات والامتثال — دورة بيع 60–120 يوم.",
    hypothesisEn:
      "Ideal customers: mid-to-large financial services and technology firms seeking governed revenue intelligence — 60–120 day sales cycle.",
    evidenceAr,
    confidence: Math.round(confidence * 100) / 100,
    recommendedAdjustmentsAr: [
      "توسيع التأهيل لقطاع Data Analytics — بيانات أولية إيجابية",
      "تقليل جهود outbound على حسابات prospect بدون تفاعل",
      "إضافة معيار ICP: وجود متطلبات حوكمة/امتثال مؤكدة",
    ],
    disclaimerAr:
      "فرضية ICP — ليست حقيقة نهائية. تتطلب تحققاً ميدانياً ومزامنة مع فريق GTM.",
    fitDistribution,
  };
}
