import { describe, expect, it } from "@jest/globals";
import {
  applyAccountMapping,
  applyContactMapping,
  applyOpportunityMapping,
  getDefaultMappings,
  DEFAULT_HUBSPOT_ACCOUNT_MAPPINGS,
  DEFAULT_HUBSPOT_CONTACT_MAPPINGS,
  DEFAULT_HUBSPOT_OPPORTUNITY_MAPPINGS,
  DEFAULT_SALESFORCE_CONTACT_MAPPINGS,
} from "../field-mapping";
import type { CrmAccount, CrmContact, CrmOpportunity } from "../types";

describe("field-mapping", () => {
  describe("getDefaultMappings", () => {
    it("returns HubSpot account mappings", () => {
      const mappings = getDefaultMappings("hubspot", "account");
      expect(mappings).toHaveLength(5);
      expect(mappings[0].salesField).toBe("name");
      expect(mappings[0].crmField).toBe("name");
    });

    it("returns HubSpot contact mappings with concat transform", () => {
      const mappings = getDefaultMappings("hubspot", "contact");
      const concatMapping = mappings.find((m) => m.transform === "concat_first_last");
      expect(concatMapping).toBeDefined();
      expect(concatMapping?.salesField).toBe("name");
    });

    it("returns Salesforce opportunity mappings", () => {
      const mappings = getDefaultMappings("salesforce", "opportunity");
      expect(mappings.length).toBeGreaterThan(0);
    });

    it("returns empty for unknown provider", () => {
      const mappings = getDefaultMappings("unknown", "account");
      expect(mappings).toHaveLength(0);
    });
  });

  describe("applyAccountMapping", () => {
    const mockCrmAccount: CrmAccount = {
      id: "crm-1",
      name: "Test Corp",
      industry: "Technology",
      website: "https://test.com",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-06-01T00:00:00Z",
    };

    it("maps CRM account to internal fields", () => {
      const result = applyAccountMapping(mockCrmAccount, DEFAULT_HUBSPOT_ACCOUNT_MAPPINGS, "crm_to_sales");
      expect(result.name).toBe("Test Corp");
      expect(result.industry).toBe("Technology");
      expect(result.website).toBe("https://test.com");
    });

    it("handles empty mappings", () => {
      const result = applyAccountMapping(mockCrmAccount, [], "crm_to_sales");
      expect(result.name).toBeUndefined();
    });
  });

  describe("applyContactMapping", () => {
    const mockCrmContact: CrmContact = {
      id: "crm-contact-1",
      accountId: "crm-acc-1",
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      title: "CEO",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-06-01T00:00:00Z",
    };

    it("concatenates first and last name with transform", () => {
      const result = applyContactMapping(mockCrmContact, DEFAULT_HUBSPOT_CONTACT_MAPPINGS, "crm_to_sales");
      expect(result.name).toBe("John Doe");
      expect(result.email).toBe("john@test.com");
    });

    it("maps sales to crm direction", () => {
      const result = applyContactMapping(mockCrmContact, DEFAULT_SALESFORCE_CONTACT_MAPPINGS, "sales_to_crm");
      expect(result.firstName).toBe("John");
    });
  });

  describe("applyOpportunityMapping", () => {
    const mockCrmOpp: CrmOpportunity = {
      id: "crm-opp-1",
      accountId: "crm-acc-1",
      name: "Big Deal",
      amount: 50000,
      currency: "USD",
      stage: "proposal",
      closeDate: "2026-12-31",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-06-01T00:00:00Z",
    };

    it("maps CRM opportunity to internal fields", () => {
      const result = applyOpportunityMapping(mockCrmOpp, DEFAULT_HUBSPOT_OPPORTUNITY_MAPPINGS, "crm_to_sales");
      expect(result.name).toBe("Big Deal");
      expect(result.amount).toBe(50000);
      expect(result.currency).toBe("USD");
    });
  });
});
