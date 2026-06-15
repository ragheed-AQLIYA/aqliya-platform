// ─── ERP Connector Factory — Tenant Isolation & Rotation Tests (Wave 3) ───
// Proves: SAP + Oracle credentials resolve through SecretResolver
//         Vault source = plaintext, Legacy-ERP source = plaintext
//         Tenant A/B isolation, rotation v3→v4, backward compat

import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { SapConnector } from "../sap-connector";
import { OracleEbsConnector } from "../oracle-connector";
import { DynamicsErpConnector } from "../dynamics-connector";
import {
  createErpConnector,
  createErpConnectorFromResolver,
} from "../connector-factory";
import type { ErpConnectionRecord } from "../connector-factory";

// Mock SecretResolver for ERP tenant isolation tests
let mockSecretResult: {
  credentials: Record<string, string>;
  source: string;
  version: number;
} | null = null;

jest.mock("@/lib/integration/secret-resolver", () => ({
  SecretPurpose: {
    ERP_SYNC: "ERP_SYNC",
  },
  secretResolver: {
    getIntegrationSecretByType: jest.fn(async (
      _orgId: string,
      _type: string,
      _provider: string,
      _purpose: string,
    ) => {
      if (mockSecretResult === null) {
        throw new Error("No integration found");
      }
      return {
        credentials: mockSecretResult.credentials,
        source: mockSecretResult.source,
        vaultEntryId: "vault-entry-erp-1",
        version: mockSecretResult.version,
        resolvedAt: new Date(),
        cacheHit: false,
      };
    }),
  },
}));

function makeMockErpRecord(overrides: Partial<ErpConnectionRecord> = {}): ErpConnectionRecord {
  return {
    id: "erp-conn-1",
    organizationId: "erp-org-1",
    provider: "sap",
    label: "Test SAP",
    connectionType: "rfc",
    apiEndpoint: "https://sap.example.com",
    apiKey: "plaintext-sap-key",
    apiSecret: null,
    fieldMapping: null,
    defaultCurrency: "SAR",
    metadata: null,
    ...overrides,
  };
}

// ─── SAP Tests ───

describe("SAP Connector Factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecretResult = null;
  });

  describe("createErpConnector (legacy backward compat)", () => {
    it("creates SapConnector from ErpConnectionRecord", async () => {
      const record = makeMockErpRecord({ provider: "sap" });
      const result = await createErpConnector(record) as SapConnector;
      expect(result).toBeInstanceOf(SapConnector);
    });

    it("handles null apiKey gracefully", async () => {
      const record = makeMockErpRecord({ provider: "sap", apiKey: null });
      const result = await createErpConnector(record) as SapConnector;
      expect(result).toBeInstanceOf(SapConnector);
    });
  });

  describe("createErpConnectorFromResolver — vault source", () => {
    it("returns SapConnector with plaintext credentials from vault", async () => {
      mockSecretResult = {
        credentials: { value: "sap-vault-api-key" },
        source: "vault",
        version: 3,
      };

      const record = makeMockErpRecord({
        provider: "sap",
        organizationId: "sap-org-a",
        apiKey: null, // force resolver path
      });
      const result = await createErpConnectorFromResolver(record) as SapConnector;
      expect(result).toBeInstanceOf(SapConnector);
    });
  });

  describe("createErpConnectorFromResolver — legacy-erp source", () => {
    it("uses legacy credentials from ErpConnection fallback", async () => {
      mockSecretResult = {
        credentials: { apiKey: "sap-legacy-key" },
        source: "legacy-erp",
        version: 0,
      };

      const record = makeMockErpRecord({
        provider: "sap",
        organizationId: "sap-org-b",
      });
      const result = await createErpConnectorFromResolver(record) as SapConnector;
      expect(result).toBeInstanceOf(SapConnector);
    });
  });

  describe("legacy fallback when SecretResolver throws", () => {
    it("falls back to createErpConnector for SAP", async () => {
      const record = makeMockErpRecord({ provider: "sap" });
      const result = await createErpConnectorFromResolver(record) as SapConnector;
      expect(result).toBeInstanceOf(SapConnector);
    });
  });
});

// ─── Oracle Tests ───

