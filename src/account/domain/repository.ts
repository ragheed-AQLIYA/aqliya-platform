/**
 * Account Repository — same pattern as DealRepository
 */
import type { Account } from "./account";
import type { AccountStatus } from "./value-objects";

export interface AccountFilter {
  industry?: string; icpMin?: number; icpMax?: number;
  status?: AccountStatus; ownerId?: string;
  search?: string; page?: number; limit?: number;
}

export interface AccountRepository {
  findById(id: string, orgId: string): Promise<Account | null>;
  findMany(filter: AccountFilter, orgId: string): Promise<Account[]>;
  save(account: Account): Promise<Account>;
  archive(id: string, orgId: string): Promise<void>;
}
