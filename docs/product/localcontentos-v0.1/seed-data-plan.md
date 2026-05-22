# LocalContentOS v0.1 — Seed Data Plan

## Purpose

Provide a realistic, Saudi-market-context seed dataset for development, testing, and demonstration of LocalContentOS v0.1.

## Seed Dataset

### Organization and Workspace

- Platform organization: `localcontent-demo` (linked to test org)
- Client workspace: `lc-demo-workspace` with `workspaceType: "content"`
- Project: `LC-DEMO-001` with `projectType: "local_content"`

### Project

```
LocalContentProject: "شركة الابتكار التقني — تقييم المحتوى المحلي FY2025"
Reporting period: FY2025
Scope: تقييم نسبة المحتوى المحلي في المشتريات والعقود للسنة المالية 2025
```

### Suppliers (12 records)

| #   | Name                     | CR         | Type          | Local % | Workforce % |
| --- | ------------------------ | ---------- | ------------- | ------- | ----------- |
| 1   | شركة التقنية المتقدمة    | 1010123456 | Saudi         | 85%     | 92%         |
| 2   | مؤسسة الأعمال الهندسية   | 1010234567 | Saudi         | 72%     | 78%         |
| 3   | GlobalTech Solutions Ltd | —          | Foreign       | 15%     | 8%          |
| 4   | شركة الخدمات اللوجستية   | 1010345678 | Saudi         | 95%     | 98%         |
| 5   | EuroParts Middle East    | —          | Foreign       | 22%     | 12%         |
| 6   | مصنع البلاستيك الوطني    | 1010456789 | Saudi         | 78%     | 85%         |
| 7   | AsiaTrade Import Co      | —          | Foreign       | 5%      | 3%          |
| 8   | شركة الصيانة المتكاملة   | 1010567890 | Joint Venture | 55%     | 62%         |
| 9   | مؤسسة النقل السريع       | 1010678901 | Saudi         | 90%     | 95%         |
| 10  | TechImport International | —          | Foreign       | 10%     | 5%          |
| 11  | شركة المواد الكيميائية   | 1010789012 | Saudi         | 68%     | 73%         |
| 12  | Global Services Corp     | —          | Foreign       | 18%     | 9%          |

### Spend Records (30+ records)

Covers categories: IT equipment, construction materials, professional services, logistics, maintenance, chemicals, office supplies.

Total spend: ~SAR 45,000,000
Local spend: ~SAR 28,000,000 (62%)
Non-local spend: ~SAR 17,000,000 (38%)

### Classifications (12+ entries)

One per supplier, with classification basis varying: certificate (5), contract_term (3), self_declaration (2), analyst_estimate (2).

### Evidence Items (15+ records)

Certificate PDFs (5), contracts (4), attestations (2), invoices (3), registrations (1).

Evidence statuses: verified (8), reviewed (3), uploaded (2), missing (2).

### Findings (5 records)

1. Low local content in IT equipment (severity: high)
2. Missing certificate for Joint Venture supplier (severity: medium)
3. 3 foreign suppliers account for 38% of spend (severity: medium)
4. Construction supplier classification based on self-declaration only (severity: low)
5. No workforce data for 4 foreign suppliers (severity: low)

### Review

- One review record: submitted by operator, reviewed by reviewer with comments.
- Status: in_review.

### Approval

- Pending (approver not yet acted).

## Seed Script

Script: `prisma/seed-local-content.ts`

Execution: `npx tsx prisma/seed-local-content.ts`

Idempotent: uses `deleteMany` before `create` to support re-seeding.

## Arabic Data

All seed data uses Arabic names, descriptions, and contextual text to match Saudi-market reality. Numeric fields (amounts, percentages) use real-world plausible values.
