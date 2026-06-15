// ─── Integration Abstraction Layer — Shared Types (Sprint 1) ───
// This file defines the contracts for all external provider integrations.
// Products MUST consume interfaces, not implementations.
// Provider selection happens at runtime per tenant via ProviderRegistry.

import type { Prisma } from "@prisma/client";

// ─── Integration Types ───

export enum IntegrationType {
  AI = "AI",
  CRM = "CRM",
  ERP = "ERP",
  STORAGE = "STORAGE",
  EMAIL = "EMAIL",
  WEBHOOK = "WEBHOOK",
}

export enum IntegrationStatus {
  ACTIVE = "ACTIVE",
  ERROR = "ERROR",
  DISABLED = "DISABLED",
  PENDING = "PENDING",
}

// ─── Known Provider IDs ───

export const AI_PROVIDERS = [
  "openai",
  "azure-openai",
  "anthropic",
  "gemini",
  "ollama",
  "vllm",
  "aws-bedrock",
] as const;
export type AIProviderId = (typeof AI_PROVIDERS)[number];

export const CRM_PROVIDERS = [
  "hubspot",
  "salesforce",
  "dynamics",
  "zoho",
  "custom",
] as const;
export type CRMProviderId = (typeof CRM_PROVIDERS)[number];

export const ERP_PROVIDERS = [
  "sap",
  "oracle",
  "dynamics-erp",
  "csv-upload",
  "custom",
] as const;
export type ERPProviderId = (typeof ERP_PROVIDERS)[number];

export const STORAGE_PROVIDERS = ["local", "s3", "azure-blob", "minio"] as const;
export type StorageProviderId = (typeof STORAGE_PROVIDERS)[number];

export const EMAIL_PROVIDERS = ["smtp", "exchange", "resend"] as const;
export type EmailProviderId = (typeof EMAIL_PROVIDERS)[number];

export const WEBHOOK_PROVIDERS = ["generic"] as const;
export type WebhookProviderId = (typeof WEBHOOK_PROVIDERS)[number];

export type AnyProviderId =
  | AIProviderId
  | CRMProviderId
  | ERPProviderId
  | StorageProviderId
  | EmailProviderId
  | WebhookProviderId;

// ─── TenantIntegration DTO ───

export interface TenantIntegrationData {
  id: string;
  organizationId: string;
  type: IntegrationType;
  provider: string;
  displayName: string;
  status: IntegrationStatus;
  priority: number;
  vaultSecretId?: string;
  configMetadata?: Record<string, unknown>;
  lastHealthCheckAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  failureReason?: string;
  failureCount: number;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Provider Factory ───

export interface ProviderFactory {
  create(config: ProviderConfig): Promise<unknown>;
}

export interface ProviderConfig {
  type: IntegrationType;
  provider: string;
  credentials?: Record<string, string>;
  configMetadata?: Record<string, unknown>;
  organizationId: string;
}

// ─── Provider Registry ───

export interface ProviderRegistry {
  register(type: IntegrationType, providerId: string, factory: ProviderFactory): void;
  resolve<T>(organizationId: string, type: IntegrationType): Promise<ResolvedProvider<T>>;
  resolveWithFallback<T>(
    organizationId: string,
    type: IntegrationType,
  ): Promise<ResolvedProvider<T>>;
  healthCheck(organizationId: string, integrationId: string): Promise<HealthCheckResult>;
  listProviders(
    organizationId: string,
    type?: IntegrationType,
  ): Promise<TenantIntegrationData[]>;
}

export interface ResolvedProvider<T> {
  provider: T;
  integration: TenantIntegrationData;
  vaultSecret?: { value: string; version: number };
}

// ─── Provider Contracts ───

export interface ProviderHealth {
  healthy: boolean;
  latencyMs: number;
  lastCheck: Date;
  error?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export interface HealthCheckResult {
  integrationId: string;
  organizationId: string;
  type: IntegrationType;
  provider: string;
  healthy: boolean;
  latencyMs: number;
  error?: string;
  lastCheckAt: Date;
}

// ─── AI Provider Contract ───

export interface AIRequest {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIEmbeddingResponse {
  embeddings: number[][];
  model: string;
  provider: string;
  usage?: { promptTokens: number; totalTokens: number };
}

export interface AIEvaluationResult {
  score: number;
  reasoning: string;
  metrics?: Record<string, number>;
}

export interface AIProvider {
  readonly providerId: string;
  readonly providerType: IntegrationType.AI;

