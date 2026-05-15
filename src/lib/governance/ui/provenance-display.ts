import { ProvenanceMetadata } from '../runtime-types';

export function formatProvenanceSummary(metadata: ProvenanceMetadata): string[] {
  const lines: string[] = [];
  lines.push(`Task: ${metadata.taskType.replace(/_/g, ' ')}`);
  lines.push(`Status: ${metadata.approvalState.replace(/_/g, ' ')}`);
  if (metadata.doctrineReferences.length > 0) lines.push(`Doctrine: ${metadata.doctrineReferences.length} reference(s)`);
  if (metadata.governanceReferences.length > 0) lines.push(`Governance: ${metadata.governanceReferences.length} rule(s)`);
  lines.push(`Review: ${metadata.reviewRequired ? 'Required' : 'Not required'}`);
  lines.push(`Escalation: ${metadata.escalationLevel.replace(/_/g, ' ')}`);
  return lines;
}

export function getSimpleProvenanceDisplay(metadata: ProvenanceMetadata): { label: string; value: string }[] {
  return [
    { label: 'Task', value: metadata.taskType.replace(/_/g, ' ') },
    { label: 'Status', value: metadata.approvalState.replace(/_/g, ' ') },
    { label: 'Review', value: metadata.reviewRequired ? 'Required' : 'Not required' },
    { label: 'Human Approval', value: metadata.humanApprovalRequired ? 'Required' : 'Obtained' },
    { label: 'Escalation', value: metadata.escalationLevel.replace(/_/g, ' ') },
    { label: 'Output', value: metadata.outputBoundary.replace(/_/g, ' ') },
  ];
}
