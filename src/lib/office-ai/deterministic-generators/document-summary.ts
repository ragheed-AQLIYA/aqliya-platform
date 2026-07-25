import type { GeneratorTask, FileWithContent } from "./common";
import { disclaimer, sourceSection, header, previewContent } from "./common";

export function generateDocumentSummary(
  task: GeneratorTask,
  files: FileWithContent[],
): string {
  const lang = task.language;
  const ar = lang === "ar";
  let output = header(task, lang);

  if (ar) {
    output += `\n## ملخص المستند\n\n`;
    output += task.instructions ? `> ${task.instructions}\n\n` : "";
    output += files.some((f) => f.extractedContent)
      ? "تم تحليل الملفات المرفقة واستخراج المحتوى النصي.\n\n"
      : "لم يتم استخراج المحتوى من الملفات بعد.\n\n";
  } else {
    output += `\n## Document Summary\n\n`;
    output += task.instructions ? `> ${task.instructions}\n\n` : "";
    output += files.some((f) => f.extractedContent)
      ? "Attached files were analyzed and text content was extracted.\n\n"
      : "File content has not been extracted yet.\n\n";
  }

  if (files.some((f) => f.extractedContent)) {
    output += previewContent(files, lang);
  }

  output += sourceSection(lang, files);
  output += disclaimer(lang);
  return output;
}
