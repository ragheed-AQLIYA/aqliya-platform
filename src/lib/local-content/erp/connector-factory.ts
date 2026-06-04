// ERP Connector Factory
// Returns the correct ErpConnector based on provider type.
// Handles credential decryption via PlatformSecret lookup.

import "server-only";

import type { ErpConnector } from "./connector";
import { SapConnector } from "./sap-connector";
import { OracleEbsConnector } from "./oracle-connector";
import { prisma } from "@/lib/prisma";

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
    default: {
      const supported = ["sap", "oracle", "microsoft-dynamics", "csv-upload"];
      throw new Error(
        `موفر ERP غير مدعوم: "${connection.provider}". المدعومة: ${supported.join(", ")}`,
      );
    }
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
