# AQLIYA AuditOS — Internal Demo Rehearsal Checklist

## 1. Environment Reset

| # | Task | Done | Notes |
|---|------|------|-------|
| 1.1 | Kill any running dev server | ☐ | `Ctrl+C` in terminal |
| 1.2 | Reset database (drop + recreate) | ☐ | `npx prisma migrate reset --force` |
| 1.3 | Run migrations | ☐ | `npx prisma migrate deploy` |
| 1.4 | Seed fresh data | ☐ | `npm run seed:audit` |
| 1.5 | Start dev server | ☐ | `npm run dev` |
| 1.6 | Verify server starts without errors | ☐ | Check terminal output |

## 2. Seed Data Verification

| # | Task | Done | Notes |
|---|------|------|-------|
| 2.1 | Dashboard loads with seeded data | ☐ | 3 engagements, activity feed |
| 2.2 | Gulf Trading engagement opens | ☐ | eng-gulf-2025 |
| 2.3 | Trial Balance shows 22 accounts | ☐ | Check TB tab |
| 2.4 | Mapping shows 1 pending | ☐ | Sundry Income |
| 2.5 | Evidence shows 6 items | ☐ | Check evidence tab |
| 2.6 | Findings show 4 items | ☐ | Check findings tab |
| 2.7 | Recommendations show 3 items | ☐ | Check recommendations tab |
| 2.8 | Review comments show 2 items | ☐ | Check review tab |
| 2.9 | AI Outputs panel shows 5 items | ☐ | Check engagement overview |
| 2.10 | Publication package loads | ☐ | Check publication tab |

## 3. Browser Route Testing

| # | Route | Done | Expected |
|---|-------|------|----------|
| 3.1 | `/audit` | ☐ | Dashboard loads |
| 3.2 | `/audit/engagements/eng-gulf-2025` | ☐ | Overview loads |
| 3.3 | `.../trial-balance` | ☐ | TB table loads |
| 3.4 | `.../mapping` | ☐ | Mappings load |
| 3.5 | `.../statements` | ☐ | Statements load |
| 3.6 | `.../notes` | ☐ | Notes load |
| 3.7 | `.../evidence` | ☐ | Evidence loads |
| 3.8 | `.../findings` | ☐ | Findings load |
| 3.9 | `.../recommendations` | ☐ | Recommendations load |
| 3.10 | `.../review` | ☐ | Review loads |
| 3.11 | `.../approval` | ☐ | Approval loads |
| 3.12 | `.../publication` | ☐ | Publication loads |
| 3.13 | `.../audit-trail` | ☐ | Audit trail loads |
| 3.14 | `.../validation` | ☐ | Validation loads |

## 4. Login/Session Mode

| # | Task | Done | Notes |
|---|------|------|-------|
| 4.1 | Understand current auth mode | ☐ | Demo fallback or NextAuth |
| 4.2 | Know which user/role is active | ☐ | Default: operator |
| 4.3 | Know how to switch roles if needed | ☐ | |
| 4.4 | Test role-restricted actions | ☐ | e.g., approve as operator should fail |

## 5. Demo Script Practice

| # | Task | Done | Notes |
|---|------|------|-------|
| 5.1 | Walk through all 21 demo steps | ☐ | From script |
| 5.2 | Time the full walkthrough | ☐ | Target: < 30 min |
| 5.3 | Practice AI output generation | ☐ | Generate draft notes, evidence suggestions |
| 5.4 | Practice approval gate demonstration | ☐ | Show blocked, fix, approve |
| 5.5 | Practice export download | ☐ | Download and open JSON |
| 5.6 | Practice traceability drawer | ☐ | Open from finding or evidence |
| 5.7 | Practice audit trail filtering | ☐ | Filter by event type |

## 6. Known Blockers Preparation

| # | Task | Done | Notes |
|---|------|------|-------|
| 6.1 | Prepare answer for "Why JSON only?" | ☐ | "JSON is current format; PDF/Word under discussion" |
| 6.2 | Prepare answer for "Is this production-ready?" | ☐ | "Pilot phase — not production yet" |
| 6.3 | Prepare answer for "Can AI make decisions?" | ☐ | "AI assists only; humans decide" |
| 6.4 | Prepare answer for "Is it secure?" | ☐ | Share security features: roles, file validation, audit trail |
| 6.5 | Prepare answer for "What about Arabic?" | ☐ | "Bilingual export labels supported; full Arabic UI under consideration" |

## 7. Backup Materials

| # | Item | Done | Notes |
|---|------|------|-------|
| 7.1 | Pre-generated export JSON files | ☐ | Statements, audit file, bilingual |
| 7.2 | Screenshots of each workflow step | ☐ | For offline/fallback walkthrough |
| 7.3 | Known limitations document printed | ☐ | For reference during limitations discussion |
| 7.4 | Pilot scope document printed | ☐ | For scope discussion |
| 7.5 | FAQ document printed | ☐ | For Q&A session |

## 8. AI Outputs Pre-Generation

| # | Task | Done | Notes |
|---|------|------|-------|
| 8.1 | Generate draft notes | ☐ | Click "Generate Draft Notes" on notes tab |
| 8.2 | Generate evidence suggestions | ☐ | Click "Suggest Evidence" on evidence tab |
| 8.3 | Generate analytical review | ☐ | Click "Analytical Review" on validation tab |
| 8.4 | Accept at least one AI draft | ☐ | To show accepted state |
| 8.5 | Verify AI audit events recorded | ☐ | Check audit trail |

## 9. Questions and Answers Preparation

| # | Question | Answer Prepared |
|---|----------|----------------|
| 9.1 | "How long does implementation take?" | ☐ |
| 9.2 | "Can we import our own trial balance?" | ☐ |
| 9.3 | "Does it integrate with our ERP?" | ☐ |
| 9.4 | "Can multiple auditors work simultaneously?" | ☐ |
| 9.5 | "What happens to our data after pilot?" | ☐ |
| 9.6 | "Is there a mobile app?" | ☐ |
| 9.7 | "Can we customize the chart of accounts?" | ☐ |
| 9.8 | "Does it support our reporting framework?" | ☐ |
| 9.9 | "What training is required?" | ☐ |
| 9.10 | "What is the pricing model?" | ☐ |

## 10. Pre-Demo Warm-Up

| # | Task | Done |
|---|------|------|
| 10.1 | Run through full script once without stopping | ☐ |
| 10.2 | Verify all timing targets are met | ☐ |
| 10.3 | Check audio/video setup if remote | ☐ |
| 10.4 | Confirm screen resolution works for demo | ☐ |
| 10.5 | Have glass of water ready | ☐ |

---

## Rehearsal Sign-Off

**Rehearsal Date:** __________________  

**Presenter:** __________________  

**Observer:** __________________  

**Feedback:**  
- ☐ Ready for client demo  
- ☐ Needs additional rehearsal (areas: __________________)  
- ☐ Issues blocking demo (details: __________________)  
