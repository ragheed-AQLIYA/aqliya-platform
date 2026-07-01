# Limitations & Safe Claims — LocalContentOS v0.1 Pilot

This document defines what can and cannot be claimed during pilot customer discussions, demos, and materials. It exists to protect commercial truthfulness.

## Allowed Claims

These claims are true and verifiable from the repository:

| Claim                                                           | Evidence                                                                                                                                                           |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| LocalContentOS is a governed local content assessment workspace | All 12 workspace routes render with real data. RBAC, audit trail, review, approval are implemented.                                                                |
| Supplier register with locality classification                  | Suppliers page shows locality badges (محلي/غير محلي/مشترك) with ownership and workforce data.                                                                      |
| Spend records with category and supplier links                  | Spend page renders records with amounts, categories, and supplier references.                                                                                      |
| Evidence vault with type and status badges                      | Evidence page renders items with type badges (شهادة, عقد, فاتورة, etc.) and status badges (مرفوع, مرتبط, مراجع, etc.).                                             |
| Rule-based classification display                               | Classification page shows supplier-level local content percentages.                                                                                                |
| Findings register with severity levels                          | Findings page shows items with severity badges (منخفض, متوسط, مرتفع, شديد).                                                                                        |
| Human review workflow                                           | Review page with submit/comment/return cycle. Governance notice: "خطوة بشرية حوكمية".                                                                              |
| Approval workflow with governance record                        | Approval page with approve/reject, decision badge, identity + timestamp. Non-certification notice: "ليس شهادة امتثال".                                             |
| Report generation with disclaimer                               | Reports page with generated records, disclaimer text, download support.                                                                                            |
| Full audit trail                                                | Audit trail page with 17 Arabic action labels, actor names, timestamps, expandable details.                                                                        |
| Text/CSV and binary PDF/XLSX export are available                 | `src/lib/local-content/export.ts` — pdfkit + xlsx (2026-05-25); disclaimer and governance metadata on all formats. Arabic PDF font rendering is a P2 quality gap. |
| Mutation feedback loop (forms refresh after write)              | Verified 2026-05-23: `revalidatePath` + client `ActionResult` + `router.refresh()`. Finding create PASS on `/local-content/projects/lc-project-demo-001/findings`. |
| Built on AQLIYA Intelligence Core                               | Reuses shared governance, RBAC, audit, storage, and tenant isolation from the platform Core.                                                                       |

## Forbidden Claims

These capabilities are NOT implemented. Do not claim them during any customer interaction:

| Claim                                                    | Reality                                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Regulatory certified compliance                          | Not implemented. The platform produces governed assessments, not regulator-certified documents. |
| Official submission to LCGPA or similar authority        | Not implemented. No integration with Saudi or other authorities.                                |
| AI autonomous classification or decision-making          | No AI is wired in this version. All classification is human-driven.                             |
| Production-hardened or enterprise-ready                  | L5 Pilot-ready, not production-hardened. See remaining limitations.                             |
| Regulator-certified PDF/XLSX as official compliance submission | Binary PDF/XLSX export exists for governed assessment output; it is not a regulator-certified document. |
| On-prem or private cloud deployment                      | Not implemented. Runs on AQLIYA cloud only.                                                     |
| Air-gapped or disconnected deployment                    | Not implemented. Not planned in current roadmap.                                                |
| Full ERP integration                                     | Data is provided as CSV/XLSX. No live ERP connection exists.                                    |
| Supplier self-service portal                             | Not implemented. Supplier management is done inside the workspace.                              |
| Real-time data sync or API integration                   | Data is uploaded as snapshots. No real-time sync.                                               |
| Multi-year trend analysis                                | Not implemented. Current scope is single-period assessment.                                     |
| Model Governance, Institutional Memory, or AQLIYA Studio | Strategic future capabilities, not implemented.                                                 |

## Required Communication in Every Customer Interaction

1. **Opening:** "هذه مساحة عمل محكومة لقياس المحتوى المحلي — ليس نظام امتثال رقابي." (This is a governed assessment workspace — not a regulatory compliance system.)
2. **During demo:** Show the non-certification notice on the approval page explicitly.
3. **During data discussion:** Explain that export includes text/CSV and binary PDF/XLSX, with disclaimer — not regulator-certified compliance.
4. **During closeout:** Reiterate that the pilot scope is controlled and limited.
5. **In writing:** Include the commercial truthfulness disclaimer in all follow-up communications.

## When Customer Asks About Forbidden Claims

| Customer asks                        | Response                                                               |
| ------------------------------------ | ---------------------------------------------------------------------- |
| "هل النظام معتمد من جهة رسمية؟"      | لا، هذا مسار توثيق داخلي حوكمي. ليس شهادة امتثال من جهة رقابية.        |
| "هل فيه ذكاء اصطناعي يصنف الموردين؟" | حالياً التصنيف بشري. الذكاء الاصطناعي غير موصول في هذه النسخة.         |
| "هل نستطيع نشره عندنا؟"              | حالياً على سحابة عقلية. النشر على خوادم خاصة في خارطة الطريق.          |
| "هل يطلع PDF؟"                       | نعم — PDF وXLSX ثنائيان متاحان (2026-05-25). ليس شهادة امتثال رسمية؛ جودة خط عربي PDF قيد التحسين (P2). |
| "هل يرتبط مع نظامنا المحاسبي؟"       | لا — البيانات تُرفع كملفات CSV. لا يوجد اتصال مباشر مع الأنظمة الأخرى. |
