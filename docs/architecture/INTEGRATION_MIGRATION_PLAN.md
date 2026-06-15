# Integration Abstraction Layer — Migration Plan

**Status:** Active — Sprint 1 Migration Strategy  
**Last updated:** 2026-06-08  

---

## 1. Migration Principle

**Do not break what works. Add the new layer alongside the old. Migrate gradually.**

This document defines exactly how AQLIYA transitions from hardcoded provider usage to a unified Integration Abstraction Layer, without breaking existing products (AuditOS, DecisionOS, SalesOS, LocalContentOS).

---

## 2. Current State → Transitional State → Target State

```
                        Current (Sprint 0)              Transitional (Sprint 1-6)         Target (Post Sprint 6)
                        ═══════════════════              ════════════════════════          ═══════════════════════

AI Provider Config      Env vars only                   Env vars + TenantIntegration       TenantIntegration only
                        (OPENAI_API_KEY,                 (IntegrationResolver falls         (env vars removed)
                         ANTHROPIC_API_KEY)               back to env vars)

CRM Provider Storage    CrmConnection (base64)           CrmConnection (read-only)           TenantIntegration + Vault
                                                        + TenantIntegration (write)
                        accessToken, refreshToken,       vaultSecretId → VaultEntry
                        apiKey in plain columns

ERP Provider Storage    ErpConnection (plaintext)        ErpConnection (read-only)           TenantIntegration + Vault
                                                        + TenantIntegration (write)
                        apiKey, apiSecret in plain       vaultSecretId → VaultEntry
                        columns

Storage Routing         Global STORAGE_PROVIDER          Global + TenantIntegration           TenantIntegration only
                        env var                          (per-tenant override possible)

Email Routing           Global SMTP env vars             Global SMTP + TenantIntegration     TenantIntegration only
                                                        (per-tenant SMTP override)

Secrets Management      Scattered:                       Unified:                             Unified:
                        - Base64 in CrmConnection        - Vault for new integrations         - Vault for ALL
                        - Plaintext in ErpConnection     - Legacy tables frozen
                        - Env vars everywhere            - Read compatibility layer

Provider Registry       None (hardcoded orchestrator)    ProviderRegistry (new)               ProviderRegistry only
                                                        + legacy factory fallback

Product Awareness       Products know providers         Products know interfaces             Products know interfaces
                        (AuditOS imports OpenAI)         (AuditOS imports AIProvider)         (AIProvider only)
```

---

## 3. Migration Steps Per Sprint

### Sprint 1 — Integration Foundation (✅ Complete)

**Action:** Create TenantIntegration model + IntegrationResolver + Architecture Spec

| What | Type | Backward Compat |
|------|------|-----------------|
| Create `IntegrationType` enum | Prisma enum | ✅ Full compat |
| Create `IntegrationStatus` enum | Prisma enum | ✅ Full compat |
| Create `TenantIntegration` model | Prisma model | ✅ Full compat |
| Add relation to `Organization` | Prisma relation | ✅ Full compat |
| Create `src/lib/integration/types.ts` | TS types/interfaces | ✅ Full compat |
| Create `src/lib/integration/resolver.ts` | TS service | ✅ Full compat (reads new + legacy) |
| Create `src/lib/integration/index.ts` | Module public API | ✅ Full compat |
| Create `docs/architecture/INTEGRATION_ARCHITECTURE.md` | Doc | ✅ Read-only |
| Create `docs/architecture/INTEGRATION_MIGRATION_PLAN.md` | Doc | ✅ Read-only |

**Risk:** None. Everything is additive.

### Sprint 2A — SecretResolver + Audit + Telemetry (🔄 Refined)

**Action:** Create `SecretResolver` with `purpose` provenance. Governance events in audit trail. Telemetry events in observability. CRM/ERP migration in Sprint 2B.

**Risk:** Low. Legacy connections continue working unchanged. No connector is forced to migrate — only the credential *read path* changes.

#### D2A.1 — SecretResolver (with `purpose`)

