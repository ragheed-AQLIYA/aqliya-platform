import { describe, expect, it, jest, beforeEach } from "@jest/globals";

const mockGetIntegrationSecretByType = jest.fn<() => Promise<{
  credentials: Record<string, string>;
  source: string;
  version: number;
  resolvedAt: Date;
  cacheHit: boolean;
}>>();

jest.mock("@/lib/integration/secret-resolver", () => ({
  secretResolver: {
    getIntegrationSecretByType: mockGetIntegrationSecretByType,
  },
  SecretPurpose: {
    EMAIL_SEND: "EMAIL_SEND",
  },
}));

import { resolveSmtpConfigFromResolver } from "../email-factory";

function makeSecretResult(overrides: Record<string, unknown> = {}) {
  return {
    credentials: { value: "default" },
    source: "vault" as const,
    version: 2,
    resolvedAt: new Date(),
    cacheHit: false,
    ...overrides,
  };
}

describe("Email Factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("resolveSmtpConfigFromResolver", () => {
    it("resolves SMTP config from vault", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({
          credentials: {
            host: "smtp.vault.com",
            port: "587",
            user: "vault-user",
            pass: "vault-pass",
            from: "vault@example.com",
          },
        }),
      );

      const config = await resolveSmtpConfigFromResolver("org-1");
      expect(config).not.toBeNull();
      expect(config!.host).toBe("smtp.vault.com");
      expect(config!.port).toBe(587);
      expect(config!.user).toBe("vault-user");
      expect(config!.pass).toBe("vault-pass");
      expect(config!.from).toBe("vault@example.com");
    });

    it("uses smtpHost/smtpUser/smtpPass keys as fallback", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({
          credentials: {
            smtpHost: "alt.smtp.com",
            smtpPort: "465",
            smtpUser: "alt-user",
            smtpPass: "alt-pass",
            smtpFrom: "alt@example.com",
            smtpSecure: "true",
          },
        }),
      );

      const config = await resolveSmtpConfigFromResolver("org-2");
      expect(config).not.toBeNull();
      expect(config!.host).toBe("alt.smtp.com");
      expect(config!.port).toBe(465);
      expect(config!.secure).toBe(true);
    });

    it("returns null when resolver throws (env fallback expected)", async () => {
      mockGetIntegrationSecretByType.mockRejectedValueOnce(new Error("Not found"));
      const config = await resolveSmtpConfigFromResolver("org-3");
      expect(config).toBeNull();
    });

    it("returns null when vault response lacks required host/user/pass", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({
          credentials: { from: "partial@example.com" }, // missing host/user/pass
        }),
      );

      const config = await resolveSmtpConfigFromResolver("org-4");
      expect(config).toBeNull();
    });

    it("parses port string correctly", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({
          credentials: {
            host: "smtp.example.com",
            port: "465",
            user: "u",
            pass: "p",
          },
        }),
      );

      const config = await resolveSmtpConfigFromResolver("org-5");
      expect(config!.port).toBe(465);
    });

    it("defaults port to 587 when port is missing", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({
          credentials: {
            host: "smtp.example.com",
            user: "u",
            pass: "p",
          },
        }),
      );

      const config = await resolveSmtpConfigFromResolver("org-6");
      expect(config!.port).toBe(587);
    });

    it("defaults from address when not provided", async () => {
      mockGetIntegrationSecretByType.mockResolvedValueOnce(
        makeSecretResult({
          credentials: {
            host: "smtp.example.com",
            user: "u",
            pass: "p",
          },
        }),
      );

      const config = await resolveSmtpConfigFromResolver("org-7");
      expect(config!.from).toBe("noreply@aqliya.ai");
    });
  });
});
