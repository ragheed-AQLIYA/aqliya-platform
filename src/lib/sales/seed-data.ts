// ─── SalesOS seed data (in-memory, no schema migration) ───

import type {
  SalesAccount,
  SalesContact,
  SalesOpportunity,
  SalesInteractionLog,
} from "./types";

const NOW = new Date().toISOString();

export function buildSalesSeedData(organizationId: string, ownerId: string) {
  const accounts: SalesAccount[] = [
    {
      id: "sales-acct-001",
      organizationId,
      name: "Acme Corp",
      nameAr: "شركة أكمي",
      status: "qualified",
      industry: "Technology",
      ownerId,
      createdById: ownerId,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "sales-acct-002",
      organizationId,
      name: "Global Finance",
      nameAr: "المالية العالمية",
      status: "active",
      industry: "Financial Services",
      ownerId,
      createdById: ownerId,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "sales-acct-003",
      organizationId,
      name: "DataFlow Ltd",
      nameAr: "داتافلو",
      status: "prospect",
      industry: "Data Analytics",
      ownerId,
      createdById: ownerId,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const contacts: SalesContact[] = [
    {
      id: "sales-contact-001",
      accountId: "sales-acct-001",
      organizationId,
      name: "Ahmed Al-Rashid",
      title: "CFO",
      email: "ahmed@acme.example",
      sensitivityLevel: "standard",
      ownerId,
      createdById: ownerId,
    },
    {
      id: "sales-contact-002",
      accountId: "sales-acct-002",
      organizationId,
      name: "Sarah K.",
      title: "VP Procurement",
      email: "sarah@globalfinance.example",
      sensitivityLevel: "restricted",
      ownerId,
      createdById: ownerId,
    },
  ];

  const opportunities: SalesOpportunity[] = [
    {
      id: "sales-opp-001",
      organizationId,
      accountId: "sales-acct-001",
      name: "AuditOS Enterprise License",
      stage: "Qualification",
      valueEstimate: 480000,
      currency: "SAR",
      qualificationScore: 72,
      ownerId,
      createdById: ownerId,
      reviewStatus: "Draft",
      approvalStatus: "Draft",
    },
    {
      id: "sales-opp-002",
      organizationId,
      accountId: "sales-acct-002",
      name: "Institutional Suite Pilot",
      stage: "InReview",
      valueEstimate: 720000,
      currency: "SAR",
      qualificationScore: 85,
      ownerId,
      createdById: ownerId,
      reviewStatus: "InReview",
      approvalStatus: "Draft",
    },
    {
      id: "sales-opp-003",
      organizationId,
      accountId: "sales-acct-003",
      name: "LocalContentOS Assessment",
      stage: "Draft",
      valueEstimate: 250000,
      currency: "SAR",
      qualificationScore: 55,
      ownerId,
      createdById: ownerId,
      reviewStatus: "Draft",
      approvalStatus: "Draft",
    },
  ];

  const interactions: SalesInteractionLog[] = [
    {
      id: "sales-int-001",
      organizationId,
      accountId: "sales-acct-001",
      opportunityId: "sales-opp-001",
      contactId: "sales-contact-001",
      type: "meeting",
      summary: "Discovery call — governance requirements discussed",
      loggedById: ownerId,
      loggedAt: NOW,
    },
    {
      id: "sales-int-002",
      organizationId,
      accountId: "sales-acct-002",
      opportunityId: "sales-opp-002",
      contactId: "sales-contact-002",
      type: "email",
      summary: "Proposal sent — awaiting review",
      evidenceRef: "proposal:draft-002",
      loggedById: ownerId,
      loggedAt: NOW,
    },
  ];

  return { accounts, contacts, opportunities, interactions };
}
