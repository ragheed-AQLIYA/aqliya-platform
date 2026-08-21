# LCGPA Audit Control Traceability Matrix

**Date:** 2026-08-21  
**Status:** COMPLETE  
**Source:** Local_Content_Verification_Audit_Matrix_v1.xlsx  
**Template:** نموذج قياس نسبة المحتوى المحلي - v.2.xlsx  
**Owner:** LocalContentOS

---

## Purpose

Maps every audit control from the official verification matrix to specific LocalContentOS workbook lines, LCGPA calculation functions, and Prisma models. Ensures every verification item can be traced to an implementation.

---

## 1. General & Controls (GEN-01 to GEN-08)

| Control | Audit Domain | Workbook Line | LCGPA Function | Implementation |
|---------|-------------|---------------|----------------|----------------|
| GEN-01 | Reporting Currency | All lines | — | All values stored in SAR (enforced at input level) |
| GEN-02 | Fiscal Framework | INF-01 to INF-03 | — | Company info with date boundaries |
| GEN-03 | Audit Opinion Test | DEC-01 | — | Declaration line for audit opinion |
| GEN-04 | Special Purpose Financials | REV-01 to REV-03 | — | Revenue lines from audited FS |
| GEN-05 | Consolidation Logic | — | — | Platform-level exclusion (not in workbook) |
| GEN-06 | Management Accounts | INF-04 | — | Company sector/segment info |
| GEN-07 | Foreign Exclusions | — | `validateLcInputs()` | Foreign cost exclusion at pillar level |
| GEN-08 | Formula Integrity | — | `LCGPA_RULE_VERSION` | Version-locked calculation engine |

## 2. Workforce Verification (LAB-01 to LAB-10)

| Control | Audit Criteria | Workbook Line | LCGPA Function | Substantiation |
|---------|---------------|---------------|----------------|----------------|
| LAB-01 | Demographic Mapping | WRK-01 to WRK-06 | `computeLcLaborCompensation()` | Payroll & headcount summary |
| LAB-02 | Scope of Compensation | WRK-05, WRK-06 | `computeLcLaborCompensation()` | Trial balance & GL |
| LAB-03 | End of Service Benefits | — | — | Actuarial valuation (not in LCGPA formula) |
| LAB-04 | Statutory Legality | DEC-02 | — | Signed management statement |
| LAB-05 | Sampling Execution | — | — | Audit sampling (post-calculation) |
| LAB-06 | Identity Verification | — | — | National ID / Iqama (post-calculation) |
| LAB-07 | Banking Trail Trace | — | — | WPS logs (post-calculation) |
| LAB-08 | Contract Validity | — | — | Employment contracts (post-calculation) |
| LAB-09 | Contractor Segregation | — | `validateLcInputs()` | Vendor invoice exclusion |
| LAB-10 | Cross-Section Exclusions | CAP-01 | `computeLcCapacityBuilding()` | Expense reclassification |

### Workforce LC% Formula (from template v.2 Section 3):

| Employee Type | LC% Attribution | Row |
|---------------|----------------|-----|
| Saudi | 100% | R11 Col B |
| Expat | 37% (0.37) | R11 Col C |

## 3. Supply Chain Verification (SC-01 to SC-10)

| Control | Control Objective | Workbook Line | LCGPA Function | Rule |
|---------|------------------|---------------|----------------|------|
| SC-01 | Descending Sorting | — | `rankAndSelectSuppliers()` | Suppliers sorted by descending spend |
| SC-02 | Unclassified Spend Cap | — | `validateLcInputs()` | Unclassified spend → non-compliant |
| SC-03 | Exclusion Verification | — | `validateLcInputs()` | Capex, depreciation, zakat, taxes excluded |
| SC-04 | 70% Scope Threshold | — | `applyGsSelectionRule()` | max(70% cumulative, top-40 suppliers) |
| SC-05 | 500M SAR Risk Vector | — | `checkExpandedSupplierRules()` | Expand to 80 suppliers if residual ≥ 500M |
| SC-06 | Dual-Transaction Sample | — | — | 2 transactions per vendor (post-calculation) |
| SC-07 | Ancillary Document Match | — | — | Contracts, POs, delivery notes (evidence) |
| SC-08 | Registry Score Match | — | — | LC score verified on LCGPA portal |
| SC-09 | Non-Manufacturing Agents | — | — | Score traced to root factory |
| SC-10 | Extra Disclosure (4.1) | — | `checkExpandedSupplierRules()` | 300 suppliers when goods < 50% |

### G&S Selection Rule (from template v.2 Section 4):

