# LC-SPEC-02a: Domain Specification — Supplier & Spend Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Domain Specification — retroactive alignment documenting the Supplier and Spend aggregates, value objects, domain events, invariants, and domain services for LocalContentOS Supplier & Spend Management.
> **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1 (Draft)
> **Template:** LC-SPEC-01a (Golden Reference) — IES-001 Reference
> **Note:** All types and behavior documented here reflect the existing implementation in `src/lib/local-content/`. No new design.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | `LC-PRD-02_Supplier_Spend_Management.md` v0.1 |
| **Blocks** | LC-SPEC-02b (API), LC-SPEC-02c (Workflow), LC-SPEC-02e (Test) |
| **Consumer** | Domain Engineering Team |
| **Evidence Classification** | Executable Evidence — all types trace to existing code |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Supplier/Spend domain definition | LC-PRD-02 | §6 (FR-01, FR-02), §10 (Data Model) |
| Domain rules | LC-PRD-02 | §7 (DR-01 to DR-06) |
| Prisma models | `schema.prisma` | `LocalContentSupplier`, `LocalContentSpendRecord` |
| Domain types | `types.ts` | `CreateSupplierInput`, `CreateSpendRecordInput` |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| Supplier aggregate contract | Core type with invariants, factory, and validation | LC-SPEC-02b, LC-SPEC-02c |
| SpendRecord aggregate contract | Core type with invariants and factory | LC-SPEC-02b, LC-SPEC-02c |
| Value object definitions | SupplierLocality, OwnershipType, SpendCategory, ImportResult | LC-SPEC-02b |
| Domain event interfaces | SupplierCreated, SpendImported, SpendClassified | LC-SPEC-02b, LC-SPEC-02e |
| Import engine contract | CSV parse → validate → result | LC-SPEC-02b |

---

# 1. Aggregate: Supplier

## 1.1 Aggregate Definition

The **Supplier** is an entity owned by the Project Aggregate. It represents a vendor/supplier registered for local content evaluation.

```
Project (Aggregate Root)
  │
  └── Supplier (Entity — owned, cascade delete)
        │
        ├── SpendRecord[] (owned — cascade delete)
        ├── Classification[] (owned — cascade delete)
        └── Evidence[] (owned — cascade delete)
```

**Rules:**
- Supplier must belong to exactly one Project
- Deleting a Project cascades to all its Suppliers
- Supplier status transitions are free-form (`active`, `inactive`, `under_review`)

## 1.2 Supplier Interface

```typescript
// From: Prisma schema LocalContentSupplier
interface Supplier {
  id: string;
  projectId: string;
  name: string;
  crNumber?: string;
  localityClassification?: SupplierLocality;   // local, non_local, mixed, unclassified
  localContentPercentage?: number;             // 0-100
  ownershipType?: OwnershipType;               // Saudi, foreign, joint_venture
  workforceLocalPct?: number;                  // 0-100
  status: string;                              // active, inactive, under_review
  metadata?: Record<string, unknown>;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Related entities
  spendRecords: SpendRecord[];
  classifications: Classification[];
  evidenceItems: Evidence[];
}
```

### Factory

```typescript
// From: services.ts — createSupplier()
function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  // Validates locality, ownership
  // Creates audit event: SUPPLIER_CREATED
  // Returns created supplier
}
```

### Reconstitution

```typescript
// From: services.ts — listSuppliers()
function listSuppliers(projectId: string): Promise<Supplier[]>
  // Guard: via parent project access
```

## 1.3 Invariants

| ID | Invariant | Enforcement |
|---|---|---|
| SI-01 | Supplier must belong to a valid Project | `projectId` foreign key |
| SI-02 | Supplier name is required | Prisma required field |
| SI-03 | localityClassification must be valid enum value | `validateSupplierLocality()` |
| SI-04 | ownershipType must be valid enum value | `validateOwnershipType()` |
| SI-05 | localContentPercentage must be 0-100 | `validatePercentage()` |
| SI-06 | workforceLocalPct must be 0-100 | `validatePercentage()` |
| SI-07 | Tenant isolation via project's organization | `requireProjectAccess(projectId)` chain |

