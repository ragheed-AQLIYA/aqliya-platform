# Engineering Memory — Pattern Library

**Status:** Active — Append-only  
**Owner:** Layer 11 (Engineering Memory)  
**Purpose:** Approved design patterns for AQLIYA. Use these. Don't invent new ones without ADR.

---

## Platform Patterns

### P-01: Server Action as API Boundary
```
Client Component → Server Action → Domain Service → Prisma → Database

NEVER: Client Component → Domain Service → Prisma
```
- **Files:** All `src/actions/*.ts`
- **Test:** Check NO_PRISMA_IN_CLIENT compliance

### P-02: enforce() Authorization Guard
```
async function myAction(input: MyInput) {
  await enforce(currentUser, "product:resource", "write");
  // ... mutation logic
}
```
- **Files:** `src/lib/authorization/authorize.ts`
- **Compliance:** ACTIONS_USE_ENFORCE rule (currently 52%)

### P-03: Tenant-Safe Download Route
```
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  const resource = await findResource(params.id, session.user.organizationId);
  if (!resource) return new Response("Not Found", { status: 404 }); // tenant-safe: 404 not 403
  
  await writePlatformAuditLog({ action: "download", resourceId: resource.id });
  return fileResponse;
}
```
- **Files:** All `/api/*/download` routes
- **Compliance:** DOWNLOAD_ROUTES_TENANT_SCOPED rule

### P-04: Paginated Response
```
async function listAction(page: number, pageSize: number): Promise<{
  items: T[];
  totalCount: number;
  hasMore: boolean;
}> {
  const [items, totalCount] = await Promise.all([
    prisma.model.findMany({ skip: page * pageSize, take: pageSize }),
    prisma.model.count(),
  ]);
  return { items, totalCount, hasMore: (page + 1) * pageSize < totalCount };
}
```
- **Standard:** All list actions follow this pattern
- **ADR:** ADR-005

### P-05: Dashboard Cache
```
import { getCachedOrFetch } from "@/lib/platform/cache-strategy";

async function getDashboardStats(orgId: string) {
  return getCachedOrFetch(`dashboard:${orgId}:stats`, async () => {
    return prisma.model.aggregate(...);
  }, { ttl: 300 }); // 5 minutes
}

// On mutation, bust cache:
import { invalidateDashboardCaches } from "@/lib/platform/cache-strategy";
await invalidateDashboardCaches(orgId);
```
- **Files:** `src/lib/platform/cache-strategy.ts`
- **ADR:** ADR-004

### P-06: Structured Logger
```
import { createLogger } from "@/lib/observability/logger";
const logger = createLogger({ product: "auditos" });

logger.info("Engagement archived", { engagementId, orgId });
logger.error("Export failed", error, { format: "pdf", engagementId });
```
- **Files:** `src/lib/observability/logger.ts`
- **ADR:** ADR-006
- **Replaces:** `console.log`, `console.error` in production paths

---

## Product Patterns

### AUDIT-01: Engagement Lifecycle
```
DRAFT → ACTIVE → IN_REVIEW → COMPLETED → ARCHIVED
```
- **Engine:** `src/lib/audit/db/engagement-db.ts`
- **Audit events:** Each transition logged

### DECISION-01: Decision Lifecycle
```
DRAFT → IN_REVIEW → APPROVED | REJECTED → ARCHIVED
```
- **Files:** `src/actions/decisions-crud.ts`
- **Tabs:** 15 tab detail view

### LOCAL-01: Supplier Scoring (4-factor)
```
Score = locality(40%) + ownership(25%) + workforce(20%) + declaredContent(15%)
```
- **Files:** `src/lib/local-content/`
- **Formula engine:** GP-01, WRK-03, SPN-03

---

## Anti-Patterns (DO NOT USE)

### AP-01: Client Component imports prisma directly
```
// NEVER:
"use client";
import { prisma } from "@/lib/prisma"; // ❌ Prisma in client bundle
```

### AP-02: Product reimplements Core
```
// NEVER:
// src/lib/audit/my-audit-logger.ts — duplicates writePlatformAuditLog
// USE: import { writePlatformAuditLog } from "@/lib/platform/audit-bridge/audit-bridge-service"
```

### AP-03: as any type escape
```
// NEVER:
const data = response as any; // ❌ Bypasses type safety
// USE: proper type narrowing or @ts-expect-error with comment
```

### AP-04: Uncached dashboard query
```
// NEVER: Direct DB aggregate on every render
const stats = await prisma.model.aggregate({ _count: true });
// USE: getCachedOrFetch pattern (P-05)
```

### AP-05: 404-as-403 tenant check
```
// NEVER:
if (resource.orgId !== user.orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
// USE: Return 404 on any tenant mismatch (P-03)
```

### AP-06: God Object (single file > 800 lines)
```
- audit-actions.ts was 3,657 lines → split to 12 modules
- localcontent-actions.ts was 1,471 lines → split to 8 modules
- Prisma schema is 5,121 lines → pending split (ADR-012)
```
