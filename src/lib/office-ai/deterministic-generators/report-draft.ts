import type { GeneratorTask, FileWithContent } from "./common";
import { disclaimer, sourceSection, header } from "./common";

export function generateReportDraft(
  task: GeneratorTask,
  files: FileWithContent[],
): string {
  const lang = task.language;
  const ar = lang === "ar";
  let output = header(task, lang);

  if (ar) {
    output += `\n## الملخص التنفيذي\n\n${task.instructions || "[ملخص تنفيذي — سيتم تعبئته بعد تحليل الملفات]"}\n\n`;
    output += `## المقدمة\n\n[مقدمة التقرير]\n\n`;
    output += `## النتائج\n\n`;
    if (files.some((f) => f.extractedContent)) {
      for (const f of files) {
        if (f.extractedContent) {
          output += `### من: ${f.filename}\n\n${f.extractedContent.slice(0, 1500)}\n\n`;
        }
      }
    } else {
      output += `[ستظهر النتائج بعد تحليل الملفات]\n\n`;
    }
    output += `## التوصيات\n\n1. [التوصية الأولى]\n2. [التوصية الثانية]\n\n`;
    output += `## الخاتمة\n\n[خاتمة]\n`;
  } else {
    output += `\n## Executive Summary\n\n${task.instructions || "[Executive summary — will be populated after file analysis]"}\n\n`;
    output += `## Introduction\n\n[Report introduction]\n\n`;
    output += `## Findings\n\n`;
    if (files.some((f) => f.extractedContent)) {
      for (const f of files) {
        if (f.extractedContent) {
          output += `### From: ${f.filename}\n\n${f.extractedContent.slice(0, 1500)}\n\n`;
        }
      }
    } else {
      output += `[Findings will appear after file analysis]\n\n`;
    }
    output += `## Recommendations\n\n1. [Recommendation 1]\n2. [Recommendation 2]\n\n`;
    output += `## Conclusion\n\n[Conclusion]\n`;
  }

  output += sourceSection(lang, files);
  output += disclaimer(lang);
  return output;
}
