# AQLIYA Engineering Weekly Report

**Generated:** 2026-07-11T02:08:07.569Z  
**Repository:** AQLIYA  
**Authority:** Engineering Excellence (findings) · OpenCode (implementation)

## Executive Summary

- Overall Repository Health: **74/100**
- Engineering Maturity: **80/100**
- Gates: 3 PASS · 3 WARNING · 2 FAIL
- Overall delta vs prior run: **+0**

## Repository Health

| Dimension | Score |
| --------- | ----- |
| Security | 65 |
| Performance | 57 |
| Code Quality | 32 |
| Architecture | 73 |
| Documentation | 95 |
| Tests | 95 |
| Technical Debt | 58 |
| Dependencies | 93 |

## New Risks

- **[high]** F-0295: Possible secret material (generic-secret)
- **[high]** F-0296: Dangerous API usage: eval
- **[high]** F-0298: Possible secret material (generic-secret)
- **[critical]** F-0819: Client module imports Prisma
- **[critical]** F-0821: Client module imports Prisma


## Resolved Risks

- F-1307
- F-1308
- F-1309
- F-1310
- F-1311
- F-1312
- F-1313
- F-1314
- F-1315
- F-1316
- F-1317
- F-1318
- F-1319
- F-1320
- F-1321
- F-1322
- F-1323
- F-1324
- F-1325
- F-1326
- F-1327
- F-1328
- F-1329
- F-1330
- F-1331
- F-1332
- F-1333
- F-1334
- F-1335
- F-1336
- F-1337
- F-1338
- F-1339
- F-1340
- F-1341
- F-1342
- F-1343
- F-1344
- F-1345
- F-1346
- F-1347
- F-1348
- F-1349
- F-1350
- F-1351
- F-1352
- F-1353
- F-1354
- F-1355
- F-1356
- F-1357
- F-1358
- F-1359
- F-1360
- F-1361
- F-1362
- F-1363
- F-1364
- F-1365
- F-1366
- F-1367
- F-1368
- F-1369
- F-1370
- F-1835
- F-1836
- F-1837
- F-1838
- F-1839
- F-1729
- F-1730
- F-1731
- F-1732
- F-1733
- F-1734
- F-1735
- F-1736
- F-1737
- F-1738
- F-1739
- F-1740
- F-1741
- F-1742
- F-1743
- F-1744
- F-1745
- F-1746
- F-1747
- F-1748
- F-1749
- F-1750
- F-1751
- F-1752
- F-1753
- F-1754
- F-1755
- F-1756
- F-1757
- F-1758
- F-1759
- F-1760
- F-1761
- F-1762
- F-1763
- F-1764
- F-1765
- F-1766
- F-1767
- F-1768
- F-1769
- F-1770
- F-1771
- F-1772
- F-1773
- F-1774
- F-1775
- F-1776
- F-1777
- F-1778
- F-1779
- F-1780
- F-1781
- F-1782
- F-1783
- F-1784
- F-1785
- F-1786
- F-1787
- F-1788
- F-1789
- F-1790
- F-1791
- F-1792
- F-1793
- F-1794
- F-1795
- F-1796
- F-1797
- F-1798
- F-1799
- F-1800
- F-1801
- F-1802
- F-1803
- F-1804
- F-1805
- F-1806
- F-1807
- F-1808
- F-1809
- F-1810
- F-1811
- F-1812
- F-1813
- F-1814
- F-1815
- F-1816
- F-1817
- F-1818
- F-1819
- F-1820
- F-1821
- F-1822
- F-1823
- F-1824
- F-1825
- F-1826
- F-1827
- F-1828
- F-1829
- F-1830
- F-1831
- F-1832
- F-1833
- F-1834

## Top Refactors

- F-0778: Debt hotspot (priority 238): index.ts (`src/lib/audit/db/index.ts`)
- F-0779: Debt hotspot (priority 160): decisions.ts (`src/actions/decisions.ts`)
- F-0780: Debt hotspot (priority 143): ai-advisor.ts (`src/lib/local-content/workbook/ai-advisor.ts`)
- F-0781: Debt hotspot (priority 143): services.ts (`src/lib/audit/services.ts`)
- F-0782: Debt hotspot (priority 137): client-acceptance-engine.ts (`src/lib/audit/client-acceptance-engine.ts`)

## Top Security Findings

- **high** Possible secret material (generic-secret) — Pattern generic-secret matched
- **high** Dangerous API usage: eval — Matched eval
- **high** Possible secret material (generic-secret) — Pattern generic-secret matched
- **high** Possible secret material (generic-secret) — Pattern generic-secret matched
- **high** Possible secret material (generic-secret) — Pattern generic-secret matched

## Performance Findings

- **high** Possible Prisma N+1 query pattern
- **high** Possible Prisma N+1 query pattern
- **high** Possible Prisma N+1 query pattern
- **high** Possible Prisma N+1 query pattern
- **high** Possible Prisma N+1 query pattern

## Coverage Delta

n/a (coverage artifact optional)

## Technical Debt Delta

Debt score delta: **+0** (higher score = healthier / less debt pressure in our inverted health metric).

## Recommended OpenCode Focus

1. Address FAIL quality gates first.
2. Review `engineering/refactors/INDEX.md` for evidence-backed suggestions.
3. Do not redesign products — fix boundaries, tests, and security gaps.

---

_Also written to repo root ENGINEERING_WEEKLY_REPORT.md_
