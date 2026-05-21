// ─── Deterministic Generators for Office AI Assistant ───
// Generates structured markdown outputs based on task metadata.
// Uses extracted file content when available; falls back to filename-only.

interface GeneratorTask {
  id: string;
  title: string | null;
  taskType: string;
  instructions: string | null;
  language: string;
  createdByName: string | null;
}

export interface FileWithContent {
  filename: string;
  fileType: string;
  extractedContent?: string;
  extractionStatus?: string;
}

function disclaimer(language: string): string {
  return language === "ar"
    ? "\n\n---\n*مسودة أولية تحتاج مراجعة بشرية. الذكاء يساعد — الإنسان يقرر.*"
    : "\n\n---\n*Initial draft requiring human review. AI assists — humans decide.*";
}

function sourceSection(language: string, files: FileWithContent[]): string {
  if (files.length === 0) {
    return language === "ar"
      ? "\n\n**الملفات المصدر:** لا توجد ملفات مصدر مرفقة بعد."
      : "\n\n**Source Files:** No source files attached yet.";
  }
  const lines: string[] = [];
  for (const f of files) {
    let line = `- ${f.filename} (${f.fileType})`;
    if (f.extractionStatus === "completed" && f.extractedContent) {
      line +=
        language === "ar" ? " ✅ تم استخراج المحتوى" : " ✅ Content extracted";
    } else if (f.extractionStatus === "failed") {
      line +=
        language === "ar" ? " ⚠ فشل استخراج المحتوى" : " ⚠ Extraction failed";
    } else if (f.extractionStatus === "skipped") {
      line += language === "ar" ? " ⏭ غير مدعوم" : " ⏭ Unsupported";
    } else {
      line +=
        language === "ar" ? " 🔲 لم يتم الاستخراج بعد" : " 🔲 Not extracted";
    }
    lines.push(line);
  }
  return `\n\n**${language === "ar" ? "الملفات المصدر:" : "Source Files:"}**\n${lines.join("\n")}`;
}

function header(task: GeneratorTask, language: string): string {
  if (language === "ar") {
    return `# ${task.title || "مسودة"} \n\n**النوع:** ${task.taskType}  \n**تم الإنشاء بواسطة:** ${task.createdByName || "النظام"}  \n`;
  }
  return `# ${task.title || "Draft"} \n\n**Type:** ${task.taskType}  \n**Created by:** ${task.createdByName || "System"}  \n`;
}

function previewContent(files: FileWithContent[], language: string): string {
  if (language === "ar") {
    let out = "\n\n## المحتوى المستخرج من الملفات\n\n";
    for (const f of files) {
      if (f.extractedContent) {
        out += `**من: ${f.filename}**\n\n`;
        out += f.extractedContent.slice(0, 2000) + "\n\n";
      }
    }
    return out;
  }
  let out = "\n\n## Extracted File Content\n\n";
  for (const f of files) {
    if (f.extractedContent) {
      out += `**From: ${f.filename}**\n\n`;
      out += f.extractedContent.slice(0, 2000) + "\n\n";
    }
  }
  return out;
}

// ─── Individual Generators ───

function generateDocumentSummary(
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

function generateExcelAnalysis(
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

function generateReportDraft(
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

function generatePresentationOutline(
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

function generateExecutiveSummary(
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

function generateMeetingNotes(
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

// ─── Router ───

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
