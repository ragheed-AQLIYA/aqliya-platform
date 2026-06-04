import "server-only";

export { accountRepository } from "./account-repository";
export { contactRepository } from "./contact-repository";
export { opportunityRepository } from "./opportunity-repository";
export { interactionRepository } from "./interaction-repository";
export { evidenceRepository } from "./evidence-repository";
export { auditRepository } from "./audit-repository";

export {
  prismaAccountToDomain,
  prismaContactToDomain,
  prismaDealToOpportunity,
  prismaInteractionToDomain,
  prismaEvidenceToDomain,
  prismaAuditToDomain,
} from "./entity-mappers";