Create a `SecretResolver` service that is the **sole authorized path** for reading integration secrets. Every resolution includes a `purpose` field for provenance tracking.

```typescript
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
  getIntegrationSecret(
    organizationId: string,
    integrationId: string,
    purpose: SecretPurpose,
  ): Promise<SecretResult>

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

**Key rule:** `SecretResolver` is the ONLY code path that reads credentials. Provider implementations call `resolver.getIntegrationSecret()`, never `process.env`.

#### D2A.1.a — SecretResolver Cache Policy

`SecretResolver` maintains an in-memory cache to avoid a Vault read on every provider operation.

| Property | Value |
|----------|-------|
| Cache type | In-memory (process-local) |
| Default TTL | **5 minutes** |
| Invalidation — `SECRET_ROTATED` | Immediate eviction |
| Invalidation — `SECRET_REVOKED` | Immediate eviction |
| Cache scope | Per `organizationId + integrationId` |

```
SecretResolver.getIntegrationSecret(orgId, integrationId, purpose)
  → Cache hit & TTL valid? → return cached
  → Cache miss → Vault → decrypt → cache (TTL: 5 min) → return
  → On SECRET_ROTATED / SECRET_REVOKED: cache.delete(key)
```

**Rationale:** 5 min TTL balances propagation speed (<5 min after rotation) against avoiding Vault reads on every request. Short enough for enterprise compliance, long enough for AI inference workloads.

#### D2A.2 — Audit Events (Governance)

Governance-significant operations — written to the official `AuditEvent` trail. These are human-actionable events.

| Event | Trigger | Records |
|-------|---------|---------|
| `SECRET_CREATED` | `VaultService.setSecret()` for integration | orgId, integrationId, provider, performedById, purpose |
| `SECRET_ROTATED` | `VaultService.rotateSecret()` | orgId, integrationId, provider, performedById, rotatedAt |
| `SECRET_REVOKED` | `VaultService.deleteSecret()` or integration disabled | orgId, integrationId, provider, performedById |
| `SECRET_VIEWED` | Secret revealed via UI or admin API | orgId, integrationId, provider, performedById, purpose |

Each event records `purpose` and `source`. No secret values in audit logs.

#### D2A.3 — Telemetry Events (Operations)

High-volume operational events — go to metrics counters (Prometheus/OpenTelemetry), NOT the audit trail.

| Event | Destination | Records |
|-------|-------------|---------|
| `SECRET_USED` | Metrics counter (increment) | orgId, integrationId, source, purpose |
| `SECRET_FAILED` | Metrics counter + error log | orgId, integrationId, source, purpose, error |

**Why separate from audit:** A single CRM sync may trigger hundreds of `SECRET_USED` events. Writing these to the audit trail would drown governance-significant events in operational noise.

#### D2A.4 — Telemetry Hook in SecretResolver

The `SecretResolver` implementation emits `SECRET_USED` / `SECRET_FAILED` as part of its resolution lifecycle. Connectors don't need to instrument it manually.

```
SecretResolver.getIntegrationSecret(orgId, integrationId, purpose)
  → vault lookup or legacy fallback
  → on success: metrics.counter('secret.used').add(1, { orgId, source, purpose })
  → on failure: metrics.counter('secret.failed').add(1, { orgId, source, purpose, error })
  → return SecretResult
