# SPEC-02b: API Specification — Account Intelligence

> **Status:** Draft v0.1 | **Template:** SPEC-01b | **Reuse:** ~95% | **Cycle:** 2

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | SPEC-02a v0.1 |
| **Blocks** | SPEC-02c, SPEC-02d, SPEC-02e |
| **Consumer** | API Engineering Team |

---

## Server Actions

All actions use `ActionResult<T>` and `safe()` wrapper from SPEC-01b pattern:

| Action | Input | Permission |
|---|---|---|
| `createAccountAction` | `CreateAccountInput` | `salesos:account.create` |
| `updateAccountAction` | `UpdateAccountInput` | `salesos:account.update` |
| `scoreAccountAction` | `{ accountId, version }` | `salesos:account.update` |
| `linkContactAction` | `{ accountId, contactId, sensitivity, version }` | `salesos:account.update` |
| `requestBriefAction` | `{ accountId }` | `salesos:account.view` |
| `listAccountsAction` | `AccountFilter` | `salesos:account.view` |
| `getAccountAction` | `{ accountId }` | `salesos:account.view` |
| `archiveAccountAction` | `{ accountId, version }` | `salesos:account.admin` |

---

## Error Mapping

Same mapping as SPEC-01b: `ValidationError → VALIDATION_ERROR`, `BusinessRuleError → BUSINESS_RULE_FAILED`, `GovernanceBlockedError → GOVERNANCE_BLOCKED`, `ConcurrencyError → CONFLICT`, `NotFoundError → NOT_FOUND`, access denied → `FORBIDDEN`.

---

## DTO Mapping

```typescript
function toAccountResponse(account: Account): AccountResponse {
  return {
    id, name, nameAr, industry, size, region,
    status, icpScore: account.scores.icp?.value,
    healthScore: account.scores.health?.value,
    ownerId, version, createdAt, updatedAt,
  };
}
```

**Rule:** DTO flattens Value Objects to primitives. No Domain types in API output.

---

## Pagination

Same contract: `PaginatedResponse<T>` with `items`, `page`, `pageSize`, `hasNext`, `totalCount?`. Default 20, max 100.

## Concurrency

Same protocol: `version` field checked on every write mutation. CONFLICT on mismatch.

## Idempotency

| Operation | Idempotent? |
|---|---|
| createAccount | No |
| updateAccount | Yes (conditional) |
| scoreAccount | Yes (if same score) |
| linkContact | Yes (if already linked) |
| list/get | Yes (read) |
| archive | Yes |

---

## Event Publication

| Domain Event | Published |
|---|---|
| AccountCreated | ✅ |
| AccountQualified | ✅ |
| AccountScored | ✅ |
| AccountDormant | ✅ |
| BriefGenerated | ✅ |

All events carry: `eventVersion: 1`, `correlationId`, `source: "salesos"`, `timestamp`, `sequenceId`.

---

## Traceability

| Element | PRD-02 Reference |
|---|---|
| Server Actions | §13 (APIs) |
| Permissions | §5 (Actors) |
| Error codes | §13 |
| Events | §11 |

---

## Document Metadata

- **Author:** OpenCode | **Template:** SPEC-01b | **Reuse:** ~95%
- **Version:** 0.1 | **Status:** Draft
