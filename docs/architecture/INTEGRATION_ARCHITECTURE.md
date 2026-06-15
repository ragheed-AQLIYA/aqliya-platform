# AQLIYA Integration Architecture

**Status:** Active — Sprint 1 Complete · Sprint 2 (Secret Ownership Enforcement) Next  
**Last updated:** 2026-06-08  
**Reading this doc first is mandatory before any provider or integration work.**  
**This doc defines the canonical Integration Abstraction Layer design.**

---

## Table of Contents

1. [Architecture Principle](#1-architecture-principle)
2. [Integration Types](#2-integration-types)
3. [Provider Registry](#3-provider-registry)
4. [Provider Contracts](#4-provider-contracts)
5. [TenantIntegration Model](#5-tenantintegration-model)
6. [Vault Linkage](#6-vault-linkage)
7. [IntegrationResolver — Compatibility Layer](#7-integrationresolver--compatibility-layer)
8. [Migration Strategy](#8-migration-strategy)
9. [Current State vs Target State](#9-current-state-vs-target-state)
10. [Operational Rules](#10-operational-rules)

---

## 1. Architecture Principle

```
AQLIYA products MUST NOT know which provider they are using.

Products know:
  ┌─ AIProvider ─┐    ┌─ CRMProvider ──┐    ┌─ StorageProvider ┐
  │ generate()   │    │ getAccounts()  │    │ store()          │
  │ chat()       │    │ getContacts()  │    │ retrieve()       │
  │ embed()      │    │ getOpps()      │    │ delete()         │
  └──────────────┘    └────────────────┘    └──────────────────┘

Not:
  ┌─ OpenAI ──┐    ┌─ HubSpot ──┐    ┌─ S3 ──┐
  │           │    │            │    │       │
  └───────────┘    └────────────┘    └───────┘
```

### Core Rules

1. **Every integration is owned by exactly one Organization.** No global providers except platform defaults.
2. **Every provider secret lives in Vault, nowhere else.** No env vars, no base64, no plaintext columns.
3. **Products consume interfaces, not implementations.** AuditOS does not import OpenAIProvider.
4. **Provider selection happens at runtime per tenant, not at build time.** `providerRegistry.resolve(orgId, "ai")` not `new OpenAIProvider(...)`.
5. **Legacy connections (CrmConnection, ErpConnection) continue working during migration.** The IntegrationResolver reads from both.

---

## 2. Integration Types

```typescript
export enum IntegrationType {
  AI      = "AI",
  CRM     = "CRM",
  ERP     = "ERP",
  STORAGE = "STORAGE",
  EMAIL   = "EMAIL",
  WEBHOOK = "WEBHOOK",
}
```

### Supported Providers Per Type

| IntegrationType | Provider ID     | Description                | Status       |
|-----------------|-----------------|----------------------------|--------------|
| **AI**          | `openai`        | OpenAI API                 | Planned      |
|                 | `azure-openai`  | Azure OpenAI Service       | Planned      |
|                 | `anthropic`     | Anthropic Claude API       | Planned      |
|                 | `gemini`        | Google Gemini API          | Planned      |
|                 | `ollama`        | Local Ollama instance      | Planned      |
|                 | `vllm`          | vLLM inference server      | Planned      |
|                 | `aws-bedrock`   | Amazon Bedrock             | Planned      |
| **CRM**         | `hubspot`       | HubSpot CRM                | Active       |
|                 | `salesforce`    | Salesforce CRM             | Active       |
|                 | `dynamics`      | Microsoft Dynamics         | Planned      |
|                 | `zoho`          | Zoho CRM                   | Planned      |
|                 | `custom`        | Custom CRM via generic API | Experimental |
| **ERP**         | `sap`           | SAP S/4HANA                | Active (stub)|
|                 | `oracle`        | Oracle EBS                 | Active (stub)|
|                 | `dynamics-erp`  | Microsoft Dynamics ERP     | Planned      |
|                 | `csv-upload`    | CSV file import            | Planned      |
|                 | `custom`        | Custom ERP via generic API | Experimental |
| **STORAGE**     | `local`         | Local filesystem           | Active       |
|                 | `s3`            | AWS S3 / MinIO             | Planned      |
|                 | `azure-blob`    | Azure Blob Storage         | Planned      |
| **EMAIL**       | `smtp`          | Generic SMTP               | Active       |
|                 | `exchange`      | Microsoft Exchange         | Planned      |
|                 | `resend`        | Resend API                 | Planned      |
| **WEBHOOK**     | `generic`       | Generic webhook endpoint   | Active       |

---

## 3. Provider Registry

### Interface

```typescript
export interface ProviderRegistry {
  /** Register a provider factory for a given type and provider ID */
  register(type: IntegrationType, providerId: string, factory: ProviderFactory): void

  /** Resolve a provider for a specific organization */
  resolve<T>(organizationId: string, type: IntegrationType): Promise<ResolvedProvider<T>>

  /** Resolve with fallback chain (try preferred, then configured chain) */
  resolveWithFallback<T>(organizationId: string, type: IntegrationType): Promise<ResolvedProvider<T>>

  /** Test connectivity for an integration */
  healthCheck(organizationId: string, integrationId: string): Promise<HealthCheckResult>

  /** List all registered providers for an organization */
  listProviders(organizationId: string, type?: IntegrationType): Promise<ProviderRegistration[]>
}

export interface ResolvedProvider<T> {
  provider: T
  integration: TenantIntegrationData
  vaultSecret?: VaultSecretResult
}

export interface ProviderFactory {
  create(config: ProviderConfig): Promise<unknown>
}
```

### Resolution Flow

```
organizationId + type
       │
       ▼
IntegrationResolver
       │
       ├── Try TenantIntegration (new)
       │     └── If found → create provider from config + vault
       │
       └── Try Legacy Connection (CrmConnection / ErpConnection)
             └── If found → create provider from legacy config
       
       ▼
  ResolvedProvider<T>
```

---

## 4. Provider Contracts

### 4.1 AI Provider Contract

```typescript
export interface AIProvider {
  readonly providerId: string
  readonly providerType: IntegrationType.AI

  generate(request: AIRequest): Promise<AIResponse>
  chat?(messages: ChatMessage[]): Promise<ChatResponse>
  embed?(input: string | string[]): Promise<EmbeddingResponse>
  evaluate?(prompt: string, output: string): Promise<EvaluationResult>
  health(): Promise<ProviderHealth>
  cost(): Promise<CostEstimate>
}
```

### 4.2 CRM Provider Contract

```typescript
export interface CRMProvider {
  readonly providerId: string
  readonly providerType: IntegrationType.CRM

  getAccounts(since?: Date): Promise<Account[]>
  getContacts(since?: Date): Promise<Contact[]>
  getOpportunities(since?: Date): Promise<Opportunity[]>
  createActivity(activity: ActivityInput): Promise<Activity>
  testConnection(): Promise<ConnectionTestResult>
  health(): Promise<ProviderHealth>
}
```

### 4.3 ERP Provider Contract

```typescript
export interface ERPProvider {
  readonly providerId: string
  readonly providerType: IntegrationType.ERP

  fetchSpendRecords(since?: Date): Promise<SpendRecord[]>
  fetchSuppliers(since?: Date): Promise<Supplier[]>
  fetchProcurementLines(since?: Date): Promise<ProcurementLine[]>
  testConnection(): Promise<ConnectionTestResult>
  health(): Promise<ProviderHealth>
}
```

### 4.4 Storage Provider Contract

```typescript
export interface StorageProvider {
  readonly providerId: string
  readonly providerType: IntegrationType.STORAGE

  store(key: string, file: FileInput): Promise<string>
  retrieve(key: string): Promise<FileOutput | null>
  delete(key: string): Promise<boolean>
  exists(key: string): Promise<boolean>
  health(): Promise<ProviderHealth>
}
```

### 4.5 Email Provider Contract

```typescript
export interface EmailProvider {
  readonly providerId: string
  readonly providerType: IntegrationType.EMAIL

  send(options: EmailSendOptions): Promise<EmailDeliveryResult>
  testConnection(): Promise<ConnectionTestResult>
  health(): Promise<ProviderHealth>
}
```

### 4.6 Webhook Provider Contract

```typescript
export interface WebhookProvider {
  readonly providerId: string
  readonly providerType: IntegrationType.WEBHOOK

  send(payload: WebhookPayload): Promise<WebhookResult>
  health(): Promise<ProviderHealth>
}
```

---

## 5. TenantIntegration Model

### Database Schema (Prisma)

```prisma
enum IntegrationType {
  AI
  CRM
  ERP
  STORAGE
  EMAIL
  WEBHOOK
}

enum IntegrationStatus {
  ACTIVE
  ERROR
  DISABLED
  PENDING
}

model TenantIntegration {
  id              String            @id @default(cuid())
  organizationId  String
  type            IntegrationType
  provider        String            // e.g. "openai", "hubspot", "sap", "s3", "smtp"
  displayName     String
  status          IntegrationStatus @default(PENDING)
  priority        Int               @default(0)       // lower = higher priority for fallback
  vaultSecretId   String?           @unique           // references VaultEntry.id
  configMetadata  Json?             // non-secret config: endpoint URLs, model names, etc.
  lastHealthCheckAt DateTime?
  lastSuccessAt   DateTime?
  lastFailureAt   DateTime?
  failureReason   String?
  failureCount    Int               @default(0)
  createdById     String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  organization    Organization      @relation(fields: [organizationId], references: [id])
  createdBy       User?             @relation(fields: [createdById], references: [id])

  @@unique([organizationId, type, provider])
  @@index([organizationId, type, status])
  @@index([organizationId, type, priority])
  @@index([status, lastHealthCheckAt])
}
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No configEncrypted column** | All secrets in Vault. `vaultSecretId` points to VaultEntry. One source of truth for secrets. |
| **provider as String not enum** | New providers added at runtime without migration. Application-level validation ensures canonical names. |
| **priority field** | Enables fallback chains per organization (e.g., try OpenAI first, Anthropic second). |
| **failure tracking** | `lastFailureAt`, `failureReason`, `failureCount` enables circuit breaker / health routing. |
| **configMetadata as Json** | Non-secret config like model names, endpoints, sync intervals — visible without vault access. |
| **@@unique([orgId, type, provider])** | Ensures one active integration per provider per organization. |

### 5.1 IntegrationHealth Model (Sprint 2.5)

A separate health tracking model that enables ProviderRegistry to make health-aware routing decisions.

```prisma
model IntegrationHealth {
  id                  String            @id @default(cuid())
  organizationId      String
  integrationId       String            // TenantIntegration.id OR legacy connection id
  type                IntegrationType
  provider            String
  status              IntegrationStatus
  latencyMs           Int?
  successCount        Int               @default(0)
  failureCount        Int               @default(0)
  consecutiveFailures Int               @default(0)
  lastSuccessAt       DateTime?
  lastFailureAt       DateTime?
  failureReason       String?
  checkedAt           DateTime          @default(now())

  @@index([organizationId, type, status])
  @@index([integrationId, checkedAt])
  @@index([status, consecutiveFailures])
}
```

**Why separate from TenantIntegration:** Health data is high-volume (checked every N minutes per integration). Keeping it in a separate model avoids bloating TenantIntegration and enables efficient time-series queries (`SELECT * FROM IntegrationHealth WHERE integrationId = X ORDER BY checkedAt DESC`).

**Usage in ProviderRegistry:** `resolveWithFallback()` skips integrations where `consecutiveFailures >= N` or `status = ERROR`, preferring healthy ones with lower `latencyMs`.

**Why successCount + failureCount added upfront:** Enables `successRate = successCount / (successCount + failureCount)` calculation without expensive `COUNT` queries on the health history table. These are cumulative counters per health record row.

**Why lastSuccessAt and lastFailureAt are essential:** `successCount = 5000` with `failureCount = 0` looks perfect — but does not reveal whether the last success was 6 months ago. `lastSuccessAt` detects stale integrations that report high counts but have been silently failing recently. `lastFailureAt` enables alerting on failure recency patterns (e.g., "failed 3 times in last 5 minutes").

**availabilityPercentage (calculated, not stored):** Derived from `successCount / (successCount + failureCount) * 100` within a sliding window. Not stored as a column — computed at query time from the cumulative counters. This feeds `ProviderRegistry.resolveWithFallback()` with success rate, latency, AND availability — not just binary status. 
Example query: `SELECT successCount, failureCount, lastSuccessAt FROM IntegrationHealth WHERE integrationId = X ORDER BY checkedAt DESC LIMIT 1` → compute availability as `successCount / (successCount + failureCount) * 100`.

#### Health State Machine

Raw health metrics are translated into a routing state for `ProviderRegistry.resolveWithFallback()`:

| State | Condition | Routing Behavior |
|-------|-----------|------------------|
| `HEALTHY` | availability ≥ 95% AND consecutiveFailures = 0 AND latencyMs ≤ threshold | Preferred |
| `DEGRADED` | availability ≥ 80% OR consecutiveFailures < 5 OR latencyMs > threshold | Available, lower priority |
| `UNHEALTHY` | availability < 80% OR consecutiveFailures ≥ 5 | Skipped |
| `DISABLED` | `TenantIntegration.status = DISABLED` | Never resolved |

**Why a state machine:** `resolveWithFallback()` needs a binary yes/no/maybe decision, not numeric analysis. The state machine translates metrics into routing decisions without pushing business logic into Sprint 3's registry code. Thresholds are configurable per organization via `configMetadata.healthThresholds` (future capability). Default: availability ≥ 95% healthy, consecutiveFailures ≥ 5 unhealthy.

---

## 6. Vault Linkage

### Current State

```
CrmConnection.accessToken  → Base64 (not real encryption)
ErpConnection.apiKey       → Stub decrypt (returns plaintext)
AI provider keys           → Env vars only
```

### Target State

```
TenantIntegration.vaultSecretId ──▶ VaultEntry
                                        │
                                        ├── key: "integrations/{orgId}/{type}/{provider}"
                                        ├── encryptedValue: AES-256-GCM
                                        ├── organizationId: string
                                        └── category: "integration"
```

### Vault Key Naming Convention

```
integrations/{orgId}/{type}/{provider}
```

Examples:
- `integrations/org_abc/AI/openai`
- `integrations/org_abc/CRM/hubspot`
- `integrations/org_xyz/AI/azure-openai`

### SecretResolver — Sole Authorized Secret Read Path (Sprint 2)

All integration credentials MUST be resolved through `SecretResolver`, not read directly from `process.env`.

```typescript
/** Purpose of secret resolution — enables observability, cost tracking, and audit provenance */
export enum SecretPurpose {
  CRM_SYNC      = "CRM_SYNC",
  ERP_SYNC      = "ERP_SYNC",
  EMAIL_SEND    = "EMAIL_SEND",
  AI_INFERENCE  = "AI_INFERENCE",
  AI_EMBED      = "AI_EMBED",
  AI_EVALUATE   = "AI_EVALUATE",
  HEALTH_CHECK  = "HEALTH_CHECK",
  STORAGE_READ  = "STORAGE_READ",
  STORAGE_WRITE = "STORAGE_WRITE",
  WEBHOOK_SEND  = "WEBHOOK_SEND",
}

export interface SecretResolver {
  /** Resolve credentials for a specific integration.
   *  `purpose` enables provenance tracking in audit events and telemetry.
   *  Sole authorized path for reading integration secrets. */
  getIntegrationSecret(
    organizationId: string,
    integrationId: string,
    purpose: SecretPurpose,
  ): Promise<SecretResult>

  /** Resolve by type+provider for factories that don't have integrationId yet */
  getIntegrationSecretByType(
    organizationId: string,
    type: IntegrationType,
    provider: string,
    purpose: SecretPurpose,
  ): Promise<SecretResult>
}

export interface SecretResult {
  credentials: Record<string, string>  // normalized key-value pairs
  source: 'vault' | 'legacy-crm' | 'legacy-erp'
  vaultEntryId?: string
  version: number                       // secret version — critical for rotation verification
  resolvedAt: Date                       // when the secret was resolved (cache hit or vault read)
  rotatedAt?: Date
}
```

**Why `version` matters:** After `SECRET_ROTATED`, operators and diagnostics need to confirm the connector is using the new version (e.g., `v4`, not `v3`). `version` in `SecretResult` enables:
- Audit evidence: "connector X confirmed on secret v4 at timestamp T"
- Cache invalidation debugging: "resolvedAt vs rotation time"
- Rollback detection: "is the connector still using the old version after rotation?"

**Architectural Rule:** `SecretResolver` is the ONLY code path that reads credentials. Provider implementations call `resolver.getIntegrationSecret()`, never `process.env`. The only exceptions are platform bootstrap secrets (database URL, auth secret, encryption keys).

### SecretResolver Cache Policy

To avoid a Vault read on every provider operation, `SecretResolver` maintains an in-memory cache.

| Property | Value |
|----------|-------|
| Cache type | In-memory (process-local) |
| Default TTL | **5 minutes** |
| Invalidation trigger — `SECRET_ROTATED` | Immediate cache eviction for that integration |
| Invalidation trigger — `SECRET_REVOKED` | Immediate cache eviction for that integration |
| Cache scope | Per `organizationId + integrationId` key |

```
SecretResolver.getIntegrationSecret(orgId, integrationId, purpose)
       │
       ├── Cache hit (TTL valid)?
       │     YES → return cached credentials
       │
       │     NO → VaultService.getSecret(vaultSecretId)
       │             → decrypt
       │             → store in cache (TTL: 5 min)
       │             → metrics: SECRET_USED
       │             → return credentials
       │
       ▼
   On SECRET_ROTATED / SECRET_REVOKED:
       → integrationCache.delete(orgId, integrationId)
```

**Why 5 minutes TTL?** Short enough that a secret rotation propagates within a reasonable window. Long enough that AI inference and CRM sync operations don't hit Vault on every request. 5 minutes is a safe default; organizations can configure per-integration TTL through `configMetadata` in Sprint 3+.

**Cache invalidation guarantee:** `SECRET_ROTATED` and `SECRET_REVOKED` audit events trigger immediate cache eviction, ensuring rotated secrets are picked up within the next resolution call.

### Secret Governance Events (Sprint 2) — Audit Trail

Governance-significant secret operations. These are **human-actionable** events logged in the official `AuditEvent` trail.

| Event | Trigger | Records |
|-------|---------|---------|
| `SECRET_CREATED` | `VaultService.setSecret()` for integration | orgId, integrationId, provider, performedById, purpose |
| `SECRET_ROTATED` | `VaultService.rotateSecret()` | orgId, integrationId, provider, performedById, rotatedAt, purpose |
| `SECRET_REVOKED` | `VaultService.deleteSecret()` or integration disabled | orgId, integrationId, provider, performedById, purpose |
| `SECRET_VIEWED` | Secret value revealed via UI or admin API | orgId, integrationId, provider, performedById, purpose |

**No secret values are ever written to audit logs.**

### Secret Telemetry Events (Sprint 2) — Observability

High-volume operational events: each secret read for provider operation. These go to **metrics and observability**, NOT the audit trail. They include `purpose` for per-use-type breakdown.

| Event | Destination | Records |
|-------|-------------|---------|
| `SECRET_USED` | Metrics counter (Prometheus / OpenTelemetry) | orgId, integrationId, source (vault/legacy), purpose, timestamp |
| `SECRET_FAILED` | Metrics counter + error log | orgId, integrationId, source, purpose, error, timestamp |

**Design rationale:** A single CRM sync may trigger hundreds of `SECRET_USED` events. Writing these to the audit trail would drown governance-significant events in operational noise.

### Secret Resolution Flow

```
ProviderRegistry.resolve(orgId, "AI")
       │
       ▼
   Find TenantIntegration where organizationId=orgId AND type="AI"
       │
       ├── vaultSecretId present?
       │     YES → SecretResolver.getIntegrationSecret(orgId, integrationId, purpose)
       │             → VaultService.getSecret(vaultSecretId)
       │             → decrypt → metrics counter: SECRET_USED
       │             → use as credentials
       │
       │     NO → SecretResolver.getIntegrationSecretByType(orgId, type, provider, purpose)
       │             → Legacy fallback (CrmConnection / ErpConnection)
       │             → metrics counter: SECRET_USED (with source="legacy")
       │
       ▼
   Create provider instance with resolved credentials
```

---

## 7. IntegrationResolver — Compatibility Layer

### Purpose

During migration (Sprint 1-6), the IntegrationResolver provides a unified read path across both new (`TenantIntegration`) and legacy (`CrmConnection`, `ErpConnection`) storage.

### Interface

```typescript
export interface IntegrationRecord {
  id: string
  organizationId: string
  type: IntegrationType
  provider: string
  displayName: string
  status: IntegrationStatus
  priority: number
  vaultSecretId?: string
  configMetadata?: Record<string, unknown>
  lastHealthCheckAt?: Date
  lastSuccessAt?: Date
  lastFailureAt?: Date
  failureReason?: string
  failureCount: number
  createdById?: string
  source: "tenant-integration" | "legacy-crm" | "legacy-erp" | "env-var"
}

export class IntegrationResolver {
  constructor(
    private prisma: PrismaClient,
    private vault: VaultService,
  ) {}

  /**
   * Resolve integrations for an organization.
   * Reads from TenantIntegration first, then falls back to legacy connections.
   */
  async resolveIntegrations(
    organizationId: string,
    type: IntegrationType,
  ): Promise<IntegrationRecord[]>
}
```

### Migration-Aware Resolution

```typescript
// Resolves the "best" integration for a type
async resolveBest(
  organizationId: string,
  type: IntegrationType,
): Promise<ResolvedIntegration | null> {
  // 1. Try ACTIVE TenantIntegration with highest priority
  // 2. Try PENDING TenantIntegration
  // 3. Fall back to legacy CrmConnection / ErpConnection
  // 4. Fall back to env vars (for AI / EMAIL)
}
```

---

## 8. Migration Strategy

### Phase: Current → Transitional → Target

```
Current State                    Transitional State              Target State
─────────────────                ───────────────────             ────────────────────
CrmConnection (active)           CrmConnection (read-only)       (deleted)
ErpConnection  (active)          ErpConnection  (read-only)       (deleted)
Env vars for AI/Email            Env vars (read-only fallback)    (removed)
Vault (standalone, unused)       Vault (wired to integrations)    Vault (sole source)

                                 + TenantIntegration (active)     + TenantIntegration (active)
                                 + IntegrationResolver            + ProviderRegistry only
                                 + ProviderRegistry (new)         (no legacy code path)
```

### Migration Steps Per Sprint

| Sprint | Action | Backward Compat |
|--------|--------|-----------------|
| **Sprint 1** | ✅ Create `TenantIntegration` model + `IntegrationResolver` | ✅ Full backward compat |
| **Sprint 2A** | `SecretResolver` (with `purpose`) + audit events (`SECRET_CREATED`/`ROTATED`/`REVOKED`/`VIEWED`) + telemetry hooks (`SECRET_USED`/`FAILED`) | ✅ Legacy secrets unchanged |
| **Sprint 2B** | Wire CRM + ERP connector factories to `SecretResolver` — **3-wave migration** (see below) | ✅ Fallback to legacy |
| **Sprint 2.5** | Create `IntegrationHealth` model — health check runner, health-aware resolution | ✅ New model only |
| **Sprint 3** | Build `ProviderRegistry` — register AI + Storage providers | ✅ Legacy path continues |
| **Sprint 4** | Migrate AI providers: env vars → TenantIntegration + Vault | ✅ Fallback to env vars |
| **Sprint 5** | Migrate CRM + ERP: CrmConnection → TenantIntegration | ✅ IntegrationResolver reads both |
| **Sprint 6** | Migrate Email + Notifications | ✅ SMTP env vars as fallback |
| **Post Sprint 6** | Remove legacy code paths, drop old columns | ⚠️ Requires validation |

#### Sprint 2B Architectural Rule — No Direct Vault Access From Connectors

No CRM/ERP connector factory may read Vault directly. Every connector calls `SecretResolver.getIntegrationSecret()` exclusively.

```
HubSpotConnector          SalesforceConnector          SAPConnector
      │                          │                         │
      └──────────────────────────┼─────────────────────────┘
                                 ▼
              SecretResolver.getIntegrationSecret(orgId, integrationId, purpose)
                                 │
                                 ▼
                        VaultService.getSecret(vaultSecretId)
```

If any provider reads Vault independently, it is an **architectural violation**. This rule ensures secret read logic, caching, audit events, and telemetry are centralized in `SecretResolver`.

#### Sprint 2B Wave Migration Plan

Sprint 2B is executed in 3 waves, each with build + test verification:

| Wave | Connectors | Auth Complexity | Rollback Risk |
|------|-----------|----------------|---------------|
| 1 | HubSpot | Single token | Very low |
| 2 | Salesforce | OAuth flow | Low |
| 3 | SAP, Oracle ERP, Dynamics CRM | Complex auth | Low (legacy fallback exists) |

**Rule:** No wave proceeds until the previous wave passes `npx tsc --noEmit`, `npm test`, and `npm run build`. Each wave is a separate PR with its own merge and verification.

### No-Break Guarantee

At every migration step:
1. Write to new path
2. Read from new path with fallback to old
3. Verify all existing functionality
4. Only then schedule old path removal

---

## 9. Current State vs Target State

| Dimension | Current | Target |
|-----------|---------|--------|
| AI providers | Hardcoded in orchestrator, env vars only | TenantIntegration + Vault + Registry |
| CRM storage | CrmConnection (base64 secrets) | TenantIntegration (vault secrets) |
| ERP storage | ErpConnection (plaintext secrets) | TenantIntegration (vault secrets) |
| Storage routing | Global STORAGE_PROVIDER env var | Per-tenant StorageProvider from registry |
| Email routing | Single SMTP from env vars | Per-tenant EmailProvider from registry |
| Secrets | Scattered (base64, plaintext, env vars) | Centralized in Vault (AES-256-GCM) |
| Provider selection | Hardcoded fallback chain | Dynamic per-tenant fallback with priority |
| Provider discovery | Not possible | `listProviders(orgId, type)` |
| Health monitoring | Per-connector only | Unified health dashboard with lastHealthCheck |

---

## 10. Operational Rules

### R1 — No Direct Provider Instantiation

```typescript
// ❌ WRONG — never do this
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ✅ CORRECT — always use registry
const provider = await providerRegistry.resolve<AIProvider>(orgId, IntegrationType.AI)
const result = await provider.generate(request)
```

### R2 — No Direct Env Var Access in Provider Implementations (Sprint 2 Enforcement)

```typescript
// ❌ WRONG — after Sprint 2 enforcement
const apiKey = process.env.HUBSPOT_ACCESS_TOKEN
const connector = new HubSpotConnector(apiKey)

// ✅ CORRECT — always use SecretResolver
const secret = await secretResolver.getIntegrationSecretByType(
  orgId, IntegrationType.CRM, 'hubspot'
)
const connector = new HubSpotConnector(secret.credentials)
```

**Exception:** Platform bootstrap secrets only (`DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY`, `SENTRY_DSN`). These are not integration secrets.

**Audit rule:** Every resolved secret generates a `SECRET_ACCESSED` audit event with organizationId, integrationId, source (vault/legacy), and timestamp — but never the secret value itself.

### R3 — Every New Integration Goes Through TenantIntegration

From Sprint 1 onwards, any new integration type or provider must:
1. Define its provider contract
2. Register in the ProviderRegistry
3. Store config in TenantIntegration
4. Store secrets in Vault

### R4 — Legacy Code Paths Are Read-Only During Migration

During migration:
- Old tables can be read for compatibility
- Old tables must NOT be written to after migration
- New writes always go to TenantIntegration

### R5 — Products Must Not Import Providers Directly

Products import:
- Provider contracts (interfaces only)
- ProviderRegistry
- Integration types

Products must NOT import:
- Individual provider implementations (OpenAIProvider, HubSpotConnector, etc.)
- Direct API client libraries

---

## Appendix: Migration Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-08 | Separate TenantIntegration model instead of polymorphic single-table | Clear type safety, Prisma enum validation, per-type indexing |
| 2026-06-08 | vaultSecretId as optional (nullable) | Enables gradual migration — legacy integrations work without vault during transition |
| 2026-06-08 | provider as String not enum | New providers at runtime without migration; validation at application layer |
| 2026-06-08 | Priority-based fallback instead of hardcoded chain | Each organization defines its own preference; platform default as fallback |
| 2026-06-08 | Sprint 2 refined to Secret Ownership Enforcement (not just Vault wiring) | Architectural rule: no provider reads process.env. SecretResolver as sole read path. Audit events for secret lifecycle. |
| 2026-06-08 | Sprint 2.5 (IntegrationHealth) inserted between Sprint 2 and 3 | ProviderRegistry needs health data for fallback routing; cannot be built without it. |
| 2026-06-08 | CRM+ERP first in Sprint 2, AI excluded until Sprint 4 | CRM/ERP are read-only data sources with existing fallback paths; AI has complex orchestration chains. |
| 2026-06-08 | SECRET_ACCESSED split into SECRET_VIEWED (audit) + SECRET_USED (telemetry) | Governance vs operations separation. High-volume operational events must not drown audit trail. |
| 2026-06-08 | `purpose` parameter mandatory on every SecretResolver call | Provenance tracking — enables answering "who used which secret and why" in audit + observability |
| 2026-06-08 | SecretResolver in-memory cache with 5-minute TTL | Avoid Vault read on every provider operation; rotation propagates within 5 min window |
| 2026-06-08 | Connectors must NOT read Vault directly — only through SecretResolver | Centralized secret read logic, cache, audit events, and telemetry in one place |
| 2026-06-08 | IntegrationHealth gets successCount + failureCount upfront | enables successRate without expensive COUNT queries on health history table |
| 2026-06-08 | Sprint 2A before 2B: infrastructure before connector migration | SecretResolver + audit + telemetry must exist before connectors depend on them |
| 2026-06-08 | `SecretResult.version` added for rotation verification | After SECRET_ROTATED, operators need to confirm connector is using new version (v4 not v3) |
| 2026-06-08 | Sprint 2B executed in 3 waves (HubSpot → Salesforce → SAP+Oracle) | Each wave has clear rollback point; HubSpot (simple auth) → Salesforce (OAuth) → SAP/Oracle (complex) |
| 2026-06-08 | Post-Sprint 2A Verification required: concurrency, rotation-under-load, cache pressure | Level 5 proof alone is insufficient for pre-production. Three load verifications required before Sprint 2B begins. |
| 2026-06-08 | IntegrationHealth adds availabilityPercentage (calculated) | ProviderRegistry.resolveWithFallback() needs success rate, latency, AND availability — not just binary success/failure |
| 2026-06-08 | Health State Machine (HEALTHY/DEGRADED/UNHEALTHY/DISABLED) derived from metrics | resolveWithFallback() needs binary yes/no/maybe, not raw numeric analysis |
| 2026-06-08 | All Sprint 2A verifications must be reproducible via npm test scripts | Evidence that cannot be reproduced by another team member is not evidence |

---

*This document is the canonical reference for the Integration Abstraction Layer. It overrides any conflicting documentation about provider architecture or integration patterns.*
