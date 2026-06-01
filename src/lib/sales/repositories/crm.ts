/** Re-export P0 CRM services as repository surface (no duplicate logic). */

export {
  listSalesAccounts,
  getSalesAccount,
  createSalesAccount,
  updateSalesAccount,
  listSalesDeals,
  getSalesDeal,
  createSalesDeal,
  updateSalesDeal,
  listSalesDealAuditEvents,
} from "../services";

export {
  listInteractionsForDeal,
  listInteractionsForAccount,
  listInteractionsForOrganization,
  createSalesInteraction,
  updateSalesInteraction,
  deleteSalesInteraction,
} from "../interactions";

export {
  listEvidenceLinksForDeal,
  listEvidenceLinksForAccount,
  linkEvidenceToDeal,
  unlinkEvidenceFromDeal,
  listEvidenceLinksForOrganization,
} from "../evidence-links";

export { listOrgSalesAuditEvents } from "../audit-trail";

export { listContactsForAccount } from "../contacts";
