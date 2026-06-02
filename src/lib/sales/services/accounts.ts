import type { SalesAccount, SalesAccountStatus } from "../types";
import {
  createAccount,
  getAccount,
  listAccounts,
} from "../store";

export function salesListAccounts(organizationId: string): SalesAccount[] {
  return listAccounts(organizationId);
}

export function salesGetAccount(
  organizationId: string,
  accountId: string,
): SalesAccount | undefined {
  return getAccount(organizationId, accountId);
}

export function salesCreateAccount(input: {
  organizationId: string;
  name: string;
  nameAr?: string;
  industry?: string;
  status?: SalesAccountStatus;
  ownerId: string;
  createdById: string;
}): SalesAccount {
  return createAccount({
    organizationId: input.organizationId,
    name: input.name,
    nameAr: input.nameAr,
    industry: input.industry,
    status: input.status ?? "prospect",
    ownerId: input.ownerId,
    createdById: input.createdById,
  });
}