```

#### D2A.5 — AI Providers NOT Touched

AI providers have complex initialization chains (orchestrators, tool resolvers, prompt contexts). They are left for Sprint 4 as originally planned.

---

### Sprint 2B — CRM + ERP Connector Migration (🔄 Split from Sprint 2)

**Action:** Wire CRM and ERP connector factories to use `SecretResolver` instead of `process.env`.

**Risk:** Low. Each connector has an existing legacy fallback path. No product code changes.

| Connector | Current Secret Source | New Source | Risk |
|-----------|---------------------|------------|------|
| HubSpot | `process.env.HUBSPOT_ACCESS_TOKEN` or `CrmConnection.accessToken` | `SecretResolver` → Vault or legacy | Low |
| Salesforce | `process.env.SALESFORCE_*` or `CrmConnection.accessToken` | `SecretResolver` → Vault or legacy | Low |
| SAP | `process.env.SAP_*` or `ErpConnection.apiKey` | `SecretResolver` → Vault or legacy | Low |
| Oracle ERP | `process.env.ORACLE_*` or `ErpConnection.apiKey` | `SecretResolver` → Vault or legacy | Low |
| Dynamics CRM | `process.env.DYNAMICS_*` or `CrmConnection.accessToken` | `SecretResolver` → Vault or legacy | Low |

**Key rule:** CRM and ERP are data sources (read operations), not decision outputs — making them the safest first migration target.

**Architectural rule — no direct Vault access from connectors:**
No connector factory may read Vault directly. Every connector calls `SecretResolver.getIntegrationSecret()` exclusively.
```
HubSpotConnector             SalesforceConnector
      │                              │
      ▼                              ▼
SecretResolver.getIntegrationSecret(orgId, integrationId, purpose)
      │
      ▼
VaultService (only SecretResolver touches this)
```
If any provider reads Vault independently, it is an **architectural violation**. This ensures secret read logic, caching, audit events, and telemetry are centralized in one place.

#### Sprint 2B Wave Migration Plan

Do not migrate all connectors in a single PR. Execute in waves with build + tests after each:

```
Wave 1     HubSpot          → SecretResolver    Verify + Build + Tests
Wave 2     Salesforce       → SecretResolver    Verify + Build + Tests
Wave 3     SAP + Oracle ERP + Dynamics CRM      Verify + Build + Tests
```

**Gate rule — each wave blocks the next:**

```
Wave 1: HubSpot
    ↓
  [Gate: Build PASS + Tests PASS + Migration Verification PASS + Compliance (0 direct vault access)]
    ↓
Wave 2: Salesforce
    ↓
  [Gate: Build PASS + Tests PASS + Migration Verification PASS + Compliance (0 direct vault access)]
    ↓
Wave 3: SAP + Oracle ERP + Dynamics CRM
    ↓
  [Gate: Full Sprint 2B sign-off]
