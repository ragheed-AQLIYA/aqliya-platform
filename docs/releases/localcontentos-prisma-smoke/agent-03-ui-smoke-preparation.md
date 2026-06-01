# Agent 03 — UI Smoke Preparation

## Checklist source

`docs/releases/localcontentos-prisma-cutover/localcontentos-human-smoke-checklist.md`

## Routes confirmed

| Route | File |
|-------|------|
| `/local-content` | `src/app/local-content/page.tsx` |
| `/local-content/campaigns` | `src/app/local-content/campaigns/page.tsx` |
| `/local-content/campaigns/[id]` | `src/app/local-content/campaigns/[id]/page.tsx` |
| `/local-content/review` | `src/app/local-content/review/page.tsx` |
| `/local-content/outputs` | `src/app/local-content/outputs/page.tsx` |

## Pre-flight

- `DATABASE_URL` → PostgreSQL (`aqliya` on localhost:5432)
- `LOCALCONTENT_CONTENT_BACKEND` unset or `prisma`
- Migration `20260601120000_localcontentos_content_studio` applied

## Dev server

```
npm run dev
```

Started for smoke attempt (port 3000).

## Manual smoke steps (if automation blocked)

1. Sign in as ADMIN (`admin@aqliya.com` / seed password if seeded).
2. Open `/local-content/campaigns`.
3. Create Content Project → Campaign → Source → Content Item.
4. Run Draft Assist (if AI configured).
5. Submit review on `/local-content/review`.
6. Approve as ADMIN.
7. Create output on `/local-content/outputs`.
8. Hard refresh — verify entities visible.
9. Query `ContentStudioProject` (or sibling tables) in PostgreSQL — rows match UI.
10. Restart dev server — verify data still visible.

## Automation

Browser MCP available; smoke attempted in Agent 04.
