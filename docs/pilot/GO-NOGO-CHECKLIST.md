# AuditOS — Pilot Go/No-Go Checklist

## 1. Environment Readiness (7 checks)

| #   | Check                            | Pass | Notes                                        |
| --- | -------------------------------- | ---- | -------------------------------------------- |
| 1.1 | PostgreSQL database is running   | ☐    | Required: `localhost:5432` or configured URL |
| 1.2 | Prisma migration applied         | ☐    | Required: `npx prisma migrate deploy`        |
| 1.3 | Seed data loaded                 | ☐    | Required: `npm run seed:audit`               |
| 1.4 | Build passes                     | ☐    | Required: `npm run build --webpack`          |
| 1.5 | Demo route accessible            | ☐    | Required: `http://localhost:3000/audit`      |
| 1.6 | No DecisionOS modifications      | ☐    | Verify via `git diff --name-only`            |
| 1.7 | Environment variables configured | ☐    | Required: `DATABASE_URL`, `AUTH_SECRET`      |

## 2. Data Readiness (9 checks)

| #   | Check                              | Pass | Notes                             |
| --- | ---------------------------------- | ---- | --------------------------------- |
| 2.1 | Demo engagement exists             | ☐    | eng-gulf-2025                     |
| 2.2 | Trial balance with 22 accounts     | ☐    | Includes variance for demo        |
| 2.3 | 1 pending mapping                  | ☐    | Sundry Income (5100)              |
| 2.4 | Evidence with mixed states         | ☐    | accepted, reviewed, missing       |
| 2.5 | Findings with varied severity      | ☐    | low, medium, high                 |
| 2.6 | Recommendations linked to findings | ☐    | 3 recommendations                 |
| 2.7 | Review comments (open)             | ☐    | 2 open comments                   |
| 2.8 | AI outputs pre-generated           | ☐    | 5 AI outputs with source entities |
| 2.9 | Financial statements structured    | ☐    | 3 statements, 10 notes            |

## 3. Security Readiness (5 checks)

| #   | Check                                | Pass | Notes                                     |
| --- | ------------------------------------ | ---- | ----------------------------------------- |
| 3.1 | Demo fallback gated for production   | ☐    | Throws in NODE_ENV=production             |
| 3.2 | Role enforcement tested              | ☐    | Server-side requireRole() verified        |
| 3.3 | Approval restricted to partner/admin | ☐    | Operator blocked from approve             |
| 3.4 | File type whitelist active           | ☐    | pdf, xlsx, xls, docx, jpg, jpeg, png, csv |
| 3.5 | File size limit active               | ☐    | 20 MB maximum                             |

## 4. Workflow Readiness (11 checks)

| #    | Check                                | Pass | Notes                                       |
| ---- | ------------------------------------ | ---- | ------------------------------------------- |
| 4.1  | Engagement creation works            | ☐    | Via server action                           |
| 4.2  | Trial balance upload works           | ☐    | Via server action                           |
| 4.3  | Account mapping confirmation works   | ☐    | Via server action                           |
| 4.4  | Evidence create and link works       | ☐    | Via server actions                          |
| 4.5  | Evidence-to-finding link works       | ☐    | Via linkEvidenceToEntityAction              |
| 4.6  | Finding CRUD works                   | ☐    | Via server actions                          |
| 4.7  | Recommendation CRUD works            | ☐    | Via server actions                          |
| 4.8  | Review comment target selector works | ☐    | Entity-targeted comments                    |
| 4.9  | Approval readiness gate works        | ☐    | 5 validation checks                         |
| 4.10 | AI output generation works           | ☐    | Notes, evidence, findings, recs, analytical |
| 4.11 | Export works                         | ☐    | Statements, audit file, bilingual           |

## 5. Stakeholder Readiness (5 checks)

| #   | Check                    | Pass | Notes                                    |
| --- | ------------------------ | ---- | ---------------------------------------- |
| 5.1 | Limitations acknowledged | ☐    | Stakeholder signed risk disclosure       |
| 5.2 | Pilot scope accepted     | ☐    | Stakeholder reviewed scope document      |
| 5.3 | Success criteria agreed  | ☐    | Measurable outcomes defined              |
| 5.4 | No production claims     | ☐    | All communications use "pilot" or "demo" |
| 5.5 | Demo data approved       | ☐    | Synthetic data, no real client data      |

## 6. Final Decision

| Criteria     | Value                             |
| ------------ | --------------------------------- |
| **Decision** | ☐ GO / ☐ CONDITIONAL GO / ☐ NO-GO |
| **Reasons**  |                                   |
| **Owner**    |                                   |
| **Date**     |                                   |

### GO Criteria

- All environment checks pass
- All data checks pass
- Security checks pass
- Workflow checks pass
- Stakeholder readiness checks pass

### CONDITIONAL GO Criteria

- Environment checks pass
- Workflow checks pass
- Minor data or security items outstanding with documented workaround
- Stakeholder acknowledges limitations

### NO-GO Criteria

- Build fails
- Seed fails
- DecisionOS modified
- Critical workflow broken
- Stakeholder does not accept limitations
- Risk disclosure not signed
