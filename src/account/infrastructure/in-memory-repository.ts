/**
 * InMemoryAccountRepository — same pattern as Cycle 1
 */
import type { AccountRepository, AccountFilter } from "../domain/repository";
import { Account } from "../domain/account";
import type { AccountProps } from "../domain/account";
import { ConcurrencyError, NotFoundError } from "../domain/errors";

export class InMemoryAccountRepository implements AccountRepository {
  private store = new Map<string, AccountProps>();

  async findById(id: string, orgId: string): Promise<Account | null> {
    const props = this.store.get(id);
    if (!props || props.organizationId !== orgId) return null;
    return Account.reconstitute({ ...props });
  }

  async findMany(filter: AccountFilter, orgId: string): Promise<Account[]> {
    let results = [...this.store.values()].filter((a) => a.organizationId === orgId);
    if (filter.status) results = results.filter((a) => a.status === filter.status);
    if (filter.ownerId) results = results.filter((a) => a.ownerId === filter.ownerId);
    if (filter.search) results = results.filter((a) => a.name.toLowerCase().includes(filter.search!.toLowerCase()));
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const page = filter.page ?? 1;
    const limit = Math.min(filter.limit ?? 20, 100);
    return results.slice((page - 1) * limit, (page - 1) * limit + limit).map((p) => Account.reconstitute({ ...p }));
  }

  async save(account: Account): Promise<Account> {
    const props = account.toJSON();
    const existing = this.store.get(account.id);
    if (existing) {
      if (props.version !== existing.version) throw new ConcurrencyError("Version mismatch", props.version, existing.version);
      props.version = existing.version + 1;
    } else {
      if (!props.id) throw new Error("Account ID must be assigned before saving");
      props.version = 1;
    }
    this.store.set(props.id, { ...props });
    return Account.reconstitute({ ...props });
  }

  async archive(id: string, orgId: string): Promise<void> {
    const existing = this.store.get(id);
    if (!existing || existing.organizationId !== orgId) throw new NotFoundError("Account not found");
    this.store.set(id, { ...existing, status: "Archived", updatedAt: new Date().toISOString(), version: existing.version + 1 });
  }
}
