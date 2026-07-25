// ─── SalesOS Prisma persistence layer — barrel re-export ───
// Tenant-scoped CRUD. Enabled via SALESOS_PRISMA_PERSISTENCE=1.
//
// === R-04 Resolution: Schema Alignment Complete ===
// Prisma schema fields added 2026-06-21:
//   SalesAccount:  nameAr, ownerId
//   SalesContact:  title, phone, sensitivityLevel, ownerId, createdById
//   SalesDeal:     name, pipelineStage, qualificationScore, reviewStatus,
//                  approvalStatus, ownerId
//   SalesInteraction: contactId, evidenceRef
//
// All core model references now use correct Prisma model names and field names.
// No `as any` casts remain for core CRUD (SalesAccount, SalesContact, SalesDeal,
// SalesInteraction, SalesEvidenceLink).
//
// Tier B/A models (salesMarketSignal, salesKnowledgeGraphNode, etc.) remain as
// optional schema extensions with `as any` + fail-soft try/catch. These are
// intentionally not typed — they depend on advanced schema extensions not part
// of the SalesOS v0.1 baseline.

export {
  prismaLoadOrgSnapshot,
  prismaSeedOrg,
  prismaCreateAccount,
  prismaCreateOpportunity,
  prismaCreateInteraction,
  prismaUpdateOpportunity,
  prismaCreateEvidence,
  prismaAppendAuditEntry,
} from "./core";

export {
  isTierB1PrismaReady,
  prismaLoadTierB1Intelligence,
  prismaCreateMarketSignal,
  prismaUpdateMarketSignal,
  prismaDeleteMarketSignal,
  prismaCreateCommercialRecommendation,
  prismaUpdateCommercialRecommendation,
  prismaDeleteCommercialRecommendation,
} from "./tier-b1";

export {
  isTierB2PrismaReady,
  prismaLoadTierB2Intelligence,
  prismaCreateInstitutionalLearningInsight,
  prismaUpdateInstitutionalLearningInsight,
  prismaDeleteInstitutionalLearningInsight,
} from "./tier-b2";

export {
  isTierB3PrismaReady,
  prismaLoadTierB3Intelligence,
  prismaCreateKnowledgeGraphNode,
  prismaCreateKnowledgeGraphEdge,
  prismaUpdateKnowledgeGraphNode,
  prismaDeleteKnowledgeGraphEdge,
} from "./tier-b3";

export {
  isTierAPrismaIntelligenceReady,
  prismaLoadTierAIntelligence,
  prismaCreateSignal,
  prismaUpdateSignal,
  prismaDeleteSignal,
  prismaCreateObjection,
  prismaCreateCompetitorMention,
  prismaCreateWinLossInsight,
  prismaCreateICPInsight,
  prismaCreateNextAction,
  prismaCreateProofAsset,
  prismaDeleteProofAsset,
} from "./tier-a";
