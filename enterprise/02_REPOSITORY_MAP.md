# AQLIYA Repository Map

**Status:** Active | **Version:** 1.0 | **Date:** 2026-06-30

## Root Structure

```
C:\Users\PC\Documents\Aqliya/
├── 📁 src/          (2,456 files) — Source code
├── 📁 docs/         (2,390 files) — Documentation
├── 📁 prisma/       (240 models) — Database
├── 📁 scripts/      (209 files) — Operations
├── 📁 infra/        (19 files) — Terraform
├── 📁 .github/      (6 workflows) — CI/CD
├── 📁 cypress/      (11 specs) — E2E tests
├── 📁 enterprise/   (12 files) — Company reference
├── 📁 tests/        — Test directory
└── 📦 package.json  (130+ scripts)
```

## src/ Architecture

```
src/
├── app/             551 files — Routes (260 pages + 64 APIs)
├── lib/            1346 files — Business Logic
│   ├── core/       151 files — Intelligence Core (12 engines)
│   ├── platform/   200+ files — Platform Services
│   ├── governance/  24 files — Governance Framework
│   ├── auth/        17 files — Auth/MFA/SSO/SCIM
│   ├── ai/          ~5 files — Barrel (shim removed)
│   └── product/     — Product-specific libs
├── components/     353 files — UI Components
├── actions/         88 files — Server Actions
├── __tests__/       72 files — Test suites
└── __mocks__/       10 files — Test mocks
```

## docs/ Structure

| Directory | Files | Classification |
|-----------|-------|---------------|
| archive/ | 998 | Historical |
| evidence/ | 544 | Operational Evidence |
| assets/ | 326 | Active (Products) |
| operations/ | 63 | Active |
| pilot/ | 62 | Active |
| releases/ | 96 | Active |
| official/ | 18 | Official Source |
| source-of-truth/ | 26 | Official Source |
| company/ | 10 | Company Guides |
| ... | ... | ... |
