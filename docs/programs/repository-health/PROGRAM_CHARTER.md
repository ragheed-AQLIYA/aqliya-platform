# Repository Health Program Charter v1.0

**Status:** Active  
**Date:** 2026-06-27  
**Program Owner:** OpenCode  
**Closure Standard:** `docs/PROGRAM_CLOSURE_CHECKLIST.md` v1.0  

---

## Purpose

Establish a reproducible engineering baseline for the AQLIYA repository.

This program does not add features.

It measures, verifies, and restores repository engineering health so that every subsequent program starts from a known-good baseline.

---

## Objectives

1. Establish the current repository health using live measurements.
2. Remove reproducibility risks.
3. Eliminate verified engineering debt.
4. Produce objective evidence.
5. Close the program under PROGRAM_CLOSURE_CHECKLIST.md.

---

## Scope

### Included

- TypeScript compilation health
- Build reproducibility
- Fresh clone verification
- CI reproducibility
- Lint health
- Repository integrity
- Corrupted file verification
- Git tracking consistency
- Knowledge map consistency
- Generated artifact validation

### Explicitly Excluded

- Documentation governance
- Product features
- UX work
- Commercial website
- New architecture
- Product roadmap execution

---

## Phase 0 — Baseline Measurement (Mandatory)

No fixes are allowed before measurement.

Measure:

- TypeScript error count
- Lint errors and warnings
- Build status
- Fresh clone status
- Git tracking status
- Corrupted file scan
- Knowledge-map consistency
- CI status

Every metric must include repository evidence.

---

## Acceptance Criteria

The program is complete only if all applicable criteria are satisfied.

- Fresh clone succeeds.
- Repository builds from scratch.
- TypeScript status is documented and meets the target.
- Lint status is documented and meets the target.
- No verified repository corruption remains.
- Knowledge map matches tracked repository files.
- CI is reproducible.
- All evidence is committed.

---

## Deliverables

- PROGRAM_CHARTER.md
- BASELINE_REPORT.md
- EXECUTION_LOG.md
- VALIDATION_REPORT.md
- INDEPENDENT_REVIEW.md
- PROGRAM_CLOSURE.md

---

## Closure Standard

PROGRAM_CLOSURE_CHECKLIST.md v1.0 is mandatory.

No closure is permitted without:

- Fresh clone verification
- Git verification
- Independent review
- Closure checklist approval
