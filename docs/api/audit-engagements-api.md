# AuditOS API Reference

## Base URL
`/api/audit/engagements`

## Authentication
All API routes require a valid NextAuth session. Use `Authorization: Bearer <token>` header.

---

## GET /api/audit/engagements
List all audit engagements for the authenticated user's organization.

**Response:**
```json
{
  "engagements": [
    {
      "id": "string",
      "clientId": "string",
      "client": { "id": "string", "name": "string" },
      "fiscalPeriod": "string",
      "engagementType": "full_audit | review | agreed_upon_procedures",
      "status": "draft | setup | in_progress | under_review | awaiting_client | ready_for_approval | approved | published | archived",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

## POST /api/audit/engagements
Create a new audit engagement.

**Body:**
```json
{
  "clientId": "string (required)",
  "fiscalPeriod": "string (required)",
  "engagementType": "full_audit | review | agreed_upon_procedures"
}
```

---

## GET /api/audit/engagements/[engagementId]
Get a single engagement with full details.

**Response includes:** client info, team members, status history, approval records.

---

## Export Endpoints

### GET .../exports/pdf — Export engagement as PDF
### GET .../exports/xlsx — Export engagement as XLSX

**Auth required.** Returns binary file download.

---

## Evidence Endpoints
### GET /api/audit/evidence/[evidenceId]/download
Download a specific evidence file. Returns the file with original MIME type.

---

## Health Check
### GET /api/health
Returns `{ "status": "ok", "timestamp": "..." }`
No auth required.
