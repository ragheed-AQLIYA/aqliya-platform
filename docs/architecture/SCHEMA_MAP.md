# AQLIYA Prisma Schema Map

**Purpose:** Document which models belong to which product or platform layer, without physically splitting `schema.prisma`.

**Why not split:** With ~110 models, cross-product relations, and 30+ migrations, a physical schema split adds maintenance complexity without proportional benefit. This map serves as the logical schema boundary reference.

---

## Legend

| Layer | Prefix | Description |
|-------|--------|-------------|
| 🔧 Platform | `Platform*`, `User*`, `Role*`, `Abac*`, `Encryption*`, `Sso*`, `Scim*` | Core platform services |
| 🛡️ Security/Auth | `Session`, `Verification*`, `Permission*`, `SoD*`, `Download*`, `Vault*` | Auth, RBAC, ABAC, encryption |
| 📊 AuditOS | `Audit*` | Financial audit system |
| 🧠 DecisionOS | `Decision*`, `Sector*`, `Recommendation*`, `Approval*`, `Risk*` (DecisionOS) | Decision governance |
| 🏗️ LocalContentOS | `LocalContent*` | Local content compliance |
| 💼 SalesOS | `Sales*`, `Account`, `Deal*` | Sales intelligence |
| 🔄 WorkflowOS | `Workflow*`, `Sunbul*` | Workflow engine |
| 🤝 LocalContactOS | `LocalContact*`, `Contact*` | Relationship intelligence |
| 🎨 ContentStudio | `ContentStudio*`, `ContentWorkspace`, `ContentItem*` | Content management |
| 🤖 AI Core | `Ai*`, `DocumentChunk`, `AgentMemory`, `Intelligence*`, `Ingestion*`, `InstitutionalMemory*` | AI engine |
| 📋 Office AI | `OfficeAi*` | Office assistant |
| 🔗 Integration | `Crm*`, `Erp*` | External system connectors |
| ⚙️ Operations | `PlatformAuditLog`, `HashChainEntry`, `ClientWorkspace`, `Sampling*`, `AuditRisk*`, `AuditBridge*`, `Org*` | Operational infrastructure |

---

## Model Inventory

### 🔧 Platform Core (16 models)

| Model | Relations | Key Fields |
|-------|-----------|------------|
| `PlatformOrganization` | → `Invitation`, → `ClientWorkspace` | `id`, `name`, `slug`, `settings (Json)` |
| `Invitation` | → `PlatformOrganization` | `token`, `email`, `role`, `expiresAt` |
| `PlatformSecret` | — | Key-value secrets store |
| `PlatformNotification` | → `UserNotificationPreference` | Notification records |
| `UserNotificationPreference` | → `PlatformNotification` | Per-user notification settings |
| `ClientWorkspace` | → `PlatformOrganization`, → `Project` | Cross-product workspace |
| `Project` | → `ClientWorkspace` | Generic project entity |
| `Organization` | (DecisionOS legacy) | `id`, `name`, `createdBy` |
| `User` | → `Session`, → `UserRoleAssignment` | Core user entity |
| `Session` | → `User` | Auth sessions |
| `VerificationToken` | — | Email/action verification |
| `Role` | → `RolePermission` | RBAC role definitions |
| `Permission` | ← `RolePermission` | Individual permissions |
| `RolePermission` | → `Role`, → `Permission` | Role-permission mapping |
| `UserRoleAssignment` | → `User`, → `Role` | User-role assignment |
| `SeparationOfDutyRule` | → `SoDConflict` | SoD rules |
| `SoDConflict` | → `SeparationOfDutyRule` | Detected SoD violations |

### 🛡️ Security Layer (5 models)

| Model | Relations | Key Fields |
|-------|-----------|------------|
| `EncryptionKey` | — | Key management |
| `DownloadTicket` | — | Secure download tokens |
| `VaultEntry` | — | Encrypted secrets storage |
| `AbacPolicy` | → `AbacPolicyCondition`, → `AbacPolicyAssignment` | ABAC policies |
| `AbacPolicyCondition` | → `AbacPolicy` | Policy conditions |
| `AbacPolicyAssignment` | → `AbacPolicy`, → `Role` | Policy-role binding |
| `SsoProvider` | — | SSO provider config |
| `ScimProvisioningEvent` | — | SCIM sync log |

### 📊 AuditOS (24 models)

