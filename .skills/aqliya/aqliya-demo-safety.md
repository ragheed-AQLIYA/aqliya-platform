---
name: aqliya-demo-safety
description: Safety rules for the /auditos demo route. Enforces mock-only, read-only, no-auth, no-upload, no-download, no-customer-data constraints.
---

# AQLIYA Demo Safety Gate

> **Purpose:** Ensure the public demo route (`/auditos`) never exposes real customer data, requires authentication, or allows destructive operations.

---

## 1. Demo Route Definition

**Current demo route:** `/auditos` (public guided demo of AuditOS)

**Constraint:** This route is publicly accessible with `skipAuth` in middleware. Every safety rule below exists because this route has no authentication gate.

---

## 2. Hard Rules (Never Violate)

### Rule 1: No Authentication Required

The demo route must work without login. Do not add auth checks to demo pages.

### Rule 2: No Real Customer Data

All data displayed in the demo must be:

- Mock/sample data from seed scripts
- Hardcoded demo data
- Generated fake data
- Never from production databases

### Rule 3: No Mutations

Demo routes are read-only:

- No Server Actions that write to the database
- No forms that submit data
- No state changes that persist
- Demo "actions" must be client-side only or reset on reload

### Rule 4: No Uploads

The demo must not have file upload functionality. No `input[type=file]`, no drop zones, no upload API calls.

### Rule 5: No Downloads

The demo must not provide real file downloads:

- No download buttons
- No export-to-PDF/XLSX
- No downloadable reports
- Demo "downloads" must be client-side generated content only (e.g., `data:text/plain` URLs)

### Rule 6: No Real API Keys

The demo must not expose or use:

- Real API keys
- Real database credentials
- Real AI provider keys
- Real secrets

### Rule 7: No Real User Data

The demo must not:

- Show real user names
- Show real organization data
- Show real financial data
- Access real workspace records

---

## 3. Demo Data Rules

All demo data must be:

- Clearly labeled as "بيانات تجريبية / Demo Data"
- Non-realistic where it could be mistaken for real
- Free of personally identifiable information (PII)
- Free of financial institution names
- Free of real Saudi government entity names (unless explicitly approved demo content)

---

## 4. Prohibited in Demo Routes

- `prisma` calls that read real data
- Server Actions with database writes
- File upload handlers
- Download handlers
- API routes that proxy to real backends
- AI calls with real prompts
- Session/authentication code

---

## 5. Permitted in Demo Routes

- Static sample data arrays
- Mock service calls
- Client-side demo interactions
- Read-only demonstrations
- UI showcase with fake data
- Client-side generated "reports" (no server involvement)

---

## 6. Verification Checklist

Every time a demo route is modified, verify:

- [ ] Route works without login
- [ ] No real data visible
- [ ] No upload elements present
- [ ] No download elements present (or only client-side generated)
- [ ] No API calls to real endpoints
- [ ] No mutations persist across page reloads
- [ ] No auth checks fail
- [ ] No real API keys in source or network requests

---

## 7. Demo Safety Failure Protocol

If demo safety is violated:

1. **Immediately identify the violation** — what rule was broken?
2. **Revert the violating change** — restore previous safe state
3. **Report** the violation, how it happened, and what fix was applied
4. **Do not deploy** until demo safety is restored
5. **Do not merge** demo-breaking changes

---

## 8. Current Demo Routes

| Route                           | Status      | Safety Verified |
| ------------------------------- | ----------- | --------------- |
| `/auditos`                      | Public demo | Yes             |
| `/auditos/financial-statements` | Public demo | Yes             |
| `/auditos/trial-balance`        | Public demo | Yes             |
| `/auditos/review`               | Public demo | Yes             |

Any new route under `/auditos` inherits these safety rules automatically.
