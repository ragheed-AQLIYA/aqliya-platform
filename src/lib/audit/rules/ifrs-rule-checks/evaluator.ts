import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import { searchRagCitations } from "./rag-citation";
import type { IfrsEvaluationContext } from "./common";
import { baseEval } from "./common";
import { handleCompleteSet } from "./complete-set";
import { handleGoingConcern } from "./going-concern";
import { handleNoOffsetting } from "./no-offsetting";
import { handleMaterialityPresentation } from "./materiality";
import { handleNoteDisclosure } from "./note-disclosure";
import { handleOciPresentation } from "./oci-presentation";
import {
  handleInventoryMeasurement,
  handleCostComponents,
  handleSpecificIdentification,
  handleCostFormulas,
} from "./inventories";
import {
  handleCurrentTaxLiability,
  handleDeferredTaxLiability,
  handleDeferredTaxAsset,
  handleTaxExpenseRecognition,
  handleTaxRateMeasurement,
  handleTaxOffsetting,
} from "./income-taxes";
import {
  handleIndicatorAssessment,
  handleRecoverableAmount,
  handleImpairmentLoss,
  handleReversal,
} from "./impairment";
import {
  handleAcquisitionMethod,
  handleIdentifyAcquirer,
  handleFairValue as handleBusinessComboFairValue,
  handleGoodwill,
} from "./business-combinations";
import {
  handleFairValueDefinition,
  handleValuationTechniques,
  handleFairValueHierarchy,
  handleFairValueDisclosure,
} from "./fair-value";
import {
  handleFunctionalCurrency,
  handleTransactionRate,
  handleReportingRate,
  handleExchangeDifferences,
  handleFxDisclosure,
} from "./foreign-exchange";
import {
  handleRpDisclosure,
  handleKmpCompensation,
  handleRpTransactions,
  handleArmLength,
} from "./related-party";
import {
  handleIpDefinition,
  handleIpMeasurement,
  handleIpFairValue,
  handleIpDisclosure,
} from "./investment-property";
import {
  handleBasicEps,
  handleDilutedEps,
  handleEpsReconciliation,
  handleEpsShareReconciliation,
} from "./earnings-per-share";
import {
  handleSeparateFsMeasurement,
  handleSeparateFsConsistency,
  handleSeparateFsDisclosure,
  handleSeparateFsJudgements,
} from "./separate-financial-statements";
import {
  handleGrantRecognition,
  handleGrantCompensation,
  handleGrantPresentation,
  handleGrantDisclosure,
} from "./government-grants";
import {
  handleEquityMethodApplication,
  handleEquityMethodInitialRecognition,
  handleEquityMethodCessation,
  handleEquityMethodDisclosure,
} from "./investments-associates";
import {
  handleIncomeExpenseCategorisation,
  handleOperatingExpenseClassification,
  handleMpmDisclosure,
  handleExpenseDisaggregation,
} from "./presentation-disclosure";
import {
  handleAdjustingEvents,
  handleNonAdjustingEvents,
  handleDividends,
} from "./events-after-reporting";
import {
  handleAmortisedCost,
  handleLiabilityMeasurement,
  handleExpectedCreditLoss,
  handleEclStaging,
  handleHedgeAccounting,
} from "./financial-instruments";
import {
  handleEquityInstrument,
  handleFinancialLiability,
  handleTreasuryShares,
} from "./financial-instruments-presentation";
import {
  handleIntangibleRecognition,
  handleExpenseVsCapitalise,
  handleIntangibleAmortisation,
} from "./intangible-assets";
import {
  handleLeases,
  handleSubsequentLeaseLiability,
  handleDepreciationInterest,
} from "./leases";
import {
  handlePpeRecognition,
  handleDepreciation,
  handleDerecognition,
} from "./ppe";
import {
  handleCashFlow,
  handleInvestingActivities,
  handleFinancingActivities,
} from "./cash-flow";
import {
  handleRevenue,
  handlePerformanceObligations,
  handleDistinctGoodsServices,
  handleTransactionPriceAllocation,
  handleRevenueRecognitionTiming,
} from "./revenue";
import {
  handleInterimPeriodMeasurement,
  handleInterimDisclosure,
  handleInterimTaxReconciliation,
  handleInterimImpairmentAssessment,
} from "./interim-reporting";
import {
  handleExplorationEvaluationMeasurement,
  handleExplorationEvaluationClassification,
  handleExplorationEvaluationImpairment,
  handleExplorationEvaluationDisclosure,
} from "./exploration-evaluation";
import {
  handleBiologicalAssetRecognition,
  handleBiologicalAssetMeasurement,
  handleAgriculturalProduceMeasurement,
  handleAgriculturalDisclosure,
} from "./agriculture";
import {
  handleSubsidiaryScopeElection,
  handleSubsidiaryElectionDisclosure,
  handleSubsidiaryEligibilityAssessment,
  handleSubsidiaryEffectiveDate,
} from "./subsidiary-disclosures";
import {
  handleInsuranceLiabilityRecognition,
  handleInsuranceLiabilityAdequacyTest,
  handleInsuranceLiabilityDerecognition,
  handleInsuranceDisclosure,
} from "./insurance-contracts";
import {
  handleRegulatoryDeferralClassification,
  handleRegulatoryDeferralPresentation,
  handleRegulatoryDeferralCashFlow,
  handleRegulatoryDeferralDisclosure,
} from "./regulatory-deferral";
import {
  handleRetirementPlanAssetMeasurement,
  handleRetirementPlanObligationMeasurement,
  handleRetirementPlanContributionRecognition,
  handleRetirementPlanDisclosure,
} from "./retirement-benefit-plans";
import {
  handleHyperinflationRestatement,
  handleHyperinflationComparativeRestatement,
  handleHyperinflationNonMonetaryItems,
  handleHyperinflationDisclosure,
} from "./hyperinflation";
import {
  handleEmployeeBenefitScope,
  handleShortTermBenefits,
  handleDefinedBenefit,
  handlePucMethod,
} from "./employee-benefits";
import {
  handleBorrowingCostCapitalisation,
  handleEligibleBorrowingCosts,
  handleCapitalisationCommencement,
  handleCapitalisationCessation,
} from "./borrowing-costs";
import {
  handleProvisionDefinition,
  handleProvisionRecognition,
  handleProvisionMeasurement,
  handleContingentLiability,
} from "./provisions";
import {
  handlePolicySelection,
  handlePolicyChange,
  handleEstimateChange,
  handleErrorCorrection,
} from "./accounting-policies";
import {
  handleSharePaymentScope,
  handleEquitySettled,
  handleCashSettled,
  handleVestingPeriod,
} from "./share-based-payment";
import {
  handleHeldForSale,
  handleHeldForSaleMeasurement,
  handleDiscontinuedOperations,
  handleNoDepreciation,
} from "./held-for-sale";
import {
  handleSignificanceDisclosure,
  handleCarryingAmounts,
  handleRiskDisclosure,
  handleEclDisclosure,
} from "./financial-instruments-disclosure";
import {
  handleCodmBasis,
  handleSegmentDefinition,
  handleSegmentMeasures,
  handleSegmentReconciliation,
} from "./operating-segments";
import {
  handleConsolidationRequirement,
  handleControlDefinition,
  handleConsolidationProcedure,
  handleUniformPolicies,
} from "./consolidated-financial-statements";
import {
  handleJointArrangement,
  handleJointOperation,
  handleJointVenture,
  handleJointEquityMethod,
} from "./joint-arrangements";
import {
  handleDisclosureScope,
  handleSubsidiaryDisclosure,
  handleJointAssociateDisclosure,
  handleStructuredEntities,
} from "./disclosure-of-interests";
import {
  handleFirstIfrsScope,
  handleFirstIfrsStatements,
  handleOpeningStatement,
  handleRetrospectiveApplication,
} from "./first-time-adoption";
import {
  handleInsuranceContractScope,
  handleGeneralModel,
  handleInsuranceRecognition,
  handleRevenueSeparation,
} from "./insurance-contracts-ifrs17";
import {
  handleInterimImpairment as handleIfric10InterimImpairment,
  handleIas36Link,
  handleTestingConsistency,
  handleIfric10Scope,
} from "./interim-impairment-ifric";
import {
  handleServiceConcessionScope,
  handleFinancialVsIntangible,
  handleOperationServices,
  handleMaintenanceObligation,
} from "./service-concessions";
import {
  handleDebtRestructuringScope,
  handleDebtMeasurement,
  handleFallbackMeasurement,
  handleDebtGainLoss,
} from "./debt-restructuring";
import {
  handleUncertaintyScope,
  handleUnitOfAccount,
  handleExaminationAssumption,
  handleReflectUncertainty,
} from "./uncertainty-over-income-taxes";
import {
  handleSmesScope,
  handleSmesFairPresentation,
  handleSmesRevenueGoods,
  handleSmesPpeMeasurement,
  handleSmesIncomeTax,
  handleSmesConsistency,
} from "./ifrs-for-smes";

