import type { GeneratorTask, FileWithContent } from "./common";
import { disclaimer, sourceSection, header } from "./common";

export function generatePresentationOutline(
  task: GeneratorTask,
  files: FileWithContent[],
): string {
  const lang = task.language;
  const ar = lang === "ar";
  let output = header(task, lang);

  if (ar) {
    output += `\n## هيكل العرض التقديمي\n\n`;
    output += `1. **الشريحة 1: العنوان** — ${task.title || "عنوان العرض"}\n\n`;
    output += `2. **الشريحة 2: جدول الأعمال**\n`;
    if (files.some((f) => f.extractedContent)) {
      for (const f of files) {
        if (f.extractedContent) {
          const snippet = f.extractedContent.slice(0, 200);
          output += `   - محتوى مستخرج من ${f.filename}: ${snippet}\n`;
        }
      }
    } else {
      output += `   - [النقاط الرئيسية]\n`;
    }
    output += `\n3. **الشريحة 3: المقدمة**\n4. **الشريحة 4-6: المحتوى الرئيسي**\n5. **الشريحة 7: التحليل**\n6. **الشريحة 8: التوصيات**\n7. **الشريحة 9: الأسئلة**\n`;
  } else {
    output += `\n## Presentation Structure\n\n`;
    output += `1. **Slide 1: Title** — ${task.title || "Presentation Title"}\n\n`;
    output += `2. **Slide 2: Agenda**\n`;
    if (files.some((f) => f.extractedContent)) {
      for (const f of files) {
        if (f.extractedContent) {
          const snippet = f.extractedContent.slice(0, 200);
          output += `   - Content from ${f.filename}: ${snippet}\n`;
        }
      }
    } else {
      output += `   - [Key points]\n`;
    }
    output += `\n3. **Slide 3: Introduction**\n4. **Slides 4-6: Main Content**\n5. **Slide 7: Analysis**\n6. **Slide 8: Recommendations**\n7. **Slide 9: Q&A**\n`;
  }

  output += sourceSection(lang, files);
  output += disclaimer(lang);
  return output;
}
