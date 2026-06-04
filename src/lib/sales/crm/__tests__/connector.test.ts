import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { HubSpotConnector } from "../hubspot-connector";
import { SalesforceConnector } from "../salesforce-connector";
import { CrmAuthError, CrmRateLimitError } from "../types";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
globalThis.fetch = mockFetch;

describe("HubSpotConnector", () => {
  let connector: HubSpotConnector;

  beforeEach(() => {
    jest.clearAllMocks();
    connector = new HubSpotConnector({
      accessToken: "test-token",
    });
  });

  describe("testConnection", () => {
    it("returns success when API responds", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ results: [] }),
      } as Response);

      const result = await connector.testConnection();
      expect(result.success).toBe(true);
      expect(result.message).toBe("اتصال HubSpot نشط");
    });

    it("returns failure on auth error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({}),
        json: async () => ({}),
        text: async () => "Unauthorized",
      } as Response);

      const result = await connector.testConnection();
      expect(result.success).toBe(false);
    });
  });

  describe("fetchAccounts", () => {
    it("fetches and maps accounts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          "X-HubSpot-RateLimit-Remaining": "99",
          "X-HubSpot-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 60),
        }),
        json: async () => ({
          results: [
            {
              id: "123",
              properties: {
                name: "Test Corp",
                industry: "Technology",
                website: "https://test.com",
                hs_createdate: "2026-01-01T00:00:00Z",
                hs_lastmodifieddate: "2026-06-01T00:00:00Z",
              },
            },
          ],
        }),
      } as Response);

      const accounts = await connector.fetchAccounts();
      expect(accounts).toHaveLength(1);
      expect(accounts[0].id).toBe("123");
      expect(accounts[0].name).toBe("Test Corp");
      expect(accounts[0].industry).toBe("Technology");
    });

    it("handles rate limiting with retry", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers({ "Retry-After": "1" }),
          json: async () => ({}),
          text: async () => "Rate limited",
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ "X-HubSpot-RateLimit-Remaining": "99" }),
          json: async () => ({ results: [] }),
        } as Response);

      const accounts = await connector.fetchAccounts();
      expect(accounts).toHaveLength(0);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("fetchContacts", () => {
    it("fetches and maps contacts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({}),
        json: async () => ({
          results: [
            {
              id: "456",
              properties: {
                firstname: "John",
                lastname: "Doe",
                email: "john@test.com",
                jobtitle: "CEO",
                hs_createdate: "2026-01-01T00:00:00Z",
                hs_lastmodifieddate: "2026-06-01T00:00:00Z",
              },
            },
          ],
        }),
      } as Response);

      const contacts = await connector.fetchContacts();
      expect(contacts).toHaveLength(1);
      expect(contacts[0].firstName).toBe("John");
      expect(contacts[0].lastName).toBe("Doe");
    });
  });

  describe("fetchOpportunities", () => {
    it("fetches and maps opportunities", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({}),
        json: async () => ({
          results: [
            {
              id: "789",
              properties: {
                dealname: "Big Deal",
                amount: "50000",
                dealstage: "qualified",
                hs_createdate: "2026-01-01T00:00:00Z",
                hs_lastmodifieddate: "2026-06-01T00:00:00Z",
              },
            },
          ],
        }),
      } as Response);

      const opps = await connector.fetchOpportunities();
      expect(opps).toHaveLength(1);
      expect(opps[0].name).toBe("Big Deal");
      expect(opps[0].amount).toBe(50000);
    });
  });
});

describe("SalesforceConnector", () => {
  let connector: SalesforceConnector;

  beforeEach(() => {
    jest.clearAllMocks();
    connector = new SalesforceConnector({
      instanceUrl: "https://test.salesforce.com",
      accessToken: "test-sf-token",
      clientId: "test-client",
      clientSecret: "test-secret",
      username: "test-user",
      password: "test-pass",
    });
  });

  describe("testConnection", () => {
    it("returns success with valid token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({}),
        json: async () => ({
          totalSize: 0,
          done: true,
          records: [],
        }),
      } as Response);

      const result = await connector.testConnection();
      expect(result.success).toBe(true);
    });

    it("re-authenticates on 401", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          headers: new Headers({}),
          json: async () => ({}),
          text: async () => "Session expired",
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ "Content-Type": "application/json" }),
          json: async () => ({ access_token: "new-token", instance_url: "https://test.salesforce.com", token_type: "Bearer", issued_at: Date.now().toString(), signature: "sig" }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({}),
          json: async () => ({ totalSize: 0, done: true, records: [] }),
        } as Response);

      const result = await connector.testConnection();
      expect(result.success).toBe(true);
    });
  });

  describe("fetchAccounts", () => {
    it("fetches and maps Salesforce accounts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({}),
        json: async () => ({
          totalSize: 1,
          done: true,
          records: [
            {
              Id: "001XX",
              Name: "SF Account",
              Industry: "Finance",
              Website: "https://sf.com",
              CreatedDate: "2026-01-01T00:00:00Z",
              LastModifiedDate: "2026-06-01T00:00:00Z",
              Owner: { Email: "owner@sf.com", Name: "Owner Name" },
            },
          ],
        }),
      } as Response);

      const accounts = await connector.fetchAccounts();
      expect(accounts).toHaveLength(1);
      expect(accounts[0].id).toBe("001XX");
      expect(accounts[0].name).toBe("SF Account");
      expect(accounts[0].industry).toBe("Finance");
    });
  });

  describe("fetchContacts", () => {
    it("fetches and maps Salesforce contacts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({}),
        json: async () => ({
          totalSize: 1,
          done: true,
          records: [
            {
              Id: "003YY",
              AccountId: "001XX",
              FirstName: "Jane",
              LastName: "Smith",
              Email: "jane@sf.com",
              Title: "VP Sales",
              CreatedDate: "2026-01-01T00:00:00Z",
              LastModifiedDate: "2026-06-01T00:00:00Z",
              Owner: { Email: "owner@sf.com" },
            },
          ],
        }),
      } as Response);

      const contacts = await connector.fetchContacts();
      expect(contacts).toHaveLength(1);
      expect(contacts[0].firstName).toBe("Jane");
      expect(contacts[0].lastName).toBe("Smith");
    });
  });
});
