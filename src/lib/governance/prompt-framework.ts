import {
  GovernanceTaskType,
  PromptAssemblyResult,
  PromptLayerContent,
  StatementDraftingPromptInput,
  MappingRecommendationPromptInput,
  AccountClassificationPromptInput,
  EvidenceReviewPromptInput,
  AuditFindingPromptInput,
  CommercialClaimPromptInput,
  GovernanceContext,
} from './runtime-types';
import { getGovernanceContext, requiresHumanApproval } from './retrieval-router';

function buildLayerContent(layer: PromptLayerContent['layer'], content: string): PromptLayerContent {
  return { layer, content };
}

function assembleSection(label: string, lines: string[]): string {
  return lines.join('\n');
}

function buildSystemDoctrineLayer(context: GovernanceContext): string {
  const refs = context.doctrineReferences.map(d =>
    `  - [${d.documentId}] ${d.title}: "${d.principle}"`
  ).join('\n');
  return assembleSection('SYSTEM DOCTRINE', [
    'You operate within AQLIYA, the parent company/platform brand. Use the relevant product context for the workflow at hand, including AuditOS for governed financial workflows.',
    'You operate within governed boundaries defined by doctrine.',
    '',
    'Applicable Doctrine References:',
    refs,
  ]);
}

function buildProductDoctrineLayer(context: GovernanceContext): string {
  const refs = context.doctrineReferences.map(d =>
    `  - ${d.title}: ${d.relevance}`
  ).join('\n');
  return assembleSection('PRODUCT DOCTRINE', [
    'Product Context:',
    refs,
  ]);
}

function buildGovernanceLayer(context: GovernanceContext): string {
  const rules = context.governanceReferences.map(g =>
    `  - [${g.source}] ${g.rule}`
  ).join('\n');
  const enforcements = context.governanceReferences.map(g =>
    `  - ${g.enforcement}`
  ).join('\n');
  return assembleSection('GOVERNANCE', [
    'Governance Rules:',
    rules,
    '',
    'Enforcement:',
    enforcements,
    '',
    `Output Boundary: ${context.outputBoundary}`,
  ]);
}

function buildEvidenceLayer(context: GovernanceContext, overrides?: { description: string; status: string }[]): { content: string; warnings: string[] } {
  const warnings: string[] = [];
  const requirements = overrides ?? context.evidenceRequirements;
  const lines: string[] = ['Evidence Requirements:'];

  for (const req of requirements) {
    const indicator = req.status === 'complete' ? '[✓]' : req.status === 'partial' ? '[~]' : req.status === 'missing' ? '[✗]' : '[?]';
    lines.push(`  ${indicator} ${req.description} (${req.status})`);
    if (req.status === 'missing' || req.status === 'partial') {
      warnings.push(`Evidence incomplete: "${req.description}" is ${req.status}`);
    }
  }

  return { content: assembleSection('EVIDENCE', lines), warnings };
}

function buildHumanApprovalLayer(context: GovernanceContext): string {
  const triggers = context.escalationTriggers.map(t => `  - ${t}`).join('\n');
  const draftNote = context.humanApprovalRequired
    ? 'Output is DRAFT until human-approved.'
    : '';
  return assembleSection('HUMAN APPROVAL', [
    context.humanApprovalRequired
      ? 'Human approval is REQUIRED for this task.'
      : 'This task does not require human approval.',
    draftNote,
    '',
    'Escalation Triggers:',
    triggers,
  ]);
}

function buildTaskSpecificLayer(taskType: GovernanceTaskType, input: Record<string, unknown>): string {
  const params = Object.entries(input)
    .map(([key, value]) => `  - ${key}: ${value}`)
    .join('\n');
  return assembleSection('TASK SPECIFIC', [
    `Task: ${taskType}`,
    'Parameters:',
    params,
  ]);
}

function combineLayers(layers: PromptLayerContent[]): string {
  return layers.map(l => {
    const header = `=== ${l.layer.toUpperCase().replace(/_/g, ' ')} ===`;
    return `${header}\n${l.content}`;
  }).join('\n\n');
}

function collectEvidenceWarnings(context: GovernanceContext): string[] {
  const warnings: string[] = [];
  for (const req of context.evidenceRequirements) {
    if (req.status === 'missing' || req.status === 'partial') {
      warnings.push(`Evidence incomplete: "${req.description}" is ${req.status}${req.requiredForApproval ? ' (required for approval)' : ''}`);
    }
  }
  return warnings;
}

