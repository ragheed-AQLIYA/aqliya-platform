# LocalContentOS V1 — End-to-End Workflow Design

**Scope:** TB Upload → FS Build → Workbook Population → Missing Data Request → Client Submission → LC Calculation → Recommendation Generation → Simulation

**Audience:** Implementation team
**Design principles:** Follow existing patterns (services, actions, guards, audit events, Prisma conventions)
**Classification:** Every component marked as `EXISTS` | `EXTEND` | `MISSING` with effort estimates

---

## Table of Contents

1. [Data Model](#1-data-model)
2. [Step 1: TB Upload](#2-step-1-tb-upload)
3. [Step 2: FS Build](#3-step-2-fs-build)
4. [Step 3: Workbook Population](#4-step-3-workbook-population)
5. [Step 4: Missing Data Request](#5-step-4-missing-data-request)
6. [Step 5: Client Submission](#6-step-5-client-submission)
7. [Step 6: LC Calculation](#7-step-6-lc-calculation)
8. [Step 7: Recommendation Generation](#8-step-7-recommendation-generation)
9. [Step 8: Simulation](#9-step-8-simulation)
10. [Route Map](#10-route-map)
11. [State Transitions](#11-state-transitions)
12. [Audit Event Catalog](#12-audit-event-catalog)
13. [UI Screen Map](#13-ui-screen-map)
14. [Build Order](#14-build-order)

---

## 1. Data Model

### 1.1 New Prisma Models

Three new models. Follow existing conventions exactly: `cuid()`, `String` statuses (not enums), `organizationId`, `createdById`, `Json?` metadata, `@@index([organizationId, ...])`.

```prisma
// ──── LocalContent: Workbook Population State ────

model LocalContentWorkforceRecord {
  id                     String                  @id @default(cuid())
  projectId              String
  project                LocalContentProject     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  organizationId         String

  // Job category from workbook (e.g., "إداري", "فني", "مهندس")
  category               String
  // Headcount
  saudiCount             Int                     @default(0)
  nonSaudiCount          Int                     @default(0)

  // Evidence link
  evidenceId             String?
  evidence               LocalContentEvidence?   @relation(fields: [evidenceId], references: [id], onDelete: SetNull)

  // Status: draft | client_submitted | verified | disputed
  status                 String                  @default("draft")
  metadata               Json?

  createdById            String?
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt

  @@index([projectId, category])
  @@index([organizationId, createdAt])
}

model LocalContentMissingDataRequest {
  id                     String                  @id @default(cuid())
  projectId              String
  project                LocalContentProject     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  organizationId         String

  // Which data category: supplier_classification | fsc_gsb | workforce | capex_origin | capacity_building | monthly_spend | prior_lc
  dataCategory           String
  // Request description in Arabic
  descriptionAr          String
  // Priority: high | medium | low
  priority               String                  @default("high")
  // Status: pending_generation | awaiting_client | client_submitted | partial | verified | completed
  status                 String                  @default("pending_generation")

  // Progress tracking: how many items out of total
  totalItems             Int                     @default(0)
  completedItems         Int                     @default(0)

  // Staff notes
  internalNotes          String?
  // Client-facing message
  clientMessage          String?

  metadata               Json?
  createdById            String?
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt

  @@index([projectId, status])
  @@index([projectId, priority])
  @@index([organizationId, createdAt])
}

model LocalContentWorkbookCalculation {
  id                     String                  @id @default(cuid())
  projectId              String
  project                LocalContentProject     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  organizationId         String

  // Calculation version (traceability)
  version                Int                     @default(1)
  // Calculation type: aqliya_internal | workbook_formula
  calculationType        String                  @default("workbook_formula")

  // Sub-scores (from workbook breakdown)
  supplierScore          Float?
  workforceScore         Float?
  capexScore             Float?
  capacityBuildingScore  Float?

  // Local Content % (composite)
  localContentPct        Float?
  // Tier: strong | moderate | weak | critical
  tier                   String?

  // Data quality indicators
  dataCompletenessPct    Float?                  // % of required fields populated
  autoFillPct            Float?                  // % auto-filled from TB/FS/Notes
  confidenceLevel        String?                 // high | medium | low

  // Snapshot of inputs at calculation time
  inputSnapshot          Json?

  createdById            String?
  createdAt              DateTime                @default(now())

  @@index([projectId, calculationType, createdAt])
  @@index([organizationId, createdAt])
}

model LocalContentScenario {
  id                     String                  @id @default(cuid())
  projectId              String
  project                LocalContentProject     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  organizationId         String

  // User-visible name
  name                   String
  description            String?

  // Scenario modifications (JSON — what changed)
  // e.g., { "supplierChanges": [{ "supplierId": "x", "newLC%": 50 }], "workforceIncrease": 15 }
  modifications          Json

  // Results (computed)
  baselineScore          Float?
  scenarioScore          Float?
  scoreDelta             Float?

  // Status: draft | calculated | saved
  status                 String                  @default("draft")

  createdById            String?
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt

  @@index([projectId, createdAt])
  @@index([organizationId, createdAt])
}
```

### 1.2 Existing Model Extensions

Add fields to existing models. Following codebase convention of additive changes.

#### `LocalContentSupplier` — Add FSC/GSB fields

```prisma
// Add after line ~1799 (after metadata field)
fscCode                String?   // Fixed Capital Formation code
gsbCode                String?   // Government Supplier Bank code
gsbCurrencyCode        String?   // e.g., "SAR", "USD"
```

#### `LocalContentProject` — Add workbook state field

```prisma
// Add after line ~1762 (after status field)
// Tracks workbook workflow step: pending_tb | tb_uploaded | fs_built | workbook_populated | awaiting_client_data | client_data_submitted | lc_calculated | recommendations_generated | completed
workbookStatus         String    @default("pending_tb")
```

### 1.3 Effort Summary

| Model | Status | Effort |
|-------|--------|--------|
| `LocalContentWorkforceRecord` | **MISSING** | 1 day (model + migration) |
| `LocalContentMissingDataRequest` | **MISSING** | 1 day (model + migration) |
| `LocalContentWorkbookCalculation` | **MISSING** | 1 day (model + migration) |
| `LocalContentScenario` | **MISSING** | 1 day (model + migration) |
| `LocalContentSupplier` FSC/GSB fields | **EXTEND** | 0.5 day (add fields + migration) |
| `LocalContentProject.workbookStatus` | **EXTEND** | 0.5 day (add field + migration) |
| **Total schema changes** | | **~4 days** |

---

## 2. Step 1: TB Upload

### 2.1 Current State

**EXISTS — Full pipeline in AuditOS:**

```
uploadTrialBalanceAction (action)
  → requireRole(["admin", "operator"])
  → assertEngagementAccess(engagementId, actor)
  → enforceAuditRateLimit(actor, "upload_trial_balance", "upload")
  → svcUploadTrialBalance (service)
      → db.saveTrialBalance (DB)
      → classifyTrialBalanceRows (AI classification)
      → db.createSuggestedMappingsForTrialBalance (mapping)
      → db.recordAuditEvent (audit)
      → maybeSyncReportingGraphAfterTbUpload (side-effect)
```

### 2.2 What to Extend

After TB upload succeeds, **automatically create or link a LocalContentOS project** and store the TB reference. This is a non-blocking hook, same pattern as `maybeSyncReportingGraphAfterTbUpload`.

#### New file: `src/lib/local-content/engagement-bridge.ts` (partial new)

```typescript
// EXTEND: Add to engagement-bridge.ts

export async function maybeCreateLcProjectFromTbUpload(
  engagementId: string,
  trialBalanceId: string,
  actorId: string,
  actorName: string,
): Promise<void> {
  try {
    // 1. Check if LC project already exists for this engagement
    const project = await prisma.localContentProject.findFirst({
      where: {
        metadata: { path: ["auditEngagementId"], equals: engagementId },
      },
    });

    if (!project) {
      // 2. Get engagement info
      const engagement = await prisma.auditEngagement.findUnique({
        where: { id: engagementId },
        select: {
          name: true,
          organizationId: true,
          client: { select: { name: true, platformOrganizationId: true } },
        },
      });
      if (!engagement) return;

      // 3. Create LC project
      await prisma.localContentProject.create({
        data: {
          name: `${engagement.client?.name ?? "Client"} - Local Content Assessment`,
          reportingPeriod: new Date().toISOString().slice(0, 7),
          organizationId: engagement.organizationId,
          status: "DataCollection",
          workbookStatus: "tb_uploaded",
          createdById: actorId,
          createdByName: actorName,
          metadata: {
            auditEngagementId: engagementId,
            trialBalanceId: trialBalanceId,
            source: "tb_upload",
          },
        },
      });
    } else {
      // 4. Update existing project: reference the new TB
      await prisma.localContentProject.update({
        where: { id: project.id },
        data: {
          workbookStatus: "tb_uploaded",
          metadata: {
            ...(project.metadata as Record<string, unknown> ?? {}),
            trialBalanceId: trialBalanceId,
            lastTbUploadAt: new Date().toISOString(),
          },
        },
      });
    }
  } catch (error) {
    console.error("[LocalContentOS] Failed to create project from TB:", error);
    // Non-blocking — must never break TB upload
  }
}
```

#### Hook point in AuditOS service (`src/lib/audit/services.ts`, line ~1314)

```typescript
// EXTEND: Add after existing graph sync hook
// (around line 1318, after maybeSyncReportingGraphAfterTbUpload)
try {
  const { maybeCreateLcProjectFromTbUpload } = await import(
    "@/lib/local-content/engagement-bridge"
  );
  await maybeCreateLcProjectFromTbUpload(
    engagementId,
    trialBalance.id,
    actorId ?? "system",
    actorName ?? "System",
  );
} catch (lcErr) {
  console.error("[LocalContentOS] TB→LC bridge failed:", lcErr);
}
```

### 2.3 Audit Events

| Event | Source | Classification |
|-------|--------|---------------|
| `trial_balance.uploaded` | AuditOS | ✅ EXISTS |
| `localcontent.tb_linked` | LocalContentOS | **MISSING** — new event |

### 2.4 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| `maybeCreateLcProjectFromTbUpload()` | **MISSING** | 1 day |
| Hook in `services.ts` | **EXTEND** | 0.5 day |
| Audit event `localcontent.tb_linked` | **MISSING** | 0.25 day |
| **Total** | | **~1.75 days** |

---

## 3. Step 2: FS Build

### 3.1 Current State

**EXISTS — Full pipeline in AuditOS:**

```
TB Upload → AI Mapping Suggestions → Human Confirm
  → rebuildFinancialStatementsForEngagement() [auto-triggered on confirm]
    → FS Engine v2: IS, BS, Equity, Cash Flow
    → IFRS Rules Engine (18 topics)
    → SOCPA Rules Engine (13 topics)
    → Disclosure Auto-generation (notes from rule triggers)
    → Reconciliation Engine
    → Reporting Graph Sync
```

The FS build already auto-triggers when mappings are confirmed. No additional effort needed to trigger it.

### 3.2 What to Extend

After FS rebuild completes, **trigger workbook population** for the linked LC project.

#### Hook in `rebuildFinancialStatementsForEngagement()` (`src/lib/audit/db/index.ts`, after rebuild hook section)

```typescript
// EXTEND: Add after existing hooks (after disclosure auto, around line ~2300)
try {
  const { maybePopulateWorkbookFromFs } = await import(
    "@/lib/local-content/workbook-population"
  );
  await maybePopulateWorkbookFromFs(engagementId, actorId);
} catch (wbErr) {
  console.error("[LocalContentOS] FS→workbook population failed:", wbErr);
}
```

#### New function in workbook-population.ts (see Step 3)

```typescript
// Design only — see Step 3 for full implementation
export async function maybePopulateWorkbookFromFs(
  engagementId: string,
  actorId?: string,
): Promise<void> {
  // 1. Find LC project linked to this engagement
  // 2. If project exists and workbookStatus is "tb_uploaded" → trigger population
  // 3. If already populated → skip (idempotent)
}
```

### 3.3 Audit Events

| Event | Source | Classification |
|-------|--------|---------------|
| `trial_balance.uploaded` + mapping confirm → FS rebuild | AuditOS | ✅ EXISTS |
| `localcontent.workbook_population_triggered` | LocalContentOS | **MISSING** |

### 3.4 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| Hook in `rebuildFinancialStatementsForEngagement()` | **EXTEND** | 0.5 day |
| `maybePopulateWorkbookFromFs()` | **MISSING** (see Step 3) | (covered in Step 3) |
| **Total** | | **~0.5 day** |

---

## 4. Step 3: Workbook Population

### 4.1 Classification

**MISSING — Entirely new service**

### 4.2 Service: `src/lib/local-content/workbook-population.ts`

```typescript
// ============================================================
// LocalContentOS — Workbook Population Engine
// Maps Trial Balance + Financial Statements + Notes
// to the workbook structure (نموذج قياس نسبة المحتوى المحلي)
// ============================================================

import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface WorkbookPopulationResult {
  totalRows: number;
  autoFilledRows: number;
  partialRows: number;
  clientRequiredRows: number;
  status: "completed" | "partial" | "no_data";
  sheets: SheetPopulationResult[];
}

export interface SheetPopulationResult {
  sheetId: string;           // e.g., "goods_services"
  sheetName: string;         // e.g., "السلع والخدمات"
  totalCells: number;
  autoFilledCells: number;
  clientRequiredCells: number;
}

// ─── Main Entry Point ───

export async function populateWorkbookFromTb(
  projectId: string,
  engagementId: string,
  actor?: { id: string; name: string },
): Promise<WorkbookPopulationResult> {
  // 1. Validate project state
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    select: { workbookStatus: true, metadata: true },
  });
  if (!project) throw new Error("Project not found");
  if (project.workbookStatus === "workbook_populated") {
    return { /* return existing result — idempotent */ };
  }

  // 2. Fetch TB
  const tb = await prisma.auditTrialBalance.findFirst({
    where: { engagementId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
  if (!tb) throw new Error("No trial balance found");

  // 3. Fetch FS
  const statements = await prisma.auditFinancialStatement.findMany({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
  });

  // 4. Fetch Notes
  const notes = await prisma.auditDisclosureNote.findMany({
    where: { engagementId, status: { in: ["draft", "reviewed", "approved"] } },
  });

  // 5. Fetch LC classification hints
  const history = await prisma.tBClassificationHistory.findMany({
    where: { engagementId },
    select: { accountCode: true, mappingHints: true },
    orderBy: { createdAt: "desc" },
  });
  const hintsByCode = new Map<string, string[]>();
  for (const row of history) {
    if (!hintsByCode.has(row.accountCode)) {
      hintsByCode.set(row.accountCode, (row.mappingHints as string[]) ?? []);
    }
  }

  // 6. Process each TB line → workbook row
  let autoCount = 0;
  let partialCount = 0;
  let clientCount = 0;
  const supplierMap = new Map<string, { name: string; amount: number; category: string; description: string }>();

  for (const line of tb.lines) {
    const lcHints = hintsByCode.get(line.accountCode) ?? [];
    const classification = classifyLineForWorkbook(line, lcHints);

    // Extract supplier-like name from account name or hints
    const supplierName = extractSupplierName(line.accountName, lcHints) ?? "غير مصنف";

    // Aggregate by supplier (or account code if no supplier match)
    const key = `${supplierName}::${line.accountCode}`;
    const existing = supplierMap.get(key);
    const amount = Math.abs(line.balance ?? (line.debitAmount - line.creditAmount));

    if (existing) {
      existing.amount += amount;
    } else {
      supplierMap.set(key, {
        name: supplierName,
        amount,
        category: classification.category,
        description: line.accountName,
      });
    }
  }

  // 7. Create/update supplier records & spend records in LCOS
  let createdCount = 0;
  for (const [key, data] of supplierMap) {
    const [supplierName] = key.split("::");

    // Find or create supplier
    let supplier = await prisma.localContentSupplier.findFirst({
      where: { projectId, name: { contains: supplierName } },
    });

    if (!supplier) {
      supplier = await prisma.localContentSupplier.create({
        data: {
          projectId,
          name: supplierName,
          localityClassification: "unclassified",
          status: "active",
          createdById: actor?.id,
          metadata: { source: "tb_auto_populate", accountCode: key.split("::")[1] },
        },
      });
      createdCount++;
    }

    // Create spend record
    await prisma.localContentSpendRecord.create({
      data: {
        projectId,
        supplierId: supplier.id,
        amount: data.amount,
        currency: "SAR",
        category: data.category,
        description: data.description,
        createdById: actor?.id,
      },
    });

    // This row is auto-filled for amount + category, but needs LC% from client
    if (data.category !== "unclassified") {
      autoCount++;
    } else {
      partialCount++;
    }
    clientCount++; // all need LC% from client
  }

  // 8. Create workforce placeholder records (from FS employee benefits)
  const employeeBenefitsNote = notes.find(n => n.noteType === "employee_benefits" || n.noteType === "expenses");
  const incomeStatement = statements.find(s => s.statementType === "income_statement");
  // Parse total employee benefits from FS or notes
  const totalPayroll = await extractTotalPayroll(engagementId, incomeStatement, employeeBenefitsNote);

  // Create 35 category workforce records with 0 defaults
  const defaultCategories = [
    "إداري", "مشرف", "مهندس", "فني", "سائق",
    "عامل إنتاج", "عامل صيانة", "موظف خدمة عملاء",
    "محاسب", "موارد بشرية", "تقنية معلومات", "تسويق",
    "مشتريات", "مستودعات", "أمن", "نظافة",
    // ... full 35 categories from workbook
  ];
  for (const cat of defaultCategories) {
    await prisma.localContentWorkforceRecord.upsert({
      where: { projectId_category: { projectId, category: cat } },
      update: {},
      create: {
        projectId,
        organizationId: project?.organizationId ?? "",
        category: cat,
        saudiCount: 0,
        nonSaudiCount: 0,
        status: "draft",
        createdById: actor?.id,
      },
    });
  }

  // 9. Update project workbook status
  await prisma.localContentProject.update({
    where: { id: projectId },
    data: {
      workbookStatus: "workbook_populated",
      metadata: {
        ...(project.metadata as Record<string, unknown> ?? {}),
        workbookPopulatedAt: new Date().toISOString(),
        supplierCount: supplierMap.size,
        spendRecordCount: createdCount,
      },
    },
  });

  // 10. Record audit event
  await createLocalContentAuditEvent({
    projectId,
    actorId: actor?.id ?? "system",
    actorName: actor?.name ?? "System",
    action: "workbook.populated",
    entityType: "LocalContentProject",
    entityId: projectId,
    after: JSON.stringify({ supplierCount: supplierMap.size, spendRecordCount: createdCount }),
    metadata: { autoFilled: autoCount, clientRequired: clientCount },
  });

  return {
    totalRows: supplierMap.size,
    autoFilledRows: autoCount,
    partialRows: partialCount,
    clientRequiredRows: clientCount,
    status: supplierMap.size > 0 ? "completed" : "no_data",
    sheets: [
      { sheetId: "goods_services", sheetName: "السلع والخدمات",
        totalCells: supplierMap.size * 19,
        autoFilledCells: autoCount * 4,  // amount, category, description, supplier name
        clientRequiredCells: clientCount * 12, // LC%, FSC, GSB, etc.
      },
    ],
  };
}

// ─── Helper Functions ───

function classifyLineForWorkbook(
  line: { accountCode: string; accountName: string; accountType?: string | null; balance: number },
  lcHints: string[],
): { category: string; lcRelevant: boolean } {
  // Uses existing local-content-intelligence categorization
  const PAYROLL_KW = ["payroll", "salary", "wages", "رواتب", "أجور"];
  const SUPPLIER_KW = ["supplier", "purchase", "مورد", "مشتريات"];
  const ASSET_KW = ["asset", "equipment", "أصل", "معدات"];

  const name = (line.accountName ?? "").toLowerCase();
  const accountType = (line.accountType ?? "").toLowerCase();

  if (PAYROLL_KW.some(k => name.includes(k))) return { category: "payroll", lcRelevant: true };
  if (SUPPLIER_KW.some(k => name.includes(k))) return { category: "goods_services", lcRelevant: true };
  if (ASSET_KW.some(k => name.includes(k)) || accountType.includes("asset")) {
    return { category: "capex", lcRelevant: true };
  }
  return { category: "other_expenses", lcRelevant: false };
}

function extractSupplierName(
  accountName: string,
  lcHints: string[],
): string | null {
  // Best effort: use first mapping hint that looks like a name
  for (const hint of lcHints) {
    if (hint.length > 3 && !hint.includes("/") && !hint.match(/^\d/)) {
      return hint;
    }
  }
  // Fallback: use account name (often "مورد - اسم المورد" pattern)
  if (accountName.includes(" - ")) {
    const parts = accountName.split(" - ");
    return parts[parts.length - 1].trim();
  }
  return null;
}

async function extractTotalPayroll(
  engagementId: string,
  incomeStatement?: { lines: any },
  note?: { content?: string },
): Promise<number> {
  // Try income statement first
  if (incomeStatement?.lines) {
    const lines = typeof incomeStatement.lines === "string"
      ? JSON.parse(incomeStatement.lines)
      : incomeStatement.lines;
    const employeeLine = lines.find(
      (l: any) => l.label?.includes("employee") || l.label?.includes("موظف"),
    );
    if (employeeLine?.amount) return Math.abs(employeeLine.amount);
  }
  // Fallback: try TB
  const tbLines = await prisma.auditTrialBalanceLine.findMany({
    where: {
      trialBalance: { engagementId },
      accountType: "expense",
    },
  });
  const payrollTotal = tbLines
    .filter(l => PAYROLL_KW.some(k => (l.accountName ?? "").toLowerCase().includes(k)))
    .reduce((s, l) => s + Math.abs(l.balance), 0);
  return payrollTotal;
}
```

### 4.3 Server Action

```typescript
// New action in src/actions/localcontent-actions.ts (EXTEND)

export async function populateWorkbookFromTbAction(projectId: string) {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "admin");
    const engagementId = await resolveAuditEngagementIdForLcProject(projectId);
    if (!engagementId) return { ok: false, error: "No linked AuditOS engagement" } as const;

    const result = await populateWorkbookFromTb(projectId, engagementId, {
      id: user.id,
      name: user.name,
    });
    revalidateLocalContentPaths(projectId, ["suppliers", "spend", "classification"]);
    return { ok: true, data: result } as const;
  });
}
```

### 4.4 Route + UI

```
/local-content/projects/[projectId]/workbook
```

**Server component** (`src/app/local-content/projects/[projectId]/workbook/page.tsx`):
- Fetches project + population stats
- Shows summary cards: total suppliers, auto-filled rows, client-required rows
- "Populate from TB" button (calls `populateWorkbookFromTbAction`)
- Progress indicator per sheet

**Client components needed:**
- `WorkbookPopulationButton` — trigger population
- `WorkbookSummaryCards` — auto-fill stats
- `WorkbookSheetTable` — per-sheet row preview

### 4.5 Audit Events

| Event | Classification |
|-------|---------------|
| `workbook.populated` | **MISSING** |
| `workbook.population_failed` | **MISSING** |

### 4.6 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| `workbook-population.ts` service | **MISSING** | 3 days |
| `populateWorkbookFromTbAction` | **MISSING** | 0.5 day |
| Workbook route + page | **MISSING** | 1 day |
| UI components (summary + table) | **MISSING** | 2 days |
| Audit events | **MISSING** | 0.25 day |
| **Total** | | **~6.75 days** |

---

## 5. Step 4: Missing Data Request

### 5.1 Classification

**MISSING — Entirely new engine**

### 5.2 Service: `src/lib/local-content/missing-data-engine.ts`

```typescript
// ============================================================
// LocalContentOS — Missing Data Engine
// After workbook population, identifies what data is missing
// and generates structured collection requests.
// ============================================================

import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface MissingDataSummary {
  projectId: string;
  totalDataCategories: number;
  completedCategories: number;
  overallCompletenessPct: number;
  categories: MissingDataCategory[];
}

export interface MissingDataCategory {
  dataCategory: string;
  labelAr: string;
  priority: "high" | "medium" | "low";
  totalItems: number;
  completedItems: number;
  completenessPct: number;
  status: string;
  impact: "blocks_lc_calculation" | "improves_accuracy" | "optional";
}

// ─── Main Entry Point ───

export async function generateMissingDataRequests(
  projectId: string,
  actor?: { id: string; name: string },
): Promise<MissingDataSummary> {
  // 1. Check existing requests
  const existing = await prisma.localContentMissingDataRequest.findMany({
    where: { projectId },
  });

  // 2. Analyze current data state
  const [suppliers, workforceRecords] = await Promise.all([
    prisma.localContentSupplier.findMany({
      where: { projectId },
      select: { id: true, localityClassification: true, localContentPercentage: true, fscCode: true },
    }),
    prisma.localContentWorkforceRecord.findMany({
      where: { projectId },
      select: { id: true, saudiCount: true, nonSaudiCount: true, status: true },
    }),
  ]);

  // 3. Generate requests for each category
  const requests: Array<{
    dataCategory: string;
    descriptionAr: string;
    priority: "high" | "medium" | "low";
    totalItems: number;
    completedItems: number;
    status: string;
  }> = [];

  // --- HIGH PRIORITY ---

  // Supplier LC Classification
  const unclassifiedSuppliers = suppliers.filter(s => !s.localityClassification || s.localityClassification === "unclassified");
  const classifiedSuppliers = suppliers.length - unclassifiedSuppliers.length;
  if (unclassifiedSuppliers.length > 0) {
    requests.push({
      dataCategory: "supplier_classification",
      descriptionAr: `تصنيف المحتوى المحلي للموردين — ${unclassifiedSuppliers.length} مورد غير مصنف`,
      priority: "high",
      totalItems: suppliers.length,
      completedItems: classifiedSuppliers,
      status: "awaiting_client",
    });
  }

  // Supplier LC%
  const suppliersWithoutPct = suppliers.filter(s => s.localContentPercentage === null || s.localContentPercentage === undefined);
  if (suppliersWithoutPct.length > 0) {
    requests.push({
      dataCategory: "supplier_lc_percentage",
      descriptionAr: `نسبة المحتوى المحلي لكل مورد — ${suppliersWithoutPct.length} مورد بدون نسبة`,
      priority: "high",
      totalItems: suppliers.length,
      completedItems: suppliers.length - suppliersWithoutPct.length,
      status: "awaiting_client",
    });
  }

  // FSC/GSB Codes
  const suppliersWithoutCodes = suppliers.filter(s => !s.fscCode);
  if (suppliersWithoutCodes.length > 0) {
    requests.push({
      dataCategory: "fsc_gsb",
      descriptionAr: `رموز التصنيف (FSC/GSB) للموردين — ${suppliersWithoutCodes.length} مورد بدون رمز`,
      priority: "high",
      totalItems: suppliers.length,
      completedItems: suppliers.length - suppliersWithoutCodes.length,
      status: "awaiting_client",
    });
  }

  // --- MEDIUM PRIORITY ---

  // Workforce
  const completedWorkforce = workforceRecords.filter(r => r.status === "client_submitted" || r.status === "verified").length;
  if (completedWorkforce < workforceRecords.length) {
    requests.push({
      dataCategory: "workforce",
      descriptionAr: `بيانات القوى العاملة — تفصيل الموظفين السعوديين وغير السعوديين حسب الفئة`,
      priority: "medium",
      totalItems: workforceRecords.length,
      completedItems: completedWorkforce,
      status: "awaiting_client",
    });
  }

  // CAPEX Origin
  const assetSpend = await prisma.localContentSpendRecord.findMany({
    where: { projectId, category: "capex" },
    select: { id: true, supplier: { select: { localityClassification: true } } },
  });
  const unclassifiedCapex = assetSpend.filter(s => !s.supplier?.localityClassification || s.supplier.localityClassification === "unclassified");
  if (unclassifiedCapex.length > 0) {
    requests.push({
      dataCategory: "capex_origin",
      descriptionAr: `أصل النفقات الرأسمالية — ${unclassifiedCapex.length} بند بدون تصنيف`,
      priority: "medium",
      totalItems: assetSpend.length,
      completedItems: assetSpend.length - unclassifiedCapex.length,
      status: "awaiting_client",
    });
  }

  // --- LOW PRIORITY ---

  // Capacity Building (always missing — no data source)
  requests.push({
    dataCategory: "capacity_building",
    descriptionAr: `بيانات تطوير القدرات — البرامج التدريبية والمؤهلات`,
    priority: "low",
    totalItems: 10, // estimated categories
    completedItems: 0,
    status: "awaiting_client",
  });

  // 4. Upsert requests into DB
  for (const req of requests) {
    const existing = await prisma.localContentMissingDataRequest.findFirst({
      where: { projectId, dataCategory: req.dataCategory },
    });
    if (!existing) {
      await prisma.localContentMissingDataRequest.create({
        data: {
          projectId,
          organizationId: "", // resolved from project
          dataCategory: req.dataCategory,
          descriptionAr: req.descriptionAr,
          priority: req.priority,
          status: req.status,
          totalItems: req.totalItems,
          completedItems: req.completedItems,
          createdById: actor?.id,
        },
      });
    } else {
      await prisma.localContentMissingDataRequest.update({
        where: { id: existing.id },
        data: {
          totalItems: req.totalItems,
          completedItems: req.completedItems,
          status: req.completedItems >= req.totalItems ? "completed" : "awaiting_client",
        },
      });
    }
  }

  // 5. Update project workbook status
  await prisma.localContentProject.update({
    where: { id: projectId },
    data: { workbookStatus: "awaiting_client_data" },
  });

  // 6. Audit
  await createLocalContentAuditEvent({
    projectId,
    actorId: actor?.id ?? "system",
    actorName: actor?.name ?? "System",
    action: "missing_data.requests_generated",
    entityType: "LocalContentMissingDataRequest",
    entityId: projectId,
    after: JSON.stringify({ requestCount: requests.length }),
  });

  // 7. Return summary
  const completed = requests.filter(r => r.status === "completed").length;
  return {
    projectId,
    totalDataCategories: requests.length,
    completedCategories: completed,
    overallCompletenessPct: requests.length > 0
      ? Math.round((completed / requests.length) * 100)
      : 100,
    categories: requests.map(r => ({
      dataCategory: r.dataCategory,
      labelAr: r.descriptionAr,
      priority: r.priority as "high" | "medium" | "low",
      totalItems: r.totalItems,
      completedItems: r.completedItems,
      completenessPct: r.totalItems > 0 ? Math.round((r.completedItems / r.totalItems) * 100) : 0,
      status: r.status,
      impact: r.dataCategory === "supplier_classification" || r.dataCategory === "supplier_lc_percentage"
        ? "blocks_lc_calculation" as const
        : "improves_accuracy" as const,
    })),
  };
}

export async function getMissingDataSummary(
  projectId: string,
): Promise<MissingDataSummary | null> {
  const requests = await prisma.localContentMissingDataRequest.findMany({
    where: { projectId },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });
  if (requests.length === 0) return null;

  const completed = requests.filter(r => r.status === "completed").length;
  return {
    projectId,
    totalDataCategories: requests.length,
    completedCategories: completed,
    overallCompletenessPct: Math.round((completed / requests.length) * 100),
    categories: requests.map(r => ({
      dataCategory: r.dataCategory,
      labelAr: r.descriptionAr,
      priority: r.priority as "high" | "medium" | "low",
      totalItems: r.totalItems,
      completedItems: r.completedItems,
      completenessPct: r.totalItems > 0 ? Math.round((r.completedItems / r.totalItems) * 100) : 0,
      status: r.status,
      impact: r.dataCategory.startsWith("supplier") ? "blocks_lc_calculation" : "improves_accuracy",
    })),
  };
}
```

### 5.3 Server Action

```typescript
// In src/actions/localcontent-actions.ts (EXTEND)

export async function generateMissingDataRequestsAction(projectId: string) {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "admin");
    const summary = await generateMissingDataRequests(projectId, {
      id: user.id, name: user.name,
    });
    revalidateLocalContentPaths(projectId, ["workbook"]);
    return { ok: true, data: summary };
  });
}

export async function getMissingDataSummaryAction(projectId: string) {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    const summary = await getMissingDataSummary(projectId);
    return { ok: true, data: summary };
  });
}
```

### 5.4 Route + UI

```
/local-content/projects/[projectId]/workbook/missing-data
```

**Server component:**
- Fetches missing data summary
- Renders priority-ordered cards for each category
- Each card shows: label, completeness %, action button

**Client components:**
- `MissingDataOverview` — dashboard with progress ring
- `MissingDataCategoryCard` — per-category card with status
- `MissingDataActionButton` — triggers data submission

### 5.5 Audit Events

| Event | Classification |
|-------|---------------|
| `missing_data.requests_generated` | **MISSING** |
| `missing_data.request_updated` | **MISSING** |

### 5.6 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| `missing-data-engine.ts` service | **MISSING** | 2 days |
| `generateMissingDataRequestsAction` | **MISSING** | 0.5 day |
| Missing data route + page | **MISSING** | 1 day |
| UI components | **MISSING** | 1.5 days |
| **Total** | | **~5 days** |

---

## 6. Step 5: Client Submission

### 6.1 Classification

**MISSING for batch classification UX** — `EXTEND` for single-supplier updates (existing `updateLocalContentSupplierAction`)

### 6.2 Service: Add batch classification + workforce submission

#### Batch supplier classification: `src/lib/local-content/services.ts` (EXTEND)

```typescript
// EXTEND: Add to existing services.ts

export interface BatchClassificationInput {
  supplierId: string;
  localityClassification: "local" | "non_local" | "mixed" | "unclassified";
  localContentPercentage: number;
  fscCode?: string;
  gsbCode?: string;
  gsbCurrencyCode?: string;
  evidenceId?: string;
}

export async function batchClassifySuppliers(
  projectId: string,
  classifications: BatchClassificationInput[],
  actor?: { id: string; name: string },
): Promise<{ updated: number }> {
  let updated = 0;
  for (const input of classifications) {
    const supplier = await prisma.localContentSupplier.findUnique({
      where: { id: input.supplierId },
      select: { projectId: true, name: true, localityClassification: true, localContentPercentage: true },
    });
    if (!supplier || supplier.projectId !== projectId) continue;

    const before = JSON.stringify({
      localityClassification: supplier.localityClassification,
      localContentPercentage: supplier.localContentPercentage,
    });

    await prisma.localContentSupplier.update({
      where: { id: input.supplierId },
      data: {
        localityClassification: input.localityClassification,
        localContentPercentage: input.localContentPercentage,
        fscCode: input.fscCode,
        gsbCode: input.gsbCode,
        gsbCurrencyCode: input.gsbCurrencyCode,
      },
    });

    if (actor) {
      await createLocalContentAuditEvent({
        projectId,
        actorId: actor.id,
        actorName: actor.name,
        action: "supplier.classified",
        entityType: "LocalContentSupplier",
        entityId: input.supplierId,
        before,
        after: JSON.stringify({
          localityClassification: input.localityClassification,
          localContentPercentage: input.localContentPercentage,
        }),
      });
    }

    // Link evidence if provided
    if (input.evidenceId) {
      await prisma.localContentEvidence.update({
        where: { id: input.evidenceId },
        data: { supplierId: input.supplierId },
      });
    }

    updated++;
  }

  // Update missing data request progress
  await updateMissingDataProgress(projectId, "supplier_classification");
  await updateMissingDataProgress(projectId, "supplier_lc_percentage");

  return { updated };
}

export async function submitWorkforceData(
  projectId: string,
  records: Array<{ category: string; saudiCount: number; nonSaudiCount: number }>,
  actor?: { id: string; name: string },
): Promise<void> {
  for (const record of records) {
    await prisma.localContentWorkforceRecord.upsert({
      where: { projectId_category: { projectId, category: record.category } },
      update: {
        saudiCount: record.saudiCount,
        nonSaudiCount: record.nonSaudiCount,
        status: "client_submitted",
      },
      create: {
        projectId,
        organizationId: "", // resolved
        category: record.category,
        saudiCount: record.saudiCount,
        nonSaudiCount: record.nonSaudiCount,
        status: "client_submitted",
        createdById: actor?.id,
      },
    });
  }

  await updateMissingDataProgress(projectId, "workforce");

  if (actor) {
    await createLocalContentAuditEvent({
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: "workforce.submitted",
      entityType: "LocalContentWorkforceRecord",
      entityId: projectId,
      after: JSON.stringify({ recordCount: records.length }),
    });
  }
}

// Internal helper
async function updateMissingDataProgress(
  projectId: string,
  dataCategory: string,
): Promise<void> {
  const request = await prisma.localContentMissingDataRequest.findFirst({
    where: { projectId, dataCategory },
  });
  if (!request) return;

  let completedItems = 0;
  if (dataCategory.startsWith("supplier")) {
    const suppliers = await prisma.localContentSupplier.findMany({
      where: { projectId },
      select: { localityClassification: true, localContentPercentage: true },
    });
    completedItems = suppliers.filter(s =>
      s.localityClassification && s.localityClassification !== "unclassified"
    ).length;
  } else if (dataCategory === "workforce") {
    const records = await prisma.localContentWorkforceRecord.findMany({
      where: { projectId },
      select: { status: true },
    });
    completedItems = records.filter(r => r.status === "client_submitted" || r.status === "verified").length;
  }

  const status = completedItems >= request.totalItems ? "completed" : "client_submitted";
  await prisma.localContentMissingDataRequest.update({
    where: { id: request.id },
    data: { completedItems, status },
  });
}
```

### 6.3 Server Actions

```typescript
// EXTEND: Add to src/actions/localcontent-actions.ts

export async function batchClassifySuppliersAction(
  projectId: string,
  classifications: BatchClassificationInput[],
) {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "classify");
    const result = await batchClassifySuppliers(projectId, classifications, {
      id: user.id, name: user.name,
    });
    revalidateLocalContentPaths(projectId, ["suppliers", "classification", "workbook"]);
    return { ok: true, data: result };
  });
}

export async function submitWorkforceDataAction(
  projectId: string,
  records: Array<{ category: string; saudiCount: number; nonSaudiCount: number }>,
) {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_supplier");
    await submitWorkforceData(projectId, records, { id: user.id, name: user.name });
    revalidateLocalContentPaths(projectId, ["workbook"]);
    return { ok: true };
  });
}
```

### 6.4 Route + UI: Batch Classification

```
/local-content/projects/[projectId]/workbook/classify-suppliers
```

**Server component:**
- Fetches unclassified suppliers (sorted by spend descending)
- Shows classification form for top-N by spend

**Client component: `BatchClassificationForm`**
```
┌─────────────────────────────────────────────────────────┐
│ تصنيف الموردين — 50 مورد غير مصنف                       │
│                                                         │
│ الترتيب: الأعلى إنفاقاً                                  │
│                                                         │
│ ┌──────────────────────────────────────────────────┐    │
│ │ #1  مؤسسة عبدالعزيز للتجارة        1,250,000 SAR │    │
│ │     التصنيف: [Local ▼] النسبة: [45] %            │    │
│ │     FSC: [______] GSB: [______]                  │    │
│ │     [📎 رفع شهادة المحتوى المحلي]                 │    │
│ ├──────────────────────────────────────────────────┤    │
│ │ #2  الشركة السعودية للخدمات          890,000 SAR  │    │
│ │     التصنيف: [Mixed ▼] النسبة: [30] %            │    │
│ │     ...                                          │    │
│ └──────────────────────────────────────────────────┘    │
│                                                         │
│ [حفظ التصنيفات]                       متبقي: 48 مورد   │
└─────────────────────────────────────────────────────────┘
```

### 6.5 Route + UI: Workforce Submission

```
/local-content/projects/[projectId]/workbook/workforce
```

**Client component: `WorkforceForm`**
- 35-row table with category, Saudi count, Non-Saudi count
- Total row auto-calculated
- Evidence upload per category (optional)

### 6.6 Audit Events

| Event | Classification |
|-------|---------------|
| `supplier.classified` (bulk) | **MISSING** (single exists) |
| `workforce.submitted` | **MISSING** |
| `missing_data.item_completed` | **MISSING** |

### 6.7 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| `batchClassifySuppliers()` service | **MISSING** | 2 days |
| `submitWorkforceData()` service | **MISSING** | 1 day |
| Server actions | **MISSING** | 0.5 day |
| Batch classification UI | **MISSING** | 3 days |
| Workforce data UI | **MISSING** | 1.5 days |
| **Total** | | **~8 days** |

---

## 7. Step 6: LC Calculation

### 7.1 Current State

**EXISTS — Scoring engine at `src/lib/local-content/scoring.ts`:**
- 4-factor weighted: locality (40) + ownership (25) + workforce (20) + declaredContent (15)
- `calculateFullScoring()` returns composite score + breakdown
- Tier: strong (≥75), moderate (≥50), weak (≥25), critical (<25)

### 7.2 What to Extend

**EXTEND: Add workbook-specific formula alongside existing AQLIYA formula.**

The workbook has its own sub-category structure (suppliers, workforce, CAPEX, capacity building) with different weights. The engine needs:

```typescript
// EXTEND: Add to scoring.ts

export interface WorkbookScoringInput {
  supplierScore: number;       // 0-100: from supplier locality + LC%
  workforceScore: number;      // 0-100: from Saudi/non-Saudi ratio
  capexScore: number;          // 0-100: from CAPEX local content ratio
  capacityBuildingScore: number; // 0-100: from training + development data
  // Weights (workbook-specific, configurable)
  supplierWeight?: number;     // default: 35
  workforceWeight?: number;    // default: 30
  capexWeight?: number;        // default: 20
  capacityBuildingWeight?: number; // default: 15
}

export function calculateWorkbookScore(
  input: WorkbookScoringInput,
): { composite: number; tier: string; subScores: Record<string, number> } {
  const sw = input.supplierWeight ?? 35;
  const ww = input.workforceWeight ?? 30;
  const cw = input.capexWeight ?? 20;
  const cbw = input.capacityBuildingWeight ?? 15;
  const totalWeight = sw + ww + cw + cbw;

  const composite = Math.min(100,
    (input.supplierScore * sw +
     input.workforceScore * ww +
     input.capexScore * cw +
     input.capacityBuildingScore * cbw) / totalWeight
  );

  const tier = composite >= 75 ? "strong"
    : composite >= 50 ? "moderate"
    : composite >= 25 ? "weak"
    : "critical";

  return {
    composite: Math.round(composite * 100) / 100,
    tier,
    subScores: {
      supplier: input.supplierScore,
      workforce: input.workforceScore,
      capex: input.capexScore,
      capacity_building: input.capacityBuildingScore,
    },
  };
}
```

### 7.3 Calculation Orchestration Service

```typescript
// NEW: src/lib/local-content/calculation-service.ts

export async function calculateLocalContentScore(
  projectId: string,
  actor?: { id: string; name: string },
): Promise<{ aqliyaScore: number; workbookScore: number; workbookTier: string }> {
  // 1. Fetch all required data
  const [project, suppliers, spendRecords, workforceRecords] = await Promise.all([
    prisma.localContentProject.findUnique({ where: { id: projectId } }),
    prisma.localContentSupplier.findMany({
      where: { projectId },
      include: { spendRecords: true, classifications: true },
    }),
    prisma.localContentSpendRecord.findMany({ where: { projectId } }),
    prisma.localContentWorkforceRecord.findMany({ where: { projectId } }),
  ]);

  if (!project) throw new Error("Project not found");

  // 2. Calculate AQLIYA internal score (existing)
  const aqliyaResult = calculateFullScoring({
    suppliers,
    spendRecords,
    classifications: suppliers.flatMap(s => s.classifications),
    evidence: [],
    findings: [],
  });

  // 3. Calculate workbook-specific sub-scores

  // Supplier score: weighted average of supplier LC%
  const suppliersWithPct = suppliers.filter(s => s.localContentPercentage != null);
  const supplierScore = suppliersWithPct.length > 0
    ? suppliersWithPct.reduce((s, sp) => s + (sp.localContentPercentage ?? 0), 0) / suppliersWithPct.length
    : 0;

  // Workforce score: Saudi ratio
  const totalSaudi = workforceRecords.reduce((s, r) => s + r.saudiCount, 0);
  const totalNonSaudi = workforceRecords.reduce((s, r) => s + r.nonSaudiCount, 0);
  const totalWorkforce = totalSaudi + totalNonSaudi;
  const workforceScore = totalWorkforce > 0 ? (totalSaudi / totalWorkforce) * 100 : 0;

  // CAPEX score: from suppliers classified as local in capex spend
  const capexSpend = spendRecords.filter(r => r.category === "capex");
  const capexTotal = capexSpend.reduce((s, r) => s + r.amount, 0);
  const capexLocal = capexSpend
    .filter(r => {
      const supplier = suppliers.find(sp => sp.id === r.supplierId);
      return supplier?.localityClassification === "local";
    })
    .reduce((s, r) => s + r.amount, 0);
  const capexScore = capexTotal > 0 ? (capexLocal / capexTotal) * 100 : 0;

  // Capacity building score: default 0 (client-provided data needed)
  const capacityBuildingScore = 0;

  // 4. Compute workbook score
  const workbookResult = calculateWorkbookScore({
    supplierScore,
    workforceScore,
    capexScore,
    capacityBuildingScore,
  });

  // 5. Calculate data completeness
  const totalSuppliers = suppliers.length;
  const classifiedSuppliers = suppliers.filter(s =>
    s.localityClassification && s.localityClassification !== "unclassified"
  ).length;
  const dataCompletenessPct = totalSuppliers > 0
    ? Math.round((classifiedSuppliers / totalSuppliers) * 100)
    : 0;

  // 6. Store calculation result
  await prisma.localContentWorkbookCalculation.create({
    data: {
      projectId,
      organizationId: project.organizationId,
      version: 1,
      calculationType: "workbook_formula",
      supplierScore,
      workforceScore,
      capexScore,
      capacityBuildingScore,
      localContentPct: workbookResult.composite,
      tier: workbookResult.tier,
      dataCompletenessPct,
      autoFillPct: 26, // from V1 Execution Audit
      confidenceLevel: dataCompletenessPct >= 80 ? "high" : dataCompletenessPct >= 50 ? "medium" : "low",
      inputSnapshot: {
        supplierCount: totalSuppliers,
        classifiedSupplierCount: classifiedSuppliers,
        workforceCount: totalWorkforce,
        totalSpend: spendRecords.reduce((s, r) => s + r.amount, 0),
      },
      createdById: actor?.id,
    },
  });

  // 7. Update project
  await prisma.localContentProject.update({
    where: { id: projectId },
    data: {
      localContentScore: workbookResult.composite,
      workbookStatus: "lc_calculated",
    },
  });

  // 8. Audit
  await createLocalContentAuditEvent({
    projectId,
    actorId: actor?.id ?? "system",
    actorName: actor?.name ?? "System",
    action: "lc.calculated",
    entityType: "LocalContentProject",
    entityId: projectId,
    after: JSON.stringify({
      aqliyaScore: aqliyaResult.compositeScore,
      workbookScore: workbookResult.composite,
      workbookTier: workbookResult.tier,
      dataCompletenessPct,
    }),
  });

  return {
    aqliyaScore: aqliyaResult.compositeScore,
    workbookScore: workbookResult.composite,
    workbookTier: workbookResult.tier,
  };
}
```

### 7.4 Server Action

```typescript
// In src/actions/localcontent-actions.ts (EXTEND)
export async function calculateLocalContentScoreAction(projectId: string) {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "admin");
    const result = await calculateLocalContentScore(projectId, {
      id: user.id, name: user.name,
    });
    revalidateLocalContentPaths(projectId, ["reports", "workbook"]);
    return { ok: true, data: result };
  });
}
```

### 7.5 Route + UI

```
/local-content/projects/[projectId]/workbook/calculation
```

**Server component:**
- Shows latest calculation with both scores
- Data completeness indicator
- "Recalculate" button

**Client components:**
- `ScoreComparisonCard` — AQLIYA vs Workbook score side-by-side
- `SubScoreBreakdown` — individual sub-score bars
- `DataCompletenessGauge` — ring/progress showing input completeness

### 7.6 Audit Events

| Event | Classification |
|-------|---------------|
| `lc.calculated` | **MISSING** |

### 7.7 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| `calculateWorkbookScore()` in scoring.ts | **EXTEND** | 0.5 day |
| `calculation-service.ts` orchestration | **MISSING** | 2 days |
| Server action | **MISSING** | 0.5 day |
| Calculation route + UI | **MISSING** | 1 day |
| **Total** | | **~4 days** |

---

## 8. Step 7: Recommendation Generation

### 8.1 Classification

**MISSING — Entirely new engine**

### 8.2 Service: `src/lib/local-content/recommendation-engine.ts`

```typescript
// ============================================================
// LocalContentOS — Recommendation Engine (V1, Rule-Based)
// Generates actionable recommendations to improve LC%.
// No AI — all deterministic arithmetic.
// ============================================================

import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface Recommendation {
  id: string;
  category: "supplier_replacement" | "local_sourcing" | "workforce_localization" | "capex_localization" | "capacity_building";
  titleAr: string;
  descriptionAr: string;
  impact: "high" | "medium" | "low";
  estimatedScoreIncrease: number | null;  // estimated percentage points
  effort: "low" | "medium" | "high";       // implementation effort
  priority: number;                        // 1 = highest
  actionUrl?: string;                      // link to relevant page
}

export interface RecommendationReport {
  projectId: string;
  currentScore: number;
  targetScore: number;
  recommendations: Recommendation[];
  totalPotentialIncrease: number;
  generatedAt: string;
}

// ─── Main Entry Point ───

export async function generateRecommendations(
  projectId: string,
  targetScore: number = 70,  // default: "moderate" threshold
): Promise<RecommendationReport> {
  const [project, suppliers, spendRecords, workforceRecords, latestCalc] = await Promise.all([
    prisma.localContentProject.findUnique({ where: { id: projectId } }),
    prisma.localContentSupplier.findMany({
      where: { projectId },
      include: { spendRecords: true },
    }),
    prisma.localContentSpendRecord.findMany({ where: { projectId } }),
    prisma.localContentWorkforceRecord.findMany({ where: { projectId } }),
    prisma.localContentWorkbookCalculation.findFirst({
      where: { projectId, calculationType: "workbook_formula" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!project) throw new Error("Project not found");
  const currentScore = latestCalc?.localContentPct ?? 0;
  const recommendations: Recommendation[] = [];
  let rank = 0;

  // ─── RECOMMENDATION 1: Supplier Replacement ───
  // Find highest-spend non-local suppliers and suggest local alternatives
  const nonLocalSuppliers = suppliers.filter(
    s => s.localityClassification === "non_local" && s.spendRecords.length > 0,
  );
  const sortedBySpend = nonLocalSuppliers
    .map(s => ({
      supplier: s,
      totalSpend: s.spreadRecords?.reduce((sum, r) => sum + r.amount, 0) ?? 0,
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);

  for (const { supplier, totalSpend } of sortedBySpend.slice(0, 5)) {
    rank++;
    // Estimate: replacing a non-local supplier with local could add 20-40% of its spend to LC%
    const estimatedIncrease = Math.min(
      100 - currentScore,
      (totalSpend / 1_000_000) * 2,  // rough: 2% per 1M SAR replaced
    );

    recommendations.push({
      id: `rec-supplier-${rank}`,
      category: "supplier_replacement",
      titleAr: `استبدال المورد "${supplier.name}" بمورد محلي`,
      descriptionAr: `إجمالي الإنفاق على هذا المورد: ${totalSpend.toLocaleString()} SAR. استبداله بمورد سعودي قد يزيد نسبة المحتوى المحلي بنحو ${estimatedIncrease.toFixed(1)}%.`,
      impact: estimatedIncrease >= 5 ? "high" : estimatedIncrease >= 2 ? "medium" : "low",
      estimatedScoreIncrease: Math.round(estimatedIncrease * 10) / 10,
      effort: "medium",
      priority: rank,
      actionUrl: `/local-content/projects/${projectId}/suppliers?highlight=${supplier.id}`,
    });
  }

  // ─── RECOMMENDATION 2: Local Sourcing Increase ───
  // Find categories with low local sourcing ratio
  const spendByCategory = new Map<string, { total: number; local: number }>();
  for (const record of spendRecords) {
    const cat = record.category;
    if (!spendByCategory.has(cat)) spendByCategory.set(cat, { total: 0, local: 0 });
    const entry = spendByCategory.get(cat)!;
    entry.total += record.amount;
    const supplier = suppliers.find(s => s.id === record.supplierId);
    if (supplier?.localityClassification === "local") {
      entry.local += record.amount;
    }
  }

  for (const [category, data] of spendByCategory) {
    const localRatio = data.total > 0 ? data.local / data.total : 0;
    if (localRatio < 0.5 && data.total > 100_000) {
      rank++;
      const increaseNeeded = 0.5 - localRatio;
      const additionalLocalSpend = data.total * increaseNeeded;
      recommendations.push({
        id: `rec-sourcing-${category}`,
        category: "local_sourcing",
        titleAr: `زيادة المشتريات المحلية في فئة "${category}"`,
        descriptionAr: `نسبة المشتريات المحلية حالياً: ${(localRatio * 100).toFixed(0)}%. زيادة المشتريات المحلية بمبلغ ${additionalLocalSpend.toLocaleString()} SAR قد تحسن درجة المحتوى المحلي.`,
        impact: data.total >= 500_000 ? "high" : "medium",
        estimatedScoreIncrease: Math.round(increaseNeeded * 10 * 10) / 10,
        effort: "medium",
        priority: rank,
      });
    }
  }

  // ─── RECOMMENDATION 3: Workforce Localization ───
  const totalSaudi = workforceRecords.reduce((s, r) => s + r.saudiCount, 0);
  const totalNonSaudi = workforceRecords.reduce((s, r) => s + r.nonSaudiCount, 0);
  const totalWF = totalSaudi + totalNonSaudi;
  const currentSaudiRatio = totalWF > 0 ? totalSaudi / totalWF : 0;

  if (currentSaudiRatio < 0.5 && totalWF > 0) {
    rank++;
    const targetRatio = 0.5;
    const additionalSaudiNeeded = Math.ceil(totalWF * targetRatio - totalSaudi);
    recommendations.push({
      id: "rec-workforce",
      category: "workforce_localization",
      titleAr: "زيادة نسبة التوطين",
      descriptionAr: `نسبة السعوديين حالياً: ${(currentSaudiRatio * 100).toFixed(0)}%. توظيف ${additionalSaudiNeeded} موظف سعودي إضافي قد يرفع درجة القوى العاملة.`,
      impact: "medium",
      estimatedScoreIncrease: Math.round((targetRatio - currentSaudiRatio) * 10 * 10) / 10,
      effort: "high",
      priority: rank,
      actionUrl: `/local-content/projects/${projectId}/workbook/workforce`,
    });
  }

  // ─── RECOMMENDATION 4: CAPEX Localization ───
  const capexSpend = spendRecords.filter(r => r.category === "capex");
  const totalCapex = capexSpend.reduce((s, r) => s + r.amount, 0);
  const localCapex = capexSpend
    .filter(r => {
      const sup = suppliers.find(s => s.id === r.supplierId);
      return sup?.localityClassification === "local";
    })
    .reduce((s, r) => s + r.amount, 0);
  const capexLocalRatio = totalCapex > 0 ? localCapex / totalCapex : 0;

  if (capexLocalRatio < 0.5 && totalCapex > 100_000) {
    rank++;
    recommendations.push({
      id: "rec-capex",
      category: "capex_localization",
      titleAr: "توجيه النفقات الرأسمالية للمنتجين المحليين",
      descriptionAr: `نسبة المشتريات الرأسمالية المحلية: ${(capexLocalRatio * 100).toFixed(0)}%. توجيه النفقات الرأسمالية للمنتجين والمقاولين المحليين لتحسين درجة الأصول.`,
      impact: totalCapex >= 500_000 ? "high" : "medium",
      estimatedScoreIncrease: Math.round((0.5 - capexLocalRatio) * 5 * 10) / 10,
      effort: "medium",
      priority: rank,
    });
  }

  // ─── RECOMMENDATION 5: Capacity Building ───
  // Static recommendation — always shown if score < target
  if (currentScore < targetScore) {
    rank++;
    recommendations.push({
      id: "rec-capacity",
      category: "capacity_building",
      titleAr: "تفعيل برامج تطوير القدرات",
      descriptionAr: "إضافة برامج تدريب وتأهيل للكوادر الوطنية وتوثيقها قد يحسن درجة تطوير القدرات. تشمل البرامج: التدريب على رأس العمل، الابتعاث، الشهادات المهنية.",
      impact: "low",
      estimatedScoreIncrease: 1.5,
      effort: "medium",
      priority: rank,
    });
  }

  // Sort by priority
  recommendations.sort((a, b) => a.priority - b.priority);

  // Estimate total potential increase
  const totalPotentialIncrease = recommendations.reduce(
    (s, r) => s + (r.estimatedScoreIncrease ?? 0),
    0,
  );

  // Audit
  await createLocalContentAuditEvent({
    projectId,
    actorId: "system",
    action: "recommendations.generated",
    entityType: "LocalContentProject",
    entityId: projectId,
    after: JSON.stringify({
      recommendationCount: recommendations.length,
      totalPotentialIncrease,
    }),
    metadata: { targetScore },
  });

  return {
    projectId,
    currentScore,
    targetScore,
    recommendations,
    totalPotentialIncrease: Math.round(totalPotentialIncrease * 10) / 10,
    generatedAt: new Date().toISOString(),
  };
}
```

### 8.3 Server Action

```typescript
// In src/actions/localcontent-actions.ts (EXTEND)
export async function generateRecommendationsAction(
  projectId: string,
  targetScore?: number,
) {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    const report = await generateRecommendations(projectId, targetScore);
    revalidateLocalContentPaths(projectId, ["workbook"]);
    return { ok: true, data: report };
  });
}
```

### 8.4 Route + UI

```
/local-content/projects/[projectId]/workbook/recommendations
```

**Server component:**
- Fetches recommendation report
- Shows target score slider (default 70)
- Priority-ordered recommendation cards
- "Total potential increase" summary

**Client components:**
- `RecommendationCard` — per-recommendation with impact badge
- `TargetScoreSlider` — adjust target, recalculate
- `PotentialIncreaseSummary` — "LC% could increase from 45% to 62%"
- `RecommendationActionButton` — link to relevant action page

### 8.5 Audit Events

| Event | Classification |
|-------|---------------|
| `recommendations.generated` | **MISSING** |

### 8.6 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| `recommendation-engine.ts` service | **MISSING** | 3 days |
| Server action | **MISSING** | 0.5 day |
| Route + UI | **MISSING** | 2 days |
| **Total** | | **~5.5 days** |

---

## 9. Step 8: Simulation

### 9.1 Classification

**MISSING — Entirely new engine**

### 9.2 Service: `src/lib/local-content/simulation-engine.ts`

```typescript
// ============================================================
// LocalContentOS — Simulation Engine (V1, What-If Analysis)
// Allows users to modify inputs and see projected LC% impact.
// ============================================================

import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface SimulationInput {
  // Supplier modifications
  supplierChanges?: Array<{
    supplierId: string;
    newLocalityClassification?: "local" | "non_local" | "mixed" | "unclassified";
    newLocalContentPercentage?: number;
    newSpendAmount?: number;
  }>;
  // New hypothetical supplier
  newSuppliers?: Array<{
    name: string;
    localityClassification: "local" | "non_local" | "mixed";
    localContentPercentage: number;
    spendAmount: number;
  }>;
  // Workforce modifications
  workforceChanges?: {
    newSaudiCount?: number;
    newNonSaudiCount?: number;
  };
  // Target score (reverse-engineer)
  targetScore?: number;
}

export interface SimulationResult {
  currentScore: number;
  projectedScore: number;
  delta: number;
  deltaPercent: number;
  subScoreChanges: Record<string, { before: number; after: number; delta: number }>;
  confidence: "high" | "medium" | "low";
}

// ─── Main Entry Point ───

export async function runSimulation(
  projectId: string,
  input: SimulationInput,
): Promise<SimulationResult> {
  // 1. Fetch current data
  const [suppliers, spendRecords, workforceRecords, latestCalc] = await Promise.all([
    prisma.localContentSupplier.findMany({
      where: { projectId },
      include: { spendRecords: true },
    }),
    prisma.localContentSpendRecord.findMany({ where: { projectId } }),
    prisma.localContentWorkforceRecord.findMany({ where: { projectId } }),
    prisma.localContentWorkbookCalculation.findFirst({
      where: { projectId, calculationType: "workbook_formula" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const currentScore = latestCalc?.localContentPct ?? 0;

  // 2. Clone data and apply modifications
  const modifiedSuppliers = suppliers.map(s => {
    const change = input.supplierChanges?.find(c => c.supplierId === s.id);
    if (!change) return s;
    return {
      ...s,
      localityClassification: change.newLocalityClassification ?? s.localityClassification,
      localContentPercentage: change.newLocalContentPercentage ?? s.localContentPercentage,
    };
  });

  // Add new suppliers
  for (const ns of input.newSuppliers ?? []) {
    modifiedSuppliers.push({
      id: `hypothetical-${Date.now()}-${Math.random()}`,
      projectId,
      name: ns.name,
      localityClassification: ns.localityClassification,
      localContentPercentage: ns.localContentPercentage,
      crNumber: null,
      ownershipType: null,
      workforceLocalPct: null,
      fscCode: null,
      gsbCode: null,
      gsbCurrencyCode: null,
      status: "active",
      metadata: null,
      createdById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      project: null!,
      classifications: [],
      evidenceItems: [],
      spendRecords: [{
        id: `hyp-spend-${Date.now()}`,
        projectId,
        supplierId: `hypothetical-${Date.now()}`,
        amount: ns.spendAmount,
        currency: "SAR",
        category: "goods_services",
        contractReference: null,
        period: null,
        description: `محاكاة: ${ns.name}`,
        supplier: null!,
        project: null!,
        classifications: [],
        localContentEvidences: [],
        createdById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
    });
  }

  // Apply spend modifications
  const modifiedSpendRecords = spendRecords.map(r => {
    const supplierChange = input.supplierChanges?.find(c => c.supplierId === r.supplierId);
    if (supplierChange?.newSpendAmount != null) {
      return { ...r, amount: supplierChange.newSpendAmount };
    }
    return r;
  });

  // 3. Recalculate scores with modified data

  // Supplier score
  const suppliersWithPct = modifiedSuppliers.filter(s => s.localContentPercentage != null);
  const supplierScore = suppliersWithPct.length > 0
    ? suppliersWithPct.reduce((s, sp) => s + (sp.localContentPercentage ?? 0), 0) / suppliersWithPct.length
    : 0;

  // Workforce score
  const workforceSaudi = input.workforceChanges?.newSaudiCount
    ?? latestCalc?.inputSnapshot
    ? JSON.parse(JSON.stringify(latestCalc.inputSnapshot)).workforceCount * 0.3
    : 0;
  // Simplified — real implementation would use actual workforce records

  // CAPEX score — recalculated with modified supplier classifications
  const capexSpend = modifiedSpendRecords.filter(r => r.category === "capex");
  const capexTotal = capexSpend.reduce((s, r) => s + r.amount, 0);
  const capexLocal = capexSpend
    .filter(r => {
      const supplier = modifiedSuppliers.find(s => s.id === r.supplierId);
      return supplier?.localityClassification === "local";
    })
    .reduce((s, r) => s + r.amount, 0);
  const capexScore = capexTotal > 0 ? (capexLocal / capexTotal) * 100 : 0;

  // Compute projected score
  const projectedScore = Math.min(100,
    (supplierScore * 35 + (workforceSaudi > 0 ? Math.min(100, workforceSaudi * 2) : 0) * 30 + capexScore * 20) / 100
  );

  const delta = projectedScore - currentScore;

  return {
    currentScore,
    projectedScore: Math.round(projectedScore * 100) / 100,
    delta: Math.round(delta * 100) / 100,
    deltaPercent: currentScore > 0 ? Math.round((delta / currentScore) * 10000) / 100 : 0,
    subScoreChanges: {
      supplier: {
        before: latestCalc?.supplierScore ?? 0,
        after: Math.round(supplierScore * 100) / 100,
        delta: Math.round((supplierScore - (latestCalc?.supplierScore ?? 0)) * 100) / 100,
      },
      workforce: {
        before: latestCalc?.workforceScore ?? 0,
        after: workforceSaudi > 0 ? Math.min(100, workforceSaudi * 2) : 0,
        delta: 0,
      },
      capex: {
        before: latestCalc?.capexScore ?? 0,
        after: Math.round(capexScore * 100) / 100,
        delta: Math.round((capexScore - (latestCalc?.capexScore ?? 0)) * 100) / 100,
      },
    },
    confidence: input.supplierChanges?.length ? "medium" : "low",
  };
}

export async function saveScenario(
  projectId: string,
  name: string,
  description: string | undefined,
  input: SimulationInput,
  result: SimulationResult,
  actor?: { id: string; name: string },
): Promise<void> {
  await prisma.localContentScenario.create({
    data: {
      projectId,
      organizationId: "", // resolved
      name,
      description,
      modifications: input as any,
      baselineScore: result.currentScore,
      scenarioScore: result.projectedScore,
      scoreDelta: result.delta,
      status: "saved",
      createdById: actor?.id,
    },
  });
}

export async function listScenarios(projectId: string) {
  return prisma.localContentScenario.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, description: true,
      baselineScore: true, scenarioScore: true, scoreDelta: true,
      status: true, createdAt: true,
    },
  });
}
```

### 9.3 Server Actions

```typescript
// In src/actions/localcontent-actions.ts (EXTEND)
export async function runSimulationAction(projectId: string, input: SimulationInput) {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    const result = await runSimulation(projectId, input);
    return { ok: true, data: result };
  });
}

export async function saveScenarioAction(
  projectId: string,
  name: string,
  description: string | undefined,
  input: SimulationInput,
  result: SimulationResult,
) {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "admin");
    await saveScenario(projectId, name, description, input, result, {
      id: user.id, name: user.name,
    });
    revalidateLocalContentPaths(projectId, ["workbook"]);
    return { ok: true };
  });
}

export async function listScenariosAction(projectId: string) {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    const scenarios = await listScenarios(projectId);
    return { ok: true, data: scenarios };
  });
}
```

### 9.4 Route + UI

```
/local-content/projects/[projectId]/workbook/simulation
```

**Server component:**
- Fetches current score and saved scenarios
- Simulation form

**Client components:**
- `SimulationForm` — modify suppliers, workforce, add hypothetical
- `ScoreComparisonChart` — before/after bar chart
- `SubScoreDeltaTable` — per-sub-score breakdown
- `SavedScenarioList` — previously saved scenarios
- `SaveScenarioButton` — save current simulation

### 9.5 Audit Events

| Event | Classification |
|-------|---------------|
| `simulation.run` | **MISSING** |
| `scenario.saved` | **MISSING** |
| `scenario.deleted` | **MISSING** |

### 9.6 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| `simulation-engine.ts` service | **MISSING** | 3 days |
| Server actions | **MISSING** | 0.5 day |
| Route + UI | **MISSING** | 2.5 days |
| **Total** | | **~6 days** |

---

## 10. Route Map

### 10.1 New Routes

All under the existing `/local-content/projects/[projectId]` namespace:

| Route | Purpose | Step | Type |
|-------|---------|------|------|
| `/workbook` | Workbook population dashboard | 3 | Server + Client |
| `/workbook/missing-data` | Missing data collection requests | 4 | Server + Client |
| `/workbook/classify-suppliers` | Batch supplier classification | 5 | Server + Client |
| `/workbook/workforce` | Workforce data submission | 5 | Server + Client |
| `/workbook/calculation` | LC% calculation results | 6 | Server + Client |
| `/workbook/recommendations` | Recommendation report | 7 | Server + Client |
| `/workbook/simulation` | What-if simulation | 8 | Server + Client |

### 10.2 Route File Structure

```
src/app/local-content/projects/[projectId]/workbook/
├── page.tsx                              ← Workbook dashboard
├── loading.tsx
├── error.tsx
├── layout.tsx                            ← Workbook-specific sub-navigation
├── missing-data/
│   └── page.tsx
├── classify-suppliers/
│   └── page.tsx
├── workforce/
│   └── page.tsx
├── calculation/
│   └── page.tsx
├── recommendations/
│   └── page.tsx
└── simulation/
    └── page.tsx
```

### 10.3 Sidebar Navigation

Add workbook tab to the existing project sidebar navigation. Following the existing tab pattern in `engagement-tabs.tsx`:

```typescript
// New: src/components/local-content/workbook-tabs.tsx
const WORKBOOK_TABS = [
  { key: "workbook", label: "نموذج المحتوى المحلي", icon: FileSpreadsheet },
  { key: "workbook/missing-data", label: "البيانات المطلوبة", icon: ClipboardList },
  { key: "workbook/classify-suppliers", label: "تصنيف الموردين", icon: Tags },
  { key: "workbook/workforce", label: "القوى العاملة", icon: Users },
  { key: "workbook/calculation", label: "نسبة المحتوى المحلي", icon: Calculator },
  { key: "workbook/recommendations", label: "التوصيات", icon: Lightbulb },
  { key: "workbook/simulation", label: "محاكاة", icon: GitCompare },
];
```

### 10.4 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| Route files (7 routes) | **MISSING** | 1 day |
| Layout + sidebar | **MISSING** | 1 day |
| Loading/error states | **MISSING** | 0.5 day |
| **Total** | | **~2.5 days** |

---

## 11. State Transitions

### 11.1 Workbook Status State Machine

```
pending_tb ───→ tb_uploaded ───→ fs_built ───→ workbook_populated ───→ awaiting_client_data ───→ client_data_submitted ───→ lc_calculated ───→ recommendations_generated ───→ completed
                     │                │               │                        │                        │
                     │                │               │                        │                        │
                     └── (TB upload   └── (FS auto    └── (Missing data        └── (Client submits      └── (Recalculation)
                        links project)    rebuild)        requests generated)      classifications)
```

| From | To | Trigger |
|------|----|---------|
| `pending_tb` | `tb_uploaded` | TB uploaded to linked engagement |
| `tb_uploaded` | `fs_built` | FS rebuilt from confirmed mappings |
| `fs_built` | `workbook_populated` | Workbook population service completes |
| `workbook_populated` | `awaiting_client_data` | Missing data requests generated |
| `awaiting_client_data` | `awaiting_client_data` | Client submits partial data |
| `awaiting_client_data` | `client_data_submitted` | All high-priority data submitted |
| `client_data_submitted` | `lc_calculated` | LC calculation run |
| `lc_calculated` | `recommendations_generated` | Recommendation engine run |
| `recommendations_generated` | `completed` | Workbook finalized |
| Any | `workbook_populated` | Re-population triggered (new TB upload) |

### 11.2 Implementation: Workflow Gate

Following the AuditOS pattern (`workflow-gating.ts`):

```typescript
// NEW: src/lib/local-content/workflow-gating.ts

export interface WorkbookContext {
  workbookStatus: string;
  hasTb: boolean;
  hasFs: boolean;
  hasWorkbookData: boolean;
  hasMissingDataRequests: boolean;
  hasClientData: boolean;
  hasCalculation: boolean;
  hasRecommendations: boolean;
}

type TabGate = (ctx: WorkbookContext) => { locked: boolean; reason?: string };

const workbookGates: Record<string, TabGate> = {
  workbook: () => ({ locked: false }),
  "missing-data": (ctx) => ctx.hasWorkbookData
    ? { locked: false }
    : { locked: true, reason: "اكتمل تعبئة النموذج أولاً." },
  "classify-suppliers": (ctx) => ctx.hasWorkbookData
    ? { locked: false }
    : { locked: true, reason: "اكتمل تعبئة النموذج أولاً." },
  workforce: (ctx) => ctx.hasWorkbookData
    ? { locked: false }
    : { locked: true, reason: "اكتمل تعبئة النموذج أولاً." },
  calculation: (ctx) => ctx.hasClientData
    ? { locked: false }
    : { locked: true, reason: "أكمل بيانات العميل أولاً." },
  recommendations: (ctx) => ctx.hasCalculation
    ? { locked: false }
    : { locked: true, reason: "احسب النتيجة أولاً." },
  simulation: (ctx) => ctx.hasCalculation
    ? { locked: false }
    : { locked: true, reason: "احسب النتيجة أولاً." },
};

export function evaluateWorkbookGate(tabKey: string, ctx: WorkbookContext) {
  const gate = workbookGates[tabKey];
  if (!gate) return { locked: false };
  return gate(ctx);
}
```

### 11.3 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| `workflow-gating.ts` | **MISSING** | 0.5 day |
| **Total** | | **~0.5 day** |

---

## 12. Audit Event Catalog

### 12.1 New Event Constants

Add to `AuditActions` in `src/lib/local-content/audit-events.ts`:

```typescript
// EXTEND: Add to existing AuditActions

// Workbook population
WORKBOOK_POPULATED: "workbook.populated",
WORKBOOK_POPULATION_FAILED: "workbook.population_failed",
WORKBOOK_REPOPULATED: "workbook.repopulated",

// Missing data
MISSING_DATA_REQUESTS_GENERATED: "missing_data.requests_generated",
MISSING_DATA_REQUEST_UPDATED: "missing_data.request_updated",
MISSING_DATA_ITEM_COMPLETED: "missing_data.item_completed",

// Supplier classification
SUPPLIER_CLASSIFIED: "supplier.classified",     // single (enum already exists for created)
SUPPLIER_BATCH_CLASSIFIED: "supplier.batch_classified",

// Workforce
WORKFORCE_SUBMITTED: "workforce.submitted",
WORKFORCE_VERIFIED: "workforce.verified",

// TB/FS links
TB_LINKED: "localcontent.tb_linked",
FS_LINKED: "localcontent.fs_linked",

// LC Calculation
LC_CALCULATED: "lc.calculated",
LC_RECALCULATED: "lc.recalculated",

// Recommendations
RECOMMENDATIONS_GENERATED: "recommendations.generated",

// Simulation
SIMULATION_RUN: "simulation.run",
SCENARIO_SAVED: "scenario.saved",
SCENARIO_DELETED: "scenario.deleted",

// Export (extend existing)
WORKBOOK_EXPORTED: "workbook.exported",
```

### 12.2 Event Specification

| Event | When | Fields |
|-------|------|--------|
| `workbook.populated` | After workbook population completes | `after`: supplier count, spend count |
| `missing_data.requests_generated` | After missing data analysis | `after`: request count, completion % |
| `supplier.batch_classified` | After batch classification | `after`: count classified, method |
| `workforce.submitted` | After workforce data submission | `after`: record count |
| `lc.calculated` | After LC% calculation | `after`: workbook score, tier, completeness |
| `recommendations.generated` | After recommendation generation | `after`: count, potential increase |
| `simulation.run` | After simulation | `after`: delta, confidence |
| `scenario.saved` | After scenario save | `after`: name, delta |

### 12.3 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| Audit event constants | **EXTEND** | 0.25 day |
| Event calls in services | **MISSING** (covered in each service) | (included in service effort) |
| **Total** | | **~0.25 day** |

---

## 13. UI Screen Map

### 13.1 Screen Inventory

| Screen | Route | Components Required | UX Description |
|--------|-------|-------------------|----------------|
| **Workbook Dashboard** | `/workbook` | `WorkbookPopulationButton`, `WorkbookSummaryCards`, `WorkbookSheetTable`, `WorkbookStatusTimeline` | Shows workbook state, population progress, per-sheet breakdown. Button to trigger population. |
| **Missing Data Overview** | `/workbook/missing-data` | `MissingDataOverview`, `MissingDataCategoryCard`, `MissingDataActionButton`, `CompletenessGauge` | Priority-ordered list of data categories. Each card shows name, completeness %, status. Action button navigates to submission screen. |
| **Batch Classification** | `/workbook/classify-suppliers` | `BatchClassificationForm`, `SupplierClassificationRow`, `EvidenceUploadButton`, `ClassificationProgress`, `TopSuppliersSummary` | Table of suppliers sorted by spend descending. Each row: supplier name, amount, classification dropdown, LC% input, FSC/GSB inputs, evidence upload. Save button submits batch. |
| **Workforce Data** | `/workbook/workforce` | `WorkforceForm`, `WorkforceRow`, `WorkforceTotals`, `EvidenceUploadButton` | 35-category table. Each row: category name (Arabic), Saudi count, Non-Saudi count. Total row auto-calculated. Evidence upload per row. |
| **Calculation Results** | `/workbook/calculation` | `ScoreComparisonCard`, `SubScoreBreakdown`, `DataCompletenessGauge`, `CalculationHistory`, `RecalculateButton` | Side-by-side AQLIYA vs Workbook scores. Sub-score bars. Data completeness gauge. History of previous calculations. |
| **Recommendations** | `/workbook/recommendations` | `TargetScoreSlider`, `RecommendationCard`, `PotentialIncreaseSummary`, `RecommendationActionButton` | Target score slider (default 70). Priority-ordered recommendation cards. Each card: title, description, impact badge, estimated score increase, action link. |
| **Simulation** | `/workbook/simulation` | `SimulationForm`, `SupplierChangeRow`, `AddSupplierForm`, `WorkforceSlider`, `ScoreComparisonChart`, `SubScoreDeltaTable`, `SavedScenarioList`, `SaveScenarioButton` | Current score display. Modify suppliers (locality, LC%, spend). Add hypothetical suppliers. Workforce sliders. Run button shows before/after chart. Save scenario. View saved scenarios list. |

### 13.2 Existing Components to Leverage

| Existing Component | Reuse For |
|-------------------|-----------|
| `DashboardLayout` | All workbook screens — provides consistent RTL layout |
| `PageHeader` | All workbook screens — consistent header pattern |
| `LocalContentStatusBadge` | Workbook status display |
| `DevPhaseBadge` | Development phase indicator |
| `InlineNotice` | Info/warning/error banners |
| `EmptyState` | Empty data states |
| `ProjectCard` | Project-level navigation |
| `LocalContentDeleteButton` | Delete functionality if needed |
| Existing supplier form patterns | Batch classification row |
| Existing evidence upload patterns | Evidence upload per supplier/workforce |

### 13.3 Effort

| Component | Status | Effort |
|-----------|--------|--------|
| Workbook dashboard UI | **MISSING** | 2 days |
| Missing data UI | **MISSING** | 1.5 days |
| Batch classification UI | **MISSING** | 3 days |
| Workforce form UI | **MISSING** | 1.5 days |
| Calculation results UI | **MISSING** | 1 day |
| Recommendations UI | **MISSING** | 2 days |
| Simulation UI | **MISSING** | 2.5 days |
| **Total UI** | | **~13.5 days** |

---

## 14. Build Order

### 14.1 Dependency Graph

```
Step 1: TB Upload (1.75d)
  │
  ▼
Step 2: FS Build (0.5d)
  │
  ▼
Step 3: Workbook Population (6.75d) ◄── Prisma models + migrations (4d)
  │
  ▼
Step 4: Missing Data Request (5d)
  │
  ▼
Step 5: Client Submission (8d)
  │
  ▼
Step 6: LC Calculation (4d)
  │
  ▼
Step 7: Recommendation Generation (5.5d)
  │
  ▼
Step 8: Simulation (6d)
```

Plus cross-cutting:
- Route files (2.5d)
- Workflow gating (0.5d)
- Audit events (0.25d, distributed)
- UI screens (13.5d)

### 14.2 Recommended Build Phases

#### Phase 1: Foundation (Weeks 1-2)

| Priority | Item | Effort |
|----------|------|--------|
| 1 | Prisma models + migrations | 4 days |
| 2 | Route files + layout | 2.5 days |
| 3 | Step 1: TB Upload extension | 1.75 days |
| 4 | Step 2: FS Build extension | 0.5 days |
| 5 | Workflow gating | 0.5 days |

**Milestone:** TB → FS pipeline linked to LC projects. Routes exist.

#### Phase 2: Core Value (Weeks 3-4)

| Priority | Item | Effort |
|----------|------|--------|
| 6 | Step 3: Workbook Population service | 3 days |
| 7 | Step 3: Workbook Population UI | 3.75 days |
| 8 | Step 4: Missing Data Request service | 2 days |
| 9 | Step 4: Missing Data Request UI | 3 days |

**Milestone:** TB → FS → Workbook Population → Missing Data Collection. The "auto-fill" value proposition is live.

#### Phase 3: Client Interaction (Weeks 5-6)

| Priority | Item | Effort |
|----------|------|--------|
| 10 | Step 5: Batch classification service | 3 days |
| 11 | Step 5: Batch classification UI | 3 days |
| 12 | Step 5: Workforce submission + UI | 2 days |

**Milestone:** Client can submit supplier classifications and workforce data. Missing data engine tracks progress.

#### Phase 4: Intelligence (Weeks 7-8)

| Priority | Item | Effort |
|----------|------|--------|
| 13 | Step 6: LC Calculation extension | 1 day |
| 14 | Step 6: Calculation orchestration + UI | 3 days |
| 15 | Step 7: Recommendation Engine + UI | 5.5 days |
| 16 | Step 8: Simulation Engine + UI | 6 days |

**Milestone:** Full pipeline complete. Client can get LC%, see recommendations, and run what-if simulations.

### 14.3 Total Effort Summary

| Step | Status | Effort (days) |
|------|--------|---------------|
| Prisma models | **MISSING** | 4 |
| Routes + layout | **MISSING** | 2.5 |
| Workflow gating | **MISSING** | 0.5 |
| 1. TB Upload | **EXTEND** | 1.75 |
| 2. FS Build | **EXTEND** | 0.5 |
| 3. Workbook Population | **MISSING** | 6.75 |
| 4. Missing Data Request | **MISSING** | 5 |
| 5. Client Submission | **MISSING** (batch) / **EXTEND** (single) | 8 |
| 6. LC Calculation | **EXTEND** | 4 |
| 7. Recommendation Generation | **MISSING** | 5.5 |
| 8. Simulation | **MISSING** | 6 |
| UI screens (cross-cutting) | **MISSING** | 13.5 |
| Audit events | **EXTEND** | 0.25 |
| **Total** | | **~58 days (~12 weeks)** |

### 14.4 Classification Summary

| Component | Count |
|-----------|-------|
| ✅ EXISTS | TB upload, FS rebuild, IFRS/SOCPA rules, Notes auto, Scoring engine, Supplier CRUD, Evidence management |
| ⚠️ EXTEND | TB→LC bridge hook, FS→LC hook, Scoring (workbook formula), Supplier (FSC/GSB fields), Project (workbookStatus), Audit event constants |
| ❌ MISSING | Workbook population service, Missing data engine, Batch classification service, Workforce submission, Calculation orchestration, Recommendation engine, Simulation engine, All new UI screens, All new routes, 4 new Prisma models |

---

*End of Workflow Design Document*
