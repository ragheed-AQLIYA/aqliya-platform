---
name: decisionos-change
description: Use when changing DecisionOS, tender decisions, decision workflows, evidence-linked decisions, or adjacent decision dashboards.
---

# DecisionOS Change Skill

## Purpose

Protect evidence-linked decision workflows.

## Required Checks

- decision status flow
- evidence links
- actor context
- audit logging
- workflow instance consistency
- seeded demo data visibility

Routes: `/decisions`, related API and server actions.

## Avoid

- generic CRM behavior
- undocumented route moves
- bypassing evidence review

## Validation

- smoke `/decisions` for seeded tender data when UI/data changes
- targeted tests under `src/__tests__/` if present for decision flows

## Final Output

- workflow impact
- changed files
- validation run
- known limitations