function collectHumanApprovalWarning(context: GovernanceContext): string[] {
  if (context.humanApprovalRequired) {
    return ['Human approval is required — output is draft until reviewed'];
  }
  return [];
}

export function buildStatementDraftingPrompt(input: StatementDraftingPromptInput): PromptAssemblyResult {
  const context = getGovernanceContext('statement_drafting');
  const warnings: string[] = [
    ...collectEvidenceWarnings(context),
    ...collectHumanApprovalWarning(context),
  ];

  if (!input.trialBalanceValidated) warnings.push('Trial balance not yet validated');
  if (!input.accountsMapped) warnings.push('Accounts not yet fully mapped');
  if (input.evidenceCompleteness !== 'complete') warnings.push(`Evidence completeness: ${input.evidenceCompleteness}`);
  warnings.push('DRAFT — NOT FINAL. This is an assistive draft. Human review and approval are required before any professional use.');

  const layers: PromptLayerContent[] = [
    buildLayerContent('system_doctrine', buildSystemDoctrineLayer(context)),
    buildLayerContent('product_doctrine', buildProductDoctrineLayer(context)),
    buildLayerContent('governance', buildGovernanceLayer(context)),
    buildLayerContent('evidence', buildEvidenceLayer(context).content),
    buildLayerContent('human_approval', buildHumanApprovalLayer(context)),
    buildLayerContent('task_specific', buildTaskSpecificLayer('statement_drafting', input as unknown as Record<string, unknown>)),
  ];

  return {
    layers,
    fullPrompt: combineLayers(layers),
    governanceContext: context,
    warnings,
  };
}

export function buildMappingRecommendationPrompt(input: MappingRecommendationPromptInput): PromptAssemblyResult {
  const context = getGovernanceContext('account_mapping');
  const warnings: string[] = [
    ...collectEvidenceWarnings(context),
    ...collectHumanApprovalWarning(context),
  ];

  if (input.lowConfidenceCount > 0) warnings.push(`${input.lowConfidenceCount} low-confidence mappings require review`);
  if (input.unmappedCount > 0) warnings.push(`${input.unmappedCount} accounts remain unmapped`);
  if (input.mappedCount < input.accountCount) warnings.push(`Mapping incomplete: ${input.mappedCount}/${input.accountCount} accounts mapped`);

  const layers: PromptLayerContent[] = [
    buildLayerContent('system_doctrine', buildSystemDoctrineLayer(context)),
    buildLayerContent('product_doctrine', buildProductDoctrineLayer(context)),
    buildLayerContent('governance', buildGovernanceLayer(context)),
    buildLayerContent('evidence', buildEvidenceLayer(context).content),
    buildLayerContent('human_approval', buildHumanApprovalLayer(context)),
    buildLayerContent('task_specific', buildTaskSpecificLayer('account_mapping', input as unknown as Record<string, unknown>)),
  ];

  return {
    layers,
    fullPrompt: combineLayers(layers),
    governanceContext: context,
    warnings,
  };
}

export function buildAccountClassificationPrompt(
  input: AccountClassificationPromptInput,
): PromptAssemblyResult {
  const context = getGovernanceContext('account_mapping');
  const warnings: string[] = [
    ...collectEvidenceWarnings(context),
    ...collectHumanApprovalWarning(context),
  ];

  const payload = {
    accountName: input.accountName,
    accountCode: input.accountCode,
    accountBalance: input.accountBalance,
    candidateAccounts: input.candidateAccounts,
    chartOfAccountsContext: input.chartOfAccountsContext,
  };

  const taskBody = assembleSection('ACCOUNT CLASSIFICATION TASK', [
    'Map ONE trial balance GL account to exactly ONE canonical AuditOS code from candidateAccounts.',
    'This is a draft suggestion — human review is required before committing the mapping.',
    '',
    'Input:',
    JSON.stringify(payload, null, 2),
    '',
    'Respond with ONLY a single JSON object (no markdown fences, no prose before or after):',
    JSON.stringify(
      {
        accountCode: 'CA-XXXX',
        confidence: 0.85,
        reasoning: 'Brief rationale citing the account name and chosen canonical line',
      },
      null,
      2,
    ),
    '',
    'Rules:',
    '- accountCode MUST be one of the CA-XXXX codes listed in candidateAccounts',
    '- confidence MUST be a number between 0 and 1',
    '- reasoning MUST be one or two sentences',
  ]);

  const layers: PromptLayerContent[] = [
    buildLayerContent('system_doctrine', buildSystemDoctrineLayer(context)),
    buildLayerContent('product_doctrine', buildProductDoctrineLayer(context)),
    buildLayerContent('governance', buildGovernanceLayer(context)),
    buildLayerContent('human_approval', buildHumanApprovalLayer(context)),
    buildLayerContent('task_specific', taskBody),
  ];

  return {
    layers,
    fullPrompt: taskBody,
    governanceContext: context,
    warnings,
  };
}