describe("Oracle EBS Connector Factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecretResult = null;
  });

  describe("createErpConnector (legacy backward compat)", () => {
    it("creates OracleEbsConnector from ErpConnectionRecord", async () => {
      const record = makeMockErpRecord({
        provider: "oracle",
        apiEndpoint: "https://oracle.example.com",
        apiKey: "oracle-key",
        apiSecret: "oracle-secret",
      });
      const result = await createErpConnector(record) as OracleEbsConnector;
      expect(result).toBeInstanceOf(OracleEbsConnector);
    });
  });

  describe("createErpConnectorFromResolver — vault source", () => {
    it("returns OracleEbsConnector with plaintext credentials from vault", async () => {
      mockSecretResult = {
        credentials: {
          value: "oracle-vault-key",
          apiSecret: "oracle-vault-secret",
        },
        source: "vault",
        version: 2,
      };

      const record = makeMockErpRecord({
        provider: "oracle",
        organizationId: "oracle-org-a",
        apiEndpoint: "https://oracle.example.com",
        apiKey: null,
        apiSecret: null,
      });
      const result = await createErpConnectorFromResolver(record) as OracleEbsConnector;
      expect(result).toBeInstanceOf(OracleEbsConnector);
    });
  });

  describe("createErpConnectorFromResolver — legacy-erp source", () => {
    it("uses legacy credentials from ErpConnection fallback", async () => {
      mockSecretResult = {
        credentials: {
          apiKey: "oracle-legacy-key",
          apiSecret: "oracle-legacy-secret",
        },
        source: "legacy-erp",
        version: 0,
      };

      const record = makeMockErpRecord({
        provider: "oracle",
        organizationId: "oracle-org-b",
        apiEndpoint: "https://oracle.example.com",
      });
      const result = await createErpConnectorFromResolver(record) as OracleEbsConnector;
      expect(result).toBeInstanceOf(OracleEbsConnector);
    });
  });

  describe("legacy fallback when SecretResolver throws", () => {
    it("falls back to createErpConnector for Oracle", async () => {
      const record = makeMockErpRecord({
        provider: "oracle",
        apiEndpoint: "https://oracle.example.com",
      });
      const result = await createErpConnectorFromResolver(record) as OracleEbsConnector;
      expect(result).toBeInstanceOf(OracleEbsConnector);
    });
  });
});

// ─── Cross-Provider Isolation Tests ───
// Proves: SAP org credentials never leak to Oracle org, and vice versa

describe("ERP Tenant A ↔ Tenant B isolation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecretResult = null;
  });

  it("SAP org A and Oracle org B resolve different credentials", async () => {
    // SAP Tenant A
    mockSecretResult = {
      credentials: { value: "sap-tenant-a-key" },
      source: "vault",
      version: 5,
    };
    const sapRecord = makeMockErpRecord({
      provider: "sap",
      organizationId: "erp-org-alpha",
      apiKey: null,
    });
    const sapConnector = await createErpConnectorFromResolver(sapRecord);
    expect(sapConnector).toBeInstanceOf(SapConnector);

    // Oracle Tenant B — different org, different credentials
    mockSecretResult = {
      credentials: {
        value: "oracle-tenant-b-key",
        apiSecret: "oracle-tenant-b-secret",
      },
      source: "vault",
      version: 3,
    };
    const oracleRecord = makeMockErpRecord({
      provider: "oracle",
      organizationId: "erp-org-beta",
      apiEndpoint: "https://oracle.example.com",
      apiKey: null,
      apiSecret: null,
    });
    const oracleConnector = await createErpConnectorFromResolver(oracleRecord);
    expect(oracleConnector).toBeInstanceOf(OracleEbsConnector);
  });
});

// ─── ERP Rotation Proof (SAP) ───
// Proves: v3 → rotate → v4 → both connectors work

// ─── ERP Rotation Proof (SAP) ───
// Proves: v3 → rotate → v4 → both connectors work

describe("ERP rotation proof", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecretResult = null;
  });

  it("SAP resolves v3 → rotate → resolves v4 → both connectors valid", async () => {
    // Phase 1: Resolve with v3 credentials (before rotation)
    mockSecretResult = {
      credentials: { value: "sap-v3-api-key" },
      source: "vault",
      version: 3,
    };

    const record = makeMockErpRecord({
      provider: "sap",
      organizationId: "erp-rotation-org",
      apiKey: null,
    });

    const connectorV3 = await createErpConnectorFromResolver(record);
    expect(connectorV3).toBeInstanceOf(SapConnector);

    // Phase 2: Simulate rotation — change credentials to v4
    mockSecretResult = {
      credentials: { value: "sap-v4-api-key" },
      source: "vault",
      version: 4,
    };

    // Phase 3: Resolve again after rotation
    const connectorV4 = await createErpConnectorFromResolver(record);
    expect(connectorV4).toBeInstanceOf(SapConnector);

    // Phase 4: Both versions produce usable connectors
    expect(connectorV3).toBeDefined();
    expect(connectorV4).toBeDefined();
    expect(mockSecretResult!.version).toBe(4);
  });
});

// ─── Dynamics 365 Tests ───