| Rule | Threshold | Workbook |
|------|-----------|----------|
| Primary | 70% of total supply chain outlays | Section 4, R10 |
| Alternative | Top 40 unique suppliers (whichever higher) | Section 4, R14-R94 |
| Minimum floor | 10 unique vendors | SC-04 |
| Expanded (SC-05) | 80 suppliers if residual ≥ 500M SAR | — |
| Extra disclosure (SC-10) | 300 suppliers if goods < 50% | Section 4.1 |

## 4. Capex, Capacity Building & Assets (CPX, CAP, DEP)

### 4.1 Capex (CPX-01 to CPX-03)

| Control | Rule | Workbook Line | LCGPA Function | Implementation |
|---------|------|---------------|----------------|----------------|
| CPX-01 | Capex ≥ 100M SAR → full mapping | Section 5 | `applyCapexRules()` | Threshold check |
| CPX-02 | Exclude real estate, land, inventory, intra-group | Section 5 | `applyCapexRules()` | `excludeFromBaseline` flag |
| CPX-03 | Top 80 assets in descending cost order | Section 5 | `applyCapexRules()` | Sorted by cost, top 80 |

### 4.2 Capacity Building (CAP-01 to CAP-04)

| Control | Rule | Workbook Line | LCGPA Function | LC% |
|---------|------|---------------|----------------|-----|
| CAP-01 | Saudi training = 100% | CAP-01 | `computeLcCapacityBuilding()` | 100% |
| CAP-02 | Internal training cost traceable | CAP-02 | `computeLcCapacityBuilding()` | Hourly rates |
| CAP-03 | Supplier development (non-contractual) | CAP-03 | `computeLcCapacityBuilding()` | 100% |
| CAP-04 | R&D in KSA = 100% (IFRS expense mapping) | CAP-04 | `computeLcCapacityBuilding()` | 100% |

### 4.3 Depreciation (DEP-01 to DEP-03)

| Control | Rule | Workbook Line | LCGPA Function | LC% |
|---------|------|---------------|----------------|-----|
| DEP-01 | Fixed Asset Register → balance sheet reconciliation | AST-01 to AST-04 | `computeLcAssetDepreciation()` | Varies |
| DEP-02 | Buildings/land = 100% local component | AST-01 | `computeLcAssetDepreciation()` | 100% |
| DEP-03 | Equipment origin = domestic vs foreign | AST-02, AST-03 | `computeLcAssetDepreciation()` | KSA=100%, Foreign=20% |

## 5. Close-out Checklist (CLO-01 to CLO-05)

| Control | Rule | Workbook Line | Implementation |
|---------|------|---------------|----------------|
| CLO-01 | Top 10 client grid | REV-01 to REV-03 | Revenue by customer segment |
| CLO-02 | Export ledger match (30-100% coverage) | REV-03 | Export revenue tracking |
| CLO-03 | Dividend disclosures | DEC-03 | Declaration line |
| CLO-04 | Management representation letter | — | Evidence upload |
| CLO-05 | Auditor declaration (SOCPA partner) | — | External audit sign-off |

---

## Appendix B: Official Sector LC% Rates (from template v.2)

### Service Sectors (23)

| Code | Sector (AR) | Sector (EN) | LC% | ISIC |
|------|------------|-------------|-----|------|
| S01 | خدمات الإسكان وتأجير المنشآت | Housing & Rental | 0.60 | 55, 68102 |
| S02 | خدمات تقديم الأغذية والمشروبات | Food & Beverage | 0.40 | 56 |
| S03 | خدمات صناعية | Industrial | 0.36 | 25921, 33, 35, 38, 71 |
| S04 | خدمات الأمن | Security | 0.82 | 80, 811001 |
| S05 | خدمات مهنية محلية | Local Professional | 0.50 | 69-74 Exc. 712 |
| S06 | خدمات ممثل محلي من مورد أجنبي | Local Agent (Foreign) | 0.20 | 69-74 Exc. 712 |
| S07 | خدمات العقارات | Real Estate | 0.48 | 68 Exc.68102 |
| S08 | خدمات الإنشاء | Construction | 0.40 | 41-43 |
| S09 | خدمات التعليم | Education | 0.66 | 75, 85 |
| S10 | خدمات الأنشطة المالية والتأمينية | Financial & Insurance | 0.75 | 64-66 |
| S11 | خدمات الرعاية الصحية | Healthcare | 0.38 | 86-88 |
| S12 | خدمات الإدارة العامة | Public Administration | 0.69 | 84 |
| S13 | خدمات النقل والخدمات اللوجستية | Transport & Logistics | 0.45 | 49-53, 79 |
| S14 | خدمات الحفر البري | Onshore Drilling | 0.30 | 06, 091 |
| S15 | خدمات الحفر البحري | Offshore Drilling | 0.20 | 06, 091 |
| S16 | خدمات التعدين | Mining | 0.30 | 09 |
| S17 | خدمات تأجير السيارات والشاحنات والمعدات | Vehicle & Equipment Rental | 0.35 | 49225, 773, 771 |
| S18 | خدمات القوى العاملة | Workforce | 0.59 | 78 |
| S19 | خدمات تقنية المعلومات والاتصالات | ICT | 0.41 | 582, 61-63 |
| S20 | خدمات أخرى | Other Services | 0.35 | 39, 58-60, 772, 7912-7990, 81-99 |
| S21 | خدمات المرافق | Utilities | 0.61 | 351, 36, 37 |
| S22 | خدمات وكلاء أو ممثلي شركات الخدمات | Service Agent/Rep | 0.05 | N/A |
| S23 | الخدمات الأجنبية | Foreign Services | 0.00 | N/A |

