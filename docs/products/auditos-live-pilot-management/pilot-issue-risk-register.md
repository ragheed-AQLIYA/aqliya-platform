# AuditOS Pilot Issue And Risk Register

Source of truth:

1. `docs/products/auditos-product-packaging.md`
2. `docs/products/auditos-sales-ops/`

## Purpose

سجل موحد لأي issue أو risk تظهر أثناء pilot حية.

## Suggested Fields

| Field | Description |
|---|---|
| Date Opened | تاريخ فتح المشكلة |
| Account | اسم العميل |
| Issue / Risk Title | عنوان مختصر |
| Type | issue / risk |
| Severity | low / medium / high |
| Description | شرح واضح |
| Impact | ما الذي قد يتعطل أو يتأثر |
| Owner | المسؤول عن المتابعة |
| Mitigation | الإجراء المقترح |
| Target Resolution Date | تاريخ الحل المتوقع |
| Status | open / monitoring / mitigated / closed |

## Example Risk Types

1. unclear buyer ownership
2. slow stakeholder response
3. weak use-case scope
4. messy source data beyond expected range
5. unrealistic expectation about AI autonomy
6. delay in evidence collection

## Rule

أي risk عالية أو issue تمنع progress يجب أن تظهر في weekly pilot status report.
