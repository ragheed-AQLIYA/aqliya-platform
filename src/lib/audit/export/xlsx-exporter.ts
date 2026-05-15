import * as XLSX from 'xlsx'
import type { ExportInput, ExportResult, Exporter } from './types'

function buildCoverSheet(input: ExportInput): XLSX.WorkSheet {
  const data: string[][] = []
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

  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 15 }]
  return ws
}

function buildStatementsSheet(input: ExportInput): XLSX.WorkSheet {
  const data: (string | number)[][] = []
  for (const stmt of input.statements) {
    data.push([stmt.title, '', ''])
    data.push(['Account', 'Amount (SAR)', ''])
    for (const line of stmt.lines) {
      const indent = line.indentLevel > 0 ? '  '.repeat(line.indentLevel) : ''
      const label = line.isTotal ? `${indent}${line.label}` : `${indent}${line.label}`
      data.push([label, line.amount, ''])
    }
    data.push(['', '', ''])
  }
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 55 }, { wch: 20 }, { wch: 10 }]
  return ws
}

function buildNotesSheet(input: ExportInput): XLSX.WorkSheet {
  const data: (string | number | string[])[][] = []
  data.push(['Note #', 'Title', 'Status', 'Missing Information'])
  for (const note of input.notes) {
    data.push([note.noteNumber, note.title, note.status, note.missingInformation.join(', ')])
  }
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 12 }, { wch: 35 }]
  return ws
}

function buildEvidenceSheet(input: ExportInput): XLSX.WorkSheet | null {
  if (!input.evidence || input.evidence.length === 0) return null
  const data: (string | number)[][] = []
  data.push(['Filename', 'Type', 'State', 'Size (KB)', 'Hash'])
  for (const ev of input.evidence) {
    data.push([ev.filename, ev.fileType, ev.state, Math.round(ev.fileSize / 1024), ev.fileHash.substring(0, 12)])
  }
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 35 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 16 }]
  return ws
}

function buildFindingsSheet(input: ExportInput): XLSX.WorkSheet | null {
  if (!input.findings || input.findings.length === 0) return null
  const data: (string | number)[][] = []
  data.push(['Title', 'Type', 'Severity', 'Status'])
  for (const f of input.findings) {
    data.push([f.title, f.findingType, f.severity, f.status])
  }
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 10 }, { wch: 12 }]
  return ws
}

export const xlsxExporter: Exporter = {
  format: 'xlsx',

  async generate(input: ExportInput): Promise<ExportResult> {
    const wb = XLSX.utils.book_new()

    const coverSheet = buildCoverSheet(input)
    XLSX.utils.book_append_sheet(wb, coverSheet, 'Cover')

    const stmtSheet = buildStatementsSheet(input)
    XLSX.utils.book_append_sheet(wb, stmtSheet, 'Statements')

    if (input.notes.length > 0) {
      const notesSheet = buildNotesSheet(input)
      XLSX.utils.book_append_sheet(wb, notesSheet, 'Notes')
    }

    if (input.evidence && input.evidence.length > 0) {
      const evSheet = buildEvidenceSheet(input)
      if (evSheet) XLSX.utils.book_append_sheet(wb, evSheet, 'Evidence')
    }

    if (input.findings && input.findings.length > 0) {
      const findSheet = buildFindingsSheet(input)
      if (findSheet) XLSX.utils.book_append_sheet(wb, findSheet, 'Findings')
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer

    return {
      format: 'xlsx',
      filename: `financial_statements_${input.metadata.engagementId.substring(0, 8)}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
      sizeBytes: buffer.length,
    }
  },
}
