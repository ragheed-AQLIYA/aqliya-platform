# Accounting Policies Library

## Purpose

This document defines the accounting policies library used by AuditOS to generate draft accounting policy notes. Policies are mapped to the engagement's accounting standard and entity type.

## Policy Template Structure

Each accounting policy note includes:

```txt
1. Policy title
2. Applicable standard reference (IFRS, SOCPA, etc.)
3. Policy statement (draft template)
4. Entity-specific options (select or customize)
5. Reviewer confirmation required
```

## Standard Policies

### 1. Basis of Preparation

```txt
Policy: The financial statements have been prepared in accordance with
[International Financial Reporting Standards / SOCPA / IFRS for SMEs]
and the applicable requirements of the [Regulatory Body / Company Law].

Options:
  - IFRS
  - SOCPA
  - IFRS for SMEs
  - Local GAAP

Reviewer: Confirm standard, check for any regulatory departures.
```

### 2. Basis of Measurement

```txt
Policy: The financial statements are prepared under the historical cost
convention, except for [financial instruments at fair value / investment
property / biological assets] which are measured at fair value.

Options:
  - Historical cost
  - Historical cost with revaluation for certain assets
  - Fair value for financial instruments

Reviewer: Confirm measurement basis appropriate for entity.
```

### 3. Functional and Presentation Currency

```txt
Policy: These financial statements are presented in [SAR / USD / other],
which is the entity's functional currency. All amounts are rounded to the
[nearest thousand / nearest whole unit].

Options:
  - SAR
  - USD
  - Other (specify)

Reviewer: Confirm currency and rounding.
```

### 4. Revenue Recognition

```txt
Policy: Revenue is recognized when control of goods or services is
transferred to the customer at an amount that reflects the consideration
to which the entity expects to be entitled. Revenue is measured at the
fair value of consideration received or receivable.

Applicable Standard: IFRS 15 / SOCPA

Reviewer: Confirm revenue recognition method appropriate for entity's
operations. Specify if revenue is recognized over time or at a point
in time.
```

### 5. Property, Plant and Equipment

```txt
Policy: Property, plant and equipment are stated at cost less accumulated
depreciation and accumulated impairment losses. Depreciation is calculated
on a straight-line basis over the estimated useful lives of the assets.

Useful Life Estimates:
  - Buildings:            20-40 years
  - Plant and Machinery:  10-20 years
  - Furniture and Fixtures:  5-10 years
  - Computer Equipment:    3-5 years
  - Motor Vehicles:        5-10 years

Reviewer: Confirm useful lives, residual values, and depreciation method.
```

### 6. Financial Instruments

```txt
Policy: Financial assets are classified as subsequently measured at
amortized cost, fair value through other comprehensive income, or fair
value through profit or loss based on the business model and contractual
cash flow characteristics.

Applicable Standard: IFRS 9 / SOCPA

Reviewer: Confirm classification and measurement categories appropriate.
```

### 7. Trade Receivables and Expected Credit Losses

```txt
Policy: Trade receivables are stated at amortized cost less expected
credit losses. The entity applies the simplified approach to measuring
expected credit losses, using a lifetime expected loss allowance based
on historical experience and forward-looking information.

Applicable Standard: IFRS 9

Reviewer: Confirm ECL methodology and impairment assumptions.
```

### 8. Inventory

```txt
Policy: Inventory is stated at the lower of cost and net realizable value.
Cost is determined using the [weighted average / FIFO] method.

Options:
  - Weighted average cost
  - FIFO
  - Specific identification

Reviewer: Confirm costing method and NRV assessment.
```

### 9. Provisions

```txt
Policy: Provisions are recognized when the entity has a present obligation
as a result of a past event, it is probable that an outflow of resources
will be required, and a reliable estimate can be made.

Applicable Standard: IAS 37 / SOCPA

Reviewer: Confirm provisions and contingencies appropriately identified.
```

### 10. Zakat and Tax

```txt
Policy: Zakat is provided for in accordance with [Saudi Zakat and Tax
regulations / applicable jurisdiction]. Corporate income tax is accounted
for using the liability method.

Reviewer: Confirm zakat base calculation, tax rate, and any exemptions.
```

### 11. Related Party Transactions

```txt
Policy: Related party transactions are disclosed in accordance with
IAS 24 / applicable SOCPA requirements. A related party is a person or
entity that is related to the reporting entity as defined in the standard.

Reviewer: Confirm related party identification and disclosure completeness.
```

## Policy Selection Workflow

```txt
1. System selects policies based on:
   - Accounting standard (IFRS, SOCPA, etc.)
   - Entity type (corporation, LLC, etc.)
   - Industry classification
   - Account types present
2. System generates draft policy note with selected policy templates
3. Reviewer reviews and customizes:
   - Confirm policy selection
   - Adjust entity-specific options
   - Add entity-specific policies
4. Reviewed policies are included in the notes package
```
