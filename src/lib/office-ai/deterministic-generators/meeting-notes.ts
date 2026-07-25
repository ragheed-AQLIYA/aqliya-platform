import type { GeneratorTask, FileWithContent } from "./common";
import { disclaimer, sourceSection, header } from "./common";

export function generateMeetingNotes(
  task: GeneratorTask,
  files: FileWithContent[],
): string {
  const lang = task.language;
  const ar = lang === "ar";
  let output = header(task, lang);

  if (ar) {
    output += `\n## ملخص الاجتماع\n\n`;
    output += `### الحضور\n- [قائمة الحضور]\n\n`;
    output += `### الموضوعات التي تمت مناقشتها\n\n`;
    if (task.instructions) {
      output += `${task.instructions}\n\n`;
    }
    if (files.some((f) => f.extractedContent)) {
      for (const f of files) {
        if (f.extractedContent)
          output += `من ${f.filename}: ${f.extractedContent.slice(0, 500)}\n\n`;
      }
    }
    output += `### القرارات\n- [القرار 1]\n\n### العناصر القابلة للتنفيذ\n| المسؤول | العنصر | الموعد |\n|---|---|---|\n| | | |\n`;
  } else {
    output += `\n## Meeting Notes Summary\n\n`;
    output += `### Attendees\n- [List]\n\n`;
    output += `### Topics Discussed\n\n`;
    if (task.instructions) {
      output += `${task.instructions}\n\n`;
    }
    if (files.some((f) => f.extractedContent)) {
      for (const f of files) {
        if (f.extractedContent)
          output += `From ${f.filename}: ${f.extractedContent.slice(0, 500)}\n\n`;
      }
    }
    output += `### Decisions\n- [Decision 1]\n\n### Action Items\n| Owner | Action | Due |\n|---|---|---|\n| | | |\n`;
  }

  output += sourceSection(lang, files);
  output += disclaimer(lang);
  return output;
}
