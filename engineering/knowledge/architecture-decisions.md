# Architecture Decisions (Engineering View)

This file does **not** replace ADRs. It indexes them for Engineering Excellence drift checks.

## Authority

1. `docs/DOCUMENTATION_AUTHORITY.md`
2. `docs/official/*` doctrine
3. `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`
4. `docs/adr/*`

## Approved layering (monitor, do not redesign)

```
Client Component → Server Action → Domain Service (src/lib) → Prisma
```

## Forbidden (drift signals)

- Client importing `@/lib/prisma` or auth/session authority
- Actions importing from `src/app/`
- Deep product-to-product imports bypassing Core
- New `src/` top-level layers without ADR

## Active ADRs

See `docs/adr/`. When an ADR is added/updated, re-run:

```bash
npm run eng:agent -- architecture-drift
```
