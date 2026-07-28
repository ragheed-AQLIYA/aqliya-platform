# AQLIYA Pilot — Demo Accounts Card

> **Printable reference card for pilot evaluators and demo sessions.**
>
> All pilot accounts share the same organization: **مؤسسة الريادة للتقنية — تجريبي**
>
> Last updated: 2026-07-25 | Seed: `prisma/seed-pilot.ts` v1.2

---

## Base Platform Accounts (prisma/seed.ts)

These accounts are created by the standard seed and have access to platform-level features.

| # | Role       | Email                  | Password     | Access     | Products            |
|---|-----------|------------------------|--------------|------------|---------------------|
| 1 | ADMIN     | admin@aqliya.com       | admin123     | Full       | All products        |
| 2 | OPERATOR  | operator@aqliya.com    | operator123  | Workspace  | Assigned products   |
| 3 | VIEWER    | viewer@aqliya.com      | viewer123    | Read-only  | View only           |

---

## Pilot Demo Accounts (prisma/seed-pilot.ts)

These 8 accounts are seeded specifically for pilot evaluation with pre-loaded Saudi institutional data.

| # | Role       | Email                      | Password  | Name (Arabic)          | Primary Product Area | Description                          |
|---|-----------|----------------------------|-----------|------------------------|----------------------|--------------------------------------|
| 1 | ADMIN     | admin.pilot@aqliya.com     | pilot123  | أحمد المنصوري           | All                  | Platform administrator               |
| 2 | ADMIN     | partner.pilot@aqliya.com   | pilot123  | خالد العتيبي            | All                  | Partner-level admin                  |
| 3 | OPERATOR  | manager.pilot@aqliya.com   | pilot123  | سارة القحطاني           | LocalContentOS       | LC project manager                   |
| 4 | OPERATOR  | auditor.pilot@aqliya.com   | pilot123  | محمد السبيعي            | AuditOS              | Senior auditor                       |
| 5 | OPERATOR  | reviewer.pilot@aqliya.com  | pilot123  | نورة الحربي             | AuditOS              | Audit reviewer                       |
| 6 | OPERATOR  | operator.pilot@aqliya.com  | pilot123  | فهد الدوسري             | SalesOS              | Sales operations                     |
| 7 | OPERATOR  | analyst.pilot@aqliya.com   | pilot123  | لينا الشمري             | All                  | Business analyst                     |
| 8 | VIEWER    | viewer.pilot@aqliya.com    | pilot123  | عبدالله المطيري          | All (read-only)      | Observer / stakeholder               |

---

## Product Workspace Map

| Product        | URL Path          | Pilot Data Seeded                                      | Key Demos                                                                 |
|---------------|-------------------|--------------------------------------------------------|---------------------------------------------------------------------------|
| AuditOS       | `/audit`          | 2 engagements, 5 findings, 3 evidence files, 2 reviews | TB upload → auto-classification → findings → review → export              |
| DecisionOS    | `/decisions`      | 3 decisions, scenarios, risks, recommendation          | Decision intake → framework → scenarios → recommendation → approval       |
| LocalContentOS| `/local-content`  | 2 projects, 5 suppliers, 10 spend records, 3 findings  | Supplier setup → spend import → classification → scoring → approval       |
| SalesOS       | `/sales`          | 1 pipeline, 4 accounts, 3 deals, 6 interactions        | Pipeline view → deal creation → qualification → proposal → negotiation    |
| RiskOS        | `/risk`           | 1 model, 1 assessment, 3 procedures                    | Risk model → assessment → inherent/residual scoring → procedures          |
| LocalContactOS| `/contacts`       | 4 contacts, 3 relations, 4 interactions                | Contact registry → relation mapping → interaction logging → sensitivity   |
| Content Studio| (under LCOS)      | 3 workspaces, 8 content items                          | Content creation → review → publish (Arabic-first articles)               |

---

## 20-Minute Demo Flow

See `docs/pilot/DEMO_FLOW.md` for the full script. Quick highlights:

### Act 1: Platform Login (1 min)
- Open `http://localhost:3000`
- Log in as `admin@aqliya.com` / `admin123`
- Show overview dashboard

### Act 2: AuditOS — Intelligent Audit (5 min)
- Navigate to `/audit`
- Show engagement list with 2 pilot engagements
- Open "تدقيق القوائم المالية 2025" → Trial Balance page
- Show AI-classified account mappings
- Show findings page with 5 findings (2 AI-suggested, 1 critical fraud risk)
- Show review comments with escalation
- Show audit trail page

### Act 3: LocalContentOS — Saudi Compliance (5 min)
- Navigate to `/local-content`
- Show project "تقييم المحتوى المحلي — الدفعة الأولى" (62.5% score)
- Show supplier list (STC 85%, Accenture 15%)
- Show spend records and classification
- Show findings (compliance risk critical)
- Show evidence uploads with verification status

### Act 4: DecisionOS + SalesOS + Risk (6 min)
- DecisionOS: `/decisions` → strategic expansion decision with framework
- SalesOS: `/sales` → pipeline with 3 deals (SAR 7.5M total)
- RiskOS: `/risk` → risk assessment with inherent/residual scores

### Act 5: Audit Trail + Governance (3 min)
- `/settings/audit-logs` → show unified PlatformAuditLog
- Demonstrate cross-product traceability
- Show evidence-linked actions

---

## First-Time Setup (Before Demo)

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env: set AUTH_SECRET (use: openssl rand -base64 32)

# 2. Start infrastructure
docker compose up -d db redis

# 3. Launch pilot (one command)
# Linux/macOS:
./scripts/pilot/launch-pilot.sh
# Windows:
.\scripts\pilot\launch-pilot.ps1

# 4. Verify setup
node scripts/pilot/verify-pilot.mjs
```

---

## Quick Reference

| Need                | Command                                      |
|--------------------|----------------------------------------------|
| Start pilot         | `./scripts/pilot/launch-pilot.sh`            |
| Verify setup        | `node scripts/pilot/verify-pilot.mjs`        |
| Re-seed only        | `npx tsx prisma/seed-pilot.ts`               |
| Re-seed (full base) | `npx tsx prisma/seed.ts`                     |
| Stop containers     | `docker compose down`                        |
| View logs           | `docker compose logs -f db`                  |
| Reset everything    | `docker compose down -v && docker compose up -d db redis` |

---

## Notes

- All pilot passwords are `pilot123` — for demo use only. Change for any production deployment.
- The pilot organization is **مؤسسة الريادة للتقنية — تجريبي** (Al-Reyada Technology — Pilot).
- Seed data represents realistic Saudi institutional scenarios with Arabic labeling.
- 180+ database records are created across 10 sections (platform, users, 7 products, audit log).
- PlatformAuditLog contains 20 unified audit trail entries spanning all 6 product areas.
- For the 20-minute demo script, see `docs/pilot/DEMO_FLOW.md`.
- For the pilot user guide, see `docs/pilot/PILOT_USER_GUIDE.md`.
