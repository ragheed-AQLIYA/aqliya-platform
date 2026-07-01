import type { Decision, DecisionType, DecisionStatus } from '../types/entities';
import { ID_PATTERNS } from '../types/identifiers';
import { RegistryError } from '../types/errors';
import { parseMarkdownTable } from '../shared/parser';

const VALID_DECISION_TYPES: DecisionType[] = ['MAT', 'STR', 'COM', 'FRZ', 'MOD', 'EVI', 'GRC'];

const VALID_DECISION_STATUSES: DecisionStatus[] = [
  'Draft',
  'Under Review',
  'Approved',
  'Rejected',
  'Active',
  'Superseded',
  'Archived',
];

function parseDecisionType(raw: string): DecisionType {
  const trimmed = raw.trim().toUpperCase();
  for (const t of VALID_DECISION_TYPES) {
    if (t === trimmed) {
      return t;
    }
  }
  return 'MAT';
}

function parseDecisionStatus(raw: string): DecisionStatus {
  const trimmed = raw.trim();
  for (const s of VALID_DECISION_STATUSES) {
    if (s.toLowerCase() === trimmed.toLowerCase()) {
      return s;
    }
  }
  return 'Draft';
}

function parseDate(raw: string): string {
  const trimmed = raw.trim();
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateRegex.test(trimmed)) {
    return trimmed;
  }
  return new Date().toISOString();
}

function parseArrayField(raw: string): string[] {
  if (!raw || raw.trim() === '—' || raw.trim() === '') {
    return [];
  }
  return raw
    .replace(/^\[|\]$/g, '')
    .split(/[,;]\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function findTableWithDecisionHeader(markdown: string): string[][] | null {
  const candidates = [
    '| DEC-ID | Type | Title | Authority | Date | Affected | Status',
    '| DEC-ID | Type | Product | Decision | Authority | Date | Status',
    '| DEC-ID | Type | Product | Status | Date | Review Date',
    '| DEC-ID | Type | Title |',
    '| DEC-ID |',
  ];

  for (const head of candidates) {
    const table = parseMarkdownTable(markdown, head);
    if (table.length > 1) {
      return table;
    }
  }

  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('| DEC-ID') && trimmed.includes('|')) {
      const table = parseMarkdownTable(markdown, trimmed);
      if (table.length > 1) {
        return table;
      }
    }
  }

  return null;
}

function findAllDecisionTables(markdown: string): string[][][] {
  const tables: string[][][] = [];
  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('| DEC-ID') && trimmed.includes('|')) {
      const table = parseMarkdownTable(markdown, trimmed);
      if (table.length > 0) {
        tables.push(table);
      }
    }
  }

  return tables;
}

function tryParseDecisionRow(row: string[]): Decision | null {
  const decId = row[0]?.trim() ?? '';
  if (!decId || !ID_PATTERNS.DECISION.test(decId)) {
    return null;
  }

  const get = (idx: number): string => (idx >= 0 && idx < row.length ? (row[idx] ?? '').trim() : '');
  const cols = row.length;

  if (cols >= 7) {
    const decision: Decision = {
      id: decId,
      version: '1.0',
      type: parseDecisionType(get(1)),
      title: get(2) || decId,
      authority: get(4) || 'Governance Team',
      decisionDate: parseDate(get(5)),
      effectiveDate: parseDate(get(5)),
      reviewDate: parseDate(get(5)),
      affectedClaims: [],
      evidenceReviewed: [],
      accepted: [],
      rejected: [],
      conditions: [],
      rationale: get(3) || '',
      governingRule: 'GR-000',
      status: parseDecisionStatus(get(6)),
    };

    if (cols >= 8) {
      decision.reviewDate = parseDate(get(7));
    }

    return decision;
  }

  if (cols >= 5) {
    return {
      id: decId,
      version: '1.0',
      type: parseDecisionType(get(1)),
      title: get(2) || decId,
      authority: get(3) || 'Governance Team',
      decisionDate: parseDate(get(4)),
      effectiveDate: parseDate(get(4)),
      reviewDate: parseDate(get(4)),
      affectedClaims: [],
      evidenceReviewed: [],
      accepted: [],
      rejected: [],
      conditions: [],
      rationale: '',
      governingRule: 'GR-000',
      status: parseDecisionStatus(cols >= 6 ? get(5) : 'Draft'),
    };
  }

  return null;
}

export function parseDecisionRegistry(markdown: string): Decision[] {
  if (!markdown || markdown.trim().length === 0) {
    throw new RegistryError('Empty markdown content for decision-registry.md', 'decision-registry.md');
  }

  const decisions: Decision[] = [];
  const seenIds = new Set<string>();

  const tables = findAllDecisionTables(markdown);

  for (const table of tables) {
    const headerIdx = table.findIndex((row) =>
      row.some((cell) => /^DEC-ID$/i.test(cell.trim())),
    );

    if (headerIdx < 0) {
      continue;
    }

    const dataRows = table.slice(headerIdx + 1).filter((row) => {
      return row.some((cell) => cell.trim() !== '' && !/^---$/.test(cell.trim()));
    });

    for (const row of dataRows) {
      const decision = tryParseDecisionRow(row);
      if (decision === null) {
        continue;
      }

      if (seenIds.has(decision.id)) {
        throw new RegistryError(`Duplicate DEC-ID: ${decision.id}`, 'decision-registry.md');
      }
      seenIds.add(decision.id);

      decisions.push(decision);
    }
  }

  return decisions;
}
