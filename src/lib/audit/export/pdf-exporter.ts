import PDFDocument from 'pdfkit'
import type { ExportInput, ExportResult, Exporter } from './types'
import type { FinancialStatementLine } from '@/types/audit'

const COMPANY_NAME = 'AQLIYA'
const PRODUCT_NAME = 'AuditOS'

function sar(v: number): string {
  return `SAR ${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
}

function drawHeader(doc: PDFKit.PDFDocument, input: ExportInput): void {
  const m = input.metadata
  doc.fontSize(14).font('Helvetica-Bold').text(`${COMPANY_NAME} ${PRODUCT_NAME}`, { align: 'left' })
  doc.fontSize(8).font('Helvetica').text('Financial Statements — Draft Export', { align: 'left' })
  doc.moveDown(0.3)
  doc.fontSize(9).font('Helvetica')
  doc.text(`Client: ${m.clientName}  |  Period: ${m.fiscalPeriod}  |  Standard: ${m.reportingFramework}  |  Currency: ${m.currency}`)
  doc.text(`Exported: ${new Date(m.exportedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}  |  Status: ${m.status}`)
  doc.moveDown(0.5)

  if (m.labels.draftWarning) {
    doc.fontSize(8).fillColor('#cc5500').font('Helvetica-Oblique')
    doc.text(m.labels.draftWarning, { align: 'center' })
    doc.fillColor('#000000').font('Helvetica')
    doc.moveDown(0.3)
  }

  if (m.labels.approvalInfo) {
    doc.fontSize(8).fillColor('#2b7a2b').font('Helvetica-Oblique')
    doc.text(m.labels.approvalInfo, { align: 'center' })
    doc.fillColor('#000000').font('Helvetica')
    doc.moveDown(0.3)
  }

  doc.moveDown(0.5)
}

function drawStatementTable(doc: PDFKit.PDFDocument, title: string, lines: FinancialStatementLine[]): void {
  doc.fontSize(11).font('Helvetica-Bold').text(title, { align: 'left' })
  doc.moveDown(0.2)

  const pageWidth = 540
  const leftMargin = 50
  const labelX = leftMargin
  const amountX = leftMargin + pageWidth - 100
  const colWidth = pageWidth - 100
  const availableWidth = pageWidth

  for (const line of lines) {
    const indent = line.indentLevel * 15
    const label = line.label
    const amount = line.amount

    doc.fontSize(line.isTotal ? 9 : 8)
    doc.font(line.isTotal ? 'Helvetica-Bold' : 'Helvetica')

    if (line.isTotal) {
      doc.moveDown(0.1)
      const y = doc.y
      doc.moveTo(leftMargin, y).lineTo(leftMargin + availableWidth, y).strokeColor('#cccccc').stroke()
      doc.moveDown(0.1)
    }

    doc.text(label, labelX + indent, doc.y, { width: colWidth - indent, align: 'left', lineBreak: true })
    const afterLabel = doc.y
    doc.text(sar(amount), amountX, afterLabel - 9, { width: 90, align: 'right' })
    doc.y = Math.max(doc.y, afterLabel) + 1

    if (line.isTotal) {
      doc.moveDown(0.05)
      const y2 = doc.y
      doc.moveTo(leftMargin, y2).lineTo(leftMargin + availableWidth, y2).strokeColor('#cccccc').stroke()
      doc.moveDown(0.1)
    }
  }

  doc.moveDown(0.5)
}

function drawNotesSummary(doc: PDFKit.PDFDocument, input: ExportInput): void {
  if (input.notes.length === 0) return

  doc.addPage()
  doc.fontSize(14).font('Helvetica-Bold').text('Notes to the Financial Statements', { align: 'left' })
  doc.moveDown(0.5)

  for (const note of input.notes) {
    doc.fontSize(9).font('Helvetica-Bold').text(`${note.noteNumber}. ${note.title}`)
    doc.fontSize(8).font('Helvetica')
    const cleanContent = note.content.replace(/<[^>]*>/g, '').substring(0, 600)
    doc.text(cleanContent, { indent: 10 })
    if (note.missingInformation.length > 0) {
      doc.fontSize(7).fillColor('#cc5500').font('Helvetica-Oblique')
      doc.text(`Missing information: ${note.missingInformation.join(', ')}`)
      doc.fillColor('#000000').font('Helvetica')
    }
    doc.moveDown(0.3)
  }
}

export const pdfExporter: Exporter = {
  format: 'pdf',

  async generate(input: ExportInput): Promise<ExportResult> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
      info: {
        Title: `Financial Statements - ${input.metadata.clientName}`,
        Author: `${COMPANY_NAME} ${PRODUCT_NAME}`,
        Subject: 'Draft Financial Statements',
        Creator: `${COMPANY_NAME} ${PRODUCT_NAME}`,
      },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    const endPromise = new Promise<void>((resolve) => doc.on('end', () => resolve()))

    drawHeader(doc, input)

    for (const stmt of input.statements) {
      if (doc.y > 650) doc.addPage()
      drawStatementTable(doc, stmt.title, stmt.lines)
    }

    drawNotesSummary(doc, input)

    // Footer with page numbers
    const range = doc.bufferedPageRange()
    if (range && range.count > 0) {
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i)
        const bottom = doc.page.margins?.bottom ?? 40
        doc.fontSize(7).fillColor('#888888').font('Helvetica')
        doc.text(
          `${COMPANY_NAME} ${PRODUCT_NAME} — Draft — Page ${i}`,
          50,
          doc.page.height - bottom - 10,
          { align: 'center', width: 495 },
        )
      }
    }

    doc.end()
    await endPromise

    const buffer = Buffer.concat(chunks)

    return {
      format: 'pdf',
      filename: `financial_statements_${input.metadata.engagementId.substring(0, 8)}.pdf`,
      mimeType: 'application/pdf',
      buffer,
      sizeBytes: buffer.length,
    }
  },
}