| Model | Relations | Key Fields |
|-------|-----------|------------|
| `AuditOrganization` | → `AuditUser`, → `AuditClient` | Audit firm org |
| `AuditUser` | → `AuditOrganization` | Audit firm user |
| `AuditClient` | → `AuditOrganization`, → `AuditEngagement` | Audit client entity |
| `AuditEngagement` | → `AuditClient`, → `AuditTrialBalance`, → `AuditEvidence` | Core engagement |
| `AuditTrialBalance` | → `AuditEngagement`, → `AuditTrialBalanceLine` | TB upload |
| `AuditTrialBalanceLine` | → `AuditTrialBalance` | Individual TB line |
| `AuditCanonicalAccount` | — | Standard account reference |
| `AuditAccountMapping` | → `AuditTrialBalanceLine`, → `AuditCanonicalAccount` | Mapping |
| `AuditFinancialStatement` | → `AuditEngagement` | Generated statements |
| `AuditDisclosureNote` | → `AuditEngagement` | Notes |
| `AuditEvidence` | → `AuditEngagement`, → `AuditEvidenceVersion` | Evidence file |
| `AuditEvidenceLink` | → `AuditEvidence` | Evidence linkage |
| `AuditEvidenceVersion` | → `AuditEvidence` | Version history |
| `AuditFinding` | → `AuditEngagement` | Identified issues |
| `AuditRecommendation` | → `AuditEngagement` | Recommendations |
| `AuditReviewComment` | → `AuditEngagement` | Review trail |
| `AuditApprovalRecord` | → `AuditEngagement` | Approval gate |
| `AuditPublicationPackage` | → `AuditEngagement` | Final deliverables |
| `AuditEvent` | → `AuditEngagement` | Audit trail |
| `AuditAiOutput` | → `AuditEngagement` | AI-assisted outputs |
| `PilotFeedback` | → `AuditEngagement` | Pilot feedback |
| `ProductionBlocker` | — | Deployment blockers |
| `PilotSignoff` | → `AuditEngagement` | Pilot signoff |
| `AuditValidationRun` | → `AuditValidationIssue`, → `AuditValidationDisposition` | Validation |

### 🧠 DecisionOS (~20 models)

| Model | Relations |
|-------|-----------|
| `Decision` | → `DecisionScenario`, → `DecisionRiskAnalysis`, → `DecisionMonitoringSignal`, → `Recommendation` |
| `DecisionFramework` | Decision template |
| `DecisionScenario` | → `Decision` |
| `DecisionRiskAnalysis` | → `Decision` |
| `Objective`, `Constraint`, `Assumption`, `Alternative`, `Risk` | Decision context models |
| `TenderProfile` | Tender/procurement |
| `Scenario`, `SimulationResult` | What-if modeling |
| `DecisionMonitoringSignal`, `DecisionRiskAlert` | Monitoring |
| `Recommendation`, `Approval`, `DecisionOutcome` | Workflow |
| `AuditLog` | DecisionOS audit |
| `Sector`, `SectorBenchmark`, `SectorPattern`, `DecisionPattern`, `SectorPlaybook`, `SectorRule` | Sector intelligence |
| `DecisionReport`, `DecisionEvidence` | Outputs |
| `DecisionEscalationRule`, `DecisionGovEvent` | Governance |

### 🏗️ LocalContentOS (9 models)

| Model | Relations |
|-------|-----------|
| `LocalContentProject` | → `LocalContentSupplier`, → `LocalContentSpendRecord`, → `LocalContentClassification` |
| `LocalContentSupplier` | → `LocalContentProject` |
| `LocalContentSpendRecord` | → `LocalContentProject` |
| `LocalContentClassification` | → `LocalContentProject` |
| `LocalContentEvidence` | → `LocalContentProject` |
| `LocalContentFinding` | → `LocalContentProject` |
| `LocalContentReview` | → `LocalContentProject` |
| `LocalContentApproval` | → `LocalContentProject` |
| `LocalContentReport` | → `LocalContentProject` |
| `LocalContentAuditEvent` | → `LocalContentProject` |

### 💼 SalesOS (11 models)

| Model | Relations |
|-------|-----------|
| `Account` | → `SalesDeal`, → `SalesContact` |
| `SalesPipeline` | → `SalesPipelineStage` |
| `SalesPipelineStage` | → `SalesPipeline` |
| `SalesAccount` | → `SalesDeal`, → `SalesInteraction` |
| `SalesDeal` | → `SalesAccount`, → `SalesEvidenceLink`, → `SalesProposal` |
| `SalesEvidenceLink` | → `SalesDeal` |
| `SalesInteraction` | → `SalesAccount` |
| `SalesContact` | → `SalesAccount` |
| `SalesProposal` | → `SalesDeal` |
| `SalesReview`, `SalesApproval` | Governance |
| `SalesAuditEvent` | Auditing |
| `DealHealthIndicator` | AI-driven health |
| `SalesForecast` | Forecasting |

### 🔄 WorkflowOS + Sunbul (8 models)

| Model | Relations |
|-------|-----------|
| `WorkflowTemplate` | Form/process definition |
| `WorkflowRecord` | → `WorkflowTemplate` |
| `WorkflowAuditEvent` | → `WorkflowRecord` |
| `WorkflowEvidence` | → `WorkflowRecord` |
| `SunbulClient` | → `SunbulRecord` |
| `SunbulUserMembership` | → `SunbulClient` |
| `SunbulRecord` | → `SunbulClient` |
| `SunbulDocument` | → `SunbulRecord` |
| `SunbulReview` | → `SunbulRecord` |
| `SunbulAuditEvent` | → `SunbulClient` |

