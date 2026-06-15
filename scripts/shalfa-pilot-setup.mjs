/**
 * Shalfa Facilities pilot rollout — engagement shell, TB ingest, FS rebuild, validation.
 *
 * Prerequisites:
 *   npm run seed:audit          (org-aqliya + platform users)
 *   npx prisma migrate deploy   (presentation policy migrations)
 *
 * Usage:
 *   node -r ./scripts/mock-server-only.cjs --import tsx scripts/shalfa-pilot-setup.mjs
 *   node -r ./scripts/mock-server-only.cjs --import tsx scripts/shalfa-pilot-setup.mjs --skip-tb
 *
 * Env:
 *   TB_FILE — path to TB 31-12-2025 Final.xlsx (default: Downloads path)
 *   DATABASE_URL
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

process.env.FF_AUDIT_FS_V2 = "true";

import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ENGAGEMENT_ID = "eng-shalfa-2025";
const CLIENT_ID = "client-shalfa";
const PROJECT_ID = "proj-shalfa-2025-audit";
const WORKSPACE_ID = "cws-shalfa-facilities";
const ORG_ID = "org-aqliya";
const skipTb = process.argv.includes("--skip-tb");
const tbFile =
  process.env.TB_FILE ??
  "c:/Users/PC/Downloads/TB 31-12-2025 Final.xlsx";

const {
  GENERIC_PRESENTATION_POLICY_V1,
  SHALFA_PILOT_PRESENTATION_POLICY_V1,
} = await import("../src/lib/audit/presentation/presentation-policy-types.ts");

const { prisma } = await import("../src/lib/prisma.ts");
const { uploadTrialBalance, confirmAllSuggestedMappings } = await import(
  "../src/lib/audit/services.ts"
);
const { rebuildFinancialStatementsAfterProfileChange } = await import(
  "../src/lib/audit/presentation/presentation-profile-rebuild.ts"
);
const { CANONICAL_COA_ACCOUNTS } = await import(
  "../src/lib/audit/coa/canonical-coa.ts"
);

async function ensureCanonicalCoa() {
  for (const row of CANONICAL_COA_ACCOUNTS) {
    await prisma.auditCanonicalAccount.upsert({
      where: { code: row.code },
      create: {
        id: row.id,
        code: row.code,
        name: row.name,
        category: row.category,
        subcategory: row.subcategory ?? null,
        statementType: row.statementType,
        displayOrder: row.displayOrder,
      },
      update: {
        name: row.name,
        category: row.category,
        subcategory: row.subcategory ?? null,
        statementType: row.statementType,
        displayOrder: row.displayOrder,
      },
    });
  }
}

async function ensurePresentationPolicies() {
  const policies = [
    {
      id: "pol-generic-v1",
      slug: GENERIC_PRESENTATION_POLICY_V1.slug,
      name: GENERIC_PRESENTATION_POLICY_V1.name,
      version: GENERIC_PRESENTATION_POLICY_V1.version,
      rules: GENERIC_PRESENTATION_POLICY_V1,
    },
    {
      id: "pol-shalfa-pilot-audited-v1",
      slug: SHALFA_PILOT_PRESENTATION_POLICY_V1.slug,
      name: SHALFA_PILOT_PRESENTATION_POLICY_V1.name,
      version: SHALFA_PILOT_PRESENTATION_POLICY_V1.version,
      rules: SHALFA_PILOT_PRESENTATION_POLICY_V1,
    },
  ];

  for (const policy of policies) {
    await prisma.auditPresentationPolicy.upsert({
      where: { id: policy.id },
      create: {
        id: policy.id,
        slug: policy.slug,
        name: policy.name,
        version: policy.version,
        rules: policy.rules,
        isSystem: true,
      },
      update: {
        slug: policy.slug,
        name: policy.name,
        version: policy.version,
        rules: policy.rules,
        isSystem: true,
      },
    });
  }
}

async function ensureShalfaEngagement() {
  const org = await prisma.auditOrganization.findUnique({
    where: { id: ORG_ID },
  });
  if (!org) {
    throw new Error(
      `Audit org ${ORG_ID} not found — run: npm run seed:audit`,
    );
  }

  const client = await prisma.auditClient.upsert({
    where: { id: CLIENT_ID },
    create: {
      id: CLIENT_ID,
      organizationId: ORG_ID,
      name: "Shalfa Facilities Co.",
      industry: "Facilities Management",
      currencyCode: "SAR",
      fiscalPeriodEnd: "12-31",
      status: "active",
    },
    update: {
      name: "Shalfa Facilities Co.",
      status: "active",
    },
  });

  let platformOrgId = org.platformOrganizationId;
  if (platformOrgId) {
    const workspace = await prisma.clientWorkspace.upsert({
      where: {
        platformOrganizationId_slug: {
          platformOrganizationId: platformOrgId,
          slug: "shalfa-facilities",
        },
      },
      create: {
        id: WORKSPACE_ID,
        platformOrganizationId: platformOrgId,
        name: "Shalfa Facilities Co.",
        slug: "shalfa-facilities",
        workspaceType: "client",
        status: "active",
        productAccess: { audit: true },
        metadata: { source: "shalfa-pilot-setup", auditClientId: client.id },
      },
      update: {
        name: "Shalfa Facilities Co.",
        status: "active",
      },
    });

    await prisma.auditClient.update({
      where: { id: client.id },
      data: { clientWorkspaceId: workspace.id },
    });

    await prisma.project.upsert({
      where: { id: PROJECT_ID },
      create: {
        id: PROJECT_ID,
        workspaceId: workspace.id,
        name: "Shalfa Facilities — FY2025",
        projectType: "audit_engagement",
        status: "active",
        metadata: {
          source: "shalfa-pilot-setup",
          auditEngagementId: ENGAGEMENT_ID,
          fiscalPeriod: "FY2025",
        },
      },
      update: { status: "active" },
    });
  }

  const engagement = await prisma.auditEngagement.upsert({
    where: { id: ENGAGEMENT_ID },
    create: {
      id: ENGAGEMENT_ID,
      organizationId: ORG_ID,
      clientId: client.id,
      projectId: platformOrgId ? PROJECT_ID : null,
      fiscalPeriod: "FY2025",
      engagementType: "full_audit",
      status: "in_progress",
      presentationProfile: "pilot-audited",
      presentationProfileVersion: "pilot-audited-v1",
      presentationPolicyId: "pol-shalfa-pilot-audited-v1",
      team: [
        {
          userId: "usr-khalid",
          userName: "Khalid Al Saud",
          role: "partner",
          assignedAt: new Date().toISOString(),
        },
      ],
    },
    update: {
      presentationProfile: "pilot-audited",
      presentationProfileVersion: "pilot-audited-v1",
      presentationPolicyId: "pol-shalfa-pilot-audited-v1",
      status: "in_progress",
    },
  });

  return { org, client, engagement };
}

function parseTbForUpload(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    throw new Error(`No sheets in TB workbook: ${filePath}`);
  }
  const sheet = wb.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Missing sheet ${sheetName} in ${filePath}`);
  }
  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });
  const keys = Object.keys(rows[0] ?? {});
  const codeKey = keys.find((k) => k.includes("رقم الحساب")) ?? "Account Code";
  const nameKey = keys.find((k) => k.includes("اسم الحساب")) ?? "Account Name";
  const closeDK = keys.find((k) => k.includes("الرصيد الحالي مدين"));
  const closeCK = keys.find((k) => k.includes("الرصيد الحالي دائن"));
  const netKey = keys.find(
    (k) => k.includes("صافي الرصيد الحالي") && !k.includes("افتتاحي"),
  );
  const hintKeys = keys.filter((k) => /^mapping\s*\d/i.test(k.trim()));

  return rows
    .map((r) => {
      const accountCode = String(r[codeKey] ?? "").trim();
      const accountName = String(r[nameKey] ?? "").trim();
      if (!accountCode || !accountName) return null;

      let debit = Number(String(r[closeDK] ?? "").replace(/,/g, "")) || 0;
      let credit = Number(String(r[closeCK] ?? "").replace(/,/g, "")) || 0;
      const net = Number(String(r[netKey] ?? "").replace(/,/g, "")) || 0;
      if (!debit && !credit && net) {
        if (net >= 0) debit = net;
        else credit = Math.abs(net);
      }

      const hints = hintKeys
        .map((k) => String(r[k] ?? "").trim())
        .filter(Boolean);

      return {
        accountCode,
        accountName,
        debit,
        credit,
        classificationHints: hints,
      };
    })
    .filter(Boolean);
}

async function ingestTbIfPresent() {
  if (skipTb) {
    return { skipped: true, reason: "--skip-tb" };
  }
  if (!fs.existsSync(tbFile)) {
    return { skipped: true, reason: `TB not found: ${tbFile}` };
  }

  const parsed = parseTbForUpload(tbFile);
  await prisma.auditAccountMapping.deleteMany({
    where: { engagementId: ENGAGEMENT_ID },
  });
  await prisma.auditTrialBalanceLine.deleteMany({
    where: { trialBalance: { engagementId: ENGAGEMENT_ID } },
  });
  await prisma.auditTrialBalance.deleteMany({
    where: { engagementId: ENGAGEMENT_ID },
  });

  const upload = await uploadTrialBalance(
    ENGAGEMENT_ID,
    path.basename(tbFile),
    parsed,
    "shalfa-pilot-setup",
    "Shalfa Pilot Setup",
  );

  const { confirmedCount } = await confirmAllSuggestedMappings(ENGAGEMENT_ID);

  return {
    skipped: false,
    tbLines: upload.trialBalance.lines.length,
    confirmedMappings: confirmedCount,
    tbFile,
  };
}

async function validateReadiness() {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: ENGAGEMENT_ID },
    select: {
      presentationProfile: true,
      presentationPolicyId: true,
      presentationPolicy: { select: { slug: true } },
    },
  });

  const mappingCount = await prisma.auditAccountMapping.count({
    where: { engagementId: ENGAGEMENT_ID, status: "confirmed" },
  });

  const map1HistoryCount = await prisma.tBClassificationHistory.count({
    where: { engagementId: ENGAGEMENT_ID },
  });

  const fsCount = await prisma.auditFinancialStatement.count({
    where: { engagementId: ENGAGEMENT_ID },
  });

  const fsRebuild = await rebuildFinancialStatementsAfterProfileChange(
    ENGAGEMENT_ID,
  );

  return {
    engagement,
    mappingCount,
    map1HistoryCount,
    fsCount,
    fsRebuild,
    urls: {
      engagement: `/audit/engagements/${ENGAGEMENT_ID}`,
      statements: `/audit/engagements/${ENGAGEMENT_ID}/statements`,
      mapping: `/audit/engagements/${ENGAGEMENT_ID}/mapping`,
    },
  };
}

const report = {
  phase: "Shalfa Pilot Rollout",
  engagementId: ENGAGEMENT_ID,
  steps: {},
};

try {
  await ensurePresentationPolicies();
  report.steps.policies = { ok: true };

  const { engagement } = await ensureShalfaEngagement();
  report.steps.engagement = {
    ok: true,
    id: engagement.id,
    profile: engagement.presentationProfile,
    policyId: engagement.presentationPolicyId,
  };

  await ensureCanonicalCoa();
  report.steps.canonicalCoa = { ok: true, count: CANONICAL_COA_ACCOUNTS.length };

  report.steps.tb = await ingestTbIfPresent();

  report.steps.validation = await validateReadiness();
  report.success = true;
} catch (err) {
  report.success = false;
  const message = err instanceof Error ? err.message : String(err);
  report.error = message;
  if (message.includes("AuditPresentationPolicy") || message.includes("does not exist")) {
    report.hint = "Run: npx prisma migrate deploy";
  }
}

const outDir = path.join("docs", "audits", "evidence");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "shalfa-pilot-setup.json"),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report, null, 2));
await prisma.$disconnect();
process.exit(report.success ? 0 : 1);
