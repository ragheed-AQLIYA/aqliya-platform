# AQLIYA Platform Core Map

**Status:** Active | **Version:** 1.0 | **Date:** 2026-06-30

## Intelligence Core — 12 Engines

All accessible via `@/lib/core/`:

```
@/lib/core/
├── ai/          → AI Engine (57 files, 4,840 LOC)
├── workflow/    → Workflow Engine (6 files, 183 LOC)
├── evidence/    → Evidence Core (11 files, 1,714 LOC)
├── knowledge/   → Knowledge Engine (13 files, 981 LOC)
├── memory/      → Institutional Memory (3 files, 1,026 LOC)
├── policy/      → Policy/ABAC (14 files, 1,318 LOC)
├── events/      → Events/Outbox (6 files, 485 LOC)
├── audit/       → Core Audit (2 files, 83 LOC)
├── decision/    → Decision Engine (10 files, 918 LOC)
├── signals/     → Signals (6 files, 877 LOC)
├── governance/  → Governance (2 files, 84 LOC)
└── contracts/   → Contracts (2 files, 150 LOC)
```

## Architecture Layers

```
Client Browser
     ↓
Next.js (Server Components / Client Components)
     ↓
Server Actions (@/actions/)
     ↓
Product Services (@/lib/{product}/)
     ↓
Intelligence Core (@/lib/core/)
     ↓
Platform Persistence (@/lib/platform/)
     ↓
Prisma → PostgreSQL 16 + pgvector
```

## Data Flow

```
Server Action → requireUserContext() → Service → Core Engine → Platform → Prisma
                    ↓                    ↓          ↓            ↓         ↓
                Auth check          Business    Business     DB/Storage  Query
                                   validation  intelligence
```
