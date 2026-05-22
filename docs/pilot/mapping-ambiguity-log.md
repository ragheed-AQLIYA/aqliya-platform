# Mapping Ambiguity Log

## Purpose
Track every instance where a source account maps to more than one target or where the mapping is uncertain during TB intake. This log feeds the post-pilot improvement process.

---

## Log Template

| # | Account Code | Account Name (Arabic) | Account Name (English) | Suggested Mapping | Confidence Level | Reviewer Override | Reviewer Rationale | Ambiguity Type | Resolution |
|---|---|---|---|---|---|---|---|---|---|
|   |              |                        |                        |                   |                  |                   |                   |                |            |

---

## Column Definitions

| Column | Description |
|---|---|
| Account Code | Source account code as it appears in the TB |
| Account Name (Arabic) | Arabic name from the TB (or blank if none) |
| Account Name (English) | English name from the TB (or blank if none) |
| Suggested Mapping | Target account(s) the mapping engine proposes |
| Confidence Level | High / Medium / Low — based on mapping engine score |
| Reviewer Override | Yes / No — did the reviewer change the suggested mapping? |
| Reviewer Rationale | Free-text explanation of the override reason |
| Ambiguity Type | One of: `naming`, `classification`, `code-pattern`, `cross-language` |
| Resolution | How the ambiguity was resolved (e.g., "mapped to most specific match", "escalated to lead", "deferred") |

---

## Ambiguity Types

| Type | Definition | Example |
|---|---|---|
| naming | Two targets share the same or very similar name | "ايجارات" → Rent Expense vs. Prepaid Rent |
| classification | Account could belong to more than one category | "مصروفات بنكية" → Bank Charges vs. Administrative Expenses |
| code-pattern | The source code matches multiple target code patterns | Code `4100` matches both Revenue `4xxx` and Cost `41xx` |
| cross-language | Arabic and English names suggest different targets | "خسائر فروقات عملة" → FX Loss (English says "FX Gain") |