---

# 2. Aggregate: SpendRecord

## 2.1 Aggregate Definition

The **SpendRecord** is an entity owned by the Project Aggregate, with a required reference to a Supplier.

```
Project (Aggregate Root)
  │
  ├── Supplier (Entity)
  │     │
  │     └── SpendRecord (Entity — owned)
  │           │
  │           ├── Classification[] (owned)
  │           └── Evidence[] (owned)
  │
  └── (SpendRecord can also be accessed directly via project)
```

**Rules:**
- SpendRecord must reference both a Project and a Supplier
- Deleting a Project cascades to all SpendRecords
- SpendRecord amount must be positive

## 2.2 SpendRecord Interface

```typescript
interface SpendRecord {
  id: string;
  projectId: string;
  supplierId: string;
  amount: number;                    // Must be > 0
  currency: string;                  // Default "SAR"
  category: string;                  // goods, services, construction, technology, logistics, other
  contractReference?: string;
  period: string;                    // e.g., "2026-H1"
  description?: string;
  metadata?: Record<string, unknown>;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Related entities
  classifications: Classification[];
  evidenceItems: Evidence[];
}
```

### Factory

```typescript
// From: services.ts — createSpendRecord()
function createSpendRecord(input: CreateSpendRecordInput): Promise<SpendRecord> {
  // Validates amount > 0
  // Links to existing Supplier via supplierId
  // Creates audit event: SPEND_CREATED
}
```

## 2.3 Invariants

| ID | Invariant | Enforcement |
|---|---|---|
| SPI-01 | SpendRecord must reference a valid Supplier | Prisma foreign key |
| SPI-02 | Spend amount must be positive | `validatePositiveNumber()` |
| SPI-03 | Spend must belong to a Project | `projectId` foreign key |
| SPI-04 | Tenant isolation via project's organization | `requireProjectAccess(projectId)` chain |

---

# 3. Value Objects

## 3.1 SupplierLocality

```typescript
const VALID_SUPPLIER_LOCALITIES = [
  "local",
  "non_local",
  "mixed",
  "unclassified",
] as const;
type SupplierLocality = typeof VALID_SUPPLIER_LOCALITIES[number];
```

**Rules:**
- Must be one of 4 valid values
- Classification is manual or rule-based (not AI)
- Used as input to scoring engine (locality weight = 40 points)

## 3.2 OwnershipType

```typescript
const VALID_OWNERSHIP_TYPES = [
  "Saudi",
  "foreign",
  "joint_venture",
] as const;
type OwnershipType = typeof VALID_OWNERSHIP_TYPES[number];
```

**Rules:**
- Must be one of 3 valid values
- Used as input to scoring engine (ownership weight = 25 points)

## 3.3 SpendCategory

```typescript
// From Prisma schema comment: goods, services, construction, technology, logistics, other
type SpendCategory = "goods" | "services" | "construction" | "technology" | "logistics" | "other";
```

**Rules:**
- Free-form string in current implementation
- Used for spend analytics breakdown

## 3.4 ImportResult

```typescript
interface ImportResult {
  validRows: ValidImportRow[];    // Successfully parsed rows
  rejectedRows: RejectedRow[];    // Rows that failed validation
  summary: {
    total: number;
    valid: number;
    rejected: number;
  };
}

interface ValidImportRow {
  rowNumber: number;
  supplierName: string;
  amount: number;
  category: string;
  period: string;
  currency: string;
  contractReference?: string;
  description?: string;
  supplierRegistrationNumber?: string;
}

interface RejectedRow {
  rowNumber: number;
  reason: string;                // Human-readable rejection reason
  raw: Record<string, string>;   // Original row data for correction
}
```

