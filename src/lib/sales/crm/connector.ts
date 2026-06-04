import "server-only";

import type {
  CrmAccount,
  CrmContact,
  CrmOpportunity,
  CrmProvider,
} from "./types";

export interface RateLimitStatus {
  remaining: number;
  resetAt: Date;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

// ─── CrmConnector interface ───

export interface CrmConnector {
  readonly provider: CrmProvider;

  testConnection(): Promise<ConnectionTestResult>;

  fetchAccounts(since?: Date): Promise<CrmAccount[]>;

  fetchContacts(since?: Date): Promise<CrmContact[]>;

  fetchOpportunities(since?: Date): Promise<CrmOpportunity[]>;

  getRateLimitStatus(): Promise<RateLimitStatus>;
}
