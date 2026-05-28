# AQLIYA API Documentation

## Available API Routes

| Route                                      | Method    | Description                                                    | Auth |
| ------------------------------------------ | --------- | -------------------------------------------------------------- | ---- |
| `/api/health`                              | GET       | Health check                                                   | No   |
| `/api/auth/[...nextauth]`                  | \*        | NextAuth authentication                                        | No   |
| `/api/audit/engagements`                   | GET, POST | List/create engagements                                        | Yes  |
| `/api/audit/engagements/[id]`              | GET       | Get engagement details                                         | Yes  |
| `/api/audit/engagements/[id]/exports/pdf`  | GET       | Export as PDF                                                  | Yes  |
| `/api/audit/engagements/[id]/exports/xlsx` | GET       | Export as XLSX                                                 | Yes  |
| `/api/audit/evidence/[id]/download`        | GET       | Download evidence file                                         | Yes  |
| `/api/custom-product-submit`               | POST      | Submit custom product inquiry                                  | No   |
| `/api/pilot-review`                        | POST      | Submit pilot review request (no auth, no DB, optional webhook) | No   |

## Integration Guide

### Authentication

1. Obtain a session token via NextAuth sign-in (`/api/auth/signin` or client-side `signIn()`)
2. Pass the token in the `Authorization: Bearer <token>` header for all authenticated requests

### Pagination

List endpoints support `?page=1&limit=20` query parameters. Responses include `total` and `totalPages` metadata.

### Error Handling

All API errors return a JSON object:

```json
{
  "error": "Description of the error"
}
```

HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 413 (payload too large), 500 (server error).

## Route-Specific Documentation

| Route                    | Document                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `POST /api/pilot-review` | [Pilot Review Intake](pilot-review-intake.md) — API reference                                   |
| `POST /api/pilot-review` | [Pilot Review Webhook Scenario](pilot-review-webhook-scenario.md) — Notion/CRM automation setup |

### Export Flow

1. Fetch engagement data via `GET /api/audit/engagements/[id]`
2. Request export via `GET .../exports/pdf` or `GET .../exports/xlsx`
3. The response is a binary file download with the correct `Content-Type` header
