# Office AI Assistant — Foundation Design

**Version:** 1.1
**Status:** Partially implemented governed shared application — document still includes design and deferred-scope sections
**Aligned with:** official v1.1 vision, `aqliya-product-taxonomy-v1.1.md`, `aqliya-cloud-platform-build-plan.md`
**Classification:** Shared governed application (NOT a standalone product)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Classification](#2-product-classification)
3. [Business Context: Sombol and Multi-Client Firms](#3-business-context-sombol-and-multi-client-firms)
4. [MVP Scope](#4-mvp-scope)
5. [Deferred Scope](#5-deferred-scope)
6. [Core User Workflows](#6-core-user-workflows)
7. [Platform Context Model](#7-platform-context-model)
8. [Governance and Human Review Rules](#8-governance-and-human-review-rules)
9. [AI Task Lifecycle](#9-ai-task-lifecycle)
10. [Proposed Data Model](#10-proposed-data-model)
11. [Route and UI Proposal](#11-route-and-ui-proposal)
12. [File and Evidence Handling](#12-file-and-evidence-handling)
13. [Prompt Registry Strategy](#13-prompt-registry-strategy)
14. [Audit Log Event Taxonomy](#14-audit-log-event-taxonomy)
15. [Security and Privacy Rules](#15-security-and-privacy-rules)
16. [Cloud-First / Private-Ready Strategy](#16-cloud-first--private-ready-strategy)
17. [Implementation Backlog](#17-implementation-backlog)
18. [Risks and Mitigations](#18-risks-and-mitigations)
19. [No-Go Conditions](#19-no-go-conditions)
20. [Recommended Sprint 5B](#20-recommended-sprint-5b)

---

## 1. Executive Summary

Office AI Assistant is the **first shared governed application** built on AQLIYA Intelligence Core. It is **not a standalone product** and **not a generic chatbot**. It helps employees analyze files, summarize documents, draft reports, and support office workflows — all within the AQLIYA governance framework.

Implementation reality as of the v0.1 hardening pass:

- Real routes exist at `/assistant` and `/assistant/[taskId]`
- Real Prisma models exist for `OfficeAiTask`, `OfficeAiOutput`, and `OfficeAiFile`
- Real server actions exist in `src/actions/office-ai-actions.ts`
- Real platform audit-log writes exist via `PlatformAuditLog`
- Current assistant generation is deterministic/template-backed, not a live cloud AI runtime
- Download access is permissioned at route level

### Why Platform Foundation Matters

Office AI Assistant builds on the completed platform foundation:

- **PlatformOrganization** — tenant identity
- **ClientWorkspace** — client data isolation
- **Project** — execution boundary
- **PlatformAuditLog** — cross-product audit trail
- **AI Orchestration** — provider abstraction (deterministic active, Cloud AI stub, Local AI deferred)

### Design Principles

| Principle      | Application                                    |
| -------------- | ---------------------------------------------- |
| Governed       | Every output is draft until human-reviewed     |
| Evidence-aware | Every output references source files           |
| Permissioned   | Scoped to workspace/project RBAC               |
| Auditable      | Every AI action logged to PlatformAuditLog     |
| Bilingual      | Arabic-first, English support                  |
| Cloud-first    | MVP uses Deterministic AI; Cloud AI when wired |
| Private-ready  | Same design works with Local AI (deferred)     |

---

## 2. Product Classification

**Office AI Assistant is NOT:**

- A standalone product like AuditOS or LocalContentOS
- A generic chatbot or conversational AI
- A replacement for human decision-making
- A SaaS-only tool — designed for Cloud + Private

**Office AI Assistant IS:**

- A shared governed application built on AQLIYA Intelligence Core
- An employee productivity tool within workspace/project boundaries
- A human-reviewed, evidence-linked, permissioned AI assistant
- A bilingual (Arabic/English) work assistant
- A Cloud-first tool designed for Private-ready deployment

### How It Differs from AuditOS AI

| Aspect       | AuditOS AI (Existing)                         | Office AI Assistant (Current)         |
| ------------ | --------------------------------------------- | ------------------------------------- |
| Scope        | Audit-specific (TB analysis, findings, notes) | General office tasks                  |
| Context      | Engagement-scoped                             | Workspace/project-scoped              |
| UI           | Embedded in audit pages                       | Dedicated assistant panel + embedded  |
| Output types | Financial review, evidence suggestions        | Summaries, drafts, outlines, analysis |
| Users        | Audit professionals                           | All employees                         |

---

## 3. Business Context: Sombol and Multi-Client Firms

### User Personas

| Persona                | Use Case                                         | Need                                   |
| ---------------------- | ------------------------------------------------ | -------------------------------------- |
| **Audit professional** | Summarize client PDF/Word files before review    | Quick document understanding           |
| **Content analyst**    | Analyze supplier Excel data for local content    | Data insights without spreadsheet work |
| **Executive**          | Generate executive summary from multiple reports | Decision-ready synthesis               |
| **Manager**            | Draft presentation outline for client meeting    | Time-saving content structure          |
| **Team lead**          | Summarize meeting notes from review sessions     | Action item capture                    |

### Sombol Pattern

A Sombol employee working across multiple clients:

- Opens Office AI Assistant within a **ClientWorkspace** (e.g., "Saudi Aramco")
- Uploads a PDF — assistant summarizes it
- Asked a question — response references the specific file and page
- Output is reviewed by the employee before use
- All actions are logged, permissioned, and scoped to that workspace
- Switching to a different workspace (e.g., "SABIC") shows completely different files and context

---

## 4. MVP Scope

### In MVP

| Capability                      | Description                                      | Priority |
| ------------------------------- | ------------------------------------------------ | -------- |
| **PDF/Word summarization**      | Upload PDF/Word, get a structured summary        | P0       |
| **Excel analysis**              | Upload Excel, get key insights/trends            | P0       |
| **Report drafting**             | Provide context/template, get a draft report     | P0       |
| **Presentation outline**        | Generate slide outline from source material      | P0       |
| **Executive summary**           | Synthesize multiple documents into summary       | P1       |
| **Meeting notes summarization** | Paste notes, get structured summary              | P1       |
| **Bilingual Arabic/English**    | Output in Arabic or English based on preference  | P0       |
| **Human review gate**           | All outputs require human review before use      | P0       |
| **Source linking**              | Output references specific source files          | P0       |
| **PlatformAuditLog**            | All actions logged                               | P0       |
| **RBAC scoping**                | Assistant respects workspace/project permissions | P0       |

### MVP Constraints

| Constraint                           | Rationale                           |
| ------------------------------------ | ----------------------------------- |
| Deterministic AI only                | Cloud AI provider is still a stub   |
| No conversational memory             | Each query is stateless             |
| No streaming responses               | Full response, then display         |
| No email integration                 | Requires secure email connector     |
| No client file Q&A                   | Deferred to post-MVP                |
| English-first UI with Arabic support | Arabic-first UI in future iteration |
| Cloud only                           | Local AI deferred to Phase 5        |

---

## 5. Deferred Scope

| Capability              | Defer To        | Reason                             |
| ----------------------- | --------------- | ---------------------------------- |
| Client file Q&A         | Post-MVP        | Requires vector search + retrieval |
| Email summarization     | Post-MVP        | Requires secure email integration  |
| Conversational memory   | Post-MVP        | Adds complexity; MVP is stateless  |
| Streaming AI responses  | Post-MVP        | UX enhancement, not core           |
| Custom prompt templates | Post-MVP        | Requires Studio                    |
| Cloud AI provider       | Phase 4 roadmap | Cloud AI provider not yet wired    |
| Local AI provider       | Phase 5 roadmap | Requires Local AI runtime          |
| Arabic-first UI         | Post-MVP        | English MVP; Arabic UX later       |
| Mobile access           | Post-MVP        | Not in scope for MVP               |
| Scheduled AI tasks      | Post-MVP        | Background job infrastructure      |

---

## 6. Core User Workflows

### Workflow 1: Document Summarization

```
1. User selects "Summarize Document" in assistant panel
2. User uploads or selects a file (PDF/Word) from workspace
3. System validates: file type, size, permissions
4. System sends file content to AI Orchestration (with project context)
5. AI generates structured summary:
   - Key points
   - Action items
   - Questions for follow-up
6. Summary displayed as draft with source file reference
7. User reviews and accepts/edits/rejects
8. If accepted → output finalized, logged to PlatformAuditLog
9. Output can be exported (copy, download PDF)
```

### Workflow 2: Excel Analysis

```
1. User uploads or selects an Excel file
2. System detects sheets, columns, data types
3. AI analyzes: trends, outliers, totals, patterns
4. Results displayed as structured analysis with key findings
5. Human review gate
6. Optionally export to PDF/XLSX report
```

### Workflow 3: Report Drafting

```
1. User selects "Draft Report"
2. User provides: topic, key points, source files, tone
3. User selects language (Arabic/English)
4. AI generates draft report
5. User reviews and refines
6. Final review gate
7. Export as PDF/DOCX
```

### Workflow 4: Presentation Outline

```
1. User selects "Generate Outline"
2. User provides: topic, audience, key messages
3. AI generates slide-by-slide outline
4. Review and refine
5. Export as PPTX outline
```

### Workflow 5: Executive Summary

```
1. User selects multiple source files or notes
2. AI synthesizes into executive summary
3. Source-linked statements
4. Review and approve
5. Export as PDF
```

### Workflow 6: Meeting Notes

```
1. User pastes raw meeting notes
2. AI structures into: attendees, topics, decisions, action items
3. Review and refine
4. Export as PDF or copy to clipboard
```

---

## 7. Platform Context Model

Every AI query carries platform context:

```typescript
interface AssistantContext {
  platformOrganizationId: string;
  clientWorkspaceId?: string;
  projectId?: string;
  userId: string;
  userRole: string;
  userPermissions: string[];
  locale: "ar" | "en";
}
```

### Context Resolution Chain

```
User (authenticated)
  → session.user.platformOrganizationId (or resolve via Organization)
  → current workspace (from URL, session, or explicit selection)
  → current project (from URL or explicit selection)
  → File references (within workspace scope)
```

### How Context is Used

| Context Field          | AI Governance         | File Access               | Audit Log             |
| ---------------------- | --------------------- | ------------------------- | --------------------- |
| platformOrganizationId | Tenant isolation      | Filter files by org       | Required field        |
| clientWorkspaceId      | Scope AI to workspace | Filter files by workspace | Required if available |
| projectId              | Scope AI to project   | Filter files by project   | Required if available |
| userId                 | Track who requested   | Check permissions         | Required field        |
| userRole               | RBAC enforcement      | —                         | Logged                |
| locale                 | Output language       | —                         | —                     |

---

## 8. Governance and Human Review Rules

### Core Rules

1. **All AI outputs are DRAFT** until human-reviewed
2. **No autonomous decisions** — AI suggests, humans decide
3. **No cross-client data mixing** — scoped to single workspace
4. **No customer data training** — zero-shot prompts only
5. **All actions logged** — to PlatformAuditLog
6. **No chatbot interface** — structured task types only
7. **No export without approval** — reviewed outputs only
8. **Evidence linking required** — every claim references source

### Review Flow

```
AI Output → Draft State
  ├── Accept → Finalized → Available for export
  ├── Edit → User modifies → Accept → Finalized
  ├── Reject → Discarded (logged with reason)
  └── Request Regeneration → AI re-generates with feedback
```

### Review States

| State       | Meaning                    | Next Actions                     |
| ----------- | -------------------------- | -------------------------------- |
| `draft`     | AI generated, not reviewed | accept, edit, reject, regenerate |
| `finalized` | Human-approved             | export, archive                  |
| `rejected`  | Human-rejected with reason | view, discard                    |
| `archived`  | Stored for reference       | view                             |

### Permission Enforcement

| Action              | Required Role                  |
| ------------------- | ------------------------------ |
| Create AI task      | workspace member               |
| Review own task     | creator                        |
| Review others' task | workspace admin / project lead |
| Export final output | project editor+                |
| Delete output       | workspace admin                |
| View audit logs     | workspace viewer+              |

---

## 9. AI Task Lifecycle

```
                ┌──────────┐
                │   DRAFT  │ ← AI generates output
                └────┬─────┘
                     │
              ┌──────┼──────┐
              ▼      ▼      ▼
          ACCEPT   EDIT   REJECT
              │      │      │
              ▼      ▼      ▼
         ┌──────────┐    ┌──────────┐
         │ FINALIZED│    │ REJECTED │
         └────┬─────┘    └──────────┘
              │
              ▼
         ┌──────────┐
         │ ARCHIVED │
         └──────────┘
```

### Lifecycle Events

| Event                      | Logged Action                    | Severity |
| -------------------------- | -------------------------------- | -------- |
| Task created               | `assistant.task_created`         | info     |
| AI generation started      | `assistant.generation_started`   | info     |
| AI generation completed    | `assistant.generation_completed` | info     |
| AI generation failed       | `assistant.generation_failed`    | error    |
| Output reviewed (accepted) | `assistant.output_accepted`      | info     |
| Output reviewed (edited)   | `assistant.output_edited`        | info     |
| Output reviewed (rejected) | `assistant.output_rejected`      | info     |
| Output exported            | `assistant.output_exported`      | info     |
| Task archived              | `assistant.task_archived`        | info     |

---

## 10. Proposed Data Model

### OfficeAiTask

```prisma
model OfficeAiTask {
  id                     String    @id @default(cuid())
  projectId              String?
  clientWorkspaceId      String?
  platformOrganizationId String

  taskType               String    // "summarize" | "analyze" | "draft" | "outline" | "exec_summary" | "meeting_notes"
  title                  String
  status                 String    @default("draft")  // draft | finalized | rejected | archived
  language               String    @default("ar")     // "ar" | "en"
  sourceContext           String?   // User-provided instructions, notes, or context

  createdBy              String
  createdByEmail         String?
  createdByName          String?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt

  outputs                OfficeAiOutput[]
  sourceFiles            OfficeAiFile[]

  @@index([projectId, status])
  @@index([clientWorkspaceId, createdAt])
  @@index([platformOrganizationId, createdAt])
  @@index([createdBy, createdAt])
}
```

### OfficeAiOutput

```prisma
model OfficeAiOutput {
  id                     String    @id @default(cuid())
  taskId                 String
  task                   OfficeAiTask @relation(fields: [taskId], references: [id])

  outputType             String    // "summary" | "analysis" | "report_draft" | "outline" | "executive_summary" | "meeting_notes"
  content                String    // The AI-generated output (markdown or structured text)
  format                 String    @default("markdown")  // "markdown" | "text" | "html"

  status                 String    @default("draft")     // draft | finalized | rejected
  aiProvider             String?   // "deterministic" | "cloud_ai" | "local_ai"
  aiModelVersion         String?
  aiPromptVersion        String?
  aiConfidence           Float?

  reviewedBy             String?
  reviewedAt             DateTime?
  reviewNotes            String?
  rejectionReason        String?

  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt

  @@index([taskId])
  @@index([status])
}
```

### OfficeAiFile

```prisma
model OfficeAiFile {
  id                     String    @id @default(cuid())
  taskId                 String?
  task                   OfficeAiTask? @relation(fields: [taskId], references: [id])

  filename               String
  fileType               String    // "pdf" | "docx" | "xlsx" | "txt" | "csv"
  fileSize               Int
  storageKey             String    // reference to File Vault
  fileHash               String?

  uploadedBy             String
  uploadedAt             DateTime  @default(now())

  @@index([taskId])
  @@index([fileHash])
}
```

### Model Decisions

| Decision                                                    | Rationale                                              |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| No FK to AuditEngagement/Decision                           | Office AI Assistant is not AuditOS-specific            |
| `projectId` and `clientWorkspaceId` are optional strings    | Can log tasks even when no workspace/project is active |
| `aiProvider`, `aiModelVersion`, `aiPromptVersion` on output | Audit traceability for AI governance                   |
| `reviewedBy`, `reviewedAt`, `reviewNotes` on output         | Full human review trail                                |
| Separate `OfficeAiFile` model                               | File references independent of any product model       |

---

## 11. Route and UI Proposal

### Routes

```
/(dashboard)/[orgSlug]/
├── assistant/                    ← Main assistant page (full-page)
│   ├── new                       ← Create new task
│   └── [taskId]                  ← View task detail / review output
│
/ (embedded within existing pages)
├── audit/engagements/[id]/
│   └── (Assistant panel)         ← Embedded panel for audit context
├── content/projects/[id]/
│   └── (Assistant panel)         ← Embedded for LocalContentOS
└── (future product pages)
    └── (Assistant panel)         ← Embedded for each product
```

### MVP Route (Before org slug migration)

```
/(dashboard)/
└── assistant/                    ← Main assistant page
    ├── new                       ← Create new task
    └── [taskId]                  ← View task detail
```

### UI Structure (Main Page)

```
┌─────────────────────────────────────────────────────────┐
│  Office AI Assistant — ذكاء المهام المكتبية              │
├─────────────────────────────────────────────────────────┤
│  [Workspace selector]            [Language: AR/EN]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────── Assistant Panel ──────────────────────┐   │
│  │                                                  │   │
│  │  Select task type:                               │   │
│  │  [Summarize] [Analyze] [Draft] [Outline] [...]   │   │
│  │                                                  │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │  Upload files or paste context...         │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  │                                                  │   │
│  │  Language: [Arabic ▼]                           │   │
│  │                                                  │   │
│  │  [  Generate  ]                                 │   │
│  │                                                  │   │
│  │  ┌────────────── Output ────────────────────┐   │   │
│  │  │  [Draft] ⚠ Review required               │   │   │
│  │  │                                           │   │   │
│  │  │  # Executive Summary                     │   │   │
│  │  │  - Key finding 1 [Source: report.pdf]    │   │   │
│  │  │  - Key finding 2 [Source: data.xlsx]     │   │   │
│  │  │                                           │   │   │
│  │  │  [Accept] [Edit] [Reject] [Regenerate]   │   │   │
│  │  └───────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────── History ─────────────────────────────┐   │
│  │  Recent tasks...                                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Embedded Panel (Within AuditOS Engagement)

```
┌─── Platform Context ──────────────────────────────┐
│  سیاق المنصة / Platform Context                   │
│  Workspace: Gulf Trading Co.                       │
│  Project: FY2025 Audit                             │
└────────────────────────────────────────────────────┘

┌─── AI Assistant ──────────────────────────────────┐
│  [Summarize this engagement]                       │
│  [Draft finding report]                            │
│  [Generate executive summary]                      │
│                                                    │
│  → Output appears inline with review buttons       │
└────────────────────────────────────────────────────┘
```

### Route Protection

- `/assistant/*` protected by existing middleware (covered by protected paths)
- Embedded panels inherit page-level protection
- No public assistant routes

---

## 12. File and Evidence Handling

### File Upload Flow

```
1. User selects file for analysis
2. File uploaded to File Vault (existing storage abstraction)
3. File scanned for type/size validation:
   - Allowed: pdf, docx, xlsx, csv, txt, md
   - Max size: 20MB per file (configurable)
   - Blocked: executable, archive, image-only files
4. File stored at path: {orgSlug}/{workspaceId}/{projectId}/office-ai/{taskId}/{filename}
5. File reference saved in OfficeAiFile record
6. File hash computed for deduplication
```

### Evidence Linking

When generating output, the assistant links claims to source files:

```json
{
  "output": "Revenue increased by 15% in Q3.",
  "evidence": [
    {
      "fileId": "file-abc-123",
      "filename": "financial-summary-q3.xlsx",
      "sheet": "Summary",
      "cell": "B12",
      "context": "Revenue growth rate calculation"
    }
  ]
}
```

### File Access Rules

| Rule                                            | Enforcement                      |
| ----------------------------------------------- | -------------------------------- |
| Can only access files within current workspace  | Filter by workspaceId            |
| Can only access files uploaded to the assistant | Not product evidence (initially) |
| File download logged                            | PlatformAuditLog                 |
| File retention follows workspace retention      | Auto-delete with workspace       |

---

## 13. Prompt Registry Strategy

### Current State

The AI Orchestration layer has a `prompt-registry.ts` that maps `GovernanceTaskType` values to prompt builders. Currently supports 5 AuditOS-specific task types.

### Extension for Office AI Assistant

Add new task types to the registry:

```typescript
// New task types for Office AI Assistant
const OFFICE_AI_TASK_TYPES = {
  document_summarize: "office_ai_document_summarize",
  excel_analyze: "office_ai_excel_analyze",
  report_draft: "office_ai_report_draft",
  presentation_outline: "office_ai_presentation_outline",
  executive_summary: "office_ai_executive_summary",
  meeting_notes: "office_ai_meeting_notes",
} as const;
```

### MVP Prompt Strategy

| Task Type              | Provider      | Prompt Approach                                                  |
| ---------------------- | ------------- | ---------------------------------------------------------------- |
| `document_summarize`   | Deterministic | Structured template — extract sections, key points, action items |
| `excel_analyze`        | Deterministic | Column analysis, trend detection, summary stats                  |
| `report_draft`         | Deterministic | Template-based with user-provided context                        |
| `presentation_outline` | Deterministic | Predefined outline structure                                     |
| `executive_summary`    | Deterministic | Condensation template from provided content                      |
| `meeting_notes`        | Deterministic | Template-based structuring                                       |

### Prompt Versioning

- Prompts stored as templates in a config file or DB
- Each prompt has a version identifier
- Version logged in `OfficeAiOutput.aiPromptVersion`
- Prompt changes are additive — never remove versions without migration plan

---

## 14. Audit Log Event Taxonomy

### Event Types

| Event                            | Description                | Severity |
| -------------------------------- | -------------------------- | -------- |
| `assistant.task_created`         | New AI task created        | info     |
| `assistant.file_uploaded`        | File uploaded for analysis | info     |
| `assistant.generation_started`   | AI generation started      | info     |
| `assistant.generation_completed` | AI generation succeeded    | info     |
| `assistant.generation_failed`    | AI generation failed       | error    |
| `assistant.output_accepted`      | Human accepted output      | info     |
| `assistant.output_edited`        | Human edited output        | info     |
| `assistant.output_rejected`      | Human rejected output      | info     |
| `assistant.output_exported`      | Output exported            | info     |
| `assistant.task_archived`        | Task archived              | info     |

### PlatformAuditLog Mapping

```typescript
// Example: document summarization completed
writePlatformAuditLog({
  productKey: "office_ai",
  action: "assistant.generation_completed",
  platformOrganizationId,
  clientWorkspaceId,
  projectId,
  actorId: userId,
  actorType: "ai",
  actorName: "Office AI Assistant",
  targetType: "office_ai_task",
  targetId: taskId,
  severity: "info",
  sourceSystem: "office_ai",
  sourceModel: "OfficeAiTask",
  sourceId: taskId,
  aiProvider: "deterministic",
  aiPromptVersion: "document-summarize-v1",
  aiOutputReviewStatus: "pending",
  evidenceRefs: sourceFiles.map((f) => ({
    fileId: f.id,
    filename: f.filename,
  })),
  metadata: {
    taskType: "summarize",
    outputType: "summary",
    fileCount: sourceFiles.length,
  },
});
```

---

## 15. Security and Privacy Rules

### No Training on Customer Data

- AI prompts are zero-shot — no customer data used for model training
- No conversation history stored beyond the active task
- No data sharing between tenants

### Data Isolation

| Layer        | Isolation     | Enforcement                                      |
| ------------ | ------------- | ------------------------------------------------ |
| Platform org | Hard boundary | All queries filtered by `platformOrganizationId` |
| Workspace    | Hard boundary | Tasks and files scoped to `clientWorkspaceId`    |
| Project      | Soft boundary | Tasks can be project-scoped                      |

### File Security

- Uploaded files scanned for allowed types
- Max file size enforced
- Files stored in tenant-isolated storage path
- File access logged
- File deletion follows workspace retention policy

### Output Security

- All outputs are DRAFT until human-reviewed
- No auto-export or auto-distribution
- Outputs linked to source files (evidence trail)
- Outputs deletable by workspace admins

### Privacy by Design

- Minimal PII in logs — actor IDs, not personal data
- File content not stored outside file vault
- AI prompts contain only file content + context — no personal data
- Retention policies apply to all AI outputs

---

## 16. Cloud-First / Private-Ready Strategy

### MVP: Deterministic AI (Cloud-hosted)

```
User → Office AI Assistant UI → AI Orchestration → DeterministicAIProvider → Response
  → PlatformAuditLog logging
```

### Phase 4: Cloud AI (Cloud-hosted)

```
User → Office AI Assistant UI → AI Orchestration → CloudAIProvider (OpenAI/Claude) → Response
  → Fallback to Deterministic if Cloud unavailable
  → PlatformAuditLog logging
```

### Phase 5: Local AI (Private/On-Prem)

```
User → Office AI Assistant UI → AI Orchestration → LocalAIProvider (Ollama/vLLM) → Response
  → All processing within customer environment
  → PlatformAuditLog logging (local DB)
  → No external API calls
```

### Configuration-Driven

```typescript
// Cloud deployment
AI_PROVIDER=cloud_ai
AI_CLOUD_API_KEY=sk-...
AI_CLOUD_MODEL=gpt-4o

// Private deployment
AI_PROVIDER=local_ai
AI_LOCAL_ENDPOINT=http://localhost:11434
AI_LOCAL_MODEL=qwen2.5:7b
```

---

## 17. Implementation Backlog

### Sprint 5B: Schema + Write Path

| Task                                                           | File                   |
| -------------------------------------------------------------- | ---------------------- |
| Create `OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile` models | `prisma/schema.prisma` |
| Create `src/lib/office-ai/office-ai-task-service.ts`           | New                    |
| Create `writePlatformAuditLog()` calls for assistant events    | Integration            |
| Create backfill (none needed — new model)                      | —                      |

### Sprint 5C: Read Context + Guard

| Task                                                | File      |
| --------------------------------------------------- | --------- |
| Create `src/lib/office-ai/office-ai-context.ts`     | New       |
| Create `src/lib/platform/guards/office-ai-guard.ts` | New       |
| Add `assistant` to `protectedPaths` in middleware   | If needed |

### Sprint 5D: Admin Page + Navigation

| Task                                                             | File           |
| ---------------------------------------------------------------- | -------------- |
| Create `/assistant` route                                        | New            |
| Create assistant UI (task creation, file upload, output display) | New            |
| Create task history panel                                        | New            |
| Add sidebar link                                                 | Sidebar update |

### Sprint 5E: AI Integration

| Task                                                   | File                   |
| ------------------------------------------------------ | ---------------------- |
| Register Office AI task handlers with AI Orchestration | AI integration         |
| Wire DeterministicAIProvider for 6 task types          | `register-handlers.ts` |
| Add prompt templates for each task type                | `prompt-registry.ts`   |
| Connect file upload to Document Intelligence           | File handling          |

### Sprint 5F: Review Workflow

| Task                                           | File              |
| ---------------------------------------------- | ----------------- |
| Implement accept/edit/reject/regenerate logic  | Server actions    |
| Add PlatformAuditLog events for review actions | Audit integration |
| Add review gate before export                  | Export control    |

### Sprint 5G: Embedded Panel + Polish

| Task                                         | File                |
| -------------------------------------------- | ------------------- |
| Create embedded assistant panel component    | Component           |
| Add platform context card to assistant pages | Context integration |
| Bilingual output support                     | Translation         |
| Final testing and validation                 | Testing             |

---

## 18. Risks and Mitigations

| Risk                                      | Likelihood | Impact   | Mitigation                                                                                       |
| ----------------------------------------- | ---------- | -------- | ------------------------------------------------------------------------------------------------ |
| Office AI Assistant perceived as chatbot  | Medium     | High     | Explicit UI labeling as "governed work assistant"; no free-form chat; structured task types only |
| File upload size limits too restrictive   | Medium     | Low      | Configurable limit; document clear error messages                                                |
| Deterministic AI output quality poor      | Medium     | Medium   | Structured templates with fallback to Cloud AI when wired                                        |
| Cross-workspace file access by mistake    | Low        | Critical | Strict workspace/project scoping in all queries                                                  |
| No conversational memory frustrates users | Medium     | Low      | MVP expectation setting; defer memory to post-MVP                                                |
| Arabic output quality                     | Medium     | Medium   | Test with Arabic content early; improve templates                                                |

---

## 19. No-Go Conditions

### Hard No-Go (Stop Immediately)

| Condition                                       | Action                                |
| ----------------------------------------------- | ------------------------------------- |
| AI output contains data from wrong workspace    | Stop, investigate file access scoping |
| AI output accepted without human review         | Stop, fix review gate                 |
| PlatformAuditLog entry missing for AI action    | Stop, fix audit wiring                |
| File upload bypasses workspace permission check | Stop, fix RBAC                        |

### Soft No-Go (Pause)

| Condition                                          | Action                                                        |
| -------------------------------------------------- | ------------------------------------------------------------- |
| Deterministic AI output unusable for any task type | Switch to template + manual input; defer AI to Cloud AI phase |
| File upload latency > 5 seconds                    | Optimize or increase chunk size                               |
| More than 10 file types needed                     | Add gradually as requested                                    |

---

## 20. Recommended Sprint 5B

**Sprint 5B: Office AI Assistant Schema + Write Path**

1. Add `OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile` Prisma models
2. Create `src/lib/office-ai/office-ai-task-service.ts` with basic CRUD
3. Wire assistant events to PlatformAuditLog via `writePlatformAuditLog()`
4. Run validation (generate, tsc, lint, build)
5. Add verification script `npm run platform:verify-office-ai-schema`

**Do NOT build:** assistant UI, AI handlers, review workflow, embedded panels