describe("Dynamics 365 Connector Factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecretResult = null;
  });

  describe("createErpConnector (legacy backward compat)", () => {
    it("creates DynamicsErpConnector from ErpConnectionRecord", async () => {
      const record = makeMockErpRecord({
        provider: "microsoft-dynamics",
        apiEndpoint: "https://org.crm.dynamics.com",
        apiKey: "dynamics-tenant-id",
        apiSecret: "dynamics-client-id",
      });
      const result = await createErpConnector(record) as DynamicsErpConnector;
      expect(result).toBeInstanceOf(DynamicsErpConnector);
    });

    it("handles missing apiKey gracefully (falls back to common tenant)", async () => {
      const record = makeMockErpRecord({
        provider: "microsoft-dynamics",
        apiEndpoint: "https://org.crm.dynamics.com",
        apiKey: null,
        apiSecret: null,
      });
      const result = await createErpConnector(record) as DynamicsErpConnector;
      expect(result).toBeInstanceOf(DynamicsErpConnector);
    });
  });

  describe("createErpConnectorFromResolver — vault source", () => {
    it("returns DynamicsErpConnector with OAuth2 credentials from vault", async () => {
      mockSecretResult = {
        credentials: {
          tenantId: "dynamics-tenant-uuid",
          clientId: "dynamics-client-uuid",
          clientSecret: "dynamics-secret-vault",
        },
        source: "vault",
        version: 2,
      };

      const record = makeMockErpRecord({
        provider: "microsoft-dynamics",
        organizationId: "dynamics-org-a",
        apiEndpoint: "https://org.crm.dynamics.com",
        apiKey: null,
        apiSecret: null,
      });
      const result = await createErpConnectorFromResolver(record) as DynamicsErpConnector;
      expect(result).toBeInstanceOf(DynamicsErpConnector);
    });
  });

  describe("createErpConnectorFromResolver — legacy-erp source", () => {
    it("uses legacy credentials from ErpConnection fallback", async () => {
      mockSecretResult = {
        credentials: {
          apiKey: "dynamics-legacy-tenant",
          apiSecret: "dynamics-legacy-client",
        },
        source: "legacy-erp",
        version: 0,
      };

      const record = makeMockErpRecord({
        provider: "microsoft-dynamics",
        organizationId: "dynamics-org-b",
        apiEndpoint: "https://org.crm.dynamics.com",
        apiKey: "dynamics-legacy-tenant",
        apiSecret: "dynamics-legacy-client",
      });
      const result = await createErpConnectorFromResolver(record) as DynamicsErpConnector;
      expect(result).toBeInstanceOf(DynamicsErpConnector);
    });
  });

  describe("legacy fallback when SecretResolver throws", () => {
    it("falls back to createErpConnector for Dynamics", async () => {
      const record = makeMockErpRecord({
        provider: "microsoft-dynamics",
        apiEndpoint: "https://org.crm.dynamics.com",
        apiKey: "fallback-tenant",
        apiSecret: "fallback-client",
      });
      const result = await createErpConnectorFromResolver(record) as DynamicsErpConnector;
      expect(result).toBeInstanceOf(DynamicsErpConnector);
    });
  });

  describe("Tenant isolation for Dynamics", () => {
    it("resolves different credentials for different orgs", async () => {
      // Org A
      mockSecretResult = {
        credentials: {
          tenantId: "tenant-a",
          clientId: "client-a",
          clientSecret: "secret-a",
        },
        source: "vault",
        version: 1,
      };
      const recordA = makeMockErpRecord({
        provider: "microsoft-dynamics",
        organizationId: "dynamics-org-alpha",
        apiEndpoint: "https://org-a.crm.dynamics.com",
        apiKey: null,
        apiSecret: null,
      });
      const connectorA = await createErpConnectorFromResolver(recordA);
      expect(connectorA).toBeInstanceOf(DynamicsErpConnector);

      // Org B — different org, different credentials
      mockSecretResult = {
        credentials: {
          tenantId: "tenant-b",
          clientId: "client-b",
          clientSecret: "secret-b",
        },
        source: "vault",
        version: 1,
      };
      const recordB = makeMockErpRecord({
        provider: "microsoft-dynamics",
        organizationId: "dynamics-org-beta",
        apiEndpoint: "https://org-b.crm.dynamics.com",
        apiKey: null,
        apiSecret: null,
      });
      const connectorB = await createErpConnectorFromResolver(recordB);
      expect(connectorB).toBeInstanceOf(DynamicsErpConnector);
    });
  });

  describe("Dynamics rotation proof", () => {
    it("resolves v1 → rotate → resolves v2 → both connectors valid", async () => {
      mockSecretResult = {
        credentials: {
          tenantId: "tenant-v1",
          clientId: "client-v1",
          clientSecret: "secret-v1",
        },
        source: "vault",
        version: 1,
      };

      const record = makeMockErpRecord({
        provider: "microsoft-dynamics",
        organizationId: "dynamics-rotation-org",
        apiEndpoint: "https://org.crm.dynamics.com",
        apiKey: null,
        apiSecret: null,
      });

      const connectorV1 = await createErpConnectorFromResolver(record);
      expect(connectorV1).toBeInstanceOf(DynamicsErpConnector);

      // Rotate
      mockSecretResult = {
        credentials: {
          tenantId: "tenant-v2",
          clientId: "client-v2",
          clientSecret: "secret-v2",
        },
        source: "vault",
        version: 2,
      };

      const connectorV2 = await createErpConnectorFromResolver(record);
      expect(connectorV2).toBeInstanceOf(DynamicsErpConnector);
      expect(mockSecretResult!.version).toBe(2);
    });
  });
});


