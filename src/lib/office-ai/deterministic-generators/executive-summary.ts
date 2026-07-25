import type { GeneratorTask, FileWithContent } from "./common";
import { disclaimer, sourceSection, header } from "./common";

export function generateExecutiveSummary(
  task: GeneratorTask,
  files: FileWithContent[],
): string {
  const lang = task.language;
  const ar = lang === "ar";
  let output = header(task, lang);

  if (ar) {
    output += `\n## الملخص التنفيذي\n\n`;
    output += `### نظرة عامة\n\n${task.instructions || "[نظرة عامة]"}\n\n`;
    output += `### النتائج الرئيسية\n\n`;
    if (files.some((f) => f.extractedContent)) {
      for (const f of files) {
        if (f.extractedContent) {
          output += `من ${f.filename}:\n${f.extractedContent.slice(0, 800)}\n\n`;
        }
      }
    } else {
      output += `- [النتيجة 1]\n- [النتيجة 2]\n- [النتيجة 3]\n`;
    }
    output += `\n### التوصيات\n\n1. [التوصية الأولى]\n2. [التوصية الثانية]\n`;
  } else {
    output += `\n## Executive Summary\n\n`;
    output += `### Overview\n\n${task.instructions || "[Overview]"}\n\n`;
    output += `### Key Findings\n\n`;
    if (files.some((f) => f.extractedContent)) {
      for (const f of files) {
        if (f.extractedContent) {
          output += `From ${f.filename}:\n${f.extractedContent.slice(0, 800)}\n\n`;
        }
      }
    } else {
      output += `- [Finding 1]\n- [Finding 2]\n- [Finding 3]\n`;
    }
    output += `\n### Recommendations\n\n1. [Recommendation 1]\n2. [Recommendation 2]\n`;
  }

  output += sourceSection(lang, files);
  output += disclaimer(lang);
  return output;
}
