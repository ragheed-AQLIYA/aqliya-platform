# AuditOS — Architecture Guards

## Identity

- **AQLIYA** is the company/platform identity.
- **AuditOS** is the current flagship product (Financial Intelligence).
- **Decision OS** is a separate adjacent product (Tender Decisions).

## Product Separation

| Product | Route Prefix | Purpose |
|---------|-------------|---------|
| AuditOS | `/audit` | Audit preparation, financial statements, notes, evidence, review, approval |
| DecisionOS | `/`, `/(dashboard)/` | Tender decision workflows, recommendations, approvals |

## Guard Rules

### 1. Do Not Mix AuditOS and Decision OS Logic

- `src/lib/audit/` belongs to AuditOS only.
- `src/lib/platform-audit.ts` belongs to Decision OS only.
- `src/app/audit/` belongs to AuditOS only.
- `src/app/(dashboard)/` belongs to Decision OS only.
- `src/components/audit/` belongs to AuditOS only.
- `src/components/decisions/` belongs to Decision OS only.

### 2. Do Not Introduce Fake Product Routes

- Do not create routes for products that are not in the current build plan.
- Do not create routes for Decision OS, Sales OS, Simulation OS, or any other AQLIYA product line.
- All new routes must be under `/audit/engagements/[engagementId]/` unless explicitly approved.

### 3. Do Not Create Unvalidated Product Lines

- AuditOS is the only active product under development.
- All other AQLIYA products are future roadmap items.
- Do not build features for products that are not in the current execution phase.

### 4. Preserve Existing Routes and Naming

| Route | Status |
|-------|--------|
| `/audit` | Protected — do not rename |
| `/audit/engagements/[engagementId]` | Protected |
| `/audit/engagements/[engagementId]/trial-balance` | Protected |
| `/audit/engagements/[engagementId]/mapping` | Protected |
| `/audit/engagements/[engagementId]/validation` | Protected |
| `/audit/engagements/[engagementId]/statements` | Protected |
| `/audit/engagements/[engagementId]/notes` | Protected |
| `/audit/engagements/[engagementId]/evidence` | Protected |
| `/audit/engagements/[engagementId]/findings` | Protected |
| `/audit/engagements/[engagementId]/recommendations` | Protected |
| `/audit/engagements/[engagementId]/review` | Protected |
| `/audit/engagements/[engagementId]/approval` | Protected |
| `/audit/engagements/[engagementId]/publication` | Protected |
| `/audit/engagements/[engagementId]/audit-trail` | Protected |
| `/decisions`, `/organizations`, etc. | Protected — Decision OS |

### 5. Preserve Prisma Model Separation

| Prefix | Product |
|--------|---------|
| (no prefix) | Decision OS: `Organization`, `User`, `Decision`, `Recommendation`, `Approval`, `AuditLog` |
| `Audit` | AuditOS: `AuditOrganization`, `AuditUser`, `AuditEngagement`, `AuditFinding`, `AuditEvent` |

- Do not cross-reference models between products.
- Do not add fields to models that belong to the other product.

### 6. Shared Components Are Read-Only

- `src/components/ui/` — shared shadcn component library. Do not modify.
- `src/lib/utils.ts` — shared utilities. Do not modify unless adding AuditOS-specific helpers.
- `src/lib/prisma.ts` — shared Prisma client. Do not modify.

### 7. Future Route Rename

- `/audit` may later be renamed to `/auditos`.
- This rename is NOT part of the current build plan.
- Do not initiate this rename without explicit approval.
