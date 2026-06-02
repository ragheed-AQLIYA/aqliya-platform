import type { SalesContact } from "../types";
import { createContact, listContactsForAccount } from "../store";

export function salesListContactsForAccount(
  organizationId: string,
  accountId: string,
): SalesContact[] {
  return listContactsForAccount(organizationId, accountId);
}

export function salesCreateContact(
  input: Omit<SalesContact, "id" | "createdAt" | "updatedAt">,
): SalesContact {
  return createContact(input);
}
