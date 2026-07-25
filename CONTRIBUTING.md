# Contributing to AQLIYA

Thank you for your interest in contributing to AQLIYA. This guide covers the process for submitting changes, the review requirements, and the standards we follow.

---

## Code of Conduct

AQLIYA is an institutional intelligence platform. All contributions must align with the platform's trust principle:

> **AI assists. Humans decide. Evidence governes.**

### Standards

- Be respectful and constructive in all interactions
- Focus on technical merit and product value
- Do not submit code that compromises security, tenant isolation, or auditability
- Do not claim capabilities that are not implemented
- Do not introduce placeholder or mock-only code into production paths

---

## Getting Started

### 1. Read the Operating Contract

Before contributing, read `AGENTS.md` — it defines the execution contract for all work on this repository. Key sections:

- **Section 1:** Platform identity (AQLIYA is NOT what you might assume)
- **Section 2:** Documentation authority hierarchy
- **Section 5:** v0.1 completion doctrine
- **Section 8:** Execution lifecycle (Discover → Plan → Implement → Validate → Document → Report)
- **Section 25:** Required final report format

### 2. Set Up Your Environment

Follow the [Developer Workflow Guide](docs/development/DEVELOPER_WORKFLOW.md) to set up your local environment.

### 3. Find Work

- Check existing issues and PRs
- Look for `good first issue` labels
- Review the roadmap in `docs/official/aqliya-roadmap-v1.1.md`
- Ask in the team channel for guidance on larger tasks

---

## Pull Request Process

### Branch Naming

```
<type>/<short-description>
```

Examples:
- `feat/local-content-supplier-scoring`
- `fix/audit-tb-upload-validation`
- `docs/developer-workflow-guide`
- `refactor/kernel-event-bus-cleanup`

### Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`

**Examples:**

```
feat(local-content): add supplier classification scoring
fix(audit): prevent TB upload without engagement context
docs(developer): add server action workflow guide
refactor(kernel): extract cache invalidation into shared helper
test(office-ai): add unit tests for task status transitions
chore(deps): update prisma to 7.8.0
```

### PR Checklist

Before submitting a PR, verify:

- [ ] **TypeScript passes:** `npx tsc --noEmit`
- [ ] **Lint passes:** `npm run lint`
- [ ] **Tests pass:** `npm test` (or relevant subset)
- [ ] **No `as any`** in new production code
- [ ] **No `console.log`** in new production code
- [ ] **Tenant isolation** — new queries include `organizationId`
- [ ] **Audit trail** — mutations include `writePlatformAuditLog()`
- [ ] **Auth checks** — protected routes include `getCurrentUser()` + `enforce()`
- [ ] **Arabic-first UX** — primary text is Arabic where applicable
- [ ] **Loading/error states** — pages handle loading and error conditions
- [ ] **Documentation updated** — if changing routes, architecture, or product status

### PR Description

Use this template:

```markdown
## What

Brief description of the change.

## Why

Link to issue or explain the motivation.

## How

Technical approach taken.

## Testing

How was this tested?

## Checklist

- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Documentation updated (if applicable)
```

### Review Requirements

- **All PRs** require at least 1 review before merge
- **Security-sensitive changes** (auth, RBAC, middleware, API routes) require 2 reviews
- **Schema changes** require review from the data architecture owner
- **Documentation-only changes** require 1 review

### Merge Requirements

- All CI checks must pass
- Branch must be up-to-date with main
- No unresolved review comments
- Squash merge preferred for clean history

---

## Development Standards

### Server Actions

- Always use `"use server"` directive
- Always authenticate via `getCurrentUser()`
- Always authorize via `enforce()`
- Always log mutations via `writePlatformAuditLog()`
- Always return `{ ok: true, data }` or `{ ok: false, error }`
- Always call `revalidatePath()` after mutations

### API Routes

- Always check authentication
- Always check tenant isolation (organizationId)
- Always return standardized `ApiResponse` format
- Always handle errors gracefully

### Components

- Use `"use client"` only when needed
- Use shadcn/ui primitives from `@/components/ui/`
- Use Arabic-first copy for primary user flows
- Handle loading and error states

### Database

- Always include `organizationId` for tenant isolation
- Always include `createdById` for auditability
- Always include `createdAt`/`updatedAt` timestamps
- Always add indexes for common query patterns

### Testing

- Write tests for all new functionality
- Use existing mock patterns in `src/__mocks__/`
- Keep unit tests fast and isolated
- Integration tests should use the test database

---

## Documentation

### When to Update Docs

Update documentation when changing:

- Platform identity or positioning
- Product status or completion level
- Route map or navigation
- Database schema
- API contracts
- Workflows or business rules
- Permissions or RBAC
- AI behavior or prompts
- Deployment or infrastructure

### Documentation Targets

| Change | Update |
|--------|--------|
| New route | `docs/source-of-truth/ROUTE_STRATEGY.md` |
| Product status | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |
| Architecture | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` |
| Schema | `prisma/schema.prisma` + seed scripts |
| New workflow | Relevant product docs in `docs/` |
| AI behavior | AI governance docs |

### Documentation Authority

Follow `docs/DOCUMENTATION_AUTHORITY.md` for conflict resolution. The hierarchy:

1. **Doctrinal** — `docs/official/` (identity, naming, trust principles)
2. **Code Reality** — Routes, schema, actions, tests, validation reports
3. **Reports** — Evidence, not doctrine
4. **Theoretical** — Background, not authority

---

## Security

### Never

- Hardcode secrets or API keys
- Bypass auth for convenience
- Add public APIs for private data
- Trust client-provided organization IDs without server validation
- Expose Prisma to client components
- Send sensitive data to external providers without clear routing rules

### Always

- Use environment variables for secrets
- Validate all inputs server-side
- Enforce tenant isolation on every query
- Log security-relevant actions
- Review auth/security changes with extra scrutiny

---

## Project Structure Reference

```
src/
├── app/           # Routes, pages, layouts, API handlers
├── actions/       # Server Actions
├── components/    # UI components (ui/ for primitives)
├── lib/           # Business logic, services, kernel
├── __tests__/     # Tests
└── __mocks__/     # Test mocks
```

---

## Questions?

If you have questions about contributing:

1. Read the [Developer Workflow Guide](docs/development/DEVELOPER_WORKFLOW.md)
2. Check `AGENTS.md` for the operating contract
3. Review `docs/DOCUMENTATION_AUTHORITY.md` for documentation rules
4. Ask in the team channel