```

**No wave may skip the gate. No two waves in the same PR.**

**Rationale:**
- Each wave has a clear rollback point — if HubSpot migration behaves unexpectedly, only HubSpot is affected
- Build + test after each wave prevents compounding errors across connectors
- HubSpot first because it has the simplest auth (single token); Salesforce second (OAuth); SAP/Oracle last (complex auth flows)
- `CrmConnection` / `ErpConnection` remain as fallback throughout — no connector breaks if migration is incomplete

---

### Sprint 2.5 — Integration Health Model

**Action:** Create `IntegrationHealth` model so ProviderRegistry (Sprint 3) can route based on health state.

| What | Type | Backward Compat |
|------|------|-----------------|
| Create `IntegrationHealth` Prisma model | Data | ✅ New model only |
| Create health check runner (per-org, per-integration) | Code | ✅ New code only |
| Wire health checks into `TenantIntegration.lastHealthCheckAt` / `lastSuccessAt` / `lastFailureAt` | Code | ✅ Updates existing model |
| Add `IntegrationHealth` to IntegrationResolver's return type | Code | ✅ Non-breaking addition |
| Expose `healthCheck(orgId, integrationId)` on resolver | Code | ✅ New method |

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

**Why successCount + failureCount:** Enables `successRate = successCount / (successCount + failureCount)` without expensive `COUNT` queries on the health history table.

**Why here (before Sprint 3):** ProviderRegistry needs health data to implement `resolveWithFallback()` — it must skip unhealthy providers and prefer healthy ones. Without IntegrationHealth, the registry would have no basis for routing decisions.

**Risk:** None. Additive model only. No migration, no legacy impact.

#### Health State Machine

IntegrationHealth derives a health **state** from raw metrics. Not stored as a column — computed from `availabilityPercentage`, `consecutiveFailures`, `latencyMs`.

| State | Condition | Routing Behavior |
|-------|-----------|------------------|
| `HEALTHY` | availability ≥ 95% AND consecutiveFailures = 0 AND latencyMs ≤ threshold | Preferred by `resolveWithFallback()` |
| `DEGRADED` | availability ≥ 80% OR consecutiveFailures < 5 OR latencyMs > threshold | Available but lower priority |
| `UNHEALTHY` | availability < 80% OR consecutiveFailures ≥ 5 | Skipped by `resolveWithFallback()` |
| `DISABLED` | `TenantIntegration.status = DISABLED` | Never resolved |

**Why a state machine instead of raw numbers:** `ProviderRegistry.resolveWithFallback()` needs a binary yes/no/maybe decision, not numeric analysis. The state machine translates raw metrics into routing decisions without pushing business logic into Sprint 3's registry code.

**Thresholds are configurable per organization** via `TenantIntegration.configMetadata.healthThresholds` (future Sprint capability). Defaults: availability ≥ 95% healthy, consecutiveFailures ≥ 5 unhealthy, latencyMs varies by integration type.

---

### Go / No-Go Criteria for Sprint 2

Sprint 2 is complete only when the following scenario works end-to-end:

```text
Organization A    Organization B    Organization C
Salesforce         HubSpot           SAP
```

All three:

```
✓ Credentials stored in Vault (AES-256-GCM)
✓ Credentials NOT sourced from process.env
✓ Credentials rotatable via VaultService.rotateSecret()
✓ Credentials revocable via VaultService.deleteSecret() / integration disable
✓ Secret usage monitorable via metrics counters (SECRET_USED / SECRET_FAILED)
✓ Secret governance auditable via AuditEvent (SECRET_CREATED / SECRET_ROTATED / SECRET_REVOKED / SECRET_VIEWED)
✓ Each secret read includes a `purpose` for provenance
✓ No system restart required to rotate or revoke
```

### Sprint 3 Gate — Hard Block

Sprint 3 (ProviderRegistry) MAY NOT START until all of the following are satisfied:

```
[ ] Sprint 2A complete — SecretResolver, audit, telemetry proven
[ ] Sprint 2B complete — HubSpot + Salesforce + SAP/Oracle migrated
[ ] Sprint 2.5 complete — IntegrationHealth model + runner + state machine
[ ] HubSpot migration verified (Wave 1 gate passed)
[ ] Salesforce migration verified (Wave 2 gate passed)
[ ] IntegrationHealth collecting real data from at least one integration
[ ] Rotation Proof reproducible — npm run test:secret-rotation passes
[ ] Concurrency Proof reproducible — npm run test:secret-concurrency passes
[ ] Zero direct Vault violations — compliance scan PASS
[ ] Zero process.env violations — compliance scan PASS
```

**Rationale:** ProviderRegistry without real health data from IntegrationHealth and proven SecretResolver is just another abstraction layer. The gate ensures Sprint 3 is built on evidence, not design documents.

### Sprint 3 — Provider Registry

**Action:** Build ProviderRegistry. Register AI + Storage providers.

| What | Type | Backward Compat |
|------|------|-----------------|
| Build `ProviderRegistry` class | Code change | ✅ Full compat |
| Register AI provider factories (OpenAI, Anthropic, Deterministic, Local) | Code change | ✅ Full compat |
| Register Storage provider factories (Local, S3 stub, Azure Blob stub) | Code change | ✅ Full compat |
| Create `resolveBestProvider(orgId, type)` | Code change | ✅ Fallback to existing orchestrator |
| Use `IntegrationHealth` for health-aware routing | Code change | ✅ Non-breaking |
| Add budget/tenant-aware AI resolution | Code change | ✅ Backward compat with env var fallback |

**Risk:** Medium. The orchestrator needs careful testing to ensure existing AI flows still work.

### Sprint 4 — AI + Storage Migration

**Action:** Migrate AI providers from env vars to TenantIntegration + Vault.

| What | Type | Backward Compat |
|------|------|-----------------|
| Create migration script: env vars → TenantIntegration | Script | ✅ Env vars kept as fallback |
| Update AIOrchestrator to use ProviderRegistry | Code change | ✅ Fallback to hardcoded |
| Update StorageProvider factory to use TenantIntegration | Code change | ✅ Fallback to env var |
| Add per-tenant AI provider selection | Code change | ✅ Default = env var behavior |
| Remove env var fallback for AI (in staging first) | Config | ⚠️ Staging only |

**Risk:** Medium. Must test every AI product flow (AuditOS AI review, DecisionOS recommendations, Office AI Assistant).

### Sprint 5 — CRM + ERP Migration

**Action:** Migrate existing CrmConnection/ErpConnection records to TenantIntegration + Vault.

| What | Type | Backward Compat |
|------|------|-----------------|
| Create migration script: CrmConnection → TenantIntegration | Script | ✅ Legacy tables read-only |
| Create migration script: ErpConnection → TenantIntegration | Script | ✅ Legacy tables read-only |
| Update CRM factory to prefer TenantIntegration | Code change | ✅ Fallback to CrmConnection |
| Update ERP factory to prefer TenantIntegration | Code change | ✅ Fallback to ErpConnection |
| Migrate existing base64 secrets to Vault | Script | 🔴 One-time operation (reversible) |

**Risk:** High for existing connected CRMs/ERPs. Must have rollback plan.

### Sprint 6 — Email + Notification Migration

**Action:** Migrate email and webhook routing to TenantIntegration.

| What | Type | Backward Compat |
|------|------|-----------------|
| Create EmailProvider interface if not exists | Code change | ✅ New code only |
| Create SMTP provider implementation | Code change | ✅ Same behavior as current |
| Create Exchange provider (stub) | Code change | ✅ New |
| Create Resend provider (stub) | Code change | ✅ New |
| Update notification engine to use ProviderRegistry | Code change | ✅ Fallback to env vars |
| Update webhook routing to use TenantIntegration | Code change | ✅ Fallback to org metadata |

**Risk:** Medium. Email is critical for notifications.

### Post Sprint 6 — Cleanup

**Action:** Remove legacy code paths. Drop old columns.

| What | Type | Risk |
|------|------|------|
| Remove `CrmConnection` table (after data verified migrated) | Prisma migration | 🔴 High |
| Remove `ErpConnection` table (after data verified migrated) | Prisma migration | 🔴 High |
| Remove env var fallback in AI providers | Code change | Medium |
| Remove env var fallback in Storage provider | Code change | Medium |
| Remove env var fallback in Email | Code change | Medium |
| Update all tests to use new paths | Test update | Medium |

**All Post-Sprint-6 changes require explicit approval and thorough validation.**

---

## 4. Rollback Plan

| Scenario | Detection | Action | Recovery Time |
|----------|-----------|--------|---------------|
| Provider resolution fails for AI | AI features return errors or fall back to deterministic | Re-enable env var path, disable TenantIntegration lookup | Minutes |
| CRM sync broken for migrated orgs | Sync errors in logs, operator alerts | Re-enable CrmConnection reads, freeze TenantIntegration for CRM | Minutes |
| ERP import broken | Import fails, batch stuck | Same as CRM rollback | Minutes |
| Vault secret resolution fails | Provider creation throws "secret not found" | Fall back to legacy credential storage | Automatic |
| Migration script corrupts data | Verification checksum mismatch | Restore from backup, re-run script with fix | Hours |

**Golden rule:** Every migration step must have a `--dry-run` mode and a documented rollback procedure before execution.

---

## 5. Data Migration Details

### 5.1 CRM: CrmConnection → TenantIntegration

```sql
-- Pseudocode for migration script
INSERT INTO TenantIntegration (
  id, organizationId, type, provider, displayName, status, priority,
  configMetadata, lastSuccessAt, failureReason, createdById
)
SELECT
  id, organizationId, 'CRM', provider, label,
  CASE WHEN syncEnabled THEN 'ACTIVE' ELSE 'DISABLED' END,
  100, -- legacy priority
  json_build_object(
    'apiEndpoint', apiEndpoint,
    'fieldMapping', fieldMapping,
    'conflictPolicy', conflictPolicy
  ),
  lastSyncAt, lastSyncError, createdById
