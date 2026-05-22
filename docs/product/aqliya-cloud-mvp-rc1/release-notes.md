# AQLIYA Cloud MVP RC1 — Release Notes

**Release:** RC1 (Release Candidate 1)
**Date:** 2026-05-20
**Status:** Cloud MVP — not production general availability
**Classification:** Cloud SaaS (not On-Prem, not Private, not Air-Gapped)
**Principle:** AI assists. Humans decide. Evidence governs.

---

## Release Purpose

This release candidate freezes the first complete AQLIYA Cloud MVP for demo and pilot evaluation with target client Sombol. It is not a production general availability release. Production readiness requires resolving documented migration drift, security gaps, and operational procedures.

**Recommended use:** Internal demos, Sombol pilot evaluation, controlled client workshops.

**Not recommended for:** Production deployment with real client data without completing the production migration plan.

---

## Implemented Capabilities

### Platform Foundation

| Capability | Status | Details |
|---|---|---|
| PlatformOrganization bridge | Complete | Links DecisionOS and AuditOS org hierarchies |
| ClientWorkspace | Complete | Client data isolation within organization |
| Project | Complete | Execution unit within workspace |
| PlatformAuditLog | Complete | Unified audit trail across products |
| Auth middleware | Active | Route-level protection for all workspace paths |
| Security headers | Active | Wired into middleware |
| Read-only admin pages | 3 pages | platform-organization, workspaces, audit-logs |

### AuditOS

| Capability | Status | Details |
|---|---|---|
| Engagement lifecycle | Pilot-ready | Create, edit, review, approve, publish |
| Trial balance upload | Complete | |
| Account mapping | Complete | With deterministic suggestions |
| Financial statements | Complete | With disclosure notes |
| Evidence vault | Complete | Upload, link, track |
| Findings & recommendations | Complete | |
| Review & approval workflow | Complete | |
| PDF/XLSX export | Complete | |
| Audit trail | Complete | Per-engagement audit events |
| Platform context card | Complete | Shows workspace/project context per engagement |
| Dashboard workspace badges | Complete | Project/workspace indicators on engagement list |

### DecisionOS — Audit Integration

| Capability | Status | Details |
|---|---|---|
| Audit log unification | Complete | DecisionOS events write to PlatformAuditLog |
| Action audit coverage | Complete | All 21+ AuditAction enum values covered via `logAudit()` + refactored sites |
| Platform org context | Complete | platformOrganizationId resolved from legacy Organization |

### Office AI Assistant

| Capability | Status | Details |
|---|---|---|
| Task creation (6 types) | Complete | document_summary, excel_analysis, report_draft, presentation_outline, executive_summary, meeting_notes |
| Bilingual output | Complete | Arabic and English |
| Deterministic generation | Complete | Template-based structured outputs |
| File upload | Complete | Real file upload via platform storage + metadata fallback |
| File validation | Complete | Extension (7 types), size (10 MB), sanitization |
| File removal | Complete | Storage + DB deletion with auth |
| File content extraction (TXT) | Complete | UTF-8 text |
| File content extraction (CSV) | Complete | Headers + sample rows + row count |
| File content extraction (XLSX) | Complete | Sheet names + column headers + sample rows |
| File content extraction (DOCX) | Complete | Full text via mammoth |
| File content extraction (PDF text layer) | Complete | Text via pdf-parse |
| Review workflow | Complete | Submit, approve, reject |
| Human review gate | Complete | All outputs are draft until approved |
| PlatformAuditLog events | 5+ types | task.created, file.attached, output.created, status_changed, extraction events |
| Extraction audit events | 3 types | extraction_started, completed, failed |
| Route: list | `/assistant` | Task creation + recent tasks |
| Route: detail | `/assistant/[taskId]` | Task detail + review + generation |
| Sidebar navigation | Complete | Link in DecisionOS, AuditOS, SalesOS |

### Sombol Demo Pack

| Document | Status |
|---|---|
| Demo script (Arabic) | Complete |
| Cloud pilot offer | Complete |
| Implementation scope (3 phases) | Complete |
| Capabilities and limitations | Complete |
| Private deployment roadmap | Complete |
| Demo rehearsal checklist | Complete |
| Cloud AI risk gate | Complete |
| Extraction design | Complete |

### Verification Scripts

| Script | Purpose | Status |
|---|---|---|
| `verify-platform-organization-links.ts` | Org link coverage | ✅ |
| `verify-client-workspace-links.ts` | Workspace/project link coverage | ✅ |
| `verify-platform-audit-logs.ts` | Audit log counts and coverage | ✅ |
| `verify-auditos-dual-write.ts` | AuditOS → PlatformAuditLog | ✅ |
| `verify-decisionos-dual-write.ts` | DecisionOS → PlatformAuditLog | ✅ |
| `verify-office-ai-task-service.ts` | Office AI service CRUD + audit | ✅ |
| `verify-office-ai-file-validation.ts` | File validation + generation | ✅ |
| `verify-office-ai-extraction.ts` | File content extraction (all 5 types) | ✅ |

---

## Not Included

| Capability | Reason | Target Phase |
|---|---|---|
| OCR (scanned PDFs) | Not implemented | Post-MVP |
| Cloud AI (OpenAI/Claude) | Risk gate not approved; CloudAIProvider is a stub | Phase 4 |
| Local AI runtime | Not implemented | Phase 5 |
| Malware scanning | Not implemented; pre-production requirement | Pre-production |
| LocalContentOS workspace | Marketing page only | Phase 6 |
| AQLIYA Studio | Not implemented | Phase 9 |
| Private/On-Prem deployment | Not ready; requires production migration baseline | Phase 3 |
| Air-Gapped mode | Not implemented | Post-Phase 3 |
| PlatformUser / PlatformRole | Deferred; RBAC per-product still active | Post-MVP |
| SSO / SAML / LDAP | Not available | Post-MVP |
| Email integration | Not implemented | Post-MVP |

---

## Migration Warning

> **هام:** هذا الإصدار تم تطويره باستخدام `prisma db push` في بيئة التطوير. الانتقال إلى الإنتاج يتطلب تنفيذ خطة الترحيل الموثقة في `docs/product/aqliya-production-migration-plan.md`. لا تستخدم `prisma db push` في الإنتاج.

The current database schema includes tables (`ClientWorkspace`, `Project`, `PlatformAuditLog`, `OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile`) that are not in any committed migration file. Production deployment requires the consolidated migration SQL.

---

## Recommended Use

| السيناريو | التوافق |
|---|---|
| عرض داخلي (Internal demo) | ✅ منصة جاهزة |
| تقييم Sombol التجريبي (Sombol pilot) | ✅ مع الاتفاق على القيود |
| تشغيل إنتاجي حقيقي (Production) | ❌ غير جاهز — راجع خطة الترحيل |
| نشر داخلي (Private/On-Prem) | ❌ غير متوفر |
| استخدام بيانات حقيقية بدون فحص ملفات | ❌ غير آمن — فحص الفيروسات غير مطبّق |

> **AI assists. Humans decide. Evidence governs.**
> **الذكاء يساعد. الإنسان يقرر. الدليل يحكم.**
