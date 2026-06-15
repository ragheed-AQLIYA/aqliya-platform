// ─── AuditOS MVP Type Definitions ───

// ─── Enums / Literal Unions ───

export type EngagementStatus =
  | 'draft' | 'setup' | 'in_progress' | 'under_review'
  | 'awaiting_client' | 'ready_for_approval' | 'approved' | 'published' | 'archived'

export type EvidenceState =
  | 'missing' | 'requested' | 'uploaded' | 'linked' | 'reviewed' | 'accepted' | 'rejected'

export type FindingStatus =
  | 'draft' | 'open' | 'in_review' | 'accepted' | 'resolved' | 'dismissed'

export type RecommendationStatus =
  | 'suggested' | 'under_review' | 'accepted' | 'rejected' | 'implemented'

export type ReviewStatus =
  | 'not_started' | 'in_review' | 'changes_requested' | 'approved'

export type ApprovalStatus =
  | 'not_ready' | 'ready' | 'pending_approval' | 'approved' | 'blocked'

export type PublicationStatus =
  | 'draft' | 'ready' | 'published' | 'locked'

export type AiOutputStatus =
  | 'suggested' | 'accepted_by_human' | 'rejected_by_human' | 'superseded' | 'expired'

export type LinkType = 'supports' | 'contradicts' | 'context'
export type FindingType = 'material_misstatement' | 'control_deficiency' | 'disclosure_gap' | 'observation'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type Materiality = 'immaterial' | 'material' | 'pervasive'
export type TrustState = 'trusted' | 'conditional' | 'blocked'
export type EngagementType = 'full_audit' | 'review' | 'agreed_upon_procedures'
export type UserRole = 'admin' | 'partner' | 'manager' | 'reviewer' | 'operator' | 'viewer'
export type ValidationCheckType = 'balance_equality' | 'missing_mappings' | 'unusual_balance' | 'negative_balance' | 'classification_conflict' | 'prior_period_variance' | 'completeness' | 'tb_ls_tie' | 'ls_fs_tie' | 'balance_sheet_equation' | 'is_equity_flow' | 'reconciliation_coverage' | 'cash_flow_tie' | 'ifrs_rule' | 'socpa_rule'
export type ValidationSeverity = 'error' | 'warning' | 'info'
export type ValidationStatus = 'passed' | 'failed' | 'warning'

// ─── Core Entities ───

export interface Organization {
  id: string
  name: string
  slug: string
  jurisdiction: string
  regulatoryFramework: string
  governanceRules?: Record<string, unknown>
  status: 'active' | 'suspended' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface AuditUser {
  id: string
  organizationId: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  status: 'active' | 'invited' | 'disabled'
  lastLoginAt?: string
  createdAt: string
}

export interface Client {
  id: string
  organizationId: string
  name: string
  registrationNumber?: string
  industry: string
  reportingFramework: string
  fiscalPeriodEnd: string
  currencyCode: string
  status: 'active' | 'inactive'
  contactEmail?: string
  contactPhone?: string
  address?: string
  createdAt: string
}

export interface Engagement {
  id: string
  organizationId: string
  clientId: string
  client?: Client
  fiscalPeriod: string
  engagementType: EngagementType
  status: EngagementStatus
  team: EngagementTeamMember[]
  governanceRules?: Record<string, unknown>
  alerts?: EngagementAlert[]
  presentationProfile?: string | null
  presentationProfileVersion?: string | null
  presentationPolicyId?: string | null
  createdAt: string
  updatedAt: string
}

export interface EngagementTeamMember {
  userId: string
  userName: string
  role: UserRole
  assignedAt: string
}

export interface EngagementAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  source: string
  createdAt: string
}