FROM CrmConnection;
```

### 5.2 ERP: ErpConnection → TenantIntegration

```sql
INSERT INTO TenantIntegration (
  id, organizationId, type, provider, displayName, status, priority,
  configMetadata, lastSuccessAt, createdById
)
SELECT
  id, organizationId, 'ERP', provider, label,
  CASE WHEN syncEnabled THEN 'ACTIVE' ELSE 'DISABLED' END,
  100,
  json_build_object(
    'apiEndpoint', apiEndpoint,
    'connectionType', connectionType,
    'sourceSystem', sourceSystem,
    'defaultCurrency', defaultCurrency,
    'fieldMapping', fieldMapping
  ),
  lastSyncAt, createdById
FROM ErpConnection;
```

### 5.3 Vault Secret Migration

For each legacy connection with secrets:

```sql
-- For each CrmConnection with accessToken:
INSERT INTO VaultEntry (
  key, encryptedValue, keyIdentifier, category, organizationId,
  status, description
)
VALUES (
  'integrations/' || organizationId || '/CRM/' || provider,
  encryptSecret(COALESCE(accessToken, apiKey)),
  keyDerivationId, 'integration', organizationId,
  'ACTIVE', 'Migrated from CrmConnection: ' || label
);

UPDATE TenantIntegration
SET vaultSecretId = VaultEntry.id
WHERE TenantIntegration.id = CrmConnection.id;
```

**⚠️ These scripts run only in Sprint 5, after Sprint 1-4 are stable.**

---

## 6. Testing Strategy

| Test Type | Scope | Sprint |
|-----------|-------|--------|
| Unit: IntegrationResolver resolves TenantIntegration | Single source of truth | 1 |
| Unit: IntegrationResolver falls back to legacy | Backward compat | 1 |
| Unit: SecretResolver resolves from vault with purpose | Secret resolution | 2A |
| Unit: SecretResolver falls back to legacy storage | Backward compat | 2A |
| Unit: SecretResolver REJECTS direct process.env | Enforcement | 2A |
| Unit: SecretResolver includes purpose in result (provenance) | Provenance | 2A |
| Unit: Audit event emitted for SECRET_CREATED / SECRET_ROTATED / SECRET_REVOKED / SECRET_VIEWED | Audit trail | 2A |
| Unit: SECRET_USED goes to metrics counter NOT audit trail | Separation | 2A |
| Unit: SECRET_FAILED goes to metrics counter + error log | Error tracking | 2A |
| Unit: Secret values NOT in audit log or telemetry payload | Security | 2A |
| Unit: HubSpot connector uses SecretResolver not process.env | Connector migration | 2B |
| Unit: Salesforce connector uses SecretResolver not process.env | Connector migration | 2B |
| Unit: SAP connector uses SecretResolver not process.env | Connector migration | 2B |
| Unit: Oracle ERP connector uses SecretResolver not process.env | Connector migration | 2B |
| Unit: Dynamics CRM connector uses SecretResolver not process.env | Connector migration | 2B |
| Unit: IntegrationHealth records successCount + failureCount | Health tracking | 2.5 |
| Unit: IntegrationHealth consecutive failure tracking | Circuit breaker | 2.5 |
| Unit: IntegrationHealth successRate calculation | Analytics | 2.5 |
| Unit: ProviderRegistry register/resolve | Registry correctness | 3 |
| Unit: resolveWithFallback skips unhealthy providers | Health-aware routing | 3 |
| Integration: AI provider resolution per org | Per-tenant AI config | 4 |
| Integration: CRM sync via new path | CRM migration | 5 |
| Integration: ERP import via new path | ERP migration | 5 |
| E2E: Full AI flow with tenant-specific provider | End-to-end | 4 |
| E2E: Full CRM sync with migrated connection | End-to-end | 5 |
| Regression: All existing tests pass | No breaking changes | Every sprint |

---

## 7. Organizational Impact

| Team/Product | Sprint 1-2 | Sprint 2.5 | Sprint 3-4 | Sprint 5-6 | Post Sprint 6 |
|-------------|-----------|-----------|-----------|-----------|---------------|
| AI Orchestration | No change | No change | Migrate to ProviderRegistry | Stable | Remove env var fallback |
| CRM (SalesOS) | SecretResolver wiring | No change | No change | Migrate to TenantIntegration | Remove CrmConnection |
| ERP (LocalContentOS) | SecretResolver wiring | No change | No change | Migrate to TenantIntegration | Remove ErpConnection |
| Storage | No change | No change | Migrate to ProviderRegistry | Stable | Remove env var fallback |
| Email/Notifications | No change | No change | No change | Migrate to TenantIntegration | Remove env var fallback |
| Vault | Active usage (secrets + audit) | No change | Wire to CRM/ERP | Further usage | Sole source of secrets |
| Platform Health | No change | Health check runner | Health-aware routing | Stable | Health dashboard |
| Platform UI | Nothing | Nothing | Nothing | Integration management UI | Integration + Health dashboard |

**Key rule:** Products do NOT need to change their code during migration. The IntegrationResolver and ProviderRegistry handle backward compatibility transparently.

---

## 8. Success Criteria

### Sprint 2A — SecretResolver + Audit + Telemetry

1. ✅ `SecretResolver` exists with `purpose` parameter (SecretPurpose enum with CRM_SYNC, ERP_SYNC, AI_INFERENCE, etc.)
2. ✅ `SECRET_CREATED`, `SECRET_ROTATED`, `SECRET_REVOKED`, `SECRET_VIEWED` audit events fire on governance-significant actions
3. ✅ `SECRET_USED`, `SECRET_FAILED` telemetry events fire on operational secret access — metrics counters only, NOT audit trail
4. ✅ No secret values appear in audit logs or telemetry payloads
5. ✅ Every `SecretResolver` resolution includes `purpose` for provenance tracking
6. ✅ AI providers still work unchanged (via `process.env` — removed in Sprint 4)

**Integrated acceptance scenario — the test that proves Sprint 2A success:**

```text
1. Create Secret in Vault
2. Link it to TenantIntegration (vaultSecretId)
3. Call SecretResolver.getIntegrationSecret(orgId, integrationId, purpose)
   → Returns credentials
