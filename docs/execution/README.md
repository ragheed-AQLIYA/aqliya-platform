# AuditOS — Execution Folder

## Purpose

This folder governs **AI-assisted engineering execution** for AuditOS.

All AI agents (OpenCode, Cursor, or other coding assistants) operating on this codebase must read and follow the documents in this folder before making changes.

This is not a theoretical reference area. It is an **operational control layer** that defines:
- How code is written
- What must not be broken
- How features are implemented via prompts
- How quality is validated
- What the UI must look and feel like
- What the next build sequence is

## Core Principle

**AI assists. Humans decide. Evidence governs.**

## Files

| File | Purpose |
|------|---------|
| [engineering-operating-protocol.md](./engineering-operating-protocol.md) | Product identity, coding principles, validation rules, AI boundaries, human review requirements, do-not-break rules |
| [architecture-guards.md](./architecture-guards.md) | Product separation rules — AQLIYA vs AuditOS vs Decision OS. Route and model boundaries |
| [implementation-prompts.md](./implementation-prompts.md) | Reusable AI prompts for feature implementation (Notes Engine, Evidence Engine, Reviewer Workflow, TB Import, Demo Dataset) |
| [qa-prompts.md](./qa-prompts.md) | QA validation prompts for mapping, statements, traceability, notes, evidence, build validation |
| [ui-rules.md](./ui-rules.md) | UI/UX rules — enterprise-grade, calm, clean, bilingual-ready, audit trust language, state clarity |
| [auditos-next-build-plan.md](./auditos-next-build-plan.md) | Next build sequence from demo dataset to pilot-ready demo flow |

## When to Use

- Before any AI-assisted code change
- Before any new feature implementation
- Before any QA pass
- Before any UI modification
- Before any build or deployment

## Scope

This folder applies to **AuditOS only**. It does not govern Decision OS, Sales OS, or other AQLIYA product lines.
