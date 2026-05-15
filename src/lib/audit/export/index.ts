import type { ExportInput, ExportResult, ExportFormat, Exporter } from './types'
import { pdfExporter } from './pdf-exporter'
import { xlsxExporter } from './xlsx-exporter'

const exporters: Record<ExportFormat, Exporter> = {
  pdf: pdfExporter,
  xlsx: xlsxExporter,
}

export function getExporter(format: ExportFormat): Exporter {
  const exp = exporters[format]
  if (!exp) throw new Error(`Unsupported export format: ${format}. Supported: ${Object.keys(exporters).join(', ')}`)
  return exp
}

export async function generateExport(input: ExportInput, format: ExportFormat): Promise<ExportResult> {
  return getExporter(format).generate(input)
}

export { pdfExporter, xlsxExporter }
export type { ExportInput, ExportResult, ExportFormat, Exporter } from './types'
