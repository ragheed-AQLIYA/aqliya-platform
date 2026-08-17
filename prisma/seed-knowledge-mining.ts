import type { PrismaClient, AuditCanonicalAccount, Organization } from "@prisma/client";

export async function seedKnowledgeMining(
  prisma: PrismaClient,
  platformOrgId: string,
) {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED_IN_PROD) {
    throw new Error("Seeding in production is not allowed. Set ALLOW_SEED_IN_PROD to override.");
  }

  // Find canonical accounts for reference
  const canonicalAccounts = await prisma.auditCanonicalAccount.findMany({
    select: { id: true, code: true, name: true, category: true },
  });
  const accountByCode = new Map(canonicalAccounts.map((a) => [a.code, a]));

  // Seed KnowledgeCandidates if none exist
  const existing = await prisma.knowledgeCandidate.count();
  if (existing > 0) {
    console.log(`KnowledgeMining: ${existing} candidates already exist, skipping seed`);
    return;
  }

  // Create 5 sample candidates representing patterns from real firm memory
  const candidatesData = [
    {
      candidatePhrase: "مصروف ايجار معدات",
      canonicalCode: "CA-5020",
      category: "expense",
      supportCount: 4,
      organizationCount: 3,
      confidence: 0.82,
      status: "CANDIDATE" as const,
      source: "pattern_mining",
    },
    {
      candidatePhrase: "استهلاك حق استخدام",
      canonicalCode: "CA-5050",
      category: "expense",
      supportCount: 3,
      organizationCount: 2,
      confidence: 0.79,
      status: "CANDIDATE" as const,
      source: "pattern_mining",
    },
    {
      candidatePhrase: "فوائد التزام عقد إيجار",
      canonicalCode: "CA-2050",
      category: "expense",
      supportCount: 5,
      organizationCount: 4,
      confidence: 0.91,
      status: "APPROVED" as const,
      source: "pattern_mining",
    },
    {
      candidatePhrase: "مخصص مكافأة نهاية خدمة",
      canonicalCode: "CA-2020",
      category: "liability",
      supportCount: 6,
      organizationCount: 5,
      confidence: 0.94,
      status: "APPROVED" as const,
      source: "pattern_mining",
    },
    {
      candidatePhrase: "عمولة بنك",
      canonicalCode: "CA-5060",
      category: "expense",
      supportCount: 2,
      organizationCount: 1,
      confidence: 0.65,
      status: "CANDIDATE" as const,
      source: "pattern_mining",
    },
  ];

  for (const data of candidatesData) {
    const canonical = accountByCode.get(data.canonicalCode);
    if (!canonical) {
      console.warn(`Skipping candidate ${data.candidatePhrase}: no canonical account for ${data.canonicalCode}`);
      continue;
    }

    await prisma.knowledgeCandidate.create({
      data: {
        organizationId: null,
        candidatePhrase: data.candidatePhrase,
        canonicalAccountId: canonical.id,
        canonicalCode: data.canonicalCode,
        category: data.category,
        supportCount: data.supportCount,
        organizationCount: data.organizationCount,
        confidence: data.confidence,
        status: data.status,
        source: data.source,
      },
    });
  }

  console.log(`KnowledgeMining: seeded ${candidatesData.length} candidates`);
}