4. Confirm SECRET_USED metric counter incremented
5. Rotate the secret (SECRET_ROTATED audit event fires)
   → Cache evicted for this integration
6. Call SecretResolver again (same orgId, integrationId)
   → Returns new credentials (no code change)
7. CRM Connector continues working with new credentials
```

If this scenario passes end-to-end, the hardest part of the migration is closed.

### Post-Sprint 2A Verification (Pre-Production)

Before Sprint 2A is considered complete, three verifications beyond the acceptance scenario:

**Verification A — Concurrency (100 parallel calls)**
- 100 concurrent `SecretResolver.getIntegrationSecret()` calls (same org, same integration)
- Expected: No race conditions, no cache corruption, consistent `version` returned for all calls within same TTL window
- Test: Run 100x Promise.all, verify all return same `version`

**Verification B — Rotation Under Load**
- 50 active requests initiating secret resolution
- Mid-execution: trigger `SECRET_ROTATED` (cache eviction)
- 50 new requests arriving after rotation
- Expected: Old requests complete with original version, new requests get new version. No outage, no restart, no manual cache flush.
- Test: Instrumented load test with rotation at midpoint

**Verification C — Cache Pressure (Multi-Tenant)**
- 100 organizations × 10 integrations each = 1000 cache keys
- Verify: Cache operates within memory limits, TTL eviction works, no key collision across orgs
- Test: Populate cache with 1000 entries, verify all resolve correctly, verify eviction on TTL expiry

**Reproducibility Requirement (applies to all three verifications):**
Every verification must be executable via a script/command that any team member can run, not just a one-off local test.

```
Verification A (Concurrency):     npm run test:secret-concurrency
Verification B (Rotation/Load):   npm run test:secret-rotation
Verification C (Cache Pressure):  npm run test:secret-cache-pressure
```

These scripts become part of the test suite and are re-runnable after Sprint 3, 4, 5 to prove the capability is still intact. Evidence that cannot be reproduced by another team member is not evidence.

### Sprint 2B — CRM + ERP Connector Migration (Wave Strategy)

Executed in 3 waves, each with independent build + test verification:

| Wave | Connectors | Auth Complexity | Rollback Risk |
|------|-----------|----------------|---------------|
| 1 | HubSpot | Single token | Very low |
| 2 | Salesforce | OAuth flow | Low |
| 3 | SAP, Oracle ERP, Dynamics CRM | Complex auth | Low (legacy fallback) |

7. ✅ Wave 1 — HubSpot connector uses `SecretResolver`, not `process.env`
8. ✅ Wave 2 — Salesforce connector uses `SecretResolver`, not `process.env`
9. ✅ Wave 3 — SAP connector uses `SecretResolver`, not `process.env`
10. ✅ Wave 3 — Oracle ERP connector uses `SecretResolver`, not `process.env`
11. ✅ Wave 3 — Dynamics CRM connector uses `SecretResolver`, not `process.env`
12. ✅ After each wave: `npx tsc --noEmit`, `npm test`, `npm run build` all pass
13. ✅ After each wave: `SecretResolver.version` correctly reflects the secret version from Vault
14. ✅ After each wave: Compliance scan — `grep "VaultService"` in connectors = 0
15. ✅ After each wave: Compliance scan — `grep "process.env"` for known provider env vars = 0
16. ✅ All existing CRM sync flows unchanged (IntegrationResolver as fallback)
17. ✅ All existing ERP import flows unchanged

### Sprint 2.5 — Integration Health

14. ✅ `IntegrationHealth` model exists with `successCount`, `failureCount`, `consecutiveFailures`, `latencyMs`
15. ✅ `availabilityPercentage` computed as `successCount / (successCount + failureCount) * 100` (calculated, not stored)
16. ✅ Health check runner executes per-org, per-integration
17. ✅ `TenantIntegration.lastHealthCheckAt` / `lastSuccessAt` / `lastFailureAt` are updated
18. ✅ `IntegrationResolver.healthCheck()` returns health data including availability

### Go / No-Go (All Three Sprints)

```text
Organization A (Salesforce)   →  ✓ Vault  ✓ No env  ✓ Rotatable  ✓ Revocable  ✓ Monitorable  ✓ Auditable
Organization B (HubSpot)      →  ✓ Vault  ✓ No env  ✓ Rotatable  ✓ Revocable  ✓ Monitorable  ✓ Auditable
Organization C (SAP)          →  ✓ Vault  ✓ No env  ✓ Rotatable  ✓ Revocable  ✓ Monitorable  ✓ Auditable
```

### Overall Migration Complete

11. ✅ Every `AIProvider` resolution reads from `TenantIntegration` (with vault-backed credentials)
12. ✅ Every `CRMProvider` resolution reads from `TenantIntegration` 
13. ✅ Every `ERPProvider` resolution reads from `TenantIntegration`
14. ✅ Every `StorageProvider` resolution is tenant-aware
15. ✅ Every `EmailProvider` resolution reads from `TenantIntegration`
16. ✅ No secrets exist outside Vault (except during migration window)
17. ✅ No product imports a provider implementation directly
18. ✅ All existing tests pass unmodified
19. ✅ AuditOS, DecisionOS, SalesOS, LocalContentOS all work without changes

---

*This document is part of the Integration Abstraction Layer migration. Read `INTEGRATION_ARCHITECTURE.md` first for the target architecture.*
