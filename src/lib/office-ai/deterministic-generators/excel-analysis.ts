import type { GeneratorTask, FileWithContent } from "./common";
import { disclaimer, sourceSection, header, previewContent } from "./common";

export function generateExcelAnalysis(
  task: GeneratorTask,
  files: FileWithContent[],
): string {
  const lang = task.language;
  const ar = lang === "ar";
  let output = header(task, lang);

  if (ar) {
    output += `\n## تحليل البيانات\n\n`;
  } else {
    output += `\n## Data Analysis\n\n`;
  }

  if (files.some((f) => f.extractedContent && f.fileType === "csv")) {
    output += previewContent(files, lang);
  } else {
    output += ar
      ? "لم يتم العثور على ملف CSV أو Excel لتحليله.\n\n"
      : "No CSV or Excel file found for analysis.\n\n";
  }

  output += sourceSection(lang, files);
  output += disclaimer(lang);
  return output;
}
