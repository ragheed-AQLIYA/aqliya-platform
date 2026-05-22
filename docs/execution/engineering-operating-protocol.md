# AuditOS — Engineering Operating Protocol

## Product Identity

- **Company:** AQLIYA
- **Product:** AuditOS / Financial Intelligence
- **Category:** AI-native audit preparation and financial intelligence system
- **Core Principle:** AI assists. Humans decide. Evidence governs.

## Current Execution Phase

**Validation + Market Proof**

- Focus: Make AuditOS pilot-ready
- Do not expand into multiple products
- Do not redesign the company architecture
- Do not build unvalidated features

## Coding Principles

1. **Read before writing.** Always read existing files, patterns, and conventions before making changes.
2. **Preserve existing patterns.** Match existing code style, naming, and structure.
3. **No speculative code.** Do not add code for features that are not in the current build plan.
4. **No dead code.** Do not leave commented-out code, unused imports, or placeholder functions.
5. **Type safety.** All new code must be fully typed. No `any` unless explicitly justified.
6. **Server/client boundary.** Respect Next.js App Router server/client separation. Mark components with `"use client"` only when needed.
7. **No inline styles.** Use Tailwind CSS classes. Follow existing utility patterns.
8. **Bilingual-ready.** All user-facing text must support Arabic and English. Use existing i18n patterns.

## Validation Rules

1. **Type check passes.** `npx tsc --noEmit` must return 0 errors after every change.
2. **Build passes.** `npm run build -- --webpack` must succeed after every change.
3. **Lint passes.** `npm run lint` must return 0 new errors.
4. **No route changes.** Do not alter existing routes unless explicitly instructed.
5. **No schema changes.** Do not alter Prisma schema unless explicitly instructed.
6. **No server action changes.** Do not alter existing server actions unless explicitly instructed.

## AI Boundaries

AI agents (OpenCode, Cursor, etc.) are authorized to:
- Read and analyze existing code
- Generate code following existing patterns
- Run validation commands
- Create documentation
- Suggest improvements

AI agents are **NOT** authorized to:
- Merge or commit code without human review
- Change product architecture
- Create new product routes
- Alter database schema
- Remove or rename existing features
- Make decisions about product scope

## Human Review Requirements

All AI-generated changes must pass human review before merging:

1. **Code review.** A human engineer must review all code changes.
2. **Functional review.** Changes must be tested in the running application.
3. **Architecture review.** Changes must not violate architecture guards.
4. **UI review.** Changes must comply with UI rules.

## Do-Not-Break Rules

These rules are absolute. Violating any of them requires immediate rollback.

1. **Do not break `/audit` routes.** All existing AuditOS routes must continue to work.
2. **Do not break Decision OS routes.** All existing Decision OS routes under `/` and `/(dashboard)/` must continue to work.
3. **Do not alter Prisma schema.** No model changes, no field changes, no relation changes.
4. **Do not alter shared components.** `src/components/ui/` must not be modified.
5. **Do not alter authentication.** `src/lib/auth.ts` and `src/lib/auth-next.ts` must not be modified.
6. **Do not alter `platform-audit.ts`.** This file belongs to Decision OS.
7. **Do not introduce new dependencies.** No new npm packages without explicit approval.
8. **Do not change environment variables.** `.env` and `.env.example` must not be modified.
9. **Do not remove existing data.** Demo dataset in `src/lib/audit/mock-data.ts` must be preserved.
10. **Do not break the build.** `npm run build` and `npx tsc --noEmit` must always pass.
