// ─── CrmConnector → CRMProvider Adapter ───
// Wraps a local CrmConnector (HubSpot/Salesforce) into the
// integration layer's CRMProvider interface so it works with
// ProviderRegistry, failover engine, and health checks.

import { IntegrationType } from "../types";
import type {
  CRMProvider,
  CRMAccount,
  CRMContact,
  CRMOpportunity,
  ConnectionTestResult,
  ProviderHealth,
} from "../types";
import type { CrmConnector } from "@/lib/sales/crm/connector";

/**
 * Adapter that wraps a local CrmConnector into the integration
 * layer's CRMProvider interface.
 */
export class CrmProviderAdapter implements CRMProvider {
  readonly providerId: string;
  readonly providerType = IntegrationType.CRM as const;

  private inner: CrmConnector;

  constructor(inner: CrmConnector) {
    this.inner = inner;
    this.providerId = inner.provider;
  }

  async getAccounts(since?: Date): Promise<CRMAccount[]> {
    const records = await this.inner.fetchAccounts(since);
    return records.map((r) => ({
      id: r.id,
      name: r.name,
      industry: r.industry,
      website: r.website,
      ownerEmail: r.ownerEmail,
    }));
  }

  async getContacts(since?: Date): Promise<CRMContact[]> {
    const records = await this.inner.fetchContacts(since);
    return records.map((r) => ({
      id: r.id,
      accountId: r.accountId,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      phone: r.phone,
    }));
  }

  async getOpportunities(since?: Date): Promise<CRMOpportunity[]> {
    const records = await this.inner.fetchOpportunities(since);
    return records.map((r) => ({
      id: r.id,
      accountId: r.accountId,
      name: r.name,
      amount: r.amount,
      stage: r.stage,
      closeDate: r.closeDate,
    }));
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return this.inner.testConnection();
  }

  async health(): Promise<ProviderHealth> {
    const startMs = Date.now();
    try {
      const result = await this.inner.testConnection();
      return {
        healthy: result.success,
        latencyMs: Date.now() - startMs,
        lastCheck: new Date(),
        error: result.success ? undefined : result.message,
      };
    } catch (err) {
      return {
        healthy: false,
        latencyMs: Date.now() - startMs,
        lastCheck: new Date(),
        error: err instanceof Error ? err.message : "CRM health check failed",
      };
    }
  }
}

/**
 * Wrap a CrmConnector into a CRMProvider adapter.
 * Used by the factory registry to produce integration-layer-compliant providers.
 */
export function wrapCrmConnector(connector: CrmConnector): CRMProvider {
  return new CrmProviderAdapter(connector);
}