### 🤝 LocalContactOS (6 models)

| Model | Relations |
|-------|-----------|
| `LocalContact` | → `LocalContactRelation`, → `LocalContactInteraction` |
| `LocalContactRelation` | → `LocalContact` |
| `LocalContactInteraction` | → `LocalContact` |
| `ContactEvidence` | → `LocalContact` |
| `ContactReview`, `ContactApproval` | Governance |
| `ContactExportRequest` | Restricted export |

### 🎨 ContentStudio (9 models)

| Model | Relations |
|-------|-----------|
| `ContentStudioProject` | → `ContentStudioCampaign`, → `ContentStudioSource` |
| `ContentStudioCampaign` | → `ContentStudioProject`, → `ContentStudioItem` |
| `ContentStudioSource` | → `ContentStudioProject` |
| `ContentStudioItem` | → `ContentStudioCampaign` |
| `ContentStudioReview`, `ContentStudioApproval` | Governance |
| `ContentStudioOutput` | Generated content |
| `ContentWorkspace` | → `ContentItem` |
| `ContentItem` | → `ContentWorkspace`, → `ContentVersion` |
| `ContentVersion` | → `ContentItem` |
| `ContentTemplate` | — |

### 🤖 AI Core (13 models)

| Model | Relations |
|-------|-----------|
| `AiModelRegistry` | → `AiModelDeployment`, → `AiModelGovernanceReview` |
| `AiModelDeployment` | → `AiModelRegistry` |
| `AiModelGovernanceReview` | → `AiModelRegistry` |
| `AiCrossProductSession` | Cross-product AI context |
| `AiActionRegistry` | AI action audit |
| `AiContextBridge` | Context sharing |
| `DocumentChunk` | → `IngestionDocument` (pgvector) |
| `AgentMemory` | Agent state persistence |
| `IntelligenceGraphNode`, `IntelligenceGraphEdge` | Knowledge graph |
| `IntelligenceQuery` | Query tracking |
| `IngestionBatch` | → `IngestionDocument` |
| `IngestionDocument` | → `IngestionBatch`, ← `DocumentChunk` |
| `InstitutionalMemoryCollection`, `InstitutionalMemoryEvent` | Memory engine |

### 📋 Office AI (6 models)

| Model | Relations |
|-------|-----------|
| `OfficeAiTask` | → `OfficeAiOutput`, → `OfficeAiFile` |
| `OfficeAiOutput` | → `OfficeAiTask` |
| `OfficeAiFile` | → `OfficeAiTask` |
| `OfficeAiWorkflowTemplate` | Template |
| `OfficeAiSchedule` | Scheduling |
| `OfficeAiRoleConfig` | Role config |

### 🔗 Integration Layer (5 models)

| Model | Relations |
|-------|-----------|
| `CrmConnection` | → `CrmSyncLog` |
| `CrmSyncLog` | → `CrmConnection` |
| `ErpConnection` | → `ErpSyncLog`, → `ErpImportBatch` |
| `ErpSyncLog` | → `ErpConnection` |
| `ErpImportBatch` | → `ErpConnection` |

### ⚙️ Platform Operations (7 models)

| Model | Relations |
|-------|-----------|
| `PlatformAuditLog` | Central audit trail |
| `HashChainEntry` | Chain-of-custody |
| `SamplingPlan` | → `SamplingResult` |
| `SamplingResult` | → `SamplingPlan` |
| `AuditRiskModel` | → `AuditRiskAssessment`, → `AuditRiskProcedure` |
| `AuditBridgeRule` | → `BridgeLogEntry` |
| `OrgHierarchyNode`, `OrgSetting`, `OrgLifecycleEvent` | Org management |

---

## Cross-Product Relations Map

Models that create explicit cross-product dependencies:

| Relation | From Product | To Product |
|----------|-------------|------------|
| `AuditEvidence` → generic evidence pattern | AuditOS | All products |
| `PlatformAuditLog` → `AuditEvent/*AuditEvent` | Platform | All products |
| `AiCrossProductSession` → cross-product AI | AI Core | All products |
| `InstitutionalMemoryCollection` → generic memory | AI Core | All products |
| `ClientWorkspace` → `Project` | Platform | All products |
| `User` → role assignments | Platform | All products |

---

## Schema Change Guidelines

1. **Add new models** to the bottom of the relevant section (no need to reorganize)
2. **Remove models** only after confirming zero references in code and seeds
3. **Rename** requires updating all code references + migration
4. **Cross-product relations** must be reviewed by Platform Architect before adding

*Last updated: 2026-06-08*
