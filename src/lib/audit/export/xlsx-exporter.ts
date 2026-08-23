import { createWorkbook, aoaToSheet, writeBuffer } from '@/lib/xlsx'
import type { Workbook } from '@/lib/xlsx'
import type { ExportInput, ExportResult, Exporter } from './types'

function buildCoverSheet(wb: Workbook, input: ExportInput): void {
  const data: (string | number)[][] = []
  const m = input.metadata
  data.push([`${'AQLIYA'} AuditOS`, '', ''])
  data.push(['Financial Statements Export', '', ''])
  data.push(['', '', ''])
  data.push(['Client:', m.clientName, ''])
  data.push(['Period:', m.fiscalPeriod, ''])
  data.push(['Framework:', m.reportingFramework, ''])
  data.push(['Currency:', m.currency, ''])
  data.push(['Status:', m.status, ''])
  data.push(['Exported:', new Date(m.exportedAt).toISOString(), ''])
  data.push(['', '', ''])
  if (m.labels.draftWarning) {
    data.push([m.labels.draftWarning, '', ''])
    data.push(['', '', ''])
  }
  if (m.labels.approvalInfo) {
    data.push([m.labels.approvalInfo, '', ''])
  }
  data.push(['', '', ''])
  data.push(['Statement', 'Type', 'Lines'])
  for (const stmt of input.statements) {
    data.push([stmt.title, stmt.statementType, String(stmt.lines.length)])
  }
  data.push(['', '', ''])
  data.push(['Notes Summary:', `${input.notes.length} notes`, ''])
  if (input.evidence) data.push(['Evidence Items:', String(input.evidence.length), ''])
  if (input.findings) data.push(['Findings:', String(input.findings.length), ''])
  if (input.recommendations) data.push(['Recommendations:', String(input.recommendations.length), ''])

  aoaToSheet(wb, data, { sheetName: 'Cover', colWidths: [30, 40, 15] })
}

function buildStatementsSheet(wb: Workbook, input: ExportInput): void {
  const data: (string | number)[][] = []
  for (const stmt of input.statements) {
    data.push([stmt.title, '', ''])
    data.push(['Account', 'Amount (SAR)', ''])
    for (const line of stmt.lines) {
      const indent = line.indentLevel > 0 ? '  '.repeat(line.indentLevel) : ''
      const label = `${indent}${line.label}`
      data.push([label, line.amount, ''])
    }
    data.push(['', '', ''])
  }
  aoaToSheet(wb, data, { sheetName: 'Statements', colWidths: [55, 20, 10] })
}

function buildNotesSheet(wb: Workbook, input: ExportInput): void {
  const data: (string | number)[][] = []
  data.push(['Note #', 'Title', 'Status', 'Missing Information'])
  for (const note of input.notes) {
    data.push([note.noteNumber, note.title, note.status, note.missingInformation.join(', ')])
  }
  aoaToSheet(wb, data, { sheetName: 'Notes', colWidths: [10, 40, 12, 35] })
}

function buildEvidenceSheet(wb: Workbook, input: ExportInput): boolean {
  if (!input.evidence || input.evidence.length === 0) return false
  const data: (string | number)[][] = []
  data.push(['Filename', 'Type', 'State', 'Size (KB)', 'Hash'])
  for (const ev of input.evidence) {
    data.push([ev.filename, ev.fileType, ev.state, Math.round(ev.fileSize / 1024), ev.fileHash.substring(0, 12)])
  }
  aoaToSheet(wb, data, { sheetName: 'Evidence', colWidths: [35, 8, 12, 12, 16] })
  return true
}

function buildFindingsSheet(wb: Workbook, input: ExportInput): boolean {
  if (!input.findings || input.findings.length === 0) return false
  const data: (string | number)[][] = []
  data.push(['Title', 'Type', 'Severity', 'Status'])
  for (const f of input.findings) {
    data.push([f.title, f.findingType, f.severity, f.status])
  }
  aoaToSheet(wb, data, { sheetName: 'Findings', colWidths: [35, 18, 10, 12] })
  return true
}

export const xlsxExporter: Exporter = {
  format: 'xlsx',

  async generate(input: ExportInput): Promise<ExportResult> {
    const wb = createWorkbook()

    buildCoverSheet(wb, input)
    buildStatementsSheet(wb, input)

    if (input.notes.length > 0) {
      buildNotesSheet(wb, input)
    }

    if (input.evidence && input.evidence.length > 0) {
      buildEvidenceSheet(wb, input)
    }

    if (input.findings && input.findings.length > 0) {
      buildFindingsSheet(wb, input)
    }

    const buffer = await writeBuffer(wb)

    return {
      format: 'xlsx',
      filename: `financial_statements_${input.metadata.engagementId.substring(0, 8)}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
      sizeBytes: buffer.length,
    }
  },
}
