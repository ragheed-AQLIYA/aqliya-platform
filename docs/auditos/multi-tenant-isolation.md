# Multi-Tenant Isolation

## Tenancy Model

AuditOS uses organization-level tenancy. All core models carry an `organizationId` field:

| Model               | organizationId | Source                     |
| ------------------- | -------------- | -------------------------- |
| `AuditOrganization` | Primary key    | Self                       |
| `AuditUser`         | Required       | Links to AuditOrganization |
| `AuditClient`       | Required       | Links to AuditOrganization |
| `AuditEngagement`   | Required       | Set at creation time       |

Relationship chain: **Engagement → Client → Organization**

## Tenant Guard

The tenant guard (`src/lib/audit/tenant-guard.ts`) provides reusable access control functions:

- `assertEngagementAccess(engagementId, actor)` — Fetches engagement's organizationId and compares against actor.organizationId
- `assertClientAccess(clientId, actor)` — Fetches client's organizationId and compares
- `assertOrganizationAccess(organizationId, actor)` — Direct comparison

All guards throw `TenantAccessError` with a descriptive message on mismatch:

- `"Access denied: engagement belongs to another organization"`
- `"Access denied: client belongs to another organization"`
- `"Access denied: organization mismatch"`

## Where the Guard is Applied

The tenant guard is enforced in **29 server actions** in `src/actions/audit-actions.ts`, covering:

- Engagement read/write
- Trial balance operations
- Evidence CRUD and linking
- Finding CRUD
- Recommendation CRUD
- Review comments
- Approvals
- AI output generation
- Export operations
- Pilot feedback and sign-off

## Access Rules

| Action                       | Rule                                                   |
| ---------------------------- | ------------------------------------------------------ |
| Read engagement data         | Actor must belong to same org as the engagement        |
| Create engagement data       | Actor must belong to the target org                    |
| Update engagement data       | Actor must belong to the same org                      |
| Delete engagement data       | Actor must belong to the same org                      |
| Export data                  | Actor must belong to the same org                      |
| Create/update pilot feedback | Actor must belong to the same org                      |
| Approve                      | Actor must belong to the same org + partner/admin role |

## Test Scenarios

### Prerequisites

```bash
npm run seed:audit
```

This seeds two organizations:

1. **Aqliya Audit Firm** (org-aqliya) — Gulf Trading Co., eng-gulf-2025
2. **Aqliya Demo Firm 2** (org-aqliya-demo-2) — Najd Services Co., eng-najd-2025

### Test Cases

| #   | Test                                | Expected             |
| --- | ----------------------------------- | -------------------- |
| 1   | Org 1 user reads Org 1 engagement   | ✅ Success           |
| 2   | Org 1 user reads Org 2 engagement   | ❌ TenantAccessError |
| 3   | Org 2 user reads Org 2 engagement   | ✅ Success           |
| 4   | Org 2 user mutates Org 1 engagement | ❌ TenantAccessError |
| 5   | Cross-org export                    | ❌ TenantAccessError |
| 6   | Cross-org approval                  | ❌ TenantAccessError |
| 7   | Cross-org AI output                 | ❌ TenantAccessError |

### Manual Test

```typescript
import { getAuditActor } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";

// Assuming actor is from org-aqliya
const actor = await getAuditActor();

// This should succeed (eng-gulf-2025 belongs to org-aqliya)
await assertEngagementAccess("eng-gulf-2025", actor);

// This should throw (eng-najd-2025 belongs to org-aqliya-demo-2)
await assertEngagementAccess("eng-najd-2025", actor);
// → TenantAccessError: "Access denied: engagement belongs to another organization"
```

## Known Limitations

- The guard is enforced at the server action layer, not at the Prisma query level
- Organization filtering is NOT applied in the DB layer's getter functions (they accept any engagementId)
- The guard relies on the engagement existing — if an engagement ID doesn't exist, it throws "Engagement not found" which is safe
- The `getDashboardSummary` and `getEngagements` functions are NOT scoped by organization (they return all engagements)
