/**
 * Office AI Assistant Seed Script
 *
 * Creates 6 polished demo tasks with mixed statuses, file types, and languages.
 * All records are marked with metadata.demo = true.
 *
 * Usage:
 *   Seed mode:          tsx scripts/seed-office-ai.ts
 *   Dry run:            tsx scripts/seed-office-ai.ts --dry
 */

import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../../.env") })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
  const isDry = process.argv.includes("--dry")
  const mode = isDry ? "DRY RUN" : "SEED"

  console.log(`\n╔════════════════════════════════════════╗`)
  console.log(`║  Office AI Assistant Seed — ${mode.padEnd(11)}║`)
  console.log(`╚════════════════════════════════════════╝\n`)

  const adapter = new PrismaPg(process.env.DATABASE_URL!)
  const prisma = new PrismaClient({ adapter })

  try {
    const platformOrg = await prisma.platformOrganization.findFirst({ select: { id: true, slug: true } })
    if (!platformOrg) { console.log("❌ No PlatformOrganization found"); process.exit(1) }

    const workspace = await prisma.clientWorkspace.findFirst({
      where: { platformOrganizationId: platformOrg.id, status: "active" },
      select: { id: true, name: true },
    })
    const project = workspace
      ? await prisma.project.findFirst({ where: { workspaceId: workspace.id, status: "active" }, select: { id: true, name: true } })
      : null

    console.log(`PlatformOrg: ${platformOrg.slug} (${platformOrg.id})`)
    console.log(`Workspace:   ${workspace ? `${workspace.name} (${workspace.id})` : "N/A"}`)
    console.log(`Project:     ${project ? `${project.name} (${project.id})` : "N/A"}`)
    console.log()

    const tasks = [
      {
        taskType: "executive_summary",
        status: "approved",
        language: "en",
        title: "Q2 2026 Performance Review — Executive Summary",
        instructions: "Synthesize key performance indicators from all departments. Focus on revenue growth, cost optimization, and strategic initiatives.",
        createdByName: "Ahmed Al-Mansouri",
        outputContent: `# Executive Summary: Q2 2026 Performance Review

**Prepared by:** Ahmed Al-Mansouri
**Date:** June 15, 2026

## Overview

Q2 2026 demonstrated strong operational performance across all business units. Revenue grew 18% YoY, driven primarily by AuditOS and DecisionOS portfolio expansion.

## Key Findings

- **Revenue:** SAR 4.2M (18% YoY growth)
- **Cost Efficiency:** Operating margin improved to 34% (up from 29% in Q1)
- **Client Acquisition:** 7 new enterprise clients onboarded
- **Product Milestone:** Office AI Assistant MVP completed and deployed

## Recommendations

1. Accelerate LocalContentOS development for Q3 2026 target
2. Expand sales team by 3 heads for UAE market entry
3. Increase cloud infrastructure budget by 15% for scalability

---

*Initial draft requiring human review. AI assists — humans decide.*

**Source Files:**
- Q2-Financials.xlsx (xlsx) ✅ Content extracted
- Q2-Narrative-Report.docx (docx) ✅ Content extracted`,
      },
      {
        taskType: "report_draft",
        status: "needs_review",
        language: "ar",
        title: "تقرير تقييم المخاطر التشغيلية — الربع الثاني 2026",
        instructions: "إعداد تقرير شامل لتقييم المخاطر التشغيلية يشمل تحليل البيانات المالية والتشغيلية للربع الثاني.",
        createdByName: "Sara Al-Otaibi",
        outputContent: `# تقرير تقييم المخاطر التشغيلية — الربع الثاني 2026

**إعداد:** سارة العتيبي
**التاريخ:** ١٠ يونيو ٢٠٢٦

## الملخص التنفيذي

تم إجراء تقييم شامل للمخاطر التشغيلية لجميع وحدات العمل. النتائج تشير إلى تحسن في مؤشرات التحكم الداخلي مع وجود بعض المخاطر المتبقية.

## النتائج الرئيسية

1. **مخاطر تقنية المعلومات (متوسطة):** تحديث أنظمة الأمان السيبراني قيد التنفيذ
2. **مخاطر الامتثال (منخفضة):** جميع متطلبات الهيئة مستوفاة
3. **مخاطر الموارد البشرية (متوسطة):** نقص في الكوادر المتخصصة في التدقيق

## التوصيات

1. تعزيز فريق أمن المعلومات بوظيفتين إضافيتين
2. تحديث سياسات الامتثال الداخلي
3. تنفيذ برنامج تدريبي للموظفين الجدد

---

*مسودة أولية تحتاج مراجعة بشرية. الذكاء يساعد — الإنسان يقرر.*

**الملفات المصدر:**
- Risk-Assessment-Q2.xlsx (xlsx) ✅ تم استخراج المحتوى`,
      },
      {
        taskType: "meeting_notes",
        status: "generated",
        language: "en",
        title: "AuditOS Steering Committee — June 10, 2026",
        instructions: "Structure meeting notes for the weekly AuditOS steering committee. Key topics: client onboarding, resource allocation, and milestone tracking.",
        createdByName: "Mohammad Al-Harbi",
        outputContent: `# Meeting Notes: AuditOS Steering Committee

**Date:** June 10, 2026
**Attendees:** Ahmed Al-Mansouri, Sara Al-Otaibi, Mohammad Al-Harbi, Khalid Al-Ghamdi

## Topics Discussed

### 1. Client Onboarding Status
- 3 new audit engagements started this week
- Migration of existing clients to platform structure is 80% complete
- Training sessions scheduled for new client teams

### 2. Resource Allocation
- 2 additional auditors needed for Q3 pipeline
- Current utilization rate: 85%
- Overtime budget: within limits

### 3. Milestone Tracking
- Office AI Assistant: MVP complete, v0.1 in progress
- DecisionOS governance flow: on track for July release
- LocalContentOS: requirements gathering phase

## Decisions
- Approve hiring of 2 junior auditors (start Q3)
- Defer UAE expansion to Q4 2026

## Action Items
| Owner | Action | Due |
|---|---|---|
| Ahmed | Finalize Q2 review | Jun 20 |
| Sara | Prepare resource plan | Jun 25 |
| Khalid | Client training schedule | Jun 18 |

---

*Initial draft requiring human review. AI assists — humans decide.*`,
      },
      {
        taskType: "excel_analysis",
        status: "rejected",
        language: "ar",
        title: "تحليل ميزانية العمليات — الربع الأول 2026",
        instructions: "تحليل جداول بيانات ميزانية العمليات للربع الأول وتقديم ملخص بالفروقات والتوصيات.",
        createdByName: "Sara Al-Otaibi",
        outputContent: `# تحليل ميزانية العمليات — الربع الأول 2026

**إعداد:** سارة العتيبي
**التاريخ:** ١ أبريل ٢٠٢٦

## تحليل البيانات

**إجمالي الصفوف:** ٢٤
**الأعمدة:** القسم، المدير، الميزانية، المصروف، الفرق

| القسم | المدير | الميزانية | المصروف | الفرق |
|---|---|---|---|---|
| التدقيق | أحمد | ٥٠٠٬٠٠٠ | ٤٢٠٬٠٠٠ | ٠٫١٦ |
| المالية | سارة | ٧٥٠٬٠٠٠ | ٧١٠٬٠٠٠ | ٠٫٠٥٣ |
| تقنية المعلومات | خالد | ٣٠٠٬٠٠٠ | ٢٩٠٬٠٠٠ | ٠٫٠٣٣ |

## الملاحظات
- قسم التدقيق لديه أكبر فرق في الميزانية (١٦٪)
- الأداء المالي العام ضمن الحدود المقبولة

---

*مسودة أولية تحتاج مراجعة بشرية. الذكاء يساعد — الإنسان يقرر.*

**الملفات المصدر:**
- Operations-Budget-Q1.xlsx (xlsx) ✅ تم استخراج المحتوى`,
      },
      {
        taskType: "document_summary",
        status: "draft",
        language: "ar",
        title: "تلخيص عقد الخدمات الاستشارية — شركة الأفق",
        instructions: "تلخيص بنود العقد الرئيسية مع شركة الأفق للاستشارات، مع التركيز على الالتزامات المالية والتسليمات.",
        createdByName: "Ahmed Al-Mansouri",
        outputContent: `# تلخيص عقد الخدمات الاستشارية — شركة الأفق

**النوع:** document_summary
**تم الإنشاء بواسطة:** أحمد المنصوري

## ملخص المستند

> تلخيص بنود العقد الرئيسية مع شركة الأفق للاستشارات

لم يتم استخراج المحتوى من الملفات بعد.

**الملفات المصدر:**
- اتفاقية-خدمات-استشارية.pdf (pdf) 🔲 لم يتم الاستخراج بعد

---

*مسودة أولية تحتاج مراجعة بشرية. الذكاء يساعد — الإنسان يقرر.`,
      },
      {
        taskType: "presentation_outline",
        status: "draft",
        language: "en",
        title: "LocalContentOS Product Launch — Board Presentation",
        instructions: "Create a compelling presentation outline for the LocalContentOS product launch to the board. Highlight market opportunity, competitive advantage, and go-to-market strategy.",
        createdByName: "Mohammad Al-Harbi",
        outputContent: `# Presentation Outline: LocalContentOS Product Launch

**Type:** presentation_outline
**Created by:** Mohammad Al-Harbi

## Presentation Structure

1. **Slide 1: Title** — LocalContentOS: Product Launch

2. **Slide 2: Agenda**
   - Market opportunity in local content management
   - Product vision and architecture
   - Competitive analysis
   - Go-to-market strategy
   - Financial projections

3. **Slide 3: Introduction**
4. **Slides 4-6: Main Content**
5. **Slide 7: Analysis**
6. **Slide 8: Recommendations**
7. **Slide 9: Q&A**

---

*Initial draft requiring human review. AI assists — humans decide.*

**Source Files:** No source files attached yet.`,
      },
    ]

    console.log(`Tasks to seed: ${tasks.length}`)
    console.log()

    if (isDry) {
      console.log("── DRY RUN — no records created ──")
      console.log()
      return
    }

    // Clean previous demo data
    const existingDemo = await prisma.officeAiTask.findMany({
      where: { metadata: { path: ["demo"], equals: true } },
      select: { id: true },
    })
    if (existingDemo.length > 0) {
      console.log(`Cleaning ${existingDemo.length} existing demo tasks...`)
      await prisma.officeAiTask.deleteMany({
        where: { id: { in: existingDemo.map((t) => t.id) } },
      })
      console.log("  ✅ Cleaned")
    }

    for (const t of tasks) {
      const task = await prisma.officeAiTask.create({
        data: {
          platformOrganizationId: platformOrg.id,
          clientWorkspaceId: workspace?.id ?? null,
          projectId: project?.id ?? null,
          taskType: t.taskType,
          status: t.status,
          language: t.language,
          title: t.title,
          instructions: t.instructions,
          createdByName: t.createdByName,
          metadata: { demo: true },
        },
      })
      console.log(`  ✅ Task: "${t.title}" — ${t.status}`)

      // Create output
      await prisma.officeAiOutput.create({
        data: {
          taskId: task.id,
          content: t.outputContent,
          format: "markdown",
          aiProvider: "deterministic",
          aiPromptVersion: "office-ai-deterministic-v1",
          status: t.status === "approved" ? "finalized" : t.status === "rejected" ? "rejected" : "draft",
          metadata: { demo: true },
        },
      })

      // Create demo file for tasks with file references in output
      if (t.taskType === "executive_summary") {
        await prisma.officeAiFile.create({
          data: {
            taskId: task.id, filename: "Q2-Financials.xlsx", fileType: "xlsx", sizeBytes: 24576,
            extractedContent: "Department,Budget,Actual,Variance\nAudit,500000,420000,0.16\nFinance,750000,710000,0.053\nIT,300000,290000,0.033",
            extractionStatus: "completed", extractedAt: new Date(),
            extractionMeta: { type: "xlsx", sheetCount: 1, columns: 4, demo: true },
            metadata: { demo: true },
          },
        })
        await prisma.officeAiFile.create({
          data: {
            taskId: task.id, filename: "Q2-Narrative-Report.docx", fileType: "docx", sizeBytes: 18432,
            extractedContent: "AQLIYA demonstrated strong Q2 performance across all business units. Revenue grew 18% YoY.",
            extractionStatus: "completed", extractedAt: new Date(),
            extractionMeta: { type: "docx", charCount: 120, demo: true },
            metadata: { demo: true },
          },
        })
      }
      if (t.taskType === "report_draft") {
        await prisma.officeAiFile.create({
          data: {
            taskId: task.id, filename: "Risk-Assessment-Q2.xlsx", fileType: "xlsx", sizeBytes: 32768,
            extractedContent: "Risk,Level,Mitigation\nCybersecurity,Medium,Update in progress\nCompliance,Low,Fully compliant\nHR,Medium,Recruitment in progress",
            extractionStatus: "completed", extractedAt: new Date(),
            extractionMeta: { type: "xlsx", sheetCount: 1, demo: true },
            metadata: { demo: true },
          },
        })
      }
      if (t.taskType === "excel_analysis") {
        await prisma.officeAiFile.create({
          data: {
            taskId: task.id, filename: "Operations-Budget-Q1.xlsx", fileType: "xlsx", sizeBytes: 16384,
            extractedContent: "Department,Manager,Budget,Spent,Variance\nAudit,Ahmed,500000,420000,0.16\nFinance,Sara,750000,710000,0.053\nIT,Khalid,300000,290000,0.033",
            extractionStatus: "completed", extractedAt: new Date(),
            extractionMeta: { type: "xlsx", sheetCount: 1, columns: 5, demo: true },
            metadata: { demo: true },
          },
        })
      }
      if (t.taskType === "document_summary") {
        await prisma.officeAiFile.create({
          data: {
            taskId: task.id, filename: "اتفاقية-خدمات-استشارية.pdf", fileType: "pdf", sizeBytes: 45056,
            extractionStatus: null,
            metadata: { demo: true },
          },
        })
      }

      // Create PlatformAuditLog events
      const events = [
        { action: "office_ai.task.created", targetType: "OfficeAiTask", targetId: task.id, severity: "info" },
        { action: "office_ai.output.created", targetType: "OfficeAiOutput", targetId: task.id, severity: "info" },
      ]
      if (t.status !== "draft") {
        events.push({ action: "office_ai.task.status_changed", targetType: "OfficeAiTask", targetId: task.id, severity: "info" })
      }
      for (const ev of events) {
        await prisma.platformAuditLog.create({
          data: {
            productKey: "office_ai_assistant",
            action: ev.action,
            platformOrganizationId: platformOrg.id,
            clientWorkspaceId: workspace?.id ?? null,
            projectId: project?.id ?? null,
            targetType: ev.targetType,
            targetId: ev.targetId,
            severity: ev.severity,
            sourceSystem: "office_ai_assistant",
            sourceModel: ev.targetType,
            sourceId: ev.targetId,
            actorName: "Seed Script",
            metadata: { demo: true, governedSharedApplication: true },
          },
        })
      }
    }

    console.log()
    console.log(`✅ Seeded ${tasks.length} Office AI demo tasks successfully!`)
    console.log()

  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err)
  process.exit(1)
})
