# 01 — Twenty Architecture Teardown

**Date:** 2026-06-01  
**Reference:** [twentyhq/twenty](https://github.com/twentyhq/twenty) · [Twenty Developers Docs](https://docs.twenty.com/developers/introduction)  
**Purpose:** Benchmark only — **do not import Twenty into AQLIYA**

---

## What Twenty Is

Twenty is an open-source CRM built as a **metadata-driven, workspace-scoped data platform** with:

- **Standard objects:** Company, Person, Opportunity, Task, Note, etc.
- **Custom objects:** Runtime-defined via Metadata API
- **Dual GraphQL endpoints:** `/graphql` (data) + `/metadata` (schema)
- **Dynamic schema generation:** WorkspaceSchemaFactory rebuilds GraphQL SDL/resolvers on metadata change
- **Apps ecosystem:** TypeScript packages extending objects, UI, logic functions, AI agents
- **Workflows:** Visual automation builder
- **Calendar/email sync:** Mailbox integration
- **Dashboards:** Widget-based analytics
- **Self-host:** Docker Compose deployment

**License (engineering risk only):** Primarily **GNU AGPL v3** with select files marked `/* @license Enterprise */` under commercial terms. Network copyleft applies to modified AGPL code offered as a service.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│  twenty-front (React) — views, record pages, workflows  │
├─────────────────────────────────────────────────────────┤
│  Metadata API (/metadata) — objects, fields, relations  │
├─────────────────────────────────────────────────────────┤
│  Core GraphQL API (/graphql) — CRUD via dynamic schema  │
├─────────────────────────────────────────────────────────┤
│  Workspace engine — schema factory, resolver factory    │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL — metadata tables + per-workspace data      │
└─────────────────────────────────────────────────────────┘
```

### Key Primitives Worth Studying

| Primitive | Twenty approach | AQLIYA relevance |
|-----------|----------------|------------------|
| Object metadata | DB-driven schema | Pattern for extensibility — **overkill for v0.3** |
| Saved views | Column/filter presets | Useful UX pattern for pipeline boards |
| Record timeline | Activity aggregation | Maps to SalesOS interaction log |
| Relations | MANY_TO_ONE / ONE_TO_MANY | Standard CRM graph |
| Logic functions | Server TS + triggers | Similar to server actions + audit |
| AI agents/skills | Workspace AI tools | Compare to governed AI in Core |
| Webhooks | Record change events | Future integration surface |
| Permissions | Object/field-level RBAC | AQLIYA needs governance-heavy variant |

### Folder Architecture (server)

Per Twenty docs: `metadata/`, `workspace/`, `database/`, `integrations/`, GraphQL type/resolver factories under workspace engine.

---

## What Twenty Does Well

1. **Clean CRM UX** — fast record browsing, kanban/table views, Cmd+K navigation
2. **Extensible data model** without redeploying code (custom objects)
3. **Developer ergonomics** — GraphQL introspection, app scaffolding CLI
4. **Modern stack** — TypeScript monorepo, self-host friendly
5. **Open community** — active GitHub, documented APIs
6. **Email/calendar context** on records (mature SaaS CRM feature)

---

## What Twenty Does NOT Solve for AQLIYA

| AQLIYA requirement | Twenty gap |
|--------------------|------------|
| **AI assists. Humans decide. Evidence governs.** | AI is assistive but not institution-grade evidence gates |
| Arabic-first / RTL institutional UX | English-first product |
| Commercial claim review against doctrine | No positioning/governance engine |
| Cross-product intelligence (AuditOS, DecisionOS, LocalContentOS) | Siloed CRM domain |
| Tenant governance with audit export for regulators | Standard SaaS audit, not institutional evidence graph |
| Saudi institutional sales context (ICV, tender adjacency) | Generic global CRM |
| Private/on-prem institutional deployment story | Self-host exists but not AQLIYA Core integration |
| Sales memory as learning system | Pipeline CRM, not governed institutional memory |

---

## What NOT to Copy

| Twenty pattern | Why avoid for SalesOS v0.3 |
|----------------|---------------------------|
| Full metadata engine / dynamic GraphQL | Massive scope; conflicts with Prisma-first AQLIYA stack |
| Generic CRM clone (leads, deals, email sync) | AGENTS.md §21.5: "should not be a CRM clone" |
| AGPL codebase embedding | License engineering risk (see 06-integration-decision.md) |
| Workspace-per-tenant dynamic schema | AQLIYA uses explicit Prisma models + migrations |
| Twenty's AI chatbot as decision surface | Violates AQLIYA trust principle |
| 20+ root GraphQL resolvers pattern | Complexity; AQLIYA uses Server Actions |
| Billing/credits model | Not relevant to institutional private platform |

---

## What to Borrow (Conceptually)

1. **Pipeline board UX** — stage columns, drag-drop (future)
2. **Record detail layout** — header + tabs (overview, activity, evidence)
3. **Saved views / filters** — lightweight, not full metadata engine
4. **Command palette navigation** — AQLIYA already has `command-palette.tsx`; extend for sales entities
5. **Activity timeline component pattern** — already partially in `entity-timeline.tsx`
6. **Object relation modeling** — Account → Contacts → Opportunities (static Prisma, not dynamic)
7. **Webhook/event thinking** — map to `SalesAuditEvent` + `PlatformAuditLog`

---

## Twenty vs SalesOS Positioning

| | Twenty | SalesOS (target) |
|---|--------|------------------|
| Identity | Open-source CRM | Governed revenue intelligence under AQLIYA |
| Primary user | Sales team | Institutional commercial + governance teams |
| Core loop | Pipeline → close | Qualify → evidence → review → memory → next action |
| Data philosophy | Flexible schema | Fixed governed schema with audit |
| AI role | Chatbot + workflow agents | Draft/suggest only; human approval required |

---

## Benchmark Sources

- [Twenty GitHub](https://github.com/twentyhq/twenty)
- [Developers Introduction](https://docs.twenty.com/developers/introduction)
- [Custom Objects](https://docs.twenty.com/developers/contribute/capabilities/backend-development/custom-objects)
- [GraphQL API](https://docs.twenty.com/developers/api/graphql-api)
- [Folder Architecture (server)](https://docs.twenty.com/developers/contribute/capabilities/backend-development/folder-architecture-server)
- LICENSE: AGPL v3 + Enterprise-carved files

**Warning:** Twenty evolves rapidly. Treat all API/architecture notes as **point-in-time benchmark**, not integration spec.
