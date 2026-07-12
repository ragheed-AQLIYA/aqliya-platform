# Dependency Report

**Agent:** dependencies  
**Generated:** 2026-07-11T02:08:06.245Z  
**Score:** 93/100  
**Findings:** 37 (critical 0, high 1, medium 0, low 35, info 1)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 1 |
| medium | 0 |
| low | 35 |
| info | 1 |

## Dependency Graph (summary)

Direct dependencies: 49
Dev dependencies: 25
Lock packages entries: 1660
Multi-version packages: 109
Unused candidates: 10

## Policy

Does not run `npm audit` or install packages (low-load / approval gates). Consumes optional cached audit JSON only.

## HIGH Findings

### F-0711 — Restrictive license: node_modules/jszip

- **Category:** license
- **Evidence:** (MIT OR GPL-3.0-or-later)
- **Suggestion:** Legal review before distribution; prefer MIT/Apache-2.0.

## LOW Findings

### F-0676 — Possibly unused package: @auth/prisma-adapter

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0677 — Possibly unused package: @embedpdf/fonts-arabic

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0678 — Possibly unused package: @radix-ui/react-slot

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0679 — Possibly unused package: playwright

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0680 — Possibly unused package: tw-animate-css

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0681 — Possibly unused package: @tailwindcss/postcss

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0682 — Possibly unused package: eslint-config-next

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0683 — Possibly unused package: eslint-plugin-security

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0684 — Possibly unused package: license-checker

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0685 — Possibly unused package: shadcn

- **Category:** unused-packages
- **Files:** `package.json`
- **Evidence:** No import/require/script reference detected in scanned corpus
- **Suggestion:** Confirm before removal — may be used by config or transitive tooling.

### F-0686 — Multiple versions installed: @jridgewell/trace-mapping

- **Category:** duplicate-packages
- **Evidence:** 0.3.9, 0.3.31
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0687 — Multiple versions installed: mime-db

- **Category:** duplicate-packages
- **Evidence:** 1.52.0, 1.54.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0688 — Multiple versions installed: mime-types

- **Category:** duplicate-packages
- **Evidence:** 2.1.35, 3.0.2
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0689 — Multiple versions installed: qs

- **Category:** duplicate-packages
- **Evidence:** 6.14.2, 6.15.1
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0690 — Multiple versions installed: tldts

- **Category:** duplicate-packages
- **Evidence:** 6.1.86, 7.0.30
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0691 — Multiple versions installed: tldts-core

- **Category:** duplicate-packages
- **Evidence:** 6.1.86, 7.0.30
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0692 — Multiple versions installed: tough-cookie

- **Category:** duplicate-packages
- **Evidence:** 5.1.2, 6.0.1
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0693 — Multiple versions installed: debug

- **Category:** duplicate-packages
- **Evidence:** 3.2.7, 4.4.3
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0694 — Multiple versions installed: commander

- **Category:** duplicate-packages
- **Evidence:** 11.1.0, 14.0.3, 6.2.1, 2.20.3, 7.2.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0695 — Multiple versions installed: execa

- **Category:** duplicate-packages
- **Evidence:** 5.1.1, 4.1.0, 9.6.1
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0696 — Multiple versions installed: get-stream

- **Category:** duplicate-packages
- **Evidence:** 6.0.1, 5.2.0, 9.0.1
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0697 — Multiple versions installed: human-signals

- **Category:** duplicate-packages
- **Evidence:** 2.1.0, 1.1.1, 8.0.1
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0698 — Multiple versions installed: is-stream

- **Category:** duplicate-packages
- **Evidence:** 2.0.1, 4.0.1
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0699 — Multiple versions installed: isexe

- **Category:** duplicate-packages
- **Evidence:** 3.1.5, 2.0.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0700 — Multiple versions installed: npm-run-path

- **Category:** duplicate-packages
- **Evidence:** 4.0.1, 6.0.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0701 — Multiple versions installed: onetime

- **Category:** duplicate-packages
- **Evidence:** 5.1.2, 7.0.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0702 — Multiple versions installed: picomatch

- **Category:** duplicate-packages
- **Evidence:** 4.0.4, 2.3.2
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0703 — Multiple versions installed: signal-exit

- **Category:** duplicate-packages
- **Evidence:** 3.0.7, 4.1.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0704 — Multiple versions installed: strip-final-newline

- **Category:** duplicate-packages
- **Evidence:** 2.0.0, 4.0.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0705 — Multiple versions installed: which

- **Category:** duplicate-packages
- **Evidence:** 4.0.0, 2.0.2
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0706 — Multiple versions installed: eslint-visitor-keys

- **Category:** duplicate-packages
- **Evidence:** 3.4.3, 5.0.1, 4.2.1
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0707 — Multiple versions installed: @opentelemetry/api-logs

- **Category:** duplicate-packages
- **Evidence:** 0.212.0, 0.214.0, 0.207.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0708 — Multiple versions installed: @opentelemetry/instrumentation

- **Category:** duplicate-packages
- **Evidence:** 0.212.0, 0.214.0, 0.207.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0709 — Multiple versions installed: balanced-match

- **Category:** duplicate-packages
- **Evidence:** 4.0.4, 1.0.2
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

### F-0710 — Multiple versions installed: brace-expansion

- **Category:** duplicate-packages
- **Evidence:** 5.0.6, 5.0.5, 1.1.14, 2.1.0
- **Suggestion:** Deduplicate via overrides/resolutions when safe.

## INFO Findings

### F-0712 — No cached npm-audit.json — advisories not scored this run

- **Category:** security-advisories
- **Evidence:** Place npm audit --json output at engineering/reports/npm-audit.json when approved

---

_AQLIYA Engineering Excellence · dependencies_