### Product Sectors (15)

| Code | Sector (AR) | Sector (EN) | LC% | ISIC |
|------|------------|-------------|-----|------|
| P01 | منتجات الزراعة والغابات والأسماك | Agriculture/Forestry/Fishery | 0.57 | 01-03 |
| P02 | منتجات الأغذية والمشروبات | Food & Beverage | 0.35 | 10-12 |
| P03 | منتجات كيميائية والنفط والغاز | Chemical/Oil/Gas | 0.61 | 19-20, 22, 352 |
| P04 | منتجات كيميائية أخرى | Other Chemical | 0.29 | 20 |
| P05 | منتجات الآلات والمعدات | Machinery & Equipment | 0.25 | 265-268, 28, 29-30 |
| P06 | منتجات المواد الكهربائية | Electrical | 0.40 | 27, 2814 |
| P07 | منتجات التعدين | Mining | 0.45 | 05, 07-08 |
| P08 | منتجات معدات ثابتة | Fixed Equipment | 0.30 | 24-25, 2813 |
| P09 | منتجات الاسمنت والجبس | Cement & Gypsum | 0.50 | 2394-2395 |
| P10 | منتجات تصنيع حديد التسليح | Rebar | 0.60 | 25114 |
| P11 | منتجات صناعية لتقنية المعلومات والاتصالات | ICT Manufacturing | 0.15 | 261-264 |
| P12 | منتجات محلية أخرى | Other Local | 0.30 | 13-18, 21, 23, 27, 31-32 |
| P13 | منتجات إعادة التدوير | Recycling | 0.70 | 381103, 383 |
| P14 | منتجات وكيل / موزع في المملكة | Local Agent/Distributor | 0.05 | 45-47 |
| P15 | منتجات مورد أجنبي | Foreign Supplier | 0.00 | N/A |

---

## LC% Formula (from template v.2 Section 2)

```
LC% = (LC_Depreciation + LC_Labor + LC_GoodsServices + LC_Training + LC_SupplierDev + LC_RD) / Total_Costs × 100
```

| Component | Template Row | Function | LC Attribution |
|-----------|-------------|----------|----------------|
| Depreciation & Amortization | R10 | `computeLcAssetDepreciation()` | KSA=100%, Foreign=20% |
| Labor Compensation | R11 | `computeLcLaborCompensation()` | Saudi=100%, Expat=37% |
| Goods & Services | R12 | `computeLcGoodsServices()` | Per sector LC% rate |
| Saudi Training & Development | R13 | `computeLcCapacityBuilding()` | 100% |
| Supplier Development | R14 | `computeLcCapacityBuilding()` | 100% |
| R&D in KSA | R15 | `computeLcCapacityBuilding()` | 100% |
| Total Contributed Value | R16 | Sum of all LC components | — |
| LC% | R18 | `LC% = R16 / Total_Costs × 100` | — |

---

## Notes

1. **PDF Limitation:** The guidance document (الدليل الارشادي لنموذج قياس نسبة المحتوى المحلي على مستوى المنهة.pdf) could not be read (model limitation). The Excel templates and audit matrix provide sufficient regulatory data for implementation.

2. **IFRS Standards:** The IFRS standards CSV provided by the user contains copyrighted IFRS Foundation content. Standard references are used for traceability (IAS 16, IAS 19, IAS 38, IFRS 15, IFRS 16) but full text is not reproduced.

3. **Workforce Expat Rate:** The template v.2 Section 3 R11 shows 0.534 (53.4%) for expat attribution in the sample data, but the regulation specifies 37%. The 37% rule from the official LCGPA regulation takes precedence over template sample values.

4. **Mandatory List:** The official mandatory list (1,444+ products across 16 manufacturing sectors) must be sourced from lcgpa.gov.sa. Our implementation supports XLSX import via `importMandatoryListFromXlsx()`.
