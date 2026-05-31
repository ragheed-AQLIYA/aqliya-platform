---
name: salesos-change
description: Use when changing SalesOS accounts, pipeline, intelligence, scoring, repository, persistence, or GTM workflow.
---

# SalesOS Change Skill

## Purpose

Improve SalesOS as a sales intelligence operating layer, not a random CRM clone.

## Rules

- Do not turn SalesOS into full CRM unless explicitly approved.
- Protect account, lead, signal, pipeline, and intelligence boundaries.
- Prefer data persistence before UI expansion.
- Do not add broad schema without migration approval.
- Keep SalesOS connected to AQLIYA Intelligence Core where relevant.

## Required Flow

1. Identify whether change is:
   - data model
   - repository/store
   - UI/dashboard
   - scoring/filtering
   - outbound execution
   - learning loop

2. Check if persistence flag or in-memory/file store is involved.
3. Propose targeted validation.
4. Avoid heavy commands unless approved.

Routes: `/sales`, marketing at `/products/sales`.

## Final Output

- change type
- changed files
- persistence impact
- validation run
