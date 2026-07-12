# Contributing to AQLIYA

## Getting Started

1. Read `AGENTS.md` (the agent operating contract)
2. Read `docs/DOCUMENTATION_AUTHORITY.md` (documentation hierarchy)
3. Read the relevant official docs in `docs/official/`
4. Check `PRODUCT_STATUS_MATRIX.md` for current product states

## Development Workflow

1. Branch from `main`
2. Make changes
3. Run validations: `npx tsc --noEmit`, `npm test`
4. Create PR with description of changes
5. Ensure CI passes

## Code Standards

- TypeScript strict mode
- Arabic-first UI with RTL support
- Server Components by default
- Server Actions for mutations
- Audit trail for all data mutations
- Error sanitization (use `sanitizeErrorResponse()`)
- Test coverage for new features

## Pull Request Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes (or relevant subset)
- [ ] New tests added for new functionality
- [ ] Documentation updated if changing routes, schema, or product status
- [ ] Arabic translation included for UI changes
- [ ] No `@ts-nocheck` or `@ts-ignore` in production files
- [ ] No `error.message` in API route catch blocks
