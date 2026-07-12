# AQLIYA Engineering Best Practices

## Non-negotiables

1. **AI assists. Humans decide. Evidence governs.**
2. Tenant isolation (`organizationId`) on every data path.
3. Server-side RBAC — never UI-only checks.
4. Audit trail for mutations.
5. Arabic-first, RTL-aware UX for primary flows.
6. No automatic code mutation from Engineering Excellence agents.

## Server / Client

- Mark client components with `"use client"` only when needed.
- Keep Prisma, filesystem, secrets, and AI providers server-side.
- Prefer Server Actions for mutations.

## Testing

- Sensitive download/export routes need integration tests (auth + tenant 404 + audit).
- Do not skip flaky tests silently — quarantine with ticket.

## Dependencies

- Prefer existing Core modules over new packages.
- New packages require review (AGENTS.md low-load / toolchain policy).

## Documentation

- Status claims must match code reality.
- Reports are evidence, not doctrine.