---

# 4. Domain Events

| Domain Event | AuditAction Constant | Payload |
|---|---|---|
| SupplierCreated | `AuditActions.SUPPLIER_CREATED` | `{ name, localityClassification }` |
| SupplierUpdated | `AuditActions.SUPPLIER_UPDATED` | `{ from: {...}, to: {...} }` |
| SpendCreated | `AuditActions.SPEND_CREATED` | `{ amount, category }` |
| SpendImported | `AuditActions.SPEND_IMPORTED` | `{ valid, rejected }` |
| SpendClassified | `AuditActions.SPEND_CLASSIFIED` | `{ category, before, after }` |

All events follow the dual-write strategy: product-scoped `localContentAuditEvent` + platform-scoped `PlatformAuditLog` + hash chain.

---

# 5. Domain Error Model

| Error | Code | When |
|---|---|---|
| `ProjectAccessError` | `FORBIDDEN` | Cross-tenant supplier/spend access |
| `ProjectAccessError` | `NOT_FOUND` | Project does not exist |
| Validation error | — | Invalid locality, ownership, amount |
| Prisma foreign key error | — | Invalid supplierId reference |

---

# 6. Repository Interface

```typescript
interface SupplierRepository {
  findByProject(projectId: string): Promise<Supplier[]>;
  create(input: CreateSupplierInput): Promise<Supplier>;
  update(id: string, data: Partial<Supplier>): Promise<Supplier>;
  delete(id: string): Promise<void>;
}

interface SpendRecordRepository {
  findByProject(projectId: string): Promise<SpendRecord[]>;
  create(input: CreateSpendRecordInput): Promise<SpendRecord>;
  delete(id: string): Promise<void>;
  bulkCreate(records: CreateSpendRecordInput[]): Promise<SpendRecord[]>;
}

interface ImportService {
  parseCSV(csvText: string): ImportResult;
}
```

---

# 7. Domain Services

```typescript
interface SupplierDomainService {
  listSuppliers(projectId: string): Promise<Supplier[]>;
  createSupplier(input: CreateSupplierInput): Promise<Supplier>;
  deleteSupplier(projectId: string, supplierId: string): Promise<void>;
}

interface SpendDomainService {
  listSpendRecords(projectId: string): Promise<SpendRecord[]>;
  createSpendRecord(input: CreateSpendRecordInput): Promise<SpendRecord>;
  importSpendCSV(projectId: string, csvText: string): Promise<ImportResult>;
  classifySpendRecord(spendId: string, classification: ClassifyInput): Promise<SpendRecord>;
  getSpendAnalytics(organizationId: string): Promise<SpendAnalytics>;
}
```

---

# Traceability

| SPEC Element | PRD Reference | Code Evidence | Evidence Classification |
|---|---|---|---|
| Supplier Aggregate (§1) | §6 (FR-01) | `services.ts` — createSupplier, listSuppliers | Executable |
| SpendRecord Aggregate (§2) | §6 (FR-02) | `services.ts` — createSpendRecord, listSpendRecords | Executable |
| Value Objects (§3) | §7 (DR-01, DR-02) | `types.ts` — VALID_SUPPLIER_LOCALITIES, etc. | Executable |
| Domain Events (§4) | §7 (DR-06) | `audit-events.ts` — AuditActions | Executable |
| Import Engine (§3.4) | §6 (FR-03) | `import.ts` — parseLocalContentCSV | Executable |
| Domain Errors (§5) | §7 (DR-04) | `guards.ts`, `localcontent-guards.ts` | Executable |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Full Supplier + Spend CRUD, CSV import, analytics in existing codebase |
| **Documented** | ✅ This specification retroactively describes the existing domain model |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Domain Specification — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1
- **Program:** LIA-001 (LC-EPIC-02)
- **Status:** **Draft v0.1** — ready for review
- **Next:** LC-SPEC-02b (API Specification)
