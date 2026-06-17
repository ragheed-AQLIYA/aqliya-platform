# LocalContentOS — Customer Instructions

**Status:** Pilot Template Pack — not software
**Purpose:** Instructions for pilot customers preparing data for a LocalContentOS pilot engagement

---

## What You Should Prepare

For the LocalContentOS pilot, please prepare the following data files from your organization. The pilot focuses on one reporting period, one procurement category or business unit, and a sample of suppliers and contracts.

### Required Files

| File                    | Contents                                                          | Format             |
| ----------------------- | ----------------------------------------------------------------- | ------------------ |
| Vendor Master           | List of all suppliers in the pilot scope with classification data | CSV / XLSX         |
| Procurement Spend       | Transaction-level spend data for the pilot period                 | CSV / XLSX         |
| Evidence Register       | Supporting documentation for classifications                      | CSV / XLSX + files |
| Classification Review   | Your current classification of key suppliers                      | CSV / XLSX         |
| Exceptions and Findings | Any known issues you already track                                | CSV / XLSX         |
| Pilot Summary           | Final assessment (completed by AQLIYA analyst)                    | CSV / XLSX         |

### Optional Files

| File                           | When to Include                                             |
| ------------------------------ | ----------------------------------------------------------- |
| Contracts                      | If you have active contracts with local content commitments |
| Purchase Orders                | If PO-level tracking is part of your procurement process    |
| Previous Local Content Reports | If available for baseline and trend comparison              |

---

## How to Fill the Templates

1. **Start with the Vendor Master** — this is the foundation. All other files reference vendor IDs from this list.
2. **Use the CSV header files** provided by AQLIYA — they contain the exact column names and formats needed.
3. **Maintain consistent vendor IDs** across all templates. The same vendor should have the same ID in every file.
4. **Fill all required fields** marked in the template specifications. Optional fields can be left blank if not available.
5. **Include evidence files** referenced in the Evidence Register. File names should match the `file_name` field.
6. **Review and validate** before submission — check the validation rules in each template specification.

---

## What Not to Include

- **Personal data** — do not include individual employee names, national IDs, or contact information unless explicitly required in the template
- **Unrelated data** — only include records within the agreed pilot scope
- **Unredacted confidential data** — if specific commercial terms are highly sensitive, you may redact them while keeping the classification data
- **Password-protected files** — all submitted files must be accessible without passwords
- **Linked or embedded files** — each file should be a standalone document

---

## Data Privacy Warning

- This data will be used only for the LocalContentOS pilot engagement
- AQLIYA will process the data per the data processing agreement
- Do not submit data that violates your organization's data privacy policies
- If you are unsure about a specific data field, consult your legal or compliance team before submitting
- You may aggregate or anonymize spend data if preferred (e.g., rounded amounts instead of exact figures)

---

## Naming Convention for Files

Use the following naming convention for all submitted files:

```
localcontentos-pilot-{prefix}-{yyyymmdd}.csv
```

| Prefix                  | Example                                                   |
| ----------------------- | --------------------------------------------------------- |
| `vendor-master`         | `localcontentos-pilot-vendor-master-20260501.csv`         |
| `procurement-spend`     | `localcontentos-pilot-procurement-spend-20260501.csv`     |
| `contracts`             | `localcontentos-pilot-contracts-20260501.csv`             |
| `evidence-register`     | `localcontentos-pilot-evidence-register-20260501.csv`     |
| `classification-review` | `localcontentos-pilot-classification-review-20260501.csv` |
| `exceptions-findings`   | `localcontentos-pilot-exceptions-findings-20260501.csv`   |

For evidence files, use the naming convention:

```
{evidence_id}-{original_filename}
```

Example: `EVD-2025-001-CR-1010234567.pdf`

---

## Evidence Folder Structure

Organize all files into the following folder structure:

```
localcontentos-pilot/
├── 01-vendor-master/
│   ├── localcontentos-pilot-vendor-master-20260501.csv
│   └── vendor-evidence/          (CR files, certificates)
├── 02-procurement-spend/
│   ├── localcontentos-pilot-procurement-spend-20260501.csv
│   └── invoice-evidence/         (invoice PDFs)
├── 03-contracts/
│   ├── localcontentos-pilot-contracts-20260501.csv
│   └── contract-evidence/        (signed contracts)
├── 04-evidence/
│   ├── localcontentos-pilot-evidence-register-20260501.csv
│   └── all-evidence-files/       (all evidence files organized by evidence_id)
├── 05-previous-reports/
│   └── (previous local content reports, if available)
├── 06-notes/
│   └── (any additional documentation, classification policy, notes)
└── README.md                     (optional: notes on data preparation)
```

---

## Submission Checklist

Before submitting, verify:

- [ ] All vendor IDs are consistent across templates
- [ ] Required fields are filled (see template specifications)
- [ ] Spend amounts use numeric format without commas or currency symbols
- [ ] Dates are in YYYY-MM-DD format
- [ ] Evidence files are named correctly and referenced in the Evidence Register
- [ ] No password-protected files
- [ ] No personal data included
- [ ] Classification values use the specified options (Local, Non-Local, Mixed, Undetermined)
- [ ] File names follow the naming convention
- [ ] Folder structure matches the required layout

---

## Common Mistakes to Avoid

| Mistake                                 | How to Avoid                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Inconsistent vendor IDs across files    | Use the exact same vendor_id value in Vendor Master, Spend, and Contracts    |
| Missing CR numbers for Saudi vendors    | CR is primary evidence for local classification — prioritize obtaining it    |
| Spend amounts with formatting           | Export raw numbers from your ERP, not formatted reports                      |
| Evidence files without register entries | Every evidence file should have a corresponding row in the Evidence Register |
| Data outside the pilot period           | Filter your dataset to the agreed reporting period before submission         |
| Arabic/English name mismatches          | Use the legal name from the CR, and include English name if available        |

---

## Questions?

If you have any questions about data preparation, contact your AQLIYA pilot analyst.
