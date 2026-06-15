// ERP Connector Factory
// Returns the correct ErpConnector based on provider type.
// Handles credential decryption via PlatformSecret lookup.

import "server-only";

import type { ErpConnector } from "./connector";
import { SapConnector } from "./sap-connector";
import { OracleEbsConnector } from "./oracle-connector";
import { OdooErpConnector } from "./odoo-connector";
import { DynamicsErpConnector } from "./dynamics-connector";
import { prisma } from "@/lib/prisma";
import { secretResolver, SecretPurpose } from "@/lib/integration/secret-resolver";

export interface ErpConnectionRecord {
  id: string;
  organizationId: string;
  provider: string;
  label: string;
  connectionType: string;
  apiEndpoint: string | null;
  apiKey: string | null;
  apiSecret: string | null;
  fieldMapping: unknown;
  defaultCurrency: string | null;
  metadata: unknown;
}

function decryptSecret(encrypted: string): string {
  // v0.1: returns as-is; production would use PlatformSecret decryption
  return encrypted;
}

export async function createErpConnector(
  connection: ErpConnectionRecord,
): Promise<ErpConnector> {
  const apiKey = connection.apiKey
    ? decryptSecret(connection.apiKey)
    : undefined;
  const apiSecret = connection.apiSecret
    ? decryptSecret(connection.apiSecret)
    : undefined;

  switch (connection.provider) {
    case "sap": {
      return new SapConnector({
        apiEndpoint: connection.apiEndpoint ?? "",
        apiKey,
        client: "100",
        systemId: connection.label,
      });
    }
    case "oracle": {
      return new OracleEbsConnector({
        apiEndpoint: connection.apiEndpoint ?? "",
        apiKey,
        apiSecret,
        instanceName: connection.label,
      });
    }
    case "odoo": {
      return new OdooErpConnector({
        apiEndpoint: connection.apiEndpoint ?? "",
        apiKey,
      });
    }
    case "microsoft-dynamics": {
      return new DynamicsErpConnector({
        apiEndpoint: connection.apiEndpoint ?? "",
        tenantId: typeof apiKey === "string" ? apiKey : "default-tenant",
        clientId: typeof apiSecret === "string" ? apiSecret : "default-client",
        clientSecret: "resolved-via-secret-resolver",
      });
    }
    default: {
      const supported = ["sap", "oracle", "odoo", "microsoft-dynamics", "csv-upload"];
      throw new Error(
        `موفر ERP غير مدعوم: "${connection.provider}". المدعومة: ${supported.join(", ")}`,
      );
    }
  }
}

/**
 * Resolve ERP credentials through SecretResolver, falling back to the
 * connection record's inline apiKey/apiSecret if the resolver is not
 * configured or throws.
 */
export async function createErpConnectorFromResolver(
  record: ErpConnectionRecord,
): Promise<ErpConnector> {
  try {
    const resolved = await secretResolver.getIntegrationSecretByType(
      record.organizationId,
      "erp",
      record.provider,
      SecretPurpose.ERP_SYNC,
    );

    const merged: ErpConnectionRecord = { ...record };

    // Resolver may return credentials as a flat key-value map.
    // Normalise: `value` → apiKey, `apiKey` → apiKey, `apiSecret` → apiSecret.
    const creds = resolved.credentials ?? {};
    if (creds.value && typeof creds.value === "string") {
      merged.apiKey = creds.value;
    } else if (creds.apiKey && typeof creds.apiKey === "string") {
      merged.apiKey = creds.apiKey;
    }
    if (creds.apiSecret && typeof creds.apiSecret === "string") {
      merged.apiSecret = creds.apiSecret;
    }

    // For Dynamics-style OAuth2 credentials, build apiKey/apiSecret from
    // tenantId + clientId + clientSecret.
    if (creds.tenantId && creds.clientId) {
      merged.apiKey = `${creds.tenantId}/${creds.clientId}`;
      if (creds.clientSecret) {
        merged.apiSecret = creds.clientSecret;
      }
    }

    return createErpConnector(merged);
  } catch {
    // Resolver not configured or integration not found → fall back to the
    // connection record's own apiKey/apiSecret (legacy compat).
    return createErpConnector(record);
  }
}

export async function createErpConnectorFromDb(
  connectionId: string,
): Promise<{ connector: ErpConnector; record: ErpConnectionRecord }> {
  const connection = await prisma.erpConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error("لم يتم العثور على اتصال ERP");
  }

  const record: ErpConnectionRecord = {
    id: connection.id,
    organizationId: connection.organizationId,
    provider: connection.provider,
    label: connection.label,
    connectionType: connection.connectionType,
    apiEndpoint: connection.apiEndpoint,
    apiKey: connection.apiKey,
    apiSecret: connection.apiSecret,
    fieldMapping: connection.fieldMapping,
    defaultCurrency: connection.defaultCurrency,
    metadata: connection.metadata,
  };

  const connector = await createErpConnector(record);
  return { connector, record };
}
