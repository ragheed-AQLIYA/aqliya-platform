# Institutional Memory Guide — دليل الذاكرة المؤسسية

> **Product:** Institutional Memory under AQLIYA  
> **Level:** L4 Usable v0.1  
> **Routes:** `/institutional-memory`, `/institutional-memory/collections`, `/institutional-memory/graph`  
> **Last updated:** 2026-06-18

---

## 1. Overview — نظرة عامة

Institutional Memory is AQLIYA's cross-product knowledge graph system. It connects entities across products (Decisions, Workflows, Accounts, Contacts) via typed events and relationships, creating an institutional memory that persists beyond any single workflow or decision.

**Key capabilities:**
- Cross-product entity linking via InstitutionalMemoryEvent
- Saved collections (InstitutionalMemoryCollection) — reusable queries
- Intelligence graph (nodes + edges) for visual exploration
- Agent Memory integration: SalesOS can read/write to Institutional Memory
- Dashboard with event timeline and relationship browser

---

## 2. Architecture — البنية المعمارية

### Data Models

#### InstitutionalMemoryEvent

The core linking model. Each event connects a source entity to a target entity across products.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| organizationId | UUID | Tenant owner |
| sourceProduct | String | Product where the event originates |
| sourceEntityId | String | Entity ID in source product |
| sourceEntityType | String | Entity type (e.g., "decision", "record", "account") |
| targetProduct | String | Product being linked to |
| targetEntityId | String | Entity ID in target product |
| targetEntityType | String | Entity type in target |
| eventType | String | Type of relationship (linked, referenced, associated, etc.) |
| description | Text | Human-readable description |
| metadata | JSON | Extensible metadata |
| confidence | Float | 0.0–1.0 confidence score |
| createdById | UUID | Who created the link |
| createdAt | DateTime | Timestamp |

#### InstitutionalMemoryCollection

A saved set of filter criteria that returns matching events.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| organizationId | UUID | Tenant owner |
| name | String | Collection name |
| description | Text | Optional description |
| filters | JSON | Filter criteria (product, eventType, date range, etc.) |
| createdById | UUID | Who created |
| updatedById | UUID | Who last updated |
| createdAt | DateTime | Timestamp |

#### IntelligenceGraphNode & IntelligenceGraphEdge

Knowledge graph for visual exploration.

| Model | Key Fields |
|-------|-----------|
| IntelligenceGraphNode | id, organizationId, label, type, entityId, entityProduct, metadata |
| IntelligenceGraphEdge | id, organizationId, sourceNodeId, targetNodeId, label, weight, metadata |

---

## 3. Cross-Product Linking — الربط بين المنتجات

### Link Pattern

Events use a flexible source → target pattern:

```
(sourceProduct: "decisionos", sourceEntityId: "dec_001")
  — eventType: "influenced" →
(targetProduct: "workflowos", targetEntityId: "wf_001")
```

### Supported Event Types

| eventType | Meaning |
|-----------|---------|
| linked | General relationship |
| referenced | One entity references another |
| associated | Entities are associated |
| influenced | One entity influenced another |
| derived | One entity derived from another |
| reviewed | Reviewed entity |
| approved | Approved entity |
| custom | User-defined type |

### How to Link Entities

1. Navigate to the source entity's detail page (decision, workflow record, account, etc.)
2. Click "Link to..." (ربط بـ)
3. Search for the target entity by name or ID
4. Select the relationship type
5. Add optional description
6. Submit — creates an InstitutionalMemoryEvent

### API

Links are created via `src/actions/institutional-memory/link-actions.ts`:
- `createLink(sourceProduct, sourceEntityId, targetProduct, targetEntityId, eventType, description, metadata)`
- `getLinksForEntity(product, entityId)` — returns all links for an entity
- `deleteLink(id)` — removes a link (logged to audit)

---

## 4. Collections — المجموعات

Collections are saved queries that allow you to bookmark or group related events.

### How to Create a Collection

1. Navigate to `/institutional-memory/collections`
2. Click "New Collection" (مجموعة جديدة)
3. Enter name and description
4. Define filters (product, event type, date range, keywords)
5. Save — the collection is stored as reusable criteria

### How to Use a Collection

1. Open a collection from the list
2. The system executes the saved filters against the events table
3. Results are displayed as a timeline or table
4. Collections can be shared with team members (via organization scoping)

---

## 5. Knowledge Graph View — عرض الرسم البياني المعرفي

The graph view at `/institutional-memory/graph` provides a visual representation of entity relationships.

### How to Use the Graph

