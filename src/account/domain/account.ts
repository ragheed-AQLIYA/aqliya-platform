/**
 * Account Aggregate — Cycle 2, SPEC-02a
 * Follows the same aggregate pattern as Deal in Cycle 1
 */
import type { IcpScore, HealthScore, AccountStatus } from "./value-objects";
import { isArchived } from "./value-objects";
import { BusinessRuleError } from "./errors";

export type AccountScores = { icp?: IcpScore; health?: HealthScore };

export interface CreateAccountProps {
  name: string; nameAr?: string; industry?: string; size?: string; region?: string;
  ownerId: string; organizationId: string; createdById: string;
}

export interface AccountProps extends CreateAccountProps {
  id: string; status: AccountStatus; scores: AccountScores;
  createdAt: string; updatedAt: string; version: number;
  metadata?: Record<string, unknown>;
}

export class Account {
  private constructor(private props: AccountProps) {}

  static create(props: CreateAccountProps): Account {
    const now = new Date().toISOString();
    return new Account({
      ...props, id: "", status: "Prospect", scores: {},
      createdAt: now, updatedAt: now, version: 1,
    });
  }

  static reconstitute(props: AccountProps): Account { return new Account(props); }

  // Getters
  get id(): string { return this.props.id; }
  get organizationId(): string { return this.props.organizationId; }
  get name(): string { return this.props.name; }
  get status(): AccountStatus { return this.props.status; }
  get scores(): AccountScores { return { ...this.props.scores }; }
  get version(): number { return this.props.version; }

  // Mutations
  updateInfo(name: string, industry?: string, size?: string, region?: string): Account {
    if (isArchived(this.props.status)) throw new BusinessRuleError("Cannot update archived account");
    return Account.reconstitute({ ...this.props, name, industry, size, region, updatedAt: new Date().toISOString() });
  }

  setScores(icp?: IcpScore, health?: HealthScore): Account {
    if (isArchived(this.props.status)) throw new BusinessRuleError("Cannot modify archived account scores");
    return Account.reconstitute({ ...this.props, scores: { icp, health }, updatedAt: new Date().toISOString() });
  }

  activate(): Account { return Account.reconstitute({ ...this.props, status: "Active", updatedAt: new Date().toISOString() }); }
  markDormant(reason: string): Account { return Account.reconstitute({ ...this.props, status: "Dormant", metadata: { ...this.props.metadata, dormancyReason: reason }, updatedAt: new Date().toISOString() }); }
  archive(): Account {
    if (isArchived(this.props.status)) throw new BusinessRuleError("Account already archived");
    return Account.reconstitute({ ...this.props, status: "Archived", updatedAt: new Date().toISOString() });
  }

  toJSON(): AccountProps { return { ...this.props }; }
}
