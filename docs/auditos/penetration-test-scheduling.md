# Penetration Test Scheduling

## Status

⏳ **Planned — not yet scheduled.** This document defines the scheduling plan for external penetration testing.

## Scope

As defined in `docs/auditos/penetration-testing-scope.md`:
- Authentication (5 tests)
- Tenant isolation (4 tests)
- File upload (4 tests)
- Rate limiting (4 tests)
- Server actions (4 tests)
- Exports (3 tests)
- Audit log (3 tests)
- Total: 27 test cases

## Requirements

| Requirement | Detail |
|-------------|--------|
| Tester qualification | External security firm or certified pen tester |
| Environment | Staging/production clone — not active production |
| Duration | Estimated 2-3 days |
| Report format | Findings with severity, evidence, and remediation |
| Re-test | After critical/high findings are resolved |

## Candidate Providers

| Provider | Type | Notes |
|----------|------|-------|
| Local security firm | External | Preferred for on-site coordination |
| Bug bounty program | Community | Consider post-launch |
| Automated scanner | SAST/DAST | Supplement manual testing |

## Estimated Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Vendor selection | 2 weeks | RFQ, scope negotiation, scheduling |
| Testing | 3 days | Execute 27 test cases |
| Report delivery | 1 week | Findings, severity, remediation |
| Remediation | 2-4 weeks | Fix critical/high findings |
| Re-test | 2 days | Verify fixes |
| Sign-off | 1 day | Accept or escalate remaining findings |

## Dependencies

- [ ] Staging environment available
- [ ] Test data loaded (anonymized)
- [ ] Network access configured
- [ ] Vendor NDA signed
- [ ] Rollback plan documented

## Owner

| Task | Owner | Target Date |
|------|-------|-------------|
| Select pen test vendor | Security lead | Pre-production |
| Schedule test | Security lead | Pre-production |
| Execute test | External vendor | Per schedule |
| Remediate findings | AQLIYA engineering | Within 4 weeks of report |
