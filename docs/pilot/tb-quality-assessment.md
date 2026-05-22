# Trial Balance — Quality Assessment Template

## Assessment Criteria

### 1. Naming Consistency
| Score | Label | Description |
|---|---|---|
| 5 | Consistent Arabic | All account names in clean Arabic, uniform spelling |
| 4 | Consistent English | All account names in clean English, uniform spelling |
| 3 | Mixed consistent | Arabic and English mixed but each language block is internally consistent |
| 2 | Mixed inconsistent | Arabic and English mixed with spelling / abbreviation variations |
| 1 | Unintelligible | Random characters, fragments, or no discernible naming convention |

**What to look for:** Trailing spaces, punctuation differences, shorthand variants (e.g., "م.م" vs "شركة ذات مسؤولية محدودة"), typos.

**Common patterns:** Mix of Arabic names with English abbreviations, inconsistent use of "&" vs "and".

### 2. Account Structure
| Score | Label | Description |
|---|---|---|
| 5 | Clean hierarchy | Accounts follow a consistent parent-child tree |
| 4 | Flat with groups | Flat list but with group header rows |
| 3 | Alphanumeric codes | Structured codes but mixed with user‑friendly labels |
| 2 | Custom / inconsistent | Multiple coding schemes in one file |
| 1 | No structure | No discernible code pattern |

**What to look for:** Code length variance, presence of delimiters (`.` `-` `/`), mixed numeric and string segments.

**Common patterns:** Some accounts use 4-digit codes, others use 7-digit; parent accounts interleaved with child accounts.

### 3. Balance Integrity
| Score | Label | Description |
|---|---|---|
| 5 | Perfect | Debits = Credits to the penny |
| 4 | Off by trivial amount | Difference < 0.01 % of total |
| 3 | Off by small amount | Difference < 1 % of total |
| 2 | Off by material amount | Difference ≥ 1 % of total |
| 1 | Not balanced | No attempt at balancing visible |

**What to look for:** Rounding differences, sign convention errors (positive vs negative), omitted contra accounts.

**Common patterns:** VAT or suspense accounts used as balancing plugs; cumulative rounding across many rows.

### 4. Hierarchy Quality
| Score | Label | Description |
|---|---|---|
| 5 | Full tree | Every child has a valid parent, no orphans |
| 4 | Mostly intact | One or two orphans, easily fixable |
| 3 | Partial | Several orphans; parent codes don't match actual parents |
| 2 | Broken | Many orphans; hierarchy logic unclear |
| 1 | No hierarchy | All accounts are top-level |

**What to look for:** Orphan accounts (child code starts with a parent prefix that doesn't exist), circular references, missing roll-up accounts.

**Common patterns:** Parent accounts deleted but children remain; hierarchy in the TB doesn't match the COA.

### 5. Export Cleanliness
| Score | Label | Description |
|---|---|---|
| 5 | Clean | No formatting issues, no empty rows, no corruption |
| 4 | Minor issues | A few empty rows or extra header lines |
| 3 | Moderate issues | Merged cells, trailing spaces, or non‑printing characters |
| 2 | Major issues | Data in wrong columns, line breaks within cells, BOM problems |
| 1 | Corrupt | File cannot be parsed without manual repair |

**What to look for:** Hidden rows, leading/trailing whitespace, date fields stored as strings, invisible Unicode characters.

**Common patterns:** Excel files with merged header rows, PDF‑to‑Excel output with fragmented cells, CSV with unescaped commas in text fields.

### 6. Missing Fields
| Score | Label | Description |
|---|---|---|
| 5 | Complete | Opening balances, comparative data, entity codes all present |
| 4 | One missing | One of the three is absent |
| 3 | Two missing | Two of the three are absent |
| 2 | All three missing | No opening balance, no comparative, no entity code |
| 1 | Minimal data | Only account name and current balance (if that) |

**What to look for:** Columns present but entirely empty, placeholder text ("N/A", "0"), columns that appear to be the wrong field.

**Common patterns:** Entity code embedded inside account code; comparative period data in a separate file.

### 7. Localization Issues
| Score | Label | Description |
|---|---|---|
| 5 | No issues | Arabic numerals, RTL correct, dates in expected format |
| 4 | Minor | Occasional Latin numeral in Arabic context |
| 3 | Moderate | Mix of Arabic and Latin numerals; RTL rendering breaks layout |
| 2 | Major | Wrong date format (MM/DD vs DD/MM); RTL causes column shift |
| 1 | Unusable | System cannot parse numerals, dates, or text direction |

**What to look for:** Numerals that look correct but are Unicode "Arabic-Indic digits" vs "Extended Arabic-Indic digits", Excel reversing text in RTL, dates that Excel auto‑converts.

**Common patterns:** TB exported from an English locale but containing Arabic account names; dates in "YYYY/MM/DD" that Excel interprets as text.

---

## Overall Score

| Level | Range | Action |
|---|---|---|
| High | 5.0 – 6.0 | Proceed to mapping with standard workflow |
| Medium | 3.5 – 4.9 | Proceed with additional validation steps |
| Low | 1.0 – 3.4 | Halt; request cleaner TB before proceeding |

**Calculation:** Average of all seven criterion scores.