  generate(request: AIRequest): Promise<AIResponse>;
  chat?(messages: AIChatMessage[]): Promise<AIResponse>;
  embed?(input: string | string[]): Promise<AIEmbeddingResponse>;
  evaluate?(prompt: string, output: string): Promise<AIEvaluationResult>;
  health(): Promise<ProviderHealth>;
}

// ─── CRM Provider Contract ───

export interface CRMAccount {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  ownerEmail?: string;
}

export interface CRMContact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface CRMOpportunity {
  id: string;
  accountId: string;
  name: string;
  amount?: number;
  stage?: string;
  closeDate?: string;
}

export interface CRMProvider {
  readonly providerId: string;
  readonly providerType: IntegrationType.CRM;

  getAccounts(since?: Date): Promise<CRMAccount[]>;
  getContacts(since?: Date): Promise<CRMContact[]>;
  getOpportunities(since?: Date): Promise<CRMOpportunity[]>;
  testConnection(): Promise<ConnectionTestResult>;
  health(): Promise<ProviderHealth>;
}

// ─── ERP Provider Contract ───

export interface ERPSpendRecord {
  sourceId: string;
  amount: number;
  currency: string;
  category: string;
  supplierName: string;
  period: string;
}

export interface ERPSupplier {
  sourceId: string;
  name: string;
  registrationNumber?: string;
  locality?: string;
}

export interface ERPProvider {
  readonly providerId: string;
  readonly providerType: IntegrationType.ERP;

  fetchSpendRecords(since?: Date): Promise<ERPSpendRecord[]>;
  fetchSuppliers(since?: Date): Promise<ERPSupplier[]>;
  testConnection(): Promise<ConnectionTestResult>;
  health(): Promise<ProviderHealth>;
}

// ─── Storage Provider Contract ───

export interface StorageFileInput {
  filename: string;
  mimeType: string;
  content: Buffer;
}

export interface StorageFileOutput {
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  content: Buffer;
}

export interface StorageProvider {
  readonly providerId: string;
  readonly providerType: IntegrationType.STORAGE;

  store(key: string, file: StorageFileInput): Promise<string>;
  retrieve(key: string): Promise<StorageFileOutput | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  health(): Promise<ProviderHealth>;
}

// ─── Email Provider Contract ───

export interface EmailSendOptions {
  recipientEmail: string;
  subject: string;
  body: string;
  htmlBody?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  deliveredAt: Date;
  error?: string;
}

export interface EmailProvider {
  readonly providerId: string;
  readonly providerType: IntegrationType.EMAIL;

  send(options: EmailSendOptions): Promise<EmailDeliveryResult>;
  testConnection(): Promise<ConnectionTestResult>;
  health(): Promise<ProviderHealth>;
}

// ─── Webhook Provider Contract ───

export interface WebhookPayload {
  url: string;
  method?: "POST" | "PUT" | "PATCH";
  headers?: Record<string, string>;
  body: unknown;
  secret?: string;
}

export interface WebhookResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  error?: string;
}

export interface WebhookProvider {
  readonly providerId: string;
  readonly providerType: IntegrationType.WEBHOOK;

  send(payload: WebhookPayload): Promise<WebhookResult>;
  health(): Promise<ProviderHealth>;
}

// ─── Prisma Input Types (for TenantIntegration creation/update) ───

export interface TenantIntegrationCreateInput {
  organizationId: string;
  type: IntegrationType;
  provider: string;
  displayName: string;
  status?: IntegrationStatus;
  priority?: number;
  vaultSecretId?: string;
  configMetadata?: Record<string, unknown>;
  createdById?: string;
}

export interface TenantIntegrationUpdateInput {
  displayName?: string;
  status?: IntegrationStatus;
  priority?: number;
  vaultSecretId?: string;
  configMetadata?: Record<string, unknown>;
  lastHealthCheckAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  failureReason?: string;
  failureCount?: number;
}

export type { Prisma };
