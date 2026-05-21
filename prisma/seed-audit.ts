import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateNotes } from "../src/lib/audit/notes";

config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const SAR = (v: number) => v;

async function main() {
  console.log("Cleaning existing AuditOS data...");
  await prisma.auditAiOutput.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.auditPublicationPackage.deleteMany();
  await prisma.auditApprovalRecord.deleteMany();
  await prisma.auditReviewComment.deleteMany();
  await prisma.auditRecommendation.deleteMany();
  await prisma.auditFinding.deleteMany();
  await prisma.auditEvidenceLink.deleteMany();
  await prisma.auditEvidence.deleteMany();
  await prisma.auditDisclosureNote.deleteMany();
  await prisma.auditFinancialStatement.deleteMany();
  await prisma.auditAccountMapping.deleteMany();
  await prisma.auditCanonicalAccount.deleteMany();
  await prisma.auditTrialBalanceLine.deleteMany();
  await prisma.auditTrialBalance.deleteMany();
  await prisma.pilotFeedback.deleteMany();
  await prisma.pilotSignoff.deleteMany();
  await prisma.auditEngagement.deleteMany();
  await prisma.auditClient.deleteMany();
  await prisma.auditUser.deleteMany();
  await prisma.productionBlocker.deleteMany();
  await prisma.auditOrganization.deleteMany();

  console.log("Seeding AuditOS demo data for Gulf Trading Co. FY2025...");

  // ─── Organization ───
  const org = await prisma.auditOrganization.create({
    data: {
      id: "org-aqliya",
      name: "Aqliya Audit Firm",
      slug: "aqliya-audit",
      jurisdiction: "Saudi Arabia",
      regulatoryFramework: "IFRS for SMEs",
      governanceRules: {
        requireEvidenceForMaterialFindings: true,
        maxApprovalDays: 14,
      },
      status: "active",
    },
  });
  console.log(`  Organization: ${org.name}`);

  // ─── Users ───
  const users = await Promise.all([
    prisma.auditUser.create({
      data: {
        id: "usr-khalid",
        organizationId: org.id,
        email: "khalid@aqliya.sa",
        name: "Khalid Al Saud",
        role: "partner",
        status: "active",
      },
    }),
    prisma.auditUser.create({
      data: {
        id: "usr-farida",
        organizationId: org.id,
        email: "farida@aqliya.sa",
        name: "Farida Al Zamil",
        role: "manager",
        status: "active",
      },
    }),
    prisma.auditUser.create({
      data: {
        id: "usr-sarah",
        organizationId: org.id,
        email: "sarah@aqliya.sa",
        name: "Sarah Al Otaibi",
        role: "reviewer",
        status: "active",
      },
    }),
    prisma.auditUser.create({
      data: {
        id: "usr-ahmed",
        organizationId: org.id,
        email: "ahmed@aqliya.sa",
        name: "Ahmed Al Ghamdi",
        role: "operator",
        status: "active",
      },
    }),
    prisma.auditUser.create({
      data: {
        id: "usr-client-rep",
        organizationId: org.id,
        email: "client@gulf-trading.sa",
        name: "Faisal Al Harbi",
        role: "viewer",
        status: "active",
      },
    }),
    prisma.auditUser.create({
      data: {
        id: "usr-admin",
        organizationId: org.id,
        email: "admin@aqliya.sa",
        name: "Admin User",
        role: "admin",
        status: "active",
      },
    }),
  ]);
  console.log(`  Users: ${users.length} created`);

  // ─── Client ───
  const client = await prisma.auditClient.create({
    data: {
      id: "cli-gulf-trading",
      organizationId: org.id,
      name: "Gulf Trading Co.",
      registrationNumber: "CR-2021-88432",
      industry: "Wholesale Trade",
      reportingFramework: "ifrs_for_smes",
      fiscalPeriodEnd: "12-31",
      currencyCode: "SAR",
      status: "active",
      contactEmail: "finance@gulf-trading.sa",
      contactPhone: "+966 55 123 4567",
    },
  });
  console.log(`  Client: ${client.name}`);

  // ─── Engagement ───
  const engagement = await prisma.auditEngagement.create({
    data: {
      id: "eng-gulf-2025",
      organizationId: org.id,
      clientId: client.id,
      fiscalPeriod: "FY2025",
      engagementType: "full_audit",
      status: "in_progress",
      team: [
        {
          userId: "usr-khalid",
          userName: "Khalid Al Saud",
          role: "partner",
          assignedAt: "2025-03-01T00:00:00Z",
        },
        {
          userId: "usr-farida",
          userName: "Farida Al Zamil",
          role: "manager",
          assignedAt: "2025-03-01T00:00:00Z",
        },
        {
          userId: "usr-sarah",
          userName: "Sarah Al Otaibi",
          role: "reviewer",
          assignedAt: "2025-03-02T00:00:00Z",
        },
        {
          userId: "usr-ahmed",
          userName: "Ahmed Al Ghamdi",
          role: "operator",
          assignedAt: "2025-03-02T00:00:00Z",
        },
      ],
      alerts: [
        {
          id: "alert-1",
          type: "warning",
          message: "Inventory count sheet not yet uploaded",
          source: "Evidence",
          createdAt: "2025-05-01T00:00:00Z",
        },
        {
          id: "alert-2",
          type: "info",
          message: "Short-term Loan classification review pending",
          source: "Finding",
          createdAt: "2025-05-02T00:00:00Z",
        },
        {
          id: "alert-3",
          type: "warning",
          message: "Revenue concentration analysis recommended",
          source: "AI",
          createdAt: "2025-05-03T00:00:00Z",
        },
        {
          id: "alert-4",
          type: "info",
          message: "Finance Cost disclosure note incomplete",
          source: "Notes",
          createdAt: "2025-05-03T00:00:00Z",
        },
      ],
    },
  });
  console.log(`  Engagement: ${engagement.id} (${engagement.status})`);

  // ─── Trial Balance ───
  // Default demo TB is BALANCED. Prior year (FY2024) comparative balances included.
  // For an unbalanced validation scenario, see docs/product/auditos-demo-dataset.md.
  const tbLinesData = [
    {
      accountCode: "1010",
      accountName: "Cash and Bank",
      debitAmount: SAR(500000),
      creditAmount: 0,
      balance: SAR(500000),
      accountType: "asset",
      currency: "SAR",
      priorYearBalance: SAR(380000),
    },
    {
      accountCode: "1020",
      accountName: "Accounts Receivable",
      debitAmount: SAR(1200000),
      creditAmount: 0,
      balance: SAR(1200000),
      accountType: "asset",
      currency: "SAR",
      priorYearBalance: SAR(950000),
    },
    {
      accountCode: "1030",
      accountName: "Inventory",
      debitAmount: SAR(800000),
      creditAmount: 0,
      balance: SAR(800000),
      accountType: "asset",
      currency: "SAR",
      priorYearBalance: SAR(620000),
    },
    {
      accountCode: "1040",
      accountName: "Prepayments",
      debitAmount: SAR(75000),
      creditAmount: 0,
      balance: SAR(75000),
      accountType: "asset",
      currency: "SAR",
      priorYearBalance: SAR(60000),
    },
    {
      accountCode: "1050",
      accountName: "Property and Equipment",
      debitAmount: SAR(3500000),
      creditAmount: 0,
      balance: SAR(3500000),
      accountType: "non-current-asset",
      currency: "SAR",
      priorYearBalance: SAR(3200000),
    },
    {
      accountCode: "1051",
      accountName: "Accumulated Depreciation",
      debitAmount: 0,
      creditAmount: SAR(875000),
      balance: SAR(-875000),
      accountType: "non-current-asset",
      currency: "SAR",
      priorYearBalance: SAR(-700000),
    },
    {
      accountCode: "2010",
      accountName: "Accounts Payable",
      debitAmount: 0,
      creditAmount: SAR(950000),
      balance: SAR(-950000),
      accountType: "liability",
      currency: "SAR",
      priorYearBalance: SAR(-780000),
    },
    {
      accountCode: "2020",
      accountName: "Accrued Expenses",
      debitAmount: 0,
      creditAmount: SAR(95000),
      balance: SAR(-95000),
      accountType: "liability",
      currency: "SAR",
      priorYearBalance: SAR(-95000),
    },
    {
      accountCode: "2030",
      accountName: "Zakat/Tax Payable",
      debitAmount: 0,
      creditAmount: SAR(85000),
      balance: SAR(-85000),
      accountType: "liability",
      currency: "SAR",
      priorYearBalance: SAR(-65000),
    },
    {
      accountCode: "2040",
      accountName: "Short-term Loan",
      debitAmount: 0,
      creditAmount: SAR(500000),
      balance: SAR(-500000),
      accountType: "liability",
      currency: "SAR",
      priorYearBalance: SAR(-500000),
    },
    {
      accountCode: "2050",
      accountName: "Finance Cost",
      debitAmount: SAR(35000),
      creditAmount: 0,
      balance: SAR(35000),
      accountType: "expense",
      currency: "SAR",
      priorYearBalance: SAR(30000),
    },
    {
      accountCode: "3010",
      accountName: "Share Capital",
      debitAmount: 0,
      creditAmount: SAR(2000000),
      balance: SAR(-2000000),
      accountType: "equity",
      currency: "SAR",
      priorYearBalance: SAR(-2000000),
    },
    {
      accountCode: "3020",
      accountName: "Retained Earnings",
      debitAmount: 0,
      creditAmount: SAR(705000),
      balance: SAR(-705000),
      accountType: "equity",
      currency: "SAR",
      priorYearBalance: SAR(-520000),
    },
    {
      accountCode: "4010",
      accountName: "Sales Revenue",
      debitAmount: 0,
      creditAmount: SAR(4500000),
      balance: SAR(-4500000),
      accountType: "revenue",
      currency: "SAR",
      priorYearBalance: SAR(-3800000),
    },
    {
      accountCode: "4020",
      accountName: "Service Revenue",
      debitAmount: 0,
      creditAmount: SAR(750000),
      balance: SAR(-750000),
      accountType: "revenue",
      currency: "SAR",
      priorYearBalance: SAR(-520000),
    },
    {
      accountCode: "5010",
      accountName: "Cost of Sales",
      debitAmount: SAR(2800000),
      creditAmount: 0,
      balance: SAR(2800000),
      accountType: "expense",
      currency: "SAR",
      priorYearBalance: SAR(2200000),
    },
    {
      accountCode: "5020",
      accountName: "Salaries and Wages",
      debitAmount: SAR(900000),
      creditAmount: 0,
      balance: SAR(900000),
      accountType: "expense",
      currency: "SAR",
      priorYearBalance: SAR(780000),
    },
    {
      accountCode: "5030",
      accountName: "Rent Expense",
      debitAmount: SAR(240000),
      creditAmount: 0,
      balance: SAR(240000),
      accountType: "expense",
      currency: "SAR",
      priorYearBalance: SAR(240000),
    },
    {
      accountCode: "5040",
      accountName: "Utilities Expense",
      debitAmount: SAR(95000),
      creditAmount: 0,
      balance: SAR(95000),
      accountType: "expense",
      currency: "SAR",
      priorYearBalance: SAR(82000),
    },
    {
      accountCode: "5050",
      accountName: "Depreciation Expense",
      debitAmount: SAR(175000),
      creditAmount: 0,
      balance: SAR(175000),
      accountType: "expense",
      currency: "SAR",
      priorYearBalance: SAR(150000),
    },
    {
      accountCode: "5060",
      accountName: "Professional Fees",
      debitAmount: SAR(120000),
      creditAmount: 0,
      balance: SAR(120000),
      accountType: "expense",
      currency: "SAR",
      priorYearBalance: SAR(75000),
    },
    {
      accountCode: "5070",
      accountName: "General and Administrative Expenses",
      debitAmount: SAR(65000),
      creditAmount: 0,
      balance: SAR(65000),
      accountType: "expense",
      currency: "SAR",
      priorYearBalance: SAR(55000),
    },
    // Mapped to Other Income — included in revenue for demo completeness
    {
      accountCode: "5100",
      accountName: "Sundry Income",
      debitAmount: 0,
      creditAmount: SAR(45000),
      balance: SAR(-45000),
      accountType: "revenue",
      currency: "SAR",
      priorYearBalance: SAR(-25000),
    },
  ];
  const totalDebits = tbLinesData.reduce((s, l) => s + l.debitAmount, 0);
  const totalCredits = tbLinesData.reduce((s, l) => s + l.creditAmount, 0);

  const tb = await prisma.auditTrialBalance.create({
    data: {
      id: "tb-gulf-2025",
      engagementId: engagement.id,
      importTimestamp: new Date("2025-04-15T10:30:00Z"),
      sourceFile: "gulf_trading_tb_fy2025.xlsx",
      fileHash: "sha256-a1b2c3d4e5f6...",
      trustState: "conditional",
      totalDebits,
      totalCredits,
      variance: totalDebits - totalCredits,
      lines: {
        create: tbLinesData.map((l, i) => ({
          id: `tb-line-${i + 1}`,
          accountCode: l.accountCode,
          accountName: l.accountName,
          debitAmount: l.debitAmount,
          creditAmount: l.creditAmount,
          balance: l.balance,
          accountType: l.accountType,
          currency: l.currency,
        })),
      },
    },
    include: { lines: true },
  });
  console.log(
    `  Trial Balance: ${tb.lines.length} lines (Debits: SAR ${totalDebits.toLocaleString()}, Credits: SAR ${totalCredits.toLocaleString()}, Variance: SAR ${(totalDebits - totalCredits).toLocaleString()})`,
  );

  // ─── Canonical Accounts ───
  const canonicalAccountsData = [
    {
      id: "ca-1",
      code: "CA-1010",
      name: "Cash and Cash Equivalents",
      category: "Current Assets",
      statementType: "balance_sheet",
      displayOrder: 100,
    },
    {
      id: "ca-2",
      code: "CA-1020",
      name: "Trade Receivables",
      category: "Current Assets",
      statementType: "balance_sheet",
      displayOrder: 110,
    },
    {
      id: "ca-3",
      code: "CA-1030",
      name: "Inventories",
      category: "Current Assets",
      statementType: "balance_sheet",
      displayOrder: 120,
    },
    {
      id: "ca-4",
      code: "CA-1040",
      name: "Prepayments",
      category: "Current Assets",
      statementType: "balance_sheet",
      displayOrder: 130,
    },
    {
      id: "ca-5",
      code: "CA-1050",
      name: "Property, Plant and Equipment",
      category: "Non-Current Assets",
      statementType: "balance_sheet",
      displayOrder: 200,
    },
    {
      id: "ca-6",
      code: "CA-1060",
      name: "Accumulated Depreciation",
      category: "Non-Current Assets",
      statementType: "balance_sheet",
      displayOrder: 210,
    },
    {
      id: "ca-7",
      code: "CA-2010",
      name: "Trade Payables",
      category: "Current Liabilities",
      statementType: "balance_sheet",
      displayOrder: 300,
    },
    {
      id: "ca-8",
      code: "CA-2020",
      name: "Accrued Expenses",
      category: "Current Liabilities",
      statementType: "balance_sheet",
      displayOrder: 310,
    },
    {
      id: "ca-9",
      code: "CA-2030",
      name: "Tax and Zakat Payable",
      category: "Current Liabilities",
      statementType: "balance_sheet",
      displayOrder: 320,
    },
    {
      id: "ca-10",
      code: "CA-2040",
      name: "Short-term Borrowings",
      category: "Current Liabilities",
      statementType: "balance_sheet",
      displayOrder: 330,
    },
    {
      id: "ca-11",
      code: "CA-3010",
      name: "Share Capital",
      category: "Equity",
      statementType: "balance_sheet",
      displayOrder: 400,
    },
    {
      id: "ca-12",
      code: "CA-3020",
      name: "Retained Earnings",
      category: "Equity",
      statementType: "balance_sheet",
      displayOrder: 410,
    },
    {
      id: "ca-13",
      code: "CA-4010",
      name: "Revenue - Sale of Goods",
      category: "Revenue",
      statementType: "income_statement",
      displayOrder: 500,
    },
    {
      id: "ca-14",
      code: "CA-4020",
      name: "Revenue - Services",
      category: "Revenue",
      statementType: "income_statement",
      displayOrder: 510,
    },
    {
      id: "ca-15",
      code: "CA-5010",
      name: "Cost of Sales",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 600,
    },
    {
      id: "ca-16",
      code: "CA-5020",
      name: "Employee Benefits",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 610,
    },
    {
      id: "ca-17",
      code: "CA-5030",
      name: "Occupancy Expenses",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 620,
    },
    {
      id: "ca-18",
      code: "CA-5040",
      name: "Utilities",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 630,
    },
    {
      id: "ca-19",
      code: "CA-5050",
      name: "Depreciation and Amortisation",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 640,
    },
    {
      id: "ca-20",
      code: "CA-5060",
      name: "Professional and Consulting Fees",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 650,
    },
    {
      id: "ca-21",
      code: "CA-5070",
      name: "General and Administrative Expenses",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 660,
    },
    {
      id: "ca-22",
      code: "CA-5100",
      name: "Other Income",
      category: "Revenue",
      statementType: "income_statement",
      displayOrder: 670,
    },
    {
      id: "ca-23",
      code: "CA-2050",
      name: "Finance Cost",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 680,
    },
  ];
  const canonicalAccounts = await Promise.all(
    canonicalAccountsData.map((ca) =>
      prisma.auditCanonicalAccount.create({ data: ca }),
    ),
  );
  console.log(`  Canonical Accounts: ${canonicalAccounts.length}`);

  // ─── Account Mappings ───
  const mappingsData = [
    {
      id: "map-1",
      sourceAccountId: "tb-line-1",
      sourceAccountCode: "1010",
      sourceAccountName: "Cash and Bank",
      debitAmount: SAR(500000),
      creditAmount: 0,
      canonicalAccountId: "ca-1",
      statementClassification: "Current Assets",
      confidence: 0.98,
      mappingType: "confirmed_ai",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:00:00Z"),
    },
    {
      id: "map-2",
      sourceAccountId: "tb-line-2",
      sourceAccountCode: "1020",
      sourceAccountName: "Accounts Receivable",
      debitAmount: SAR(1200000),
      creditAmount: 0,
      canonicalAccountId: "ca-2",
      confidence: 0.97,
      mappingType: "confirmed_ai",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:05:00Z"),
    },
    {
      id: "map-3",
      sourceAccountId: "tb-line-3",
      sourceAccountCode: "1030",
      sourceAccountName: "Inventory",
      debitAmount: SAR(800000),
      creditAmount: 0,
      canonicalAccountId: "ca-3",
      confidence: 0.99,
      mappingType: "confirmed_ai",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:10:00Z"),
    },
    {
      id: "map-4",
      sourceAccountId: "tb-line-4",
      sourceAccountCode: "1040",
      sourceAccountName: "Prepayments",
      debitAmount: SAR(75000),
      creditAmount: 0,
      canonicalAccountId: "ca-4",
      confidence: 0.96,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:15:00Z"),
    },
    {
      id: "map-5",
      sourceAccountId: "tb-line-5",
      sourceAccountCode: "1050",
      sourceAccountName: "Property and Equipment",
      debitAmount: SAR(3500000),
      creditAmount: 0,
      canonicalAccountId: "ca-5",
      confidence: 0.99,
      mappingType: "confirmed_ai",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:20:00Z"),
    },
    {
      id: "map-6",
      sourceAccountId: "tb-line-6",
      sourceAccountCode: "1051",
      sourceAccountName: "Accumulated Depreciation",
      debitAmount: 0,
      creditAmount: SAR(875000),
      canonicalAccountId: "ca-6",
      confidence: 0.98,
      mappingType: "confirmed_ai",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:25:00Z"),
    },
    {
      id: "map-7",
      sourceAccountId: "tb-line-7",
      sourceAccountCode: "2010",
      sourceAccountName: "Accounts Payable",
      debitAmount: 0,
      creditAmount: SAR(950000),
      canonicalAccountId: "ca-7",
      confidence: 0.97,
      mappingType: "human_mapped",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:30:00Z"),
    },
    {
      id: "map-8",
      sourceAccountId: "tb-line-8",
      sourceAccountCode: "2020",
      sourceAccountName: "Accrued Expenses",
      debitAmount: 0,
      creditAmount: SAR(95000),
      canonicalAccountId: "ca-8",
      confidence: 0.92,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:35:00Z"),
    },
    {
      id: "map-9",
      sourceAccountId: "tb-line-9",
      sourceAccountCode: "2030",
      sourceAccountName: "Zakat/Tax Payable",
      debitAmount: 0,
      creditAmount: SAR(85000),
      canonicalAccountId: "ca-9",
      confidence: 0.95,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:40:00Z"),
    },
    {
      id: "map-10",
      sourceAccountId: "tb-line-10",
      sourceAccountCode: "2040",
      sourceAccountName: "Short-term Loan",
      debitAmount: 0,
      creditAmount: SAR(500000),
      canonicalAccountId: "ca-10",
      statementClassification: "Current Liabilities",
      confidence: 0.88,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:45:00Z"),
    },
    {
      id: "map-11",
      sourceAccountId: "tb-line-12",
      sourceAccountCode: "3010",
      sourceAccountName: "Share Capital",
      debitAmount: 0,
      creditAmount: SAR(2000000),
      canonicalAccountId: "ca-11",
      confidence: 0.99,
      mappingType: "confirmed_ai",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:50:00Z"),
    },
    {
      id: "map-12",
      sourceAccountId: "tb-line-13",
      sourceAccountCode: "3020",
      sourceAccountName: "Retained Earnings",
      debitAmount: 0,
      creditAmount: SAR(705000),
      canonicalAccountId: "ca-12",
      confidence: 0.99,
      mappingType: "human_mapped",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T11:55:00Z"),
    },
    {
      id: "map-13",
      sourceAccountId: "tb-line-14",
      sourceAccountCode: "4010",
      sourceAccountName: "Sales Revenue",
      debitAmount: 0,
      creditAmount: SAR(4500000),
      canonicalAccountId: "ca-13",
      confidence: 0.98,
      mappingType: "confirmed_ai",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:00:00Z"),
    },
    {
      id: "map-14",
      sourceAccountId: "tb-line-15",
      sourceAccountCode: "4020",
      sourceAccountName: "Service Revenue",
      debitAmount: 0,
      creditAmount: SAR(750000),
      canonicalAccountId: "ca-14",
      confidence: 0.97,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:05:00Z"),
    },
    {
      id: "map-15",
      sourceAccountId: "tb-line-16",
      sourceAccountCode: "5010",
      sourceAccountName: "Cost of Sales",
      debitAmount: SAR(2800000),
      creditAmount: 0,
      canonicalAccountId: "ca-15",
      confidence: 0.99,
      mappingType: "confirmed_ai",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:10:00Z"),
    },
    {
      id: "map-16",
      sourceAccountId: "tb-line-17",
      sourceAccountCode: "5020",
      sourceAccountName: "Salaries and Wages",
      debitAmount: SAR(900000),
      creditAmount: 0,
      canonicalAccountId: "ca-16",
      confidence: 0.96,
      mappingType: "human_mapped",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:15:00Z"),
    },
    {
      id: "map-17",
      sourceAccountId: "tb-line-18",
      sourceAccountCode: "5030",
      sourceAccountName: "Rent Expense",
      debitAmount: SAR(240000),
      creditAmount: 0,
      canonicalAccountId: "ca-17",
      confidence: 0.95,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:20:00Z"),
    },
    {
      id: "map-18",
      sourceAccountId: "tb-line-19",
      sourceAccountCode: "5040",
      sourceAccountName: "Utilities Expense",
      debitAmount: SAR(95000),
      creditAmount: 0,
      canonicalAccountId: "ca-18",
      confidence: 0.97,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:25:00Z"),
    },
    {
      id: "map-19",
      sourceAccountId: "tb-line-20",
      sourceAccountCode: "5050",
      sourceAccountName: "Depreciation Expense",
      debitAmount: SAR(175000),
      creditAmount: 0,
      canonicalAccountId: "ca-19",
      confidence: 0.98,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:30:00Z"),
    },
    {
      id: "map-20",
      sourceAccountId: "tb-line-21",
      sourceAccountCode: "5060",
      sourceAccountName: "Professional Fees",
      debitAmount: SAR(120000),
      creditAmount: 0,
      canonicalAccountId: "ca-20",
      confidence: 0.96,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:35:00Z"),
    },
    {
      id: "map-21",
      sourceAccountId: "tb-line-22",
      sourceAccountCode: "5070",
      sourceAccountName: "General and Administrative Expenses",
      debitAmount: SAR(65000),
      creditAmount: 0,
      canonicalAccountId: "ca-21",
      confidence: 0.97,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:40:00Z"),
    },
    {
      id: "map-23",
      sourceAccountId: "tb-line-11",
      sourceAccountCode: "2050",
      sourceAccountName: "Finance Cost",
      debitAmount: SAR(35000),
      creditAmount: 0,
      canonicalAccountId: "ca-23",
      confidence: 0.94,
      mappingType: "ai_suggested",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:42:00Z"),
    },
    // Sundry Income mapped to Other Income — confirmed for balanced demo
    {
      id: "map-22",
      sourceAccountId: "tb-line-23",
      sourceAccountCode: "5100",
      sourceAccountName: "Sundry Income",
      debitAmount: 0,
      creditAmount: SAR(45000),
      canonicalAccountId: "ca-22",
      statementClassification: "Revenue",
      confidence: 0.85,
      mappingType: "confirmed_ai",
      status: "confirmed",
      mappedBy: "Ahmed Al Ghamdi",
      mappedAt: new Date("2025-04-15T12:45:00Z"),
    },
  ];
  for (const m of mappingsData) {
    await prisma.auditAccountMapping.create({
      data: { ...m, engagementId: engagement.id },
    });
  }
  console.log(`  Account Mappings: ${mappingsData.length}`);

  // ─── Financial Statements ───
  const incomeStatementLines = [
    {
      id: "fsl-is-1",
      statementId: "fs-is-1",
      label: "Revenue",
      amount: SAR(5295000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 10,
      linkedAccountMappings: ["map-13", "map-14", "map-22"],
    },
    {
      id: "fsl-is-2",
      statementId: "fs-is-1",
      label: "  Sales Revenue",
      amount: SAR(4500000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 11,
      linkedAccountMappings: ["map-13"],
    },
    {
      id: "fsl-is-3",
      statementId: "fs-is-1",
      label: "  Service Revenue",
      amount: SAR(750000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 12,
      linkedAccountMappings: ["map-14"],
    },
    {
      id: "fsl-is-3b",
      statementId: "fs-is-1",
      label: "  Other Income",
      amount: SAR(45000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 13,
      linkedAccountMappings: ["map-22"],
    },
    {
      id: "fsl-is-4",
      statementId: "fs-is-1",
      label: "Cost of Sales",
      amount: SAR(2800000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 20,
      linkedAccountMappings: ["map-15"],
    },
    {
      id: "fsl-is-5",
      statementId: "fs-is-1",
      label: "Gross Profit",
      amount: SAR(2495000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 30,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-is-6",
      statementId: "fs-is-1",
      label: "Operating Expenses",
      amount: SAR(1630000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 40,
      linkedAccountMappings: [
        "map-16",
        "map-17",
        "map-18",
        "map-19",
        "map-20",
        "map-21",
        "map-23",
      ],
    },
    {
      id: "fsl-is-7",
      statementId: "fs-is-1",
      label: "  Salaries and Wages",
      amount: SAR(900000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 41,
      linkedAccountMappings: ["map-16"],
    },
    {
      id: "fsl-is-8",
      statementId: "fs-is-1",
      label: "  Rent Expense",
      amount: SAR(240000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 42,
      linkedAccountMappings: ["map-17"],
    },
    {
      id: "fsl-is-9",
      statementId: "fs-is-1",
      label: "  Utilities",
      amount: SAR(95000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 43,
      linkedAccountMappings: ["map-18"],
    },
    {
      id: "fsl-is-10",
      statementId: "fs-is-1",
      label: "  Depreciation",
      amount: SAR(175000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 44,
      linkedAccountMappings: ["map-19"],
    },
    {
      id: "fsl-is-11",
      statementId: "fs-is-1",
      label: "  Professional Fees",
      amount: SAR(120000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 45,
      linkedAccountMappings: ["map-20"],
    },
    {
      id: "fsl-is-12",
      statementId: "fs-is-1",
      label: "  General and Administrative",
      amount: SAR(65000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 46,
      linkedAccountMappings: ["map-21"],
    },
    {
      id: "fsl-is-12b",
      statementId: "fs-is-1",
      label: "  Finance Cost",
      amount: SAR(35000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 47,
      linkedAccountMappings: ["map-23"],
    },
    {
      id: "fsl-is-13",
      statementId: "fs-is-1",
      label: "Net Profit",
      amount: SAR(865000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 50,
      linkedAccountMappings: [],
    },
  ];
  const balanceSheetLines = [
    {
      id: "fsl-bs-1",
      statementId: "fs-bs-1",
      label: "ASSETS",
      amount: 0,
      isTotal: false,
      indentLevel: 0,
      displayOrder: 5,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-bs-2",
      statementId: "fs-bs-1",
      label: "Current Assets",
      amount: SAR(2575000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 10,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-bs-3",
      statementId: "fs-bs-1",
      label: "  Cash and Cash Equivalents",
      amount: SAR(500000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 11,
      linkedAccountMappings: ["map-1"],
    },
    {
      id: "fsl-bs-4",
      statementId: "fs-bs-1",
      label: "  Trade Receivables",
      amount: SAR(1200000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 12,
      linkedAccountMappings: ["map-2"],
    },
    {
      id: "fsl-bs-5",
      statementId: "fs-bs-1",
      label: "  Inventories",
      amount: SAR(800000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 13,
      linkedAccountMappings: ["map-3"],
    },
    {
      id: "fsl-bs-6",
      statementId: "fs-bs-1",
      label: "  Prepayments",
      amount: SAR(75000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 14,
      linkedAccountMappings: ["map-4"],
    },
    {
      id: "fsl-bs-7",
      statementId: "fs-bs-1",
      label: "Non-Current Assets",
      amount: SAR(2625000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 20,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-bs-8",
      statementId: "fs-bs-1",
      label: "  Property, Plant and Equipment",
      amount: SAR(3500000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 21,
      linkedAccountMappings: ["map-5"],
    },
    {
      id: "fsl-bs-9",
      statementId: "fs-bs-1",
      label: "  Less: Accumulated Depreciation",
      amount: SAR(-875000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 22,
      linkedAccountMappings: ["map-6"],
    },
    {
      id: "fsl-bs-10",
      statementId: "fs-bs-1",
      label: "TOTAL ASSETS",
      amount: SAR(5200000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 30,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-bs-11",
      statementId: "fs-bs-1",
      label: "LIABILITIES AND EQUITY",
      amount: 0,
      isTotal: false,
      indentLevel: 0,
      displayOrder: 35,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-bs-12",
      statementId: "fs-bs-1",
      label: "Current Liabilities",
      amount: SAR(1630000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 40,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-bs-13",
      statementId: "fs-bs-1",
      label: "  Trade Payables",
      amount: SAR(950000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 41,
      linkedAccountMappings: ["map-7"],
    },
    {
      id: "fsl-bs-14",
      statementId: "fs-bs-1",
      label: "  Accrued Expenses",
      amount: SAR(95000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 42,
      linkedAccountMappings: ["map-8"],
    },
    {
      id: "fsl-bs-15",
      statementId: "fs-bs-1",
      label: "  Tax and Zakat Payable",
      amount: SAR(85000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 43,
      linkedAccountMappings: ["map-9"],
    },
    {
      id: "fsl-bs-16",
      statementId: "fs-bs-1",
      label: "  Short-term Borrowings",
      amount: SAR(500000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 44,
      linkedAccountMappings: ["map-10"],
    },
    {
      id: "fsl-bs-17",
      statementId: "fs-bs-1",
      label: "Equity",
      amount: SAR(3570000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 50,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-bs-18",
      statementId: "fs-bs-1",
      label: "  Share Capital",
      amount: SAR(2000000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 51,
      linkedAccountMappings: ["map-11"],
    },
    {
      id: "fsl-bs-19",
      statementId: "fs-bs-1",
      label: "  Retained Earnings",
      amount: SAR(705000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 52,
      linkedAccountMappings: ["map-12"],
    },
    {
      id: "fsl-bs-20",
      statementId: "fs-bs-1",
      label: "  Current Year Profit",
      amount: SAR(865000),
      isTotal: false,
      indentLevel: 1,
      displayOrder: 53,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-bs-21",
      statementId: "fs-bs-1",
      label: "TOTAL LIABILITIES AND EQUITY",
      amount: SAR(5200000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 60,
      linkedAccountMappings: [],
    },
  ];
  const equityLines = [
    {
      id: "fsl-eq-1",
      statementId: "fs-eq-1",
      label: "Share Capital",
      amount: SAR(2000000),
      isTotal: false,
      indentLevel: 0,
      displayOrder: 10,
      linkedAccountMappings: ["map-11"],
    },
    {
      id: "fsl-eq-2",
      statementId: "fs-eq-1",
      label: "Retained Earnings - Opening",
      amount: SAR(705000),
      isTotal: false,
      indentLevel: 0,
      displayOrder: 20,
      linkedAccountMappings: ["map-12"],
    },
    {
      id: "fsl-eq-3",
      statementId: "fs-eq-1",
      label: "Current Year Profit",
      amount: SAR(865000),
      isTotal: false,
      indentLevel: 0,
      displayOrder: 30,
      linkedAccountMappings: [],
    },
    {
      id: "fsl-eq-4",
      statementId: "fs-eq-1",
      label: "Total Equity",
      amount: SAR(3570000),
      isTotal: true,
      indentLevel: 0,
      displayOrder: 40,
      linkedAccountMappings: [],
    },
  ];

  await prisma.auditFinancialStatement.create({
    data: {
      id: "fs-is-1",
      engagementId: engagement.id,
      statementType: "income_statement",
      title: "Statement of Profit or Loss",
      status: "draft",
      lines: incomeStatementLines,
    },
  });
  await prisma.auditFinancialStatement.create({
    data: {
      id: "fs-bs-1",
      engagementId: engagement.id,
      statementType: "balance_sheet",
      title: "Statement of Financial Position",
      status: "draft",
      lines: balanceSheetLines,
    },
  });
  await prisma.auditFinancialStatement.create({
    data: {
      id: "fs-eq-1",
      engagementId: engagement.id,
      statementType: "equity",
      title: "Statement of Changes in Equity",
      status: "draft",
      lines: equityLines,
    },
  });
  console.log(
    "  Financial Statements: 3 created (Income Statement, Balance Sheet, Equity)",
  );

  // ─── Disclosure Notes (generated by Notes Engine v1) ───
  const notesEngineContext = {
    engagementId: engagement.id,
    trialBalanceLines: tbLinesData.map((l) => ({
      accountCode: l.accountCode,
      accountName: l.accountName,
      debitAmount: l.debitAmount,
      creditAmount: l.creditAmount,
      balance: l.balance,
      accountType: l.accountType,
    })),
    mappings: mappingsData.map((m) => ({
      sourceAccountCode: m.sourceAccountCode,
      sourceAccountName: m.sourceAccountName,
      canonicalAccountName: m.canonicalAccountName ?? undefined,
      statementClassification: m.statementClassification ?? undefined,
    })),
    financialStatements: [
      {
        statementType: "income_statement",
        lines: incomeStatementLines.map((l) => ({
          label: l.label,
          amount: l.amount,
          isTotal: l.isTotal,
          linkedAccountMappings: l.linkedAccountMappings,
        })),
      },
      {
        statementType: "balance_sheet",
        lines: balanceSheetLines.map((l) => ({
          label: l.label,
          amount: l.amount,
          isTotal: l.isTotal,
          linkedAccountMappings: l.linkedAccountMappings,
        })),
      },
      {
        statementType: "equity",
        lines: equityLines.map((l) => ({
          label: l.label,
          amount: l.amount,
          isTotal: l.isTotal,
          linkedAccountMappings: l.linkedAccountMappings,
        })),
      },
    ],
    existingNotes: [],
    evidence: [
      {
        filename: "bank_confirmation_samba.pdf",
        state: "accepted",
        targetLabel: "Cash and Bank",
      },
      {
        filename: "ar_aging_report.pdf",
        state: "accepted",
        targetLabel: "Accounts Receivable",
      },
      {
        filename: "ppe_schedule.xlsx",
        state: "accepted",
        targetLabel: "Property and Equipment",
      },
      {
        filename: "loan_agreement.pdf",
        state: "reviewed",
        targetLabel: "Short-term Loan",
      },
      {
        filename: "inventory_count_sheet.pdf",
        state: "missing",
        targetLabel: "Inventory",
      },
    ],
    findings: [],
  };

  const generatedNotes = generateNotes(notesEngineContext);

  for (let i = 0; i < generatedNotes.length; i++) {
    const note = generatedNotes[i];
    let status = note.status;

    if (note.noteNumber === "1") status = "reviewed";
    if (note.noteNumber === "2") status = "reviewed";
    if (note.noteNumber === "6") status = "approved";

    await prisma.auditDisclosureNote.create({
      data: {
        id: `note-${i + 1}`,
        engagementId: engagement.id,
        noteNumber: note.noteNumber,
        title: note.title,
        noteType: note.noteType,
        content: note.content,
        linkedStatementLine: note.linkedStatementLine ?? null,
        missingInformation: note.missingInformation,
        aiDrafted: false,
        status,
      },
    });
  }
  console.log(
    `  Disclosure Notes: ${generatedNotes.length} (generated by Notes Engine v1)`,
  );

  // ─── Evidence Requirements ───
  const now = new Date();
  const evidenceData = [
    {
      id: "ev-1",
      filename: "gulf_trading_tb_fy2025.xlsx",
      fileType: "xlsx",
      fileSize: 245000,
      fileHash: "hash-001",
      uploadedBy: "Ahmed Al Ghamdi",
      uploadedAt: new Date("2025-04-15T10:30:00Z"),
      state: "accepted",
      storageKey: "tb-files/gulf_trading_tb_fy2025.xlsx",
    },
    {
      id: "ev-2",
      filename: "bank_confirmation_samba.pdf",
      fileType: "pdf",
      fileSize: 180000,
      fileHash: "hash-002",
      uploadedBy: "Ahmed Al Ghamdi",
      uploadedAt: new Date("2025-04-20T09:00:00Z"),
      state: "accepted",
      storageKey: "evidence/bank_confirmation_samba.pdf",
    },
    {
      id: "ev-3",
      filename: "ar_aging_report.pdf",
      fileType: "pdf",
      fileSize: 320000,
      fileHash: "hash-003",
      uploadedBy: "Sarah Al Otaibi",
      uploadedAt: new Date("2025-04-22T14:00:00Z"),
      state: "accepted",
      storageKey: "evidence/ar_aging_report.pdf",
    },
    {
      id: "ev-4",
      filename: "ppe_schedule.xlsx",
      fileType: "xlsx",
      fileSize: 95000,
      fileHash: "hash-004",
      uploadedBy: "Ahmed Al Ghamdi",
      uploadedAt: new Date("2025-04-25T11:00:00Z"),
      state: "accepted",
      storageKey: "evidence/ppe_schedule.xlsx",
    },
    {
      id: "ev-5",
      filename: "loan_agreement.pdf",
      fileType: "pdf",
      fileSize: 450000,
      fileHash: "hash-005",
      uploadedBy: "Sarah Al Otaibi",
      uploadedAt: new Date("2025-04-28T10:00:00Z"),
      state: "reviewed",
      storageKey: "evidence/loan_agreement.pdf",
    },
    {
      id: "ev-missing-1",
      filename: "inventory_count_sheet.pdf",
      fileType: "pdf",
      fileSize: 0,
      fileHash: "",
      uploadedBy: "",
      uploadedAt: null,
      state: "missing",
      storageKey: "",
    },
  ];
  for (const ev of evidenceData) {
    await prisma.auditEvidence.create({
      data: { ...ev, engagementId: engagement.id },
    });
  }

  // Evidence links
  await prisma.auditEvidenceLink.createMany({
    data: [
      {
        id: "el-1",
        evidenceId: "ev-1",
        targetType: "account",
        targetId: "all",
        linkType: "supports",
        context: "Trial Balance",
        createdBy: "Ahmed Al Ghamdi",
      },
      {
        id: "el-2",
        evidenceId: "ev-2",
        targetType: "account",
        targetId: "tb-line-1",
        linkType: "supports",
        context: "Cash and Bank",
        createdBy: "Ahmed Al Ghamdi",
      },
      {
        id: "el-3",
        evidenceId: "ev-3",
        targetType: "account",
        targetId: "tb-line-2",
        linkType: "supports",
        context: "Accounts Receivable",
        createdBy: "Sarah Al Otaibi",
      },
      {
        id: "el-4",
        evidenceId: "ev-4",
        targetType: "account",
        targetId: "tb-line-5",
        linkType: "supports",
        context: "Property and Equipment",
        createdBy: "Ahmed Al Ghamdi",
      },
      {
        id: "el-5",
        evidenceId: "ev-5",
        targetType: "account",
        targetId: "tb-line-10",
        linkType: "supports",
        context: "Short-term Loan",
        createdBy: "Sarah Al Otaibi",
      },
      {
        id: "el-m1",
        evidenceId: "ev-missing-1",
        targetType: "account",
        targetId: "tb-line-3",
        linkType: "supports",
        context: "Inventory",
        createdBy: "System",
      },
    ],
  });
  // Record audit events for evidence creation and linking
  for (const ev of evidenceData) {
    await prisma.auditEvent.create({
      data: {
        engagementId: engagement.id,
        eventType: "evidence.created",
        actorId: ev.uploadedBy || "system",
        actorName: ev.uploadedBy || "System",
        actorRole: "operator",
        targetType: "evidence",
        targetId: ev.id,
        newState: ev.state,
        description: `Evidence created: ${ev.filename}`,
        aiRelated: false,
        timestamp: ev.uploadedAt || now,
      },
    });
  }
  await prisma.auditEvent.createMany({
    data: [
      {
        id: "ae-ev-1",
        engagementId: engagement.id,
        eventType: "evidence.linked",
        actorId: "usr-ahmed",
        actorName: "Ahmed Al Ghamdi",
        actorRole: "operator",
        targetType: "account",
        targetId: "all",
        newState: "linked",
        description: "Evidence linked to Trial Balance",
        aiRelated: false,
        timestamp: new Date("2025-04-15T10:35:00Z"),
      },
      {
        id: "ae-ev-2",
        engagementId: engagement.id,
        eventType: "evidence.linked",
        actorId: "usr-ahmed",
        actorName: "Ahmed Al Ghamdi",
        actorRole: "operator",
        targetType: "account",
        targetId: "tb-line-1",
        newState: "linked",
        description: "Evidence linked to Cash and Bank",
        aiRelated: false,
        timestamp: new Date("2025-04-20T09:05:00Z"),
      },
      {
        id: "ae-ev-3",
        engagementId: engagement.id,
        eventType: "evidence.linked",
        actorId: "usr-sarah",
        actorName: "Sarah Al Otaibi",
        actorRole: "reviewer",
        targetType: "account",
        targetId: "tb-line-2",
        newState: "linked",
        description: "Evidence linked to Accounts Receivable",
        aiRelated: false,
        timestamp: new Date("2025-04-22T14:05:00Z"),
      },
      {
        id: "ae-ev-4",
        engagementId: engagement.id,
        eventType: "evidence.linked",
        actorId: "usr-ahmed",
        actorName: "Ahmed Al Ghamdi",
        actorRole: "operator",
        targetType: "account",
        targetId: "tb-line-5",
        newState: "linked",
        description: "Evidence linked to Property and Equipment",
        aiRelated: false,
        timestamp: new Date("2025-04-25T11:05:00Z"),
      },
      {
        id: "ae-ev-5",
        engagementId: engagement.id,
        eventType: "evidence.linked",
        actorId: "usr-sarah",
        actorName: "Sarah Al Otaibi",
        actorRole: "reviewer",
        targetType: "account",
        targetId: "tb-line-10",
        newState: "linked",
        description: "Evidence linked to Short-term Loan",
        aiRelated: false,
        timestamp: new Date("2025-04-28T10:05:00Z"),
      },
      {
        id: "ae-ev-m1",
        engagementId: engagement.id,
        eventType: "evidence.linked",
        actorId: "system",
        actorName: "System",
        actorRole: "operator",
        targetType: "account",
        targetId: "tb-line-3",
        newState: "linked",
        description: "Evidence linked to Inventory",
        aiRelated: false,
        timestamp: new Date("2025-04-16T00:00:00Z"),
      },
    ],
  });
  console.log(`  Evidence: ${evidenceData.length}, Links: 6`);

  // ─── Findings ───
  await prisma.auditFinding.createMany({
    data: [
      {
        id: "find-1",
        engagementId: engagement.id,
        title: "Revenue Concentration Risk",
        findingType: "observation",
        severity: "medium",
        materiality: "immaterial",
        description:
          "Sales Revenue represents 85% of total revenue. Customer concentration analysis recommended to assess dependency risk.",
        rootCause: "Single revenue stream dominance",
        impact:
          "Business continuity risk if major customer relationship changes",
        status: "open",
        relatedAccountIds: ["tb-line-14"],
        relatedEvidenceIds: [],
        aiSuggested: true,
      },
      {
        id: "find-2",
        engagementId: engagement.id,
        title: "Short-term Loan Classification",
        findingType: "disclosure_gap",
        severity: "high",
        materiality: "material",
        description:
          "Short-term Loan (account 2040) of SAR 500,000 is classified as current, but the loan agreement indicates a 24-month term.",
        rootCause: "Classification error in trial balance preparation",
        impact: "Current ratio and working capital presentation",
        status: "open",
        relatedAccountIds: ["tb-line-10"],
        relatedEvidenceIds: ["ev-5"],
        aiSuggested: true,
      },
      {
        id: "find-3",
        engagementId: engagement.id,
        title: "Missing Inventory Evidence",
        findingType: "disclosure_gap",
        severity: "high",
        materiality: "material",
        description:
          "Inventory of SAR 800,000 (account 1030) has no supporting evidence. Physical inventory count sheet has not been uploaded.",
        rootCause: "Pending client submission",
        impact: "Cannot verify existence of inventory",
        status: "in_review",
        relatedAccountIds: ["tb-line-3"],
        relatedEvidenceIds: [],
        aiSuggested: false,
        assignedTo: "client@gulf-trading.sa",
      },
      {
        id: "find-4",
        engagementId: engagement.id,
        title: "Professional Fees Variance",
        findingType: "observation",
        severity: "low",
        materiality: "immaterial",
        description:
          "Professional Fees increased 60% from SAR 75,000 to SAR 120,000 year-over-year with no supporting explanation.",
        rootCause: "Engagement of additional consultants",
        impact: "N/A - immaterial",
        status: "draft",
        relatedAccountIds: ["tb-line-21"],
        relatedEvidenceIds: [],
        aiSuggested: true,
      },
      {
        id: "find-5",
        engagementId: engagement.id,
        title: "Finance Cost Disclosure",
        findingType: "disclosure_gap",
        severity: "low",
        materiality: "immaterial",
        description:
          "Finance Cost of SAR 35,000 requires disclosure of financing arrangement terms, effective interest rate, and maturity profile.",
        rootCause: "Note disclosure incomplete",
        impact: "Incomplete note disclosure",
        status: "draft",
        relatedAccountIds: ["tb-line-11"],
        relatedEvidenceIds: ["ev-5"],
        aiSuggested: true,
      },
    ],
  });
  console.log("  Findings: 5");

  // ─── Recommendations ───
  await prisma.auditRecommendation.createMany({
    data: [
      {
        id: "rec-1",
        engagementId: engagement.id,
        findingId: "find-1",
        title: "Perform Customer Concentration Analysis",
        description:
          "Analyze revenue by customer to assess concentration risk and document findings.",
        recommendedAction:
          "Request customer-level revenue breakdown from management. Calculate percentage of total revenue per customer. Document any customer exceeding 10% of total revenue.",
        impactAssessment:
          "Improves risk disclosure. Supports going concern assessment.",
        riskLevel: "medium",
        status: "suggested",
        aiContributed: true,
      },
      {
        id: "rec-2",
        engagementId: engagement.id,
        findingId: "find-2",
        title: "Reclassify Short-term Loan as Non-Current",
        description:
          "Reclassify SAR 500,000 Short-term Loan from current to non-current liabilities based on 24-month term.",
        recommendedAction:
          "Reclassify to Non-current Borrowings. Disclose reclassification in notes. Verify loan agreement terms.",
        impactAssessment:
          "Improves current ratio. Provides more accurate liquidity presentation.",
        riskLevel: "high",
        status: "under_review",
        aiContributed: true,
      },
      {
        id: "rec-3",
        engagementId: engagement.id,
        findingId: "find-3",
        title: "Request Inventory Count Sheet from Client",
        description:
          "Client must provide physical inventory count sheet and valuation report.",
        recommendedAction:
          "Send formal evidence request for: (1) Physical inventory count sheet, (2) Inventory valuation report, (3) NRV assessment for slow-moving items.",
        impactAssessment:
          "Required to verify existence and valuation of SAR 800,000 inventory.",
        riskLevel: "high",
        status: "suggested",
        aiContributed: false,
      },
    ],
  });
  console.log("  Recommendations: 3");

  // ─── Review Comments ───
  await prisma.auditReviewComment.createMany({
    data: [
      {
        id: "rc-1",
        engagementId: engagement.id,
        targetType: "statement",
        targetId: "fs-is-1",
        reviewerId: "usr-sarah",
        reviewerName: "Sarah Al Otaibi",
        comment:
          "Revenue breakdown by segment should be disclosed in the notes. Verify that service revenue recognition criteria are documented.",
        requiredAction: "provide_evidence",
        status: "open",
        createdAt: new Date("2025-04-28T14:00:00Z"),
      },
      {
        id: "rc-2",
        engagementId: engagement.id,
        targetType: "note",
        targetId: "note-2",
        reviewerId: "usr-sarah",
        reviewerName: "Sarah Al Otaibi",
        comment:
          "PPE note needs depreciation rates per asset class and details of additions/disposals during the year.",
        requiredAction: "provide_evidence",
        status: "open",
        createdAt: new Date("2025-04-28T14:30:00Z"),
      },
      {
        id: "rc-3",
        engagementId: engagement.id,
        targetType: "note",
        targetId: "note-1",
        reviewerId: "usr-sarah",
        reviewerName: "Sarah Al Otaibi",
        comment:
          "General information note reviewed. Basis of preparation is appropriate for IFRS for SMEs.",
        requiredAction: "none",
        status: "resolved",
        resolution: "Note accepted as drafted.",
        createdAt: new Date("2025-04-29T09:00:00Z"),
        resolvedAt: new Date("2025-04-29T09:30:00Z"),
      },
    ],
  });
  console.log("  Review Comments: 3");

  // ─── Approval Record ───
  await prisma.auditApprovalRecord.create({
    data: {
      id: "appr-1",
      engagementId: engagement.id,
      approverId: "usr-farida",
      approverName: "Farida Al Zamil",
      approverRole: "manager",
      action: "approved",
      rationale:
        "Preliminary mapping review complete. Proceed to evidence collection.",
      targetType: "engagement",
      targetId: engagement.id,
      createdAt: new Date("2025-04-17T09:00:00Z"),
    },
  });
  console.log("  Approval Records: 1");

  // ─── Publication Package ───
  await prisma.auditPublicationPackage.create({
    data: { id: "pub-1", engagementId: engagement.id, status: "draft" },
  });
  console.log("  Publication Package: 1");

  // ─── Audit Events ───
  const eventsData = [
    {
      id: "ae-1",
      eventType: "engagement.created",
      actorId: "usr-khalid",
      actorName: "Khalid Al Saud",
      actorRole: "partner",
      targetType: "engagement",
      targetId: engagement.id,
      newState: "setup",
      description: "Engagement created for Gulf Trading Co. FY2025",
      timestamp: new Date("2025-03-01T08:00:00Z"),
    },
    {
      id: "ae-2",
      eventType: "team.assigned",
      actorId: "usr-khalid",
      actorName: "Khalid Al Saud",
      actorRole: "partner",
      targetType: "engagement",
      targetId: engagement.id,
      newState: "setup",
      description:
        "Team assigned: Farida (Manager), Sarah (Reviewer), Ahmed (Operator)",
      timestamp: new Date("2025-03-01T09:00:00Z"),
    },
    {
      id: "ae-3",
      eventType: "trial_balance.uploaded",
      actorId: "usr-ahmed",
      actorName: "Ahmed Al Ghamdi",
      actorRole: "operator",
      targetType: "trial_balance",
      targetId: "tb-gulf-2025",
      newState: "uploaded",
      description: "Trial balance uploaded: gulf_trading_tb_fy2025.xlsx",
      timestamp: new Date("2025-04-15T10:30:00Z"),
    },
    {
      id: "ae-4",
      eventType: "mapping.ai_suggested",
      actorId: "system",
      actorName: "AI Assistant",
      actorRole: "operator",
      targetType: "account_mapping",
      targetId: "map-1",
      newState: "suggested",
      description: "AI suggested 23 account mappings",
      aiRelated: true,
      metadata: { suggestionCount: 23, modelVersion: "audit-os-llm-v1" },
      timestamp: new Date("2025-04-15T10:45:00Z"),
    },
    {
      id: "ae-5",
      eventType: "mapping.confirmed",
      actorId: "usr-ahmed",
      actorName: "Ahmed Al Ghamdi",
      actorRole: "operator",
      targetType: "account_mapping",
      targetId: "map-1",
      newState: "confirmed",
      description: "Ahmed confirmed all 23 account mappings",
      aiRelated: false,
      timestamp: new Date("2025-04-15T12:45:00Z"),
    },
    {
      id: "ae-6",
      eventType: "validation.completed",
      actorId: "system",
      actorName: "System",
      actorRole: "operator",
      targetType: "validation",
      targetId: "val-1",
      newState: "completed",
      description: "Validation completed: 0 errors, 2 warnings",
      timestamp: new Date("2025-04-15T13:00:00Z"),
    },
    {
      id: "ae-7",
      eventType: "evidence.uploaded",
      actorId: "usr-ahmed",
      actorName: "Ahmed Al Ghamdi",
      actorRole: "operator",
      targetType: "evidence",
      targetId: "ev-1",
      newState: "uploaded",
      description: "Evidence uploaded: gulf_trading_tb_fy2025.xlsx",
      timestamp: new Date("2025-04-15T10:30:00Z"),
    },
    {
      id: "ae-8",
      eventType: "evidence.accepted",
      actorId: "usr-sarah",
      actorName: "Sarah Al Otaibi",
      actorRole: "reviewer",
      targetType: "evidence",
      targetId: "ev-2",
      previousState: "reviewed",
      newState: "accepted",
      description: "Bank confirmation verified and accepted",
      timestamp: new Date("2025-04-22T15:00:00Z"),
    },
    {
      id: "ae-9",
      eventType: "signal.generated",
      actorId: "ai-system",
      actorName: "AI Assistant",
      actorRole: "operator",
      targetType: "signal",
      targetId: "find-1",
      newState: "generated",
      description: "AI detected revenue concentration risk in Sales Revenue",
      aiRelated: true,
      metadata: { signalType: "revenue_concentration", confidence: 0.75 },
      timestamp: new Date("2025-04-20T07:55:00Z"),
    },
    {
      id: "ae-10",
      eventType: "finding.created",
      actorId: "usr-sarah",
      actorName: "Sarah Al Otaibi",
      actorRole: "reviewer",
      targetType: "finding",
      targetId: "find-1",
      newState: "open",
      description: "Finding created: Revenue Concentration Risk",
      timestamp: new Date("2025-04-20T08:00:00Z"),
    },
    {
      id: "ae-11",
      eventType: "recommendation.ai_suggested",
      actorId: "ai-system",
      actorName: "AI Assistant",
      actorRole: "manager",
      targetType: "recommendation",
      targetId: "rec-1",
      newState: "draft",
      description:
        "AI drafted recommendation for customer concentration analysis",
      aiRelated: true,
      metadata: { modelVersion: "audit-os-llm-v1" },
      timestamp: new Date("2025-04-25T07:55:00Z"),
    },
    {
      id: "ae-12",
      eventType: "recommendation.created",
      actorId: "usr-sarah",
      actorName: "Sarah Al Otaibi",
      actorRole: "reviewer",
      targetType: "recommendation",
      targetId: "rec-1",
      newState: "suggested",
      description:
        "Sarah reviewed and accepted AI recommendation for concentration analysis",
      aiRelated: true,
      timestamp: new Date("2025-04-25T08:00:00Z"),
    },
    {
      id: "ae-13",
      eventType: "review.comment_added",
      actorId: "usr-sarah",
      actorName: "Sarah Al Otaibi",
      actorRole: "reviewer",
      targetType: "statement",
      targetId: "fs-is-1",
      newState: "commented",
      description: "Review comment: Other Income needs separate presentation",
      timestamp: new Date("2025-04-28T14:00:00Z"),
    },
    {
      id: "ae-14",
      eventType: "engagement.state_changed",
      actorId: "usr-khalid",
      actorName: "Khalid Al Saud",
      actorRole: "partner",
      targetType: "engagement",
      targetId: engagement.id,
      previousState: "setup",
      newState: "in_progress",
      description: "Engagement moved to In Progress after setup completion",
      timestamp: new Date("2025-03-05T09:00:00Z"),
    },
    {
      id: "ae-15",
      eventType: "finding.state_changed",
      actorId: "usr-sarah",
      actorName: "Sarah Al Otaibi",
      actorRole: "reviewer",
      targetType: "finding",
      targetId: "find-3",
      previousState: "open",
      newState: "in_review",
      description: 'Finding "Missing Inventory Evidence" moved to In Review',
      timestamp: new Date("2025-05-01T10:00:00Z"),
    },
    {
      id: "ae-16",
      eventType: "recommendation.state_changed",
      actorId: "usr-sarah",
      actorName: "Sarah Al Otaibi",
      actorRole: "reviewer",
      targetType: "recommendation",
      targetId: "rec-2",
      previousState: "suggested",
      newState: "under_review",
      description: 'Recommendation "Reclassify Loan" moved to Under Review',
      timestamp: new Date("2025-05-02T09:00:00Z"),
    },
  ];
  for (const ev of eventsData) {
    await prisma.auditEvent.create({
      data: {
        id: ev.id,
        engagementId: engagement.id,
        eventType: ev.eventType,
        actorId: ev.actorId,
        actorName: ev.actorName,
        actorRole: ev.actorRole,
        targetType: ev.targetType,
        targetId: ev.targetId,
        previousState: (ev as any).previousState ?? "",
        newState: ev.newState,
        description: ev.description,
        aiRelated: (ev as any).aiRelated ?? false,
        metadata: (ev as any).metadata ?? undefined,
        timestamp: ev.timestamp,
      },
    });
  }
  console.log(`  Audit Events: ${eventsData.length}`);

  // ─── AI Outputs ───
  await prisma.auditAiOutput.createMany({
    data: [
      {
        id: "ai-1",
        engagementId: engagement.id,
        suggestionType: "mapping",
        inputContext:
          "Account: Sundry Income (5100), balance SAR 45,000 credit",
        outputContent:
          "Suggested mapping: Sundry Income → Other Income (CA-5100) - Revenue",
        confidence: 0.85,
        modelVersion: "audit-os-llm-v1",
        status: "suggested",
        sourceEntityType: "engagement",
        sourceEntityId: engagement.id,
      },
      {
        id: "ai-2",
        engagementId: engagement.id,
        suggestionType: "finding",
        inputContext: "Revenue concentration: Sales Revenue 85% of total",
        outputContent:
          "Potential observation: High revenue concentration in Sales Revenue. Recommend customer concentration analysis.",
        confidence: 0.75,
        modelVersion: "audit-os-llm-v1",
        status: "accepted_by_human",
        acceptedBy: "usr-sarah",
        acceptedAt: new Date("2025-04-20T08:00:00Z"),
        sourceEntityType: "engagement",
        sourceEntityId: engagement.id,
      },
      {
        id: "ai-3",
        engagementId: engagement.id,
        suggestionType: "recommendation",
        inputContext: "Finding: Short-term Loan classification - 24-month term",
        outputContent:
          "Recommendation: Reclassify Short-term Loan of SAR 500,000 from current to non-current liabilities.",
        confidence: 0.91,
        modelVersion: "audit-os-llm-v1",
        status: "accepted_by_human",
        acceptedBy: "usr-sarah",
        acceptedAt: new Date("2025-04-25T08:30:00Z"),
        sourceEntityType: "engagement",
        sourceEntityId: engagement.id,
      },
      {
        id: "ai-4",
        engagementId: engagement.id,
        suggestionType: "note_draft",
        inputContext: "PPE note for Gulf Trading Co.",
        outputContent:
          "Drafted Note 2 - Property, Plant and Equipment with standard IFRS for SMEs disclosure.",
        confidence: 0.78,
        modelVersion: "audit-os-llm-v1",
        status: "accepted_by_human",
        acceptedBy: "usr-sarah",
        acceptedAt: new Date("2025-04-16T10:10:00Z"),
        sourceEntityType: "engagement",
        sourceEntityId: engagement.id,
      },
      {
        id: "ai-5",
        engagementId: engagement.id,
        suggestionType: "anomaly_explanation",
        inputContext: "Professional Fees 60% increase from SAR 75K to SAR 120K",
        outputContent:
          "Significant variance detected. Professional Fees increased 60% YoY.",
        confidence: 0.72,
        modelVersion: "audit-os-llm-v1",
        status: "suggested",
        sourceEntityType: "engagement",
        sourceEntityId: engagement.id,
      },
    ],
  });
  console.log("  AI Outputs: 5");

  // ─── Second Organization (Multi-Tenant Test) ───
  const org2 = await prisma.auditOrganization.create({
    data: {
      id: "org-aqliya-demo-2",
      name: "Aqliya Demo Firm 2",
      slug: "aqliya-demo-2",
      jurisdiction: "Saudi Arabia",
      regulatoryFramework: "IFRS for SMEs",
      status: "active",
    },
  });
  await prisma.auditUser.createMany({
    data: [
      {
        id: "usr-ahmed-org2",
        organizationId: org2.id,
        email: "ahmed@demo2.sa",
        name: "Ahmed Org2",
        role: "operator",
        status: "active",
      },
      {
        id: "usr-sarah-org2",
        organizationId: org2.id,
        email: "sarah@demo2.sa",
        name: "Sarah Org2",
        role: "reviewer",
        status: "active",
      },
      {
        id: "usr-khalid-org2",
        organizationId: org2.id,
        email: "khalid@demo2.sa",
        name: "Khalid Org2",
        role: "partner",
        status: "active",
      },
    ],
  });
  const client2 = await prisma.auditClient.create({
    data: {
      id: "cli-najd",
      organizationId: org2.id,
      name: "Najd Services Co.",
      industry: "Services",
      reportingFramework: "ifrs_for_smes",
      status: "active",
    },
  });
  const eng2 = await prisma.auditEngagement.create({
    data: {
      id: "eng-najd-2025",
      organizationId: org2.id,
      clientId: client2.id,
      fiscalPeriod: "FY2025",
      status: "setup",
    },
  });
  console.log(
    `  Second Org: ${org2.name} (Client: ${client2.name}, Eng: ${eng2.id})`,
  );

  // ─── Production Blockers ───
  const blockerDefs = [
    {
      title: "Virus/malware scanning",
      description:
        "Integrate ClamAV or cloud-based file scanning for uploaded evidence files. Scanner abstraction + production fail-closed implemented.",
      category: "Security",
      severity: "critical",
      requiredBefore: "production",
      status: "in_review",
      resolutionPlan:
        "Scanner abstraction + fail-closed active. 2/5 exit criteria met. Missing: real provider, SCANNER_PROVIDER config, scan AuditEvent verification.",
    },
    {
      title: "Production auth provisioning",
      description:
        "Set up NextAuth with real credentials and user provisioning workflow. Admin UI + role checks + tenant isolation active.",
      category: "Auth",
      severity: "critical",
      requiredBefore: "production",
      status: "in_review",
      resolutionPlan:
        "Admin UI at /audit/admin/users. 3/5 exit criteria met. Missing: SSO/OAuth, password provider restriction, pen testing.",
    },
    {
      title: "Multi-tenant isolation validation",
      description:
        "Create second test organization and verify data isolation between tenants.",
      category: "Infrastructure",
      severity: "high",
      requiredBefore: "production",
      status: "resolved",
      resolutionPlan:
        "Tenant guard + 29 server actions guarded + second org seeded.",
    },
    {
      title: "PDF/DOCX export decision",
      description:
        "Decide on PDF or DOCX export format and implement rendering pipeline. Decision: JSON-only for pilot. PDF/DOCX deferred to post-pilot.",
      category: "Export",
      severity: "high",
      requiredBefore: "production",
      status: "in_review",
      resolutionPlan:
        "Decision documented at docs/auditos/export-format-decision.md. JSON-only for pilot. Evaluate PDF library before external production.",
    },
    {
      title: "Security review",
      description:
        "Conduct full security review and penetration testing. Internal review complete. Tenant guard + rate limiting + file security verified.",
      category: "Security",
      severity: "critical",
      requiredBefore: "production",
      status: "in_review",
      resolutionPlan:
        "Internal security review documented at docs/auditos/security-review.md. 3.5/5 criteria met. Missing: external penetration testing, aggregated upload failure monitoring.",
    },
    {
      title: "Rate limiting",
      description: "Add rate limiting to server actions to prevent abuse.",
      category: "Infrastructure",
      severity: "medium",
      requiredBefore: "production",
      status: "resolved",
      resolutionPlan:
        "In-memory limiter at src/lib/audit/rate-limit.ts. 16+ actions guarded.",
    },
    {
      title: "Backup and monitoring",
      description:
        "Configure database backup strategy and application monitoring. Strategy docs + health check + daily monitoring active.",
      category: "Infrastructure",
      severity: "high",
      requiredBefore: "production",
      status: "in_review",
      resolutionPlan:
        "Backup strategy documented. audit:health 7/7. pilot:daily active. 6.5/9 criteria met. Missing: automated backup scheduling, restore verification log, upload failure aggregation.",
    },
  ];
  for (const b of blockerDefs) {
    await prisma.productionBlocker.create({
      data: { ...b, createdBy: "system" },
    });
  }
  console.log(`  Production Blockers: ${blockerDefs.length}`);

  console.log();
  console.log("========================================");
  console.log("  AuditOS seed completed successfully!");
  console.log(`  Org:         ${org.name}`);
  console.log(`  Client:      ${client.name}`);
  console.log(`  Engagement:  ${engagement.id} (FY2025)`);
  console.log(`  TB Lines:    ${tbLinesData.length}`);
  console.log(`  Mappings:    ${mappingsData.length}`);
  console.log(`  Statements:  3`);
  console.log(`  Notes:       ${generatedNotes.length}`);
  console.log(`  Findings:    5`);
  console.log(`  Events:      ${eventsData.length}`);
  console.log("========================================");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
