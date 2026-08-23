# LCGPA Official Artifact Catalogue

**Retrieved:** 2026-08-22 from `https://lcgpa.gov.sa`
**Method:** rendered the Mendix documents page, resolved each publisher's download
control to its `/file?guid=…&changedDate=…` URL, retrieved the raw bytes inside
the session, hashed before parsing.
**Preserved at:** `uploads/lcgpa-sources/2026-07/` (git-ignored; raw bytes are
never committed)

---

## 1. How the site serves documents

`lcgpa.gov.sa` is a **Mendix single-page application**. Every path returns the
same ~26 KB application shell; content arrives over the Mendix runtime API
(`POST /xas/`). The former SharePoint paths no longer resolve:

| Retired URL | Status 2026-08-22 |
|---|---|
| `/ar/Regulations/DocumentsLibrary/Pages/default.aspx` | redirects to `#/error-page/404.html` |
| `/en/Regulations/Docs-Lists/Pages/FactoriesList.aspx` | connection timeout |
| `/en/LocalContent/Pages/Local-Content-Mechanisms.aspx` | connection timeout |
| `/en/eservices/Pages/Service-003.aspx` | connection timeout |

The working documents route is:

```
https://lcgpa.gov.sa/#/ar_SA/MandatoryListNationalProducts/Documents
```

Published files are served from:

```
https://lcgpa.gov.sa/file?guid=<guid>&changedDate=<epochMillis>
```

**That endpoint returns HTTP 401 without a Mendix runtime session cookie.** Any
fetcher must first GET `https://lcgpa.gov.sa/` and replay the resulting cookies —
`createHttpFetcher()` does this automatically. The endpoint also returns the real
filename in `Content-Disposition`; the URL itself has no extension.

The `guid` identifies a **document version**. When LCGPA republishes a document
the guid changes, so the documents page is monitored by `DOCUMENT_DISCOVERY`
while each current artifact is monitored by `FILE_FINGERPRINT`.

---

## 2. The eight published documents

| # | Title (as published) | Type | Bytes | SHA-256 | guid | changedDate |
|---|---|---|---:|---|---|---|
| 1 | القائمة الإلزامية للجهات الحكومية (يوليو 2026) | XLSX | 461,503 | `93f3e1f4533da8d12644c0c9b964c4712972b1eade347d805458aca0d0d1d632` | 8725724278325064 | 1785224655483 |
| 2 | القائمة الإلزامية للشركات المملوكة للدولة (July 2026) | XLSX | 419,723 | `f613722d4017c8b0b2b471b99fba1c61d53bf5f4b29266a4d901671419e83dfc` | 8725724278324869 | 1785224636605 |
| 3 | الحد الأدنى لنسبة المحتوى المحلي … القائمة الإلزامية - يوليو 2026 | XLSX | 117,819 | `acec6451903348b92484c4e0280d26a076e2321219d565e1253a0aa9d111673f` | 8725724278312159 | 1785404027587 |
| 4 | التعليمات الخاصة بتسليم المنتجات الوطنية … 2026 | PDF | 99,926 | `c9d553fc233c1ec2ebddf4385565361a1d7c08b21b59d11c64479c415abe598e` | 8725724278376079 | 1783418664349 |
| 5 | وثيقة ضوابط الاستثناء من القائمة الإلزامية - للخدمات | PDF | 183,638 | `7d4466e7fb842466824eb08029413d8a7bda5ed18a02224ce3453344d08068d1` | 8725724278350523 | 1780919715142 |
| 6 | وثيقة ضوابط الاستثناء من القائمة الإلزامية - للسلع | PDF | 208,485 | `5a668fea292de5124fe5468c2d1a0295e149e23acf6bf97432cfe0b0d0ef61d7` | 8725724278133137 | 1780919629818 |
| 7 | وثيقة ضوابط الاستثناء … لمنتجات الأدوية والمستحضرات والمستلزمات الطبية | PDF | 187,342 | `99abe220eecbaf05695b4d116c5a0ccfea05cef2a51ee9a5410c5d30ede1970f` | 8725724278133031 | 1780919591503 |
| 8 | النموذج لإقرار المصنع أو مزود الخدمة بأن المنتج صناعة وطنية | PDF | 60,540 | `083560e1038251afe4f0e37f9865a78444e523e4fe90d740ca25f1972176209d` | 8725724278133507 | 1751786957997 |

Verify any of them:

```powershell
Get-FileHash -Algorithm SHA256 ".\uploads\lcgpa-sources\2026-07\<file>"
```

---

## 3. Structure of the Mandatory List workbooks (#1, #2)

One worksheet **per sector**; the sheet name *is* the sector's published
identity. LCGPA publishes no sector code in these workbooks, so the engine
invents none. Header on row 1, data from row 2, column A empty.

| Col | Header | Present in |
|---|---|---|
| B | الرمز في منصة اعتماد Etimad Code | both |
| C | اسم المنتج (عربي) | both |
| D | اسم المنتج (انجليزي) | both |
| E | وصف المنتج (عربي) | both |
| F | وصف المنتج (انجليزي) | both |
| G | السقف السعري Price Ceiling | government only |
| H | تاريخ التطبيق Effective Date | both |
| I | الحد الأدنى لخط الأساس لمصنع المنتج | government only |
| J | ملاحظات | both |

