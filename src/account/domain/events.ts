/**
 * Account Domain Events — follow same template as SalesOS deals
 */
export interface DomainEvent {
  id: string; type: string; eventVersion: number; source: string;
  subject: string; data: unknown; timestamp: string; sequenceId: string; correlationId?: string;
}

export interface AccountCreatedEvent {
  type: "salesos.account.created"; eventVersion: 1;
  subject: string; data: { accountId: string; name: string; industry?: string; ownerId: string; };
}

export interface AccountScoredEvent {
  type: "salesos.account.scored"; eventVersion: 1;
  subject: string; data: { accountId: string; score: number; dimensions: Record<string, number>; };
}

export interface AccountDormantEvent {
  type: "salesos.account.dormant"; eventVersion: 1;
  subject: string; data: { accountId: string; dormancyReason: string; };
}
