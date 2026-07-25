import type { GeneratorTask, FileWithContent } from "./common";
import { generateDocumentSummary } from "./document-summary";
import { generateExcelAnalysis } from "./excel-analysis";
import { generateReportDraft } from "./report-draft";
import { generatePresentationOutline } from "./presentation-outline";
import { generateExecutiveSummary } from "./executive-summary";
import { generateMeetingNotes } from "./meeting-notes";

export function generateDeterministicOfficeAiOutput(
  task: GeneratorTask,
  files: FileWithContent[],
): { content: string; format: string } {
  const generators: Record<
    string,
    (t: GeneratorTask, f: FileWithContent[]) => string
  > = {
    document_summary: generateDocumentSummary,
    excel_analysis: generateExcelAnalysis,
    report_draft: generateReportDraft,
    presentation_outline: generatePresentationOutline,
    executive_summary: generateExecutiveSummary,
    meeting_notes: generateMeetingNotes,
  };

  const generator = generators[task.taskType];
  if (!generator) {
    throw new Error(`Unsupported task type: ${task.taskType}`);
  }

  const content = generator(task, files);
  return { content, format: "markdown" };
}