export interface FinancialPeriod {
  id: string
  engagementId: string
  label: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface TrialBalance {
  id: string
  engagementId: string
  importTimestamp: string
  sourceFile: string
  fileHash?: string
  trustState: TrustState
  totalDebits: number
  totalCredits: number
  variance: number
  lines: TrialBalanceLine[]
  createdAt: string
}

export interface TrialBalanceLine {
  id: string
  trialBalanceId: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  balance: number
  accountType?: string
  currency: string
}

export interface CanonicalAccount {
  id: string
  code: string
  name: string
  category: string
  subcategory?: string
  statementType: 'balance_sheet' | 'income_statement' | 'equity' | 'cash_flow'
  reportingFramework: string
  version: string
  displayOrder: number
}

export interface AccountMapping {
  id: string
  engagementId: string
  sourceAccountId: string
  sourceAccountCode: string
  sourceAccountName: string
  debitAmount: number
  creditAmount: number
  canonicalAccountId?: string
  canonicalAccountCode?: string
  canonicalAccountName?: string
  statementClassification?: string
  confidence?: number
  classificationSource?: 'firm_memory' | 'rule' | 'pattern' | 'local' | 'cloud' | 'none'
  /** Explainable classification — Trust + Evidence (Phase 4). */
  classificationExplanation?: import('@/lib/tb-intelligence/classification-explanation').MappingClassificationExplanation
  mappingType: 'ai_suggested' | 'human_mapped' | 'confirmed_ai'
  status: 'pending' | 'confirmed' | 'rejected'
  aiSuggestionId?: string
  mappedBy?: string
  mappedAt?: string
  updatedAt: string
}

export interface ValidationRun {
  id: string
  engagementId: string
  validationType: string
  status: 'running' | 'completed' | 'failed'
  summary: string
  issues: ValidationIssue[]
  trustState: TrustState
  validatedAt: string
}

export interface ValidationIssue {
  id: string
  validationRunId: string
  checkType: ValidationCheckType
  severity: ValidationSeverity
  status: 'open' | 'accepted' | 'dismissed' | 'investigated'
  description: string
  accountCode?: string
  accountName?: string
  expectedValue?: number
  actualValue?: number
  message: string
  disposedBy?: string
  disposedAt?: string
  disposition?: string
}

export interface FinancialStatement {
  id: string
  engagementId: string
  statementType: 'balance_sheet' | 'income_statement' | 'equity' | 'cash_flow'
  title: string
  status: 'draft' | 'reviewed' | 'approved'
  lines: FinancialStatementLine[]
  linkedAccounts: AccountMapping[]
  reviewComments: ReviewComment[]
  createdAt: string
  updatedAt: string
}

export interface FinancialStatementLine {
  id: string
  statementId: string
  label: string
  amount: number
  isTotal: boolean
  indentLevel: number
  displayOrder: number
  linkedAccountMappings: string[] // mapping IDs
  ifrsCitations?: string[]
  socpaCitations?: string[]
}

export interface DisclosureNote {
  id: string
  engagementId: string
  noteNumber: string
  title: string
  noteType: string
  content: string
  linkedStatementLine?: string
  missingInformation: string[]
  aiDrafted: boolean
  status: 'draft' | 'needs_info' | 'reviewed' | 'approved' | 'rejected'
  reviewComments: ReviewComment[]
  createdAt: string
  updatedAt: string
}

export interface EvidenceObject {
  id: string
  engagementId: string
  filename: string
  fileType: string
  fileSize: number
  fileHash: string
  uploadedBy: string
  uploadedAt: string
  state: EvidenceState
  linkedEntities: EvidenceLink[]
  storageKey: string
}

export interface EvidenceLink {
  id: string
  evidenceId: string
  targetType: 'account' | 'finding' | 'statement_line' | 'note'
  targetId: string
  targetLabel: string
  linkType: LinkType
  context?: string
  createdBy: string
  createdAt: string
}

export interface Finding {
  id: string
  engagementId: string
  title: string
  findingType: FindingType
  severity: RiskLevel
  materiality: Materiality
  description: string
  rootCause?: string
  impact?: string
  status: FindingStatus
  relatedAccountIds: string[]
  relatedEvidenceIds: string[]
  aiSuggested: boolean
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface Recommendation {
  id: string
  engagementId: string
  findingId: string
  finding?: Finding
  title: string
  description: string
  recommendedAction: string
  impactAssessment?: string
  riskLevel: RiskLevel
  status: RecommendationStatus
  aiContributed: boolean
  aiSuggestionId?: string
  reviewerDecision?: string
  createdAt: string
  updatedAt: string
}

export interface ReviewComment {
  id: string
  engagementId: string
  targetType: 'statement' | 'note' | 'finding' | 'recommendation' | 'evidence'
  targetId: string
  reviewerId: string
  reviewerName: string
  comment: string
  requiredAction?: 'none' | 'revise' | 'provide_evidence' | 'clarify'
  resolution?: string
  status: 'open' | 'resolved' | 'acknowledged'
  createdAt: string
  resolvedAt?: string
}

export interface ApprovalRecord {
  id: string
  engagementId: string
  approverId: string
  approverName: string
  approverRole: UserRole
  action: 'approved' | 'rejected' | 'modifications_requested'
  rationale?: string
  targetType: 'engagement' | 'statement' | 'recommendation'
  targetId: string
  createdAt: string
}

export interface PublicationPackage {
  id: string
  engagementId: string
  status: PublicationStatus
  statements: FinancialStatement[]
  notes: DisclosureNote[]
  findings: Finding[]
  recommendations: Recommendation[]
  reviewSummary: string
  findingsSummary: string
  evidenceSummary: string
  approvalHistory: ApprovalRecord[]
  publishedAt?: string
  publishedBy?: string
  lockedAt?: string
}

export interface AuditEvent {
  id: string
  engagementId: string
  eventType: string
  actorId: string
  actorName: string
  actorRole: UserRole
  targetType: string
  targetId: string
  previousState?: string
  newState: string
  description: string
  aiRelated: boolean
  metadata?: Record<string, unknown>
  timestamp: string
}

export interface AIAssistanceOutput {
  id: string
  engagementId: string
  suggestionType: 'mapping' | 'finding' | 'recommendation' | 'note_draft' | 'evidence_summary' | 'anomaly_explanation'
  inputContext: string
  outputContent: string
  confidence: number
  modelVersion: string
  status: AiOutputStatus
  acceptedBy?: string
  acceptedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  sourceEntityType?: string
  sourceEntityId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface WorkflowStatus {
  currentState: EngagementStatus
  availableTransitions: string[]
  blockingIssues: string[]
  completionPercentage: number
}

export interface TraceabilityNode {
  id: string
  type: 'source_data' | 'account' | 'evidence' | 'finding' | 'recommendation' | 'approval' | 'publication'
  label: string
  entityType: string
  status: string
  children?: TraceabilityNode[]
}

export interface PilotFeedback {
  id: string
  engagementId: string
  title: string
  description: string
  source: string
  category: string
  severity: string
  status: string
  decision?: string
  owner?: string
  nextAction?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ProductionBlocker {
  id: string
  engagementId?: string
  title: string
  description: string
  category: string
  severity: string
  status: string
  requiredBefore: string
  owner?: string
  resolutionPlan?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PilotSignoff {
  id: string
  engagementId: string
  checklistItem: string
  status: string
  signedBy?: string
  signedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DashboardSummary {
  totalEngagements: number
  activeEngagements: number
  pendingReviews: number
  openFindings: number
  missingEvidence: number
  readyForApproval: number
  publishedCount: number
  recentActivity: AuditEvent[]
  engagements: Engagement[]
}