1. Navigate to `/institutional-memory/graph`
2. The graph displays nodes (entities) and edges (relationships)
3. **Nodes** are color-coded by product:
   - Blue: DecisionOS
   - Green: WorkflowOS
   - Orange: LocalContentOS
   - Purple: SalesOS / Accounts / Contacts
4. **Edges** are labeled with event type
5. Click a node to see entity details
6. Click an edge to see the event details

### Data Source

The graph is powered by:
- `IntelligenceGraphNode` — entity nodes
- `IntelligenceGraphEdge` — relationship edges
- Both are generated/filtered from InstitutionalMemoryEvent data

---

## 6. Agent Memory Integration — تكامل ذاكرة الوكيل

Institutional Memory integrates with Agent Memory (used by SalesOS AI agents).

### How Agent Memory Syncs

1. SalesOS AI agents can read Institutional Memory events for context
2. Agents can write new events to Institutional Memory when they discover relationships
3. Sync is governed by `workflow.agent-memory` permission
4. All agent writes are logged in audit trail

### Agent Memory Read

Agents use `src/actions/agent-memory-actions.ts`:
```
getContextForEntity(entityType, entityId) → returns related events
```

### Agent Memory Write

Agents call `createAgentMemoryEntry(source, target, type, content)`:
- Source: the agent/entity creating the link
- Target: the entity being linked
- Type: event type
- Content: description + metadata

### Guardrails

- Agents cannot delete InstitutionalMemory events
- Agents cannot modify events created by humans
- All agent-created events have `confidence < 1.0`
- Human review can adjust confidence or delete agent-created links

---

## 7. Use Cases — حالات الاستخدام

### Linking Decisions to Workflows

A procurement decision (DecisionOS) can be linked to the resulting procurement workflow (WorkflowOS):

```
decision: "Procurement Plan Q3 2026"
  — eventType: "derived" →
workflow: "Procurement Execution for Q3 2026"
```

### Linking Accounts to Decisions

A client account (SalesOS) linked to decisions affecting them:

```
account: "Ministry of Finance"
  — eventType: "influenced" →
decision: "Budget Allocation 2026"
```

### Linking Contacts to Workflows

A stakeholder (LocalContactOS) linked to workflows they participated in:

```
contact: "Ahmed Al-Saud"
  — eventType: "reviewed" →
workflow: "Vendor Onboarding - Ministry"
```

---

## 8. Dashboard — لوحة المعلومات

The Institutional Memory dashboard (`/institutional-memory`) displays:

| Metric | Description |
|--------|-------------|
| Total Events | Count of all cross-product links |
| Event Timeline | Recent events in chronological order |
| Event Type Breakdown | Count by event type |
| Product Links | Links grouped by source → target product |
| Recent Collections | Last 5 saved collections |
| Graph Preview | Mini version of the knowledge graph |

---

## 9. Roles and Permissions — الصلاحيات والأدوار

| Role | Permissions |
|------|-------------|
| VIEWER | View events, collections, graph |
| OPERATOR | Create links, create collections, explore graph |
| ADMIN | Full CRUD, manage nodes/edges |

**Permission slugs:**
- `memory.view` — view events and graph
- `memory.create` — create links and collections
- `memory.edit` — edit events and collections
- `memory.delete` — delete events and collections
- `memory.agent` — agent read/write access

---

## 10. FAQ — الأسئلة الشائعة

### How is Institutional Memory different from a database foreign key?
Institutional Memory is cross-product and cross-entity. A decision in DecisionOS can link to a workflow in WorkflowOS and an account in SalesOS — these are different databases/models. Institutional Memory provides a unified relationship layer.

### Can I link an entity to itself?
Yes, self-referential links are allowed (e.g., linking a decision to a related decision).

### How is the knowledge graph generated?
The graph nodes and edges are generated from InstitutionalMemoryEvent data. Each unique source/target entity becomes a node, and each event becomes an edge.

### Can I export my collections?
Collections are stored as metadata/filters, not as data. You can view collection results and export individual entity data from their respective products.

### How are agent-created links different?
Agent-created links have a lower confidence score (typically 0.3–0.7) vs human-created links (1.0). Agent-created links can be escalated for human review and adjustment.

### Is the graph view real-time?
The graph is generated on request from the current event data. For large datasets, filtering by product or date range is recommended.

---

## 11. Related Resources

- Route Table: `docs/source-of-truth/ROUTE_STRATEGY.md`
- Product Status: `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- Architecture: `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`
- Link actions: `src/actions/institutional-memory/link-actions.ts`
- Agent memory: `src/actions/agent-memory-actions.ts`
- Graph models: `prisma/schema.prisma` (InstitutionalMemoryEvent, InstitutionalMemoryCollection, IntelligenceGraphNode, IntelligenceGraphEdge)