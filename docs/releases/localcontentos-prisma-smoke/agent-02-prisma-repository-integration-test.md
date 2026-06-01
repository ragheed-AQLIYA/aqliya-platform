# Agent 02 — Prisma Repository Integration Test

**File:** `src/lib/local-content/content/__tests__/content-studio-prisma-repository.test.ts`  
**Config:** `jest.content-studio-prisma.config.js` (real `@prisma/client`, dotenv before setup)

## Behavior

- Skips when `DATABASE_URL` unset or Jest placeholder `postgresql://localhost:5432/test_db`
- Unique org prefix per run: `lcos-prisma-integ-{runId}`
- Creates: project → campaign → source → item (aiGenerated/reviewRequired) → review → approval → output
- Verifies org-scoped lists and cross-org null reads
- Re-instantiates repository to confirm persistence
- Cleans up records by `organizationId` in `afterAll`

## Command

```
npx jest --config jest.content-studio-prisma.config.js src/lib/local-content/content/__tests__/content-studio-prisma-repository.test.ts --runInBand
```

## Result

**6/6 PASS** (light)

## Notes

- Standard `npm test` uses mocked Prisma; integration test requires dedicated config.
- No destructive DB reset performed.
