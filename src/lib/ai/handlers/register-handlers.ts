// Phase 3B: Register all deterministic AI handlers
// Imported at app startup — registers handlers on the shared deterministicProvider instance.
// Each handler preserves existing AuditOS rule-based behavior.

import { deterministicProvider } from "../providers/deterministic-provider"
import { analyticalReviewHandler } from "./analytical-review-handler"
import { evidenceSuggestionsHandler } from "./evidence-suggestions-handler"
import { findingDraftsHandler } from "./finding-drafts-handler"
import { recommendationDraftsHandler } from "./recommendation-drafts-handler"
import { draftNotesHandler } from "./draft-notes-handler"
import { disclosureEnrichmentHandler } from "./disclosure-enrichment-handler"
import { commercialClaimAssistHandler } from "./commercial-claim-assist-handler"
import { pilotDecisionAssistHandler } from "./pilot-decision-assist-handler"

// analytical review — rule-based TB scan + anomaly flag generation
deterministicProvider.registerHandler('trial_balance_upload', analyticalReviewHandler)

// evidence suggestions — materiality-based evidence gap detection
deterministicProvider.registerHandler('evidence_review', evidenceSuggestionsHandler)

// finding drafts — predefined finding templates with duplicate-title prevention
deterministicProvider.registerHandler('audit_findings', findingDraftsHandler)

// recommendation drafts — per-finding remediation recommendations with duplicate-findingId prevention
deterministicProvider.registerHandler('approval_review', recommendationDraftsHandler)

// draft notes — notes engine rule-based note generation with skipExistingTitles
deterministicProvider.registerHandler('notes_generation', draftNotesHandler)
deterministicProvider.registerHandler('disclosure_enrichment', disclosureEnrichmentHandler)

// cross-product governed assist (Office AI, LocalContentOS, DecisionOS)
deterministicProvider.registerHandler('commercial_claim_review', commercialClaimAssistHandler)
deterministicProvider.registerHandler('pilot_decision', pilotDecisionAssistHandler)
