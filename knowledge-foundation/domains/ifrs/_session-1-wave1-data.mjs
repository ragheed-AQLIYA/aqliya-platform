/**
 * Session 1 Wave 1 — governed rule extracts for priority IFRS/IAS standards.
 * validationStatus: pending-review — requires KNOWLEDGE_REVIEWER before production admission.
 */

export const WAVE1_STANDARDS = [
  {
    slug: "ifrs-15",
    standardCode: "IFRS 15",
    standardName: "Revenue from Contracts with Customers",
    sourceUrl: "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/",
    versionLabel: "IFRS 15:2024",
    issueDate: "2014-05-28",
    effectiveDate: "2018-01-01",
    assetId: "kf-accounting-a-ifrs-15",
    rules: [
      {
        ruleId: "ifrs15-r001",
        paragraphReference: "IFRS 15.9",
        ruleText:
          "An entity shall apply this Standard using the five-step model: identify the contract, identify performance obligations, determine transaction price, allocate transaction price, recognise revenue when performance obligations are satisfied.",
        topic: "five-step-model",
      },
      {
        ruleId: "ifrs15-r002",
        paragraphReference: "IFRS 15.31",
        ruleText:
          "An entity shall account for a contract with a customer only when specified criteria are met, including approval and identification of rights, payment terms, commercial substance, and probable collection of consideration.",
        topic: "contract-identification",
      },
      {
        ruleId: "ifrs15-r003",
        paragraphReference: "IFRS 15.35",
        ruleText:
          "At contract inception, an entity shall assess the goods or services promised and identify as performance obligations each distinct good or service or bundle of goods or services.",
        topic: "performance-obligations",
      },
      {
        ruleId: "ifrs15-r004",
        paragraphReference: "IFRS 15.38",
        ruleText:
          "A good or service is distinct if the customer can benefit from it on its own or with readily available resources and it is separately identifiable from other promises in the contract.",
        topic: "distinct-goods-services",
      },
      {
        ruleId: "ifrs15-r005",
        paragraphReference: "IFRS 15.46",
        ruleText:
          "An entity shall allocate the transaction price to each performance obligation in proportion to the stand-alone selling prices of the distinct goods or services underlying each performance obligation.",
        topic: "transaction-price-allocation",
      },
      {
        ruleId: "ifrs15-r006",
        paragraphReference: "IFRS 15.B3-B4",
        ruleText:
          "Revenue is recognised when (or as) the entity satisfies a performance obligation by transferring a promised good or service — over time if criteria in paragraph 35 are met, otherwise at a point in time.",
        topic: "revenue-recognition-timing",
      },
    ],
    guidance: [
      {
        guidanceId: "ifrs15-g001",
        paragraphReference: "IFRS 15.BC",
        title: "Principal vs agent considerations",
        text: "Implementation analysis should evaluate whether the entity controls the good or service before transfer when determining gross versus net presentation.",
        topic: "principal-agent",
      },
      {
        guidanceId: "ifrs15-g002",
        paragraphReference: "IFRS 15.IE",
        title: "Illustrative examples reference",
        text: "Refer to IFRS 15 Illustrative Examples for application patterns on licensing, warranties, and variable consideration constraints.",
        topic: "illustrative-examples",
      },
    ],
  },
  {
    slug: "ifrs-16",
    standardCode: "IFRS 16",
    standardName: "Leases",
    sourceUrl: "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/",
    versionLabel: "IFRS 16:2024",
    issueDate: "2016-01-13",
    effectiveDate: "2019-01-01",
    assetId: "kf-accounting-a-ifrs-16",
    rules: [
      {
        ruleId: "ifrs16-r001",
        paragraphReference: "IFRS 16.9",
        ruleText:
          "At the commencement date, a lessee shall recognise a right-of-use asset and a lease liability, except for leases accounted for under the short-term lease or low-value asset exemptions.",
        topic: "initial-recognition",
      },
      {
        ruleId: "ifrs16-r002",
        paragraphReference: "IFRS 16.22",
        ruleText:
          "A lessee shall measure the lease liability at the present value of lease payments that are not paid at the commencement date, discounted using the interest rate implicit in the lease or the lessee's incremental borrowing rate.",
        topic: "lease-liability-measurement",
      },
      {
        ruleId: "ifrs16-r003",
        paragraphReference: "IFRS 16.24",
        ruleText:
          "The right-of-use asset shall be measured at cost, comprising the initial lease liability amount, lease payments made at or before commencement, initial direct costs, and an estimate of dismantling costs.",
        topic: "rou-asset-measurement",
      },
      {
        ruleId: "ifrs16-r004",
        paragraphReference: "IFRS 16.29",
        ruleText:
          "After commencement, a lessee shall measure the lease liability by increasing the carrying amount to reflect interest and reducing it for lease payments made.",
        topic: "subsequent-lease-liability",
      },
      {
        ruleId: "ifrs16-r005",
        paragraphReference: "IFRS 16.31",
        ruleText:
          "A lessee shall depreciate the right-of-use asset and account for interest on the lease liability separately, unless applying the recognition exemption for short-term or low-value leases.",
        topic: "depreciation-interest",
      },
      {
        ruleId: "ifrs16-r006",
        paragraphReference: "IFRS 16.B37",
        ruleText:
          "A contract is (or contains) a lease if it conveys the right to control the use of an identified asset for a period of time in exchange for consideration.",
        topic: "lease-definition",
      },
    ],
    guidance: [
      {
        guidanceId: "ifrs16-g001",
        paragraphReference: "IFRS 16.B53",
        title: "Lease term assessment",
        text: "Assess whether extension and termination options are reasonably certain when determining lease term and related payments.",
        topic: "lease-term",
      },
    ],
  },
  {
    slug: "ifrs-9",
    standardCode: "IFRS 9",
    standardName: "Financial Instruments",
    sourceUrl: "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/",
    versionLabel: "IFRS 9:2024",
    issueDate: "2014-07-24",
    effectiveDate: "2018-01-01",
    assetId: "kf-accounting-a-ifrs-9",
    rules: [
      {
        ruleId: "ifrs9-r001",
        paragraphReference: "IFRS 9.4.1.1",
        ruleText:
          "An entity shall classify financial assets on initial recognition based on the entity's business model for managing the assets and the contractual cash flow characteristics of the asset.",
        topic: "classification",
      },
      {
        ruleId: "ifrs9-r002",
        paragraphReference: "IFRS 9.B4.1.7",
        ruleText:
          "Financial assets are measured at amortised cost only if held within a hold-to-collect business model and contractual terms give rise to cash flows that are solely payments of principal and interest (SPPI).",
        topic: "amortised-cost",
      },
      {
        ruleId: "ifrs9-r003",
        paragraphReference: "IFRS 9.5.1.1",
        ruleText:
          "An entity shall measure financial liabilities at amortised cost using the effective interest method, except for liabilities designated at fair value through profit or loss or arising from transfers that do not qualify for derecognition.",
        topic: "liability-measurement",
      },
      {
        ruleId: "ifrs9-r004",
        paragraphReference: "IFRS 9.5.5.1",
        ruleText:
          "An entity shall recognise a loss allowance for expected credit losses on financial assets measured at amortised cost, at fair value through other comprehensive income (debt), and certain loan commitments and financial guarantee contracts.",
        topic: "expected-credit-loss",
      },
      {
        ruleId: "ifrs9-r005",
        paragraphReference: "IFRS 9.5.5.17",
        ruleText:
          "At each reporting date, an entity shall measure expected credit losses at an amount equal to lifetime expected credit losses if credit risk has increased significantly since initial recognition; otherwise 12-month expected credit losses apply.",
        topic: "ecl-staging",
      },
      {
        ruleId: "ifrs9-r006",
        paragraphReference: "IFRS 9.6.1.1",
        ruleText:
          "Hedge accounting is permitted only if qualifying criteria are met, including formal designation and documentation at inception of the hedging relationship.",
        topic: "hedge-accounting",
      },
    ],
    guidance: [
      {
        guidanceId: "ifrs9-g001",
        paragraphReference: "IFRS 9.B5.5",
        title: "Simplified approach for trade receivables",
        text: "Entities may apply the simplified approach and recognise lifetime expected credit losses for trade receivables, contract assets, and lease receivables without tracking credit risk changes.",
        topic: "simplified-ecl",
      },
    ],
  },
  {
    slug: "ias-1",
    standardCode: "IAS 1",
    standardName: "Presentation of Financial Statements",
    sourceUrl: "https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/",
    versionLabel: "IAS 1:2024",
    issueDate: "2007-09-06",
    effectiveDate: "2009-01-01",
    assetId: "kf-accounting-a-ias-1",
    rules: [
      {
        ruleId: "ias1-r001",
        paragraphReference: "IAS 1.10",
        ruleText:
          "A complete set of financial statements comprises a statement of financial position, a statement of profit or loss and other comprehensive income, a statement of changes in equity, a statement of cash flows, and notes.",
        topic: "complete-set",
      },
      {
        ruleId: "ias1-r002",
        paragraphReference: "IAS 1.15",
        ruleText:
          "An entity shall prepare its financial statements on a going concern basis unless management intends to liquidate or cease trading or has no realistic alternative.",
        topic: "going-concern",
      },
      {
        ruleId: "ias1-r003",
        paragraphReference: "IAS 1.25",
        ruleText:
          "An entity shall not offset assets and liabilities or income and expenses unless offsetting is required or permitted by an IFRS Accounting Standard.",
        topic: "no-offsetting",
      },
      {
        ruleId: "ias1-r004",
        paragraphReference: "IAS 1.29",
        ruleText:
          "An entity shall present separately each material class of similar items and dissimilar items separately unless they are immaterial.",
        topic: "materiality-presentation",
      },
      {
        ruleId: "ias1-r005",
        paragraphReference: "IAS 1.54",
        ruleText:
          "An entity shall disclose in the notes information required by IFRS Standards and additional information necessary to achieve a fair presentation.",
        topic: "note-disclosure",
      },
      {
        ruleId: "ias1-r006",
        paragraphReference: "IAS 1.82A",
        ruleText:
          "An entity with material other comprehensive income items shall present a statement of profit or loss and a separate statement of comprehensive income, or a single statement with profit or loss section and OCI section.",
        topic: "oci-presentation",
      },
    ],
    guidance: [
      {
        guidanceId: "ias1-g001",
        paragraphReference: "IAS 1.IG",
        title: "Line item presentation by function or nature",
        text: "Choose presentation of expenses by function or by nature consistently; additional disclosure by nature is required if function format is used.",
        topic: "expense-classification",
      },
    ],
  },
  {
    slug: "ias-12",
    standardCode: "IAS 12",
    standardName: "Income Taxes",
    sourceUrl: "https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/",
    versionLabel: "IAS 12:2024",
    issueDate: "1996-10-01",
    effectiveDate: "1998-01-01",
    assetId: "kf-accounting-a-ias-12",
    rules: [
      {
        ruleId: "ias12-r001",
        paragraphReference: "IAS 12.15",
        ruleText:
          "An entity shall recognise a current tax liability for tax payable on taxable profit for current and prior periods to the extent unpaid.",
        topic: "current-tax-liability",
      },
      {
        ruleId: "ias12-r002",
        paragraphReference: "IAS 12.24",
        ruleText:
          "An entity shall recognise a deferred tax liability for all taxable temporary differences, except for the initial recognition exemption for certain assets and liabilities in a transaction that is not a business combination.",
        topic: "deferred-tax-liability",
      },
      {
        ruleId: "ias12-r003",
        paragraphReference: "IAS 12.34",
        ruleText:
          "An entity shall recognise a deferred tax asset for deductible temporary differences, unused tax losses and unused tax credits to the extent that it is probable that taxable profit will be available.",
        topic: "deferred-tax-asset",
      },
      {
        ruleId: "ias12-r004",
        paragraphReference: "IAS 12.46",
        ruleText:
          "Current and deferred tax shall be recognised in profit or loss except when the tax arises from items recognised in other comprehensive income or directly in equity.",
        topic: "tax-expense-recognition",
      },
      {
        ruleId: "ias12-r005",
        paragraphReference: "IAS 12.51",
        ruleText:
          "Deferred tax assets and liabilities shall be measured at the tax rates expected to apply in the period when the asset is realised or liability settled, based on enacted or substantively enacted rates.",
        topic: "tax-rate-measurement",
      },
      {
        ruleId: "ias12-r006",
        paragraphReference: "IAS 12.74",
        ruleText:
          "An entity shall offset current tax assets and liabilities only when it has a legally enforceable right to offset and intends to settle on a net basis or realise asset and settle liability simultaneously.",
        topic: "tax-offsetting",
      },
    ],
    guidance: [
      {
        guidanceId: "ias12-g001",
        paragraphReference: "IAS 12.29",
        title: "Recoverability of deferred tax assets",
        text: "Review probability of future taxable profits supporting deferred tax assets at each reporting date; adjust valuation allowance when evidence changes.",
        topic: "dta-recoverability",
      },
    ],
  },
  {
    slug: "ifrs-for-smes",
    standardCode: "IFRS for SMEs",
    standardName: "IFRS for SMEs Accounting Standard",
    sourceUrl: "https://www.ifrs.org/issued-standards/ifrs-for-smes/",
    versionLabel: "IFRS for SMEs:2024",
    issueDate: "2009-07-09",
    effectiveDate: "2010-01-01",
    assetId: "kf-accounting-a-ifrs-smes",
    rules: [
      {
        ruleId: "smes-r001",
        paragraphReference: "Section 1.2",
        ruleText:
          "This Standard is intended for general purpose financial statements of entities that do not have public accountability and publish general purpose financial statements for external users.",
        topic: "scope",
      },
      {
        ruleId: "smes-r002",
        paragraphReference: "Section 3.4",
        ruleText:
          "Financial statements shall present fairly the financial position, performance and cash flows of the entity through application of the principles in this Standard.",
        topic: "fair-presentation",
      },
      {
        ruleId: "smes-r003",
        paragraphReference: "Section 23.2",
        ruleText:
          "An entity shall recognise revenue from the sale of goods when the significant risks and rewards of ownership transfer, the entity retains no effective control, amount can be measured reliably, and economic benefits are probable.",
        topic: "revenue-goods",
      },
      {
        ruleId: "smes-r004",
        paragraphReference: "Section 17.9",
        ruleText:
          "Property, plant and equipment shall be measured at cost less accumulated depreciation and impairment unless the revaluation model is applied to an entire class of assets.",
        topic: "ppe-measurement",
      },
      {
        ruleId: "smes-r005",
        paragraphReference: "Section 29.1",
        ruleText:
          "Income tax expense comprises current tax and deferred tax based on temporary differences between carrying amounts and tax bases using enacted tax rates.",
        topic: "income-tax-smes",
      },
      {
        ruleId: "smes-r006",
        paragraphReference: "Section 5.2",
        ruleText:
          "An entity shall use a presentation format consistent with prior periods unless a change results in more reliable and relevant information.",
        topic: "consistency",
      },
    ],
    guidance: [
      {
        guidanceId: "smes-g001",
        paragraphReference: "Preface",
        title: "Differences from full IFRS",
        text: "IFRS for SMEs simplifies recognition and measurement relative to full IFRS; map AuditOS engagements configured for SMEs to Section-based requirements before applying full IFRS 15/16/9 rules.",
        topic: "ifrs-mapping",
      },
      {
        guidanceId: "smes-g002",
        paragraphReference: "Section 33",
        title: "Related party disclosures",
        text: "SMEs require related party disclosures when control, joint control, or significant influence exists — align with AuditOS engagement related party workflows.",
        topic: "related-parties",
      },
    ],
  },
];
