# AQLIYA Decision OS - Demo Script (5-7 Minutes)

## Pre-Demo Checklist

- [ ] `npm run dev` running on `http://localhost:3000`
- [ ] Browser open at `http://localhost:3000`
- [ ] SQLite database seeded with demo data
- [ ] Clear browser cache/cookies
- [ ] Speaker notes prepared

---

## Demo Flow (Step-by-Step)

### 1. Opening (30 seconds)

**Action:**
- Show browser at `http://localhost:3000`
- Point to: Clean Arabic interface (RTL)
- Highlight: "أكليا - نظام دعم القرار"

**Script:**
> "هذا هو AQLIYA Decision OS - منصة ذكاء قراري مصممة لمساعدة المنظمات في اتخاذ قرارات مدروسة ومبنية على البيانات."

---

### 2. Dashboard Overview (45 seconds)

**Action:**
- Navigate to `/decisions`
- Point to decision list with "Non-Profit Training & Empowerment Tender"

**Script:**
> "لدينا هنا قائمة القرارات. هذا القرار التجريبي: مناقصة تدريب لـ 1,000 مستفيد من الضمان الاجتماعي. القرار في حالة مراجعة (IN_REVIEW)."

**Key Points:**
- Organization: AQLIYA Demo Organization
- Decision Owner: Ahmed Al-Mansouri
- Status: IN_REVIEW

---

### 3. Decision Detail - Overview Tab (1 minute)

**Action:**
- Click on the decision to open `/decisions/[id]`
- Show the Overview tab with:
  - Objectives (3 items)
  - Constraints (3 items)
  - Assumptions (3 items)
  - Alternatives (3 items)
  - Risks (3 items with levels)

**Script:**
> "عند فتح القرار، نرى التفاصيل الكاملة: الأهداف، القيود، الافتراضات، البدائل، والمخاطر. كل قرار مرتبط بمنظمة وصاحب قرار ومراجع ومعتمد."

**Click through tabs:** Overview → Tender → Simulation → Recommendation → Governance → Report

---

### 4. Tender Tab - Input Data (1 minute)

**Action:**
- Navigate to Tender tab
- Show the pre-filled form:
  - Client: Social Development Non-Profit Organization
  - Contract Value: SAR 2,800,000
  - Estimated Cost: SAR 2,460,000
  - Duration: 4 months
  - Required Capacity: 35
  - Available Capacity: 50
  - Strategic Fit: 90/100
  - Risk Level: LOW
  - Margin Estimate: 12.1%

**Script:**
> "هنا بيانات المناقصة. العميل، القيمة التعاقدية، التكلفة، المدة، القدرة المطلوبة والمتاحة، التوافق الاستراتيجي، ومستوى المخاطر. كلها مدخلة ومحفوظة في قاعدة البيانات."

**Demo Action:**
- Change "Available Capacity" from 50 to 40
- Click "Save Tender Details"
- Show success message
- Point to: Audit Log entry created

**Script:**
> "عند التعديل، يتم حفظ البيانات وإنشاء سجل تدقيق (Audit Log) أوتوماتيكيًا يسجل من قام بالتعديل وماذا تغّر."

---

### 5. Simulation Tab - Run Simulation (1.5 minutes)

**Action:**
- Navigate to Simulation tab
- Point to "Run Simulation" button
- Click "Run Simulation"

**What Happens:**
1. System calculates 3 scenarios:
   - **Best Case** (+10% adjustments)
   - Feasibility: ~95
   - Financial: ~90
   - Capacity: ~92
   - Risk: ~94
   - Strategic Fit: 90
   - **Overall: ~93.2**

   - **Expected Case** (baseline)
   - Feasibility: ~82
   - Financial: ~78
   - Capacity: ~85
   - Risk: ~80
   - Strategic Fit: 90
   - **Overall: ~83.0**

   - **Worst Case** (-20% adjustments)
   - Feasibility: ~65
   - Financial: ~62
   - Capacity: ~70
   - Risk: ~68
   - Strategic Fit: 90
   - **Overall: ~71.0**

**Script:**
> "هنا محرك المحاكاة. نظام يعمل 3 سيناريوهات: أفضل حالة، الحالة المتوقعة، وأسوأ حالة. كل سيناريو يحسب 6 أنواع من النقاط: الجدوى، المالي، القدرة، المخاطر، التوافق الاستراتيجي، والنتيجة الإجمالية."

**Point to Recommendation section below:**
> "بناءً على الحالة المتوقعة (83.0)، النظام يولد توصية أوتوماتيكية."

---

### 6. Recommendation Tab (45 seconds)

**Action:**
- Navigate to Recommendation tab
- Show:
  - **Type:** GO WITH CONDITIONS
  - **Confidence Score:** 83.0%
  - **Reasoning:** "Strong strategic fit and acceptable Expected Case score..."
  - **Conditions:**
    1. Reallocate 20% capacity from Project Y
    2. Secure training material price lock-in by May 15
    3. Include payment term clause in contract
  - **Risk Notes:** "Medium risks related to resource allocation..."

**Script:**
> "التوصية واضحة: GO WITH CONDITIONS. النتيجة 83% مما يعني قبول مشروط. النظام أوتوماتيكيًا يولد الشروط والمبررات بناءً على تحليل النقاط."

---

### 7. Governance Tab (1 minute)