export function buildEvidenceReviewPrompt(input: EvidenceReviewPromptInput): PromptAssemblyResult {
  const context = getGovernanceContext('evidence_review');
  const warnings: string[] = [
    ...collectEvidenceWarnings(context),
    ...collectHumanApprovalWarning(context),
  ];

  if (input.evidenceItemsTotal > 0 && input.evidenceItemsReviewed < input.evidenceItemsTotal) {
    warnings.push(`${input.evidenceItemsTotal - input.evidenceItemsReviewed} evidence items not yet reviewed`);
  }
  if (input.evidenceItemsReviewed > 0 && input.evidenceItemsVerified < input.evidenceItemsReviewed) {
    warnings.push(`${input.evidenceItemsReviewed - input.evidenceItemsVerified} reviewed items not yet verified`);
  }

  const layers: PromptLayerContent[] = [
    buildLayerContent('system_doctrine', buildSystemDoctrineLayer(context)),
    buildLayerContent('product_doctrine', buildProductDoctrineLayer(context)),
    buildLayerContent('governance', buildGovernanceLayer(context)),
    buildLayerContent('evidence', buildEvidenceLayer(context).content),
    buildLayerContent('human_approval', buildHumanApprovalLayer(context)),
    buildLayerContent('task_specific', buildTaskSpecificLayer('evidence_review', input as unknown as Record<string, unknown>)),
  ];

  return {
    layers,
    fullPrompt: combineLayers(layers),
    governanceContext: context,
    warnings,
  };
}

export function buildAuditFindingPrompt(input: AuditFindingPromptInput): PromptAssemblyResult {
  const context = getGovernanceContext('audit_findings');
  const warnings: string[] = [
    ...collectEvidenceWarnings(context),
    ...collectHumanApprovalWarning(context),
  ];

  if (!input.evidenceLinked) warnings.push('Finding not linked to evidence');
  if (!input.evidenceSufficient) warnings.push('Evidence may be insufficient for this finding');

  const layers: PromptLayerContent[] = [
    buildLayerContent('system_doctrine', buildSystemDoctrineLayer(context)),
    buildLayerContent('product_doctrine', buildProductDoctrineLayer(context)),
    buildLayerContent('governance', buildGovernanceLayer(context)),
    buildLayerContent('evidence', buildEvidenceLayer(context).content),
    buildLayerContent('human_approval', buildHumanApprovalLayer(context)),
    buildLayerContent('task_specific', buildTaskSpecificLayer('audit_findings', input as unknown as Record<string, unknown>)),
  ];

  return {
    layers,
    fullPrompt: combineLayers(layers),
    governanceContext: context,
    warnings,
  };
}

export function buildCommercialClaimReviewPrompt(input: CommercialClaimPromptInput): PromptAssemblyResult {
  const context = getGovernanceContext('commercial_claim_review');
  const warnings: string[] = [
    ...collectEvidenceWarnings(context),
    ...collectHumanApprovalWarning(context),
  ];

  if (!input.hasEvidenceSupport) warnings.push('Claim lacks evidence support — review for overclaim risk');
  if (input.isPilotResult) warnings.push('Pilot results require careful positioning — do not overstate maturity');
  warnings.push('DRAFT-ONLY BOUNDARY: This is a draft commercial claim review. It is not approved commercial positioning. Human approval is required before any external use. Do not present as final.');

  const layers: PromptLayerContent[] = [
    buildLayerContent('system_doctrine', buildSystemDoctrineLayer(context)),
    buildLayerContent('product_doctrine', buildProductDoctrineLayer(context)),
    buildLayerContent('governance', buildGovernanceLayer(context)),
    buildLayerContent('evidence', buildEvidenceLayer(context).content),
    buildLayerContent('human_approval', buildHumanApprovalLayer(context)),
    buildLayerContent('task_specific', buildTaskSpecificLayer('commercial_claim_review', input as unknown as Record<string, unknown>)),
  ];

  return {
    layers,
    fullPrompt: combineLayers(layers),
    governanceContext: context,
    warnings,
  };
}
