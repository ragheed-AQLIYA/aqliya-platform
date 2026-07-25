import type { ProviderFactory, ProviderConfig } from "../types";

export const smtpFactory: ProviderFactory = {
  async create(config: ProviderConfig) {
    const { SmtpEmailProviderAdapter } = await import(
      "@/lib/platform/notification/email-provider-adapter"
    );
    return new SmtpEmailProviderAdapter({
      host: config.credentials?.host ?? (config.configMetadata?.host as string) ?? "",
      port: parseInt(config.credentials?.port ?? "587", 10),
      user: config.credentials?.user ?? (config.configMetadata?.user as string) ?? "",
      pass: config.credentials?.pass ?? (config.configMetadata?.pass as string) ?? "",
      from: config.credentials?.from ?? (config.configMetadata?.from as string) ?? "noreply@aqliya.ai",
      secure: config.credentials?.secure === "true",
    });
  },
};