**Action:**
- Navigate to Governance tab
- Show three sections:

**a) Decision Roles:**
- Owner: Ahmed Al-Mansouri (ADMIN)
- Reviewer: Sara Al-Otaibi (MEMBER)
- Approver: Mohammad Al-Harbi (ADMIN)

**b) Audit Log:**
Point to entries:
- "2026-05-01: CREATED - Decision created"
- "2026-05-01: UPDATED - Tender details added"
- "2026-05-03: STATUS_CHANGED - DRAFT → IN_REVIEW"

**c) Approvals:**
- Show pending approval with comments: "Under review - need to verify capacity reallocation plan"

**Script:**
> "هنا حوكمة القرار. نرى الأدوار: المالك، المراجع، المعتمد. سجل التدقيق يوثق كل إجراء: الإنشاء، التعديل، تغيير الحالة. والموافقات تظهر حالة كل موافقة."

---

### 8. Report Tab - Full Decision Report (1 minute)

**Action:**
- Navigate to Report tab
- Scroll through the full report:
  1. **Decision Header** - Title, Status, Owner, Date
  2. **Executive Summary** - Overall score and recommendation
  3. **Tender Context** - Client, values, duration, margin
  4. **Objectives, Constraints, Assumptions, Alternatives**
  5. **Risk Map** - Risk level and identified risks
  6. **Scenario Comparison** - Table with 3 scenarios
  7. **Score Breakdown** - Cards showing all scores
  8. **Final Recommendation** - Type, reasoning, conditions
  9. **Governance Trail** - Full audit log

**Click "Print Report" button:**
- Show print-friendly layout

**Script:**
> "تقرير القرار المطبوع. هيكل منظم يحتوي كل ما يحتاجه صاحب القرار: السياق، المدخلات، المحاكاة، التوصية، والمسار الحوكمي. يمكن طباعته مباشرة."

---

### 9. Closing (30 seconds)

**Action:**
- Navigate back to `/decisions`
- Point to clean, professional UI

**Script:**
> "هذا هو AQLIYA Decision OS MVP. نظام يربط بين هيكلة القرار، محاكاة السيناريوهات، التوصيات الذكية، والحوكمة - كل ذلك في واجهة مؤسسية نظيفة."
>
> "الخطوة القادمة: ربط نظام المصادقة، استكمال صفحات المنظمات، وإضافة المزيد من حالات الاستخدام."

---

## What to Mention (Key Talking Points)

### What We Built:
✅ **Decision Workspace** - Full lifecycle management
✅ **Tender Module** - Complete tender profile with all inputs
✅ **Simulation Engine** - Rule-based 3-scenario comparison
✅ **Recommendation Engine** - Auto-generated with conditions
✅ **Governance Layer** - Audit logs, roles, approvals
✅ **Decision Report** - Structured, printable report
✅ **RTL Arabic Interface** - Professional, institutional design
✅ **Real Data Flow** - Prisma v7 + SQLite (seed data)

### What We Did NOT Build (Scope Control):
❌ No AI/LLM (rule-based only)
❌ No authentication (using mock-user-id)
❌ No organizations page data (still mock)
❌ No Monte Carlo simulation
❌ No integrations (CRM, ERP, etc.)
❌ No PDF export (print CSS only)
❌ No Sales OS module

### Architecture Highlights:
- **Next.js 16.2.4** (App Router)
- **Prisma v7** (Driver adapters)
- **TypeScript** (Strict mode)
- **Tailwind CSS + shadcn/ui**
- **Server Actions** for data mutations
- **13 Prisma Models** (fully relational)

---

## Demo Tips

### Do's:
✅ Speak confidently about the business value
✅ Point to specific numbers (scores, values)
✅ Show the data flow (Tender → Simulation → Recommendation)
✅ Emphasize the audit trail (Governance)
✅ Mention "rule-based" when asked about AI

### Don'ts:
❌ Don't click too fast (let audience read)
❌ Don't mention "chatbot" or "AI" (not built yet)
❌ Don't go to Organizations/Settings (still mock)
❌ Don't try to login (auth not built)
❌ Don't demo "Create Decision" (form is stub)

### If Asked About:
- **AI:** "We're using rule-based engines for MVP. AI integration is planned for future releases."
- **Authentication:** "Simple auth is the next priority after this MVP."
- **PostgreSQL:** "Configured in schema. Using SQLite for development."
- **Multi-tenant:** "Basic org support ready. Full isolation in next phase."
- **Monte Carlo:** "Rule-based simulation for MVP. Monte Carlo planned for advanced analytics."

---

## Backup Plan

### If Simulation Fails:
- Show the mock data in the report page
- Explain: "Simulation engine calculates these scores..."
- Point to Report tab which has all data

### If Page Doesn't Load:
- Show the build output: `npm run build` (all pages pass)
- Explain the architecture and data flow verbally
- Show the code structure in `src/`

### If Time Runs Over:
- Skip Governance tab
- Go directly to Report tab (shows everything)
- Click "Print Report" for impressive close

---

## Post-Demo Next Steps

1. **Add authentication** - Replace mock-user-id
2. **Connect Organizations** - Build `actions/organizations.ts`
3. **Test full flow** - End-to-end validation
4. **Add error handling** - Better UX
5. **Plan Phase 2** - PostgreSQL, advanced features

---

**End of Demo Script**

Good luck! 🚀