export function evaluateIfrsRule(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  switch (rule.topic) {
    case "complete-set":
      return handleCompleteSet(rule, ctx);

    case "going-concern":
      return handleGoingConcern(rule, ctx);

    case "no-offsetting":
      return handleNoOffsetting(rule, ctx);

    case "materiality-presentation":
      return handleMaterialityPresentation(rule, ctx);

    case "note-disclosure":
      return handleNoteDisclosure(rule, ctx);

    case "oci-presentation":
      return handleOciPresentation(rule, ctx);

    case "five-step-model":
    case "contract-identification":
      return handleRevenue(rule, ctx);

    case "definition":
    case "initial-measurement":
      return handlePpeRecognition(rule, ctx);

    case "depreciation":
      return handleDepreciation(rule, ctx);

    case "initial-recognition":
    case "lease-liability-measurement":
    case "rou-asset-measurement":
    case "lease-definition":
      return handleLeases(rule, ctx);

    case "classification":
    case "operating-method":
      return handleCashFlow(rule, ctx);

    // IAS 2 / IAS 37 / IFRS 5 / IFRIC 19 — "measurement" is shared across standards
    case "measurement": {
      const mid = rule.ruleId.toLowerCase();
      if (mid.startsWith("ias-37")) return handleProvisionMeasurement(rule, ctx);
      if (mid.startsWith("ifrs-5")) return handleHeldForSaleMeasurement(rule, ctx);
      if (mid.startsWith("ifric-19")) return handleDebtMeasurement(rule, ctx);
      return handleInventoryMeasurement(rule, ctx);
    }
    case "cost-components":
      return handleCostComponents(rule, ctx);
    case "specific-identification":
      return handleSpecificIdentification(rule, ctx);
    case "cost-formulas":
      return handleCostFormulas(rule, ctx);

    // IAS 12 — Income Taxes
    case "current-tax-liability":
      return handleCurrentTaxLiability(rule, ctx);
    case "deferred-tax-liability":
      return handleDeferredTaxLiability(rule, ctx);
    case "deferred-tax-asset":
      return handleDeferredTaxAsset(rule, ctx);
    case "tax-expense-recognition":
      return handleTaxExpenseRecognition(rule, ctx);
    case "tax-rate-measurement":
      return handleTaxRateMeasurement(rule, ctx);
    case "tax-offsetting":
      return handleTaxOffsetting(rule, ctx);

    // IAS 36 — Impairment of Assets
    case "indicator-assessment":
      return handleIndicatorAssessment(rule, ctx);
    case "recoverable-amount":
      return handleRecoverableAmount(rule, ctx);
    case "impairment-loss":
      return handleImpairmentLoss(rule, ctx);
    case "reversal":
      return handleReversal(rule, ctx);

    // IFRS 3 — Business Combinations
    case "acquisition-method":
      return handleAcquisitionMethod(rule, ctx);
    case "identify-acquirer":
      return handleIdentifyAcquirer(rule, ctx);
    case "fair-value":
      return handleBusinessComboFairValue(rule, ctx);
    case "goodwill":
      return handleGoodwill(rule, ctx);

    // IFRS 13 — Fair Value Measurement
    case "fair-value-definition":
      return handleFairValueDefinition(rule, ctx);
    case "valuation-techniques":
      return handleValuationTechniques(rule, ctx);
    case "fair-value-hierarchy":
      return handleFairValueHierarchy(rule, ctx);
    case "disclosure":
      return handleFairValueDisclosure(rule, ctx);

    // IAS 21 — The Effects of Changes in Foreign Exchange Rates
    case "functional-currency":
      return handleFunctionalCurrency(rule, ctx);
    case "transaction-rate":
      return handleTransactionRate(rule, ctx);
    case "reporting-rate":
      return handleReportingRate(rule, ctx);
    case "exchange-differences":
      return handleExchangeDifferences(rule, ctx);
    case "fx-disclosure":
      return handleFxDisclosure(rule, ctx);

    // IAS 24 — Related Party Disclosures
    case "rp-disclosure":
      return handleRpDisclosure(rule, ctx);
    case "kmp-compensation":
      return handleKmpCompensation(rule, ctx);
    case "rp-transactions":
      return handleRpTransactions(rule, ctx);
    case "arm-length":
      return handleArmLength(rule, ctx);

    // IAS 40 — Investment Property
    case "ip-definition":
      return handleIpDefinition(rule, ctx);
    case "ip-measurement":
      return handleIpMeasurement(rule, ctx);
    case "ip-fair-value":
      return handleIpFairValue(rule, ctx);
    case "ip-disclosure":
      return handleIpDisclosure(rule, ctx);

    // IAS 33 — Earnings per Share
    case "basic-eps":
      return handleBasicEps(rule, ctx);
    case "diluted-eps":
      return handleDilutedEps(rule, ctx);
    case "eps-reconciliation":
      return handleEpsReconciliation(rule, ctx);
    case "eps-share-reconciliation":
      return handleEpsShareReconciliation(rule, ctx);

    // IAS 27 — Separate Financial Statements
    case "separate-fs-measurement":
      return handleSeparateFsMeasurement(rule, ctx);
    case "separate-fs-consistency":
      return handleSeparateFsConsistency(rule, ctx);
    case "separate-fs-disclosure":
      return handleSeparateFsDisclosure(rule, ctx);
    case "separate-fs-judgements":
      return handleSeparateFsJudgements(rule, ctx);

    // IAS 20 — Government Grants
    case "grant-recognition":
      return handleGrantRecognition(rule, ctx);
    case "grant-compensation":
      return handleGrantCompensation(rule, ctx);
    case "grant-presentation":
      return handleGrantPresentation(rule, ctx);
    case "grant-disclosure":
      return handleGrantDisclosure(rule, ctx);

    // IAS 28 — Investments in Associates and Joint Ventures
    case "equity-method-application":
      return handleEquityMethodApplication(rule, ctx);
    case "equity-method-initial-recognition":
      return handleEquityMethodInitialRecognition(rule, ctx);
    case "equity-method-cessation":
      return handleEquityMethodCessation(rule, ctx);
    case "equity-method-disclosure":
      return handleEquityMethodDisclosure(rule, ctx);

    // IFRS 18 — Presentation and Disclosure in Financial Statements
    case "income-expense-categorisation":
      return handleIncomeExpenseCategorisation(rule, ctx);
    case "operating-expense-classification":
      return handleOperatingExpenseClassification(rule, ctx);
    case "mpm-disclosure":
      return handleMpmDisclosure(rule, ctx);
    case "expense-disaggregation":
      return handleExpenseDisaggregation(rule, ctx);

    // IAS 10 — Events After the Reporting Period
    case "adjusting-events":
      return handleAdjustingEvents(rule, ctx);
    case "non-adjusting-events":
      return handleNonAdjustingEvents(rule, ctx);
    case "dividends":
      return handleDividends(rule, ctx);

    // IFRS 9 — Financial Instruments
    case "amortised-cost":
      return handleAmortisedCost(rule, ctx);
    case "liability-measurement":
      return handleLiabilityMeasurement(rule, ctx);
    case "expected-credit-loss":
      return handleExpectedCreditLoss(rule, ctx);
    case "ecl-staging":
      return handleEclStaging(rule, ctx);
    case "hedge-accounting":
      return handleHedgeAccounting(rule, ctx);

    // IAS 32 — Financial Instruments Presentation
    case "equity-instrument":
      return handleEquityInstrument(rule, ctx);
    case "financial-liability":
      return handleFinancialLiability(rule, ctx);
    case "treasury-shares":
      return handleTreasuryShares(rule, ctx);

    // IAS 38 / IAS 37 / IFRS 17 — "recognition" is shared across standards
    case "recognition": {
      const rid = rule.ruleId.toLowerCase();
      if (rid.startsWith("ias-37")) return handleProvisionRecognition(rule, ctx);
      if (rid.startsWith("ifrs-17")) return handleInsuranceRecognition(rule, ctx);
      return handleIntangibleRecognition(rule, ctx);
    }
    case "expense-vs-capitalise":
      return handleExpenseVsCapitalise(rule, ctx);
    case "amortisation":
      return handleIntangibleAmortisation(rule, ctx);

    // IFRS 16 — Leases (remaining topics)
    case "subsequent-lease-liability":
      return handleSubsequentLeaseLiability(rule, ctx);
    case "depreciation-interest":
      return handleDepreciationInterest(rule, ctx);

    // IAS 16 — PPE (remaining topic)
    case "derecognition":
      return handleDerecognition(rule, ctx);

    // IAS 7 — Cash Flows (remaining topics)
    case "investing":
      return handleInvestingActivities(rule, ctx);
    case "financing":
      return handleFinancingActivities(rule, ctx);

    // IFRS 15 — Revenue (remaining topics)
    case "performance-obligations":
      return handlePerformanceObligations(rule, ctx);
    case "distinct-goods-services":
      return handleDistinctGoodsServices(rule, ctx);
    case "transaction-price-allocation":
      return handleTransactionPriceAllocation(rule, ctx);
    case "revenue-recognition-timing":
      return handleRevenueRecognitionTiming(rule, ctx);

    // IAS 34 — Interim Financial Reporting
    case "interim-period-measurement":
      return handleInterimPeriodMeasurement(rule, ctx);
    case "interim-disclosure":
      return handleInterimDisclosure(rule, ctx);
    case "interim-tax-reconciliation":
      return handleInterimTaxReconciliation(rule, ctx);
    case "interim-impairment-assessment":
      return handleInterimImpairmentAssessment(rule, ctx);

    // IFRS 6 — Exploration for and Evaluation of Mineral Resources
    case "exploration-evaluation-measurement":
      return handleExplorationEvaluationMeasurement(rule, ctx);
    case "exploration-evaluation-classification":
      return handleExplorationEvaluationClassification(rule, ctx);
    case "exploration-evaluation-impairment":
      return handleExplorationEvaluationImpairment(rule, ctx);
    case "exploration-evaluation-disclosure":
      return handleExplorationEvaluationDisclosure(rule, ctx);

    // IAS 41 — Agriculture
    case "biological-asset-recognition":
      return handleBiologicalAssetRecognition(rule, ctx);
    case "biological-asset-measurement":
      return handleBiologicalAssetMeasurement(rule, ctx);
    case "agricultural-produce-measurement":
      return handleAgriculturalProduceMeasurement(rule, ctx);
    case "agricultural-disclosure":
      return handleAgriculturalDisclosure(rule, ctx);

    // IFRS 19 — Subsidiaries without Public Accountability: Disclosures
    case "subsidiary-scope-election":
      return handleSubsidiaryScopeElection(rule, ctx);
    case "subsidiary-election-disclosure":
      return handleSubsidiaryElectionDisclosure(rule, ctx);
    case "subsidiary-eligibility-assessment":
      return handleSubsidiaryEligibilityAssessment(rule, ctx);
    case "subsidiary-effective-date":
      return handleSubsidiaryEffectiveDate(rule, ctx);

    // IFRS 4 — Insurance Contracts (Phase I)
    case "insurance-liability-recognition":
      return handleInsuranceLiabilityRecognition(rule, ctx);
    case "insurance-liability-adequacy-test":
      return handleInsuranceLiabilityAdequacyTest(rule, ctx);
    case "insurance-liability-derecognition":
      return handleInsuranceLiabilityDerecognition(rule, ctx);
    case "insurance-disclosure":
      return handleInsuranceDisclosure(rule, ctx);

    // IFRS 14 — Regulatory Deferral Accounts
    case "regulatory-deferral-classification":
      return handleRegulatoryDeferralClassification(rule, ctx);
    case "regulatory-deferral-presentation":
      return handleRegulatoryDeferralPresentation(rule, ctx);
    case "regulatory-deferral-cash-flow":
      return handleRegulatoryDeferralCashFlow(rule, ctx);
    case "regulatory-deferral-disclosure":
      return handleRegulatoryDeferralDisclosure(rule, ctx);

    // IAS 26 — Accounting and Reporting by Retirement Benefit Plans
    case "retirement-plan-asset-measurement":
      return handleRetirementPlanAssetMeasurement(rule, ctx);
    case "retirement-plan-obligation-measurement":
      return handleRetirementPlanObligationMeasurement(rule, ctx);
    case "retirement-plan-contribution-recognition":
      return handleRetirementPlanContributionRecognition(rule, ctx);
    case "retirement-plan-disclosure":
      return handleRetirementPlanDisclosure(rule, ctx);

    // IAS 29 — Financial Reporting in Hyperinflationary Economies
    case "hyperinflation-restatement":
      return handleHyperinflationRestatement(rule, ctx);
    case "hyperinflation-comparative-restatement":
      return handleHyperinflationComparativeRestatement(rule, ctx);
    case "hyperinflation-non-monetary-items":
      return handleHyperinflationNonMonetaryItems(rule, ctx);
    case "hyperinflation-disclosure":
      return handleHyperinflationDisclosure(rule, ctx);

    // IAS 19 / IFRS 2 / IFRS 1 / IFRS 12 / IFRS 17 / IFRS for SMEs / IFRIC 10/12/19 — "scope" is shared
    case "scope": {
      const sid = rule.ruleId.toLowerCase();
      if (sid.startsWith("ifrs-2")) return handleSharePaymentScope(rule, ctx);
      if (sid.startsWith("ifrs-1-r")) return handleFirstIfrsScope(rule, ctx);
      if (sid.startsWith("ifrs-12")) return handleDisclosureScope(rule, ctx);
      if (sid.startsWith("ifrs-17")) return handleInsuranceContractScope(rule, ctx);
      if (sid.startsWith("smes")) return handleSmesScope(rule, ctx);
      if (sid.startsWith("ifric-10")) return handleIfric10Scope(rule, ctx);
      if (sid.startsWith("ifric-12")) return handleServiceConcessionScope(rule, ctx);
      if (sid.startsWith("ifric-19")) return handleDebtRestructuringScope(rule, ctx);
      return handleEmployeeBenefitScope(rule, ctx);
    }
    case "short-term":
      return handleShortTermBenefits(rule, ctx);
    case "defined-benefit":
      return handleDefinedBenefit(rule, ctx);
    case "puc-method":
      return handlePucMethod(rule, ctx);

    // IAS 23 — Borrowing Costs
    case "capitalisation":
      return handleBorrowingCostCapitalisation(rule, ctx);
    case "eligible-costs":
      return handleEligibleBorrowingCosts(rule, ctx);
    case "commencement":
      return handleCapitalisationCommencement(rule, ctx);
    case "cessation":
      return handleCapitalisationCessation(rule, ctx);

    // IAS 37 — Provisions
    case "provision-definition":
      return handleProvisionDefinition(rule, ctx);
    case "contingent-liability":
      return handleContingentLiability(rule, ctx);

    // IAS 8 — Accounting Policies
    case "policy-selection":
      return handlePolicySelection(rule, ctx);
    case "policy-change":
      return handlePolicyChange(rule, ctx);
    case "estimate-change":
      return handleEstimateChange(rule, ctx);
    case "error-correction":
      return handleErrorCorrection(rule, ctx);

    // IFRS 2 — Share-based Payment
    case "equity-settled":
      return handleEquitySettled(rule, ctx);
    case "cash-settled":
      return handleCashSettled(rule, ctx);
    case "vesting-period":
      return handleVestingPeriod(rule, ctx);

    // IFRS 5 — Non-current Assets Held for Sale
    case "held-for-sale":
      return handleHeldForSale(rule, ctx);
    case "discontinued-operations":
      return handleDiscontinuedOperations(rule, ctx);
    case "no-depreciation":
      return handleNoDepreciation(rule, ctx);

    // IFRS 7 — Financial Instruments: Disclosures
    case "significance-disclosure":
      return handleSignificanceDisclosure(rule, ctx);
    case "carrying-amounts":
      return handleCarryingAmounts(rule, ctx);
    case "risk-disclosure":
      return handleRiskDisclosure(rule, ctx);
    case "ecl-disclosure":
      return handleEclDisclosure(rule, ctx);

    // IFRS 8 — Operating Segments
    case "codm-basis":
      return handleCodmBasis(rule, ctx);
    case "segment-definition":
      return handleSegmentDefinition(rule, ctx);
    case "segment-measures":
      return handleSegmentMeasures(rule, ctx);
    case "reconciliation":
      return handleSegmentReconciliation(rule, ctx);

    // IFRS 10 — Consolidated Financial Statements
    case "consolidation-requirement":
      return handleConsolidationRequirement(rule, ctx);
    case "control-definition":
      return handleControlDefinition(rule, ctx);
    case "consolidation-procedure":
      return handleConsolidationProcedure(rule, ctx);
    case "uniform-policies":
      return handleUniformPolicies(rule, ctx);

    // IFRS 11 — Joint Arrangements
    case "joint-arrangement":
      return handleJointArrangement(rule, ctx);
    case "joint-operation":
      return handleJointOperation(rule, ctx);
    case "joint-venture":
      return handleJointVenture(rule, ctx);
    case "equity-method":
      return handleJointEquityMethod(rule, ctx);

    // IFRS 12 — Disclosure of Interests
    case "subsidiary-disclosure":
      return handleSubsidiaryDisclosure(rule, ctx);
    case "joint-associate-disclosure":
      return handleJointAssociateDisclosure(rule, ctx);
    case "structured-entities":
      return handleStructuredEntities(rule, ctx);

    // IFRS 1 — First-time Adoption
    case "first-ifrs-statements":
      return handleFirstIfrsStatements(rule, ctx);
    case "opening-statement":
      return handleOpeningStatement(rule, ctx);
    case "retrospective-application":
      return handleRetrospectiveApplication(rule, ctx);

    // IFRS 17 — Insurance Contracts
    case "general-model":
      return handleGeneralModel(rule, ctx);
    case "revenue-separation":
      return handleRevenueSeparation(rule, ctx);

    // IFRIC 10 — Interim Impairment
    case "interim-impairment":
      return handleIfric10InterimImpairment(rule, ctx);
    case "ias36-link":
      return handleIas36Link(rule, ctx);
    case "testing-consistency":
      return handleTestingConsistency(rule, ctx);

    // IFRIC 12 — Service Concessions
    case "financial-vs-intangible":
      return handleFinancialVsIntangible(rule, ctx);
    case "operation-services":
      return handleOperationServices(rule, ctx);
    case "maintenance-obligation":
      return handleMaintenanceObligation(rule, ctx);

    // IFRIC 19 — Debt Restructuring
    case "fallback-measurement":
      return handleFallbackMeasurement(rule, ctx);
    case "gain-loss":
      return handleDebtGainLoss(rule, ctx);

    // IFRIC 23 — Uncertainty Over Income Taxes
    case "unit-of-account":
      return handleUnitOfAccount(rule, ctx);
    case "examination-assumption":
      return handleExaminationAssumption(rule, ctx);
    case "probable-acceptance":
      return handleUncertaintyScope(rule, ctx);
    case "reflect-uncertainty":
      return handleReflectUncertainty(rule, ctx);

    // IFRS for SMEs
    case "fair-presentation":
      return handleSmesFairPresentation(rule, ctx);
    case "revenue-goods":
      return handleSmesRevenueGoods(rule, ctx);
    case "ppe-measurement":
      return handleSmesPpeMeasurement(rule, ctx);
    case "income-tax-smes":
      return handleSmesIncomeTax(rule, ctx);
    case "consistency":
      return handleSmesConsistency(rule, ctx);

    default:
      return baseEval(
        rule,
        "skipped",
        "موضوع غير مُنفّذ في Phase 6.",
        "Topic not executable in Phase 6.",
      );
  }
}

/**
 * Evaluates an IFRS rule with optional RAG citation enrichment.
 * Use this in server actions / route handlers where async is available.
 */
export async function evaluateIfrsRuleWithRag(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): Promise<IfrsRuleEvaluation> {
  const result = evaluateIfrsRule(rule, ctx)

  // Enrich with RAG citations if enabled
  if (ctx.ragEnabled !== false && ctx.organizationId) {
    const citations = await searchRagCitations(rule, ctx.organizationId)
    if (citations.length > 0) {
      result.ragCitations = citations
    }
  }

  return result
}
