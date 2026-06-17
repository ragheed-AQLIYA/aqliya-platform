# WorkflowOS / Sunbul scripts

Seeds, validation, and internal pilot utilities for the WorkflowOS (Sunbul) workspace.

| Script | Purpose |
|--------|---------|
| `seed-sunbul-pilot.ts` | Pilot client, memberships, sample records |
| `seed-sunbul-organization.ts` | Organization-level Sunbul seed |
| `validate-sunbul-e2e.ts` | Data-layer E2E validation (Prisma, no NextAuth) |
| `validate-sunbul-admin-auth.ts` | Admin auth validation |
| `sunbul-internal-pilot.ts` | Internal pilot orchestration |

Example:

```bash
npx tsx -r ../mock-server-only.cjs scripts/workflowos/seed-sunbul-pilot.ts
```
