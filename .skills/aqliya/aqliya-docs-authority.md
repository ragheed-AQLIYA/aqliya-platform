---
name: aqliya-docs-authority
description: Documentation source-of-truth hierarchy for AQLIYA. Determines which document has highest authority in case of conflict, and when docs must be updated.
---

# AQLIYA Documentation Authority

> **Purpose:** Resolve documentation conflicts systematically. Prevent contradictory docs, stale claims, and misaligned positioning.

---

## 1. Authority Hierarchy

```
Highest Authority
│
├── docs/DOCUMENTATION_AUTHORITY.md        Conflict resolution meta-rules
├── docs/official/                         Doctrine docs (identity, governance, architecture)
│   ├── AQLIYA_MASTER_REFERENCE.md         Current master reference
│   ├── aqliya-vision-v1.1.md             Positioning and identity
│   ├── aqliya-implementation-rules-v1.1.md
│   ├── aqliya-product-taxonomy-v1.1.md
│   ├── aqliya-core-architecture-v1.1.md
│   ├── aqliya-skill-context-v1.1.md
│   ├── aqliya-glossary-v1.1.md
│   ├── aqliya-roadmap-v1.1.md
│   └── aqliya-agent-context-v1.1.md
│
├── docs/source-of-truth/                  Verified implementation status
│   ├── AQLIYA_ARCHITECTURE.md
│   ├── AQLIYA_SYSTEM_TAXONOMY.md
│   ├── PRODUCT_STATUS_MATRIX.md
│   └── ROUTE_STRATEGY.md
│
├── .skills/aqliya/                        Agent operating skills
│   ├── aqliya-low-load-dev.md
│   ├── aqliya-security-gate.md
│   ├── aqliya-docs-authority.md
│   ├── aqliya-demo-safety.md
│   ├── aqliya-product-completion.md
│   ├── aqliya-release-checklist.md
│   └── aqliya-opencode-agent.md
│
├── AGENTS.md                              Master agent operating contract
│
├── docs/reports/                          Evidence reports (not doctrine)
│
└── Archived docs/                         Historical only
    Lowest Authority
```

---

## 2. Conflict Resolution Rules

### Rule 1: Identity/Governance conflicts

**Follow `docs/official/` doctrine docs.**

If `AQLIYA_MASTER_REFERENCE.md` says one thing and a report says another, the master reference wins for identity, naming, governance, and positioning.

### Rule 2: Implementation status conflicts

**Inspect code, schema, routes, actions, seeds, tests.**

If `PRODUCT_STATUS_MATRIX.md` says "L5 Pilot-ready" but code shows no audit logs, no review/approval, and no exports → code reality wins. Update the status matrix.

### Rule 3: Official docs conflict with code reality

**Update the stale official docs. Document the correction.**

Do not silently choose a third interpretation. Write the correction in the final report.

### Rule 4: Reports are evidence, not doctrine

Reports may guide decisions but do not override official docs or code reality.

### Rule 5: Theoretical docs are background

Vision docs, roadmaps, and strategy docs describe intent. Implementation docs and code describe reality.

### Rule 6: Archived docs are historical only

Do not use archived docs as authoritative references.

### Rule 7: Skills are operating instructions

`.skills/aqliya/*.md` files are operating protocols. They constrain agent behavior but do not override product doctrine or code reality.

---

## 3. When to Update Docs

| Trigger                            | Update                                        |
| ---------------------------------- | --------------------------------------------- |
| Route created, renamed, or deleted | `ROUTE_STRATEGY.md`, `AQLIYA_ARCHITECTURE.md` |
| Product status changed             | `PRODUCT_STATUS_MATRIX.md`, roadmap if needed |
| Architecture changed               | `aqliya-core-architecture-v1.1.md`            |
| Identity/positioning changed       | `aqliya-vision-v1.1.md`, README, docs index   |
| Terminology changed                | `aqliya-glossary-v1.1.md`                     |
| New workflow added                 | Relevant product docs                         |
| AI behavior changed                | AI governance docs / product docs             |
| Export behavior changed            | Product docs and operator manual              |
| Agent operating rules changed      | `AGENTS.md`, relevant `.skills/aqliya/*.md`   |

---

## 4. Before Changing Any Doc, Ask

1. Is this changing doctrine or reporting reality?
2. Which document is the highest authority for this topic?
3. Will this change contradict any higher-authority document?
4. Does the change need to be synchronized across multiple docs?
5. Will the README need updating?
6. Will the product status matrix need updating?

---

## 5. Doc Maintenance Rules

- Do not delete old docs without archiving them in `docs/archive/`
- Do not rename docs without updating all cross-references
- Do not leave stale references to deleted files
- After any doc change, run: `grep -r "old-path" docs/` to find stale references
- Keep reports in `docs/reports/` — do not promote reports to `docs/official/`
- Keep `.skills/aqliya/` files focused on agent behavior, not product features
