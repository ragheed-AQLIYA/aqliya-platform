/**
 * SalesOS Store — Account & Contact domain
 */

import type { SalesAccount, SalesContact } from "../types";
import { governedDefaults, salesEntityId } from "../entity-factory";
import { getOrgStore, schedulePersist, persistPrismaWrite } from "./common";

// ─── Accounts ───

export function listAccounts(organizationId: string): SalesAccount[] {
  return [...getOrgStore(organizationId).accounts.values()];
}

export function getAccount(
  organizationId: string,
  accountId: string,
): SalesAccount | undefined {
  const acct = getOrgStore(organizationId).accounts.get(accountId);
  return acct?.organizationId === organizationId ? acct : undefined;
}

export function createAccount(
  input: Omit<SalesAccount, "id" | "createdAt" | "updatedAt">,
): SalesAccount {
  const store = getOrgStore(input.organizationId);
  const now = new Date().toISOString();
  const account: SalesAccount = {
    ...input,
    source: input.source ?? "manual",
    id: `sales-acct-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  store.accounts.set(account.id, account);
  schedulePersist(input.organizationId);
  persistPrismaWrite(input.organizationId, "createAccount", async () => {
    const { accountRepository } = await import("../repositories");
    await accountRepository.create(account);
  });
  return account;
}

// ─── Contacts ───

export function listContactsForAccount(
  organizationId: string,
  accountId: string,
): SalesContact[] {
  return [...getOrgStore(organizationId).contacts.values()].filter(
    (c) => c.accountId === accountId,
  );
}

export function createContact(
  input: Omit<SalesContact, "id" | "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): SalesContact {
  const store = getOrgStore(input.organizationId);
  const ts = governedDefaults({ source: input.source, status: input.status });
  const contact: SalesContact = {
    ...input,
    id: salesEntityId("sales-contact"),
    createdAt: input.createdAt ?? ts.createdAt,
    updatedAt: input.updatedAt ?? ts.updatedAt,
    source: input.source ?? ts.source,
    status: input.status ?? ts.status,
  };
  store.contacts.set(contact.id, contact);
  schedulePersist(input.organizationId);
  return contact;
}