Sheets without an Etimad Code column (`نظرة عامة`, `ضوابط الاستثناء …`) are
skipped and reported.

**Verified content of #1 (government entities, July 2026):**

| | |
|---|---:|
| Product sheets (sectors) | 14 |
| Products | **1,727** |
| Duplicate codes across sheets | 0 |

| Sector | Products |
|---|---:|
| المستلزمات الطبية | 585 |
| البناء و التشييد | 386 |
| الأدوية و المستحضرات الطبية | 366 |
| الأغذية و المنتجات الزراعية | 95 |
| المواد الكيميائية و الاسمدة | 77 |
| معدات ولوازم شخصية ومنزلية | 55 |
| النقل و الخدمات اللوجستية | 45 |
| الأثاث | 30 |
| المنتجات الاستهلاكية البلاستيكية | 24 |
| القرطاسية والأدوات المكتبية | 20 |
| مستهلكات النظافة | 19 |
| المنتجات الاستهلاكية الورقية | 12 |
| الأعمال الفنية | 8 |
| المعدات و اللوازم الرياضية | 5 |
| **Total** | **1,727** |

Two published quirks reproduced in the parser's tests:

1. The `البناء و التشييد` sheet labels its **Arabic** name column
   "Commodity Title (English)". Columns are therefore matched on the **Arabic**
   half of the bilingual header, which is consistent across the file.
2. The workbook contains `xl/externalLinks/` parts and a calculation chain. Both
   raise integrity **warnings**; the parser reads cached cell values only and
   never evaluates a formula or an external reference.

---

## 4. Structure of the minimum local content schedule (#3)

Single worksheet, header row 1, data from row 2. The sheet declares ~1,047,835
formatted rows; the parser stops after a 50-row blank run.

| Col | Header |
|---|---|
| A | الرمز في منصة اعتماد Etimad Code |
| B | اسم المنتج (عربي) |
| C | اسم المنتج (انجليزي) |
| D | تاريخ بدء إشتراط الحد الأدنى — e.g. `1 أغسطس 2026م` |
| E–J | نسبة الحد الأدنى لعام **2026 … 2031** |

Year cells carry three meanings and **none of them is zero**:

| Cell | Meaning | Stored as |
|---|---|---|
| a number | the binding minimum for that year | `STATED`, percentage 0–100 |
| `-` | the requirement does not bind that year | `NOT_APPLICABLE`, pct `null` |
| `TBD` | the authority has not determined it | `TBD`, pct `null` |

Percentages are published as **fractions** (`0.23` = 23%). Values of 1 or below
are multiplied by 100 and the conversion count is reported as a parser warning.

**Verified content:** 1,198 products, six schedule years.

| Commencement (تاريخ بدء إشتراط) | Products |
|---|---:|
| 1 أغسطس 2026 | 2 |
| 1 أغسطس 2027 | 231 |
| 1 يونيو 2028 | 965 |
| **Total** | **1,198** |

The two products binding from 2026-08-01 are `2353` بلاط سيراميك and `2354`
بلاط بورسلان, both at **23%** in 2026, rising to 27%/25% in 2027 and reaching
60%/43% by 2030, with 2031 published as `TBD`.

---

## 5. Cross-artifact findings

### 5.1 The join key is the canonical Etimad code

The mandatory list publishes zero-padded codes (`0001`); the minimum-LC schedule
publishes them unpadded (`1`). Joining on the raw strings matches only 918 of
1,198 rows. Joining on the **canonical** code (digits, leading zeros stripped)
matches **1,192**.

### 5.2 Six products carry a minimum but are not on the July 2026 list

`2802, 2804, 2805, 2808, 2809, 2814` appear in the minimum-LC schedule with a
published percentage but are **absent from the July 2026 Mandatory List**.

Two official artifacts disagree. Under §29 this is a `REGULATORY_CONFLICT`:
it is recorded with both artifact hashes and routed to human review. **The engine
does not choose between them, and neither should the reviewer without going back
to LCGPA.**

### 5.3 The 233-product cohort has moved

SPA announcement N2514218 (2026-02-17) stated that **233 products** become
subject to minimum local content from **2026-08-01**. In the July 2026 schedule
those 233 products are split: **2** commence 2026-08-01 and **231** commence
2027-08-01.

The arithmetic matches exactly (2 + 231 = 233), which is consistent with the
cohort having been rescheduled between the February announcement and the July
publication. **This is an observation, not a finding.** Confirming what LCGPA
actually decided requires the official amendment; the engine records both
statements with their sources and leaves the interpretation to a human (§51).

---

## 6. What is still not published

| Question | Status |
|---|---|
| Sector codes for mandatory-list sheets | Not published — the sheet name is the identity |
| HS codes | Not published in these workbooks |
| A dataset-level effective date inside the workbooks | Not stated — only per-product `تاريخ التطبيق` |
| Minimum percentages for 2031 | Published as `TBD` |

Each is recorded as `null`/`UNKNOWN`. None is inferred.
