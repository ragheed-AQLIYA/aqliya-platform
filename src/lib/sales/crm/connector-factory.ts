import "server-only";

import type { CrmConnection } from "@prisma/client";
import type { CrmConnector } from "./connector";
import { HubSpotConnector } from "./hubspot-connector";
import { SalesforceConnector } from "./salesforce-connector";
import { CrmConnectionError } from "./types";

function decryptValue(encrypted?: string | null): string | undefined {
  if (!encrypted) return undefined;
  try {
    const decoded = Buffer.from(encrypted, "base64").toString("utf-8");
    return decoded;
  } catch {
    return encrypted;
  }
}

export function createConnector(connection: CrmConnection): CrmConnector {
  const provider = connection.provider;

  switch (provider) {
    case "hubspot": {
      const accessToken = decryptValue(connection.accessToken);
      const apiKey = decryptValue(connection.apiKey);
      return new HubSpotConnector({
        accessToken,
        apiKey,
        apiEndpoint: connection.apiEndpoint ?? undefined,
      });
    }

    case "salesforce": {
      const accessToken = decryptValue(connection.accessToken);
      const refreshToken = decryptValue(connection.refreshToken);

      const metadata = (connection.metadata as Record<string, string | undefined>) ?? {};
      return new SalesforceConnector({
        instanceUrl: connection.apiEndpoint ?? metadata.instanceUrl ?? "",
        clientId: metadata.clientId ?? "",
        clientSecret: metadata.clientSecret,
        username: metadata.username,
        password: metadata.password,
        accessToken,
        refreshToken,
        apiVersion: connection.apiVersion ?? "v60.0",
      });
    }

    case "apollo":
    case "custom":
      throw new CrmConnectionError(
        `CRM provider "${provider}" not yet supported`,
        provider,
      );

    default:
      throw new CrmConnectionError(
        `Unknown CRM provider: "${provider}"`,
        "custom",
      );
  }
}
