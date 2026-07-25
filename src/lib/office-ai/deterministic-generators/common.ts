export interface GeneratorTask {
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

export function disclaimer(language: string): string {
  return language === "ar"
    ? "\n\n---\n*مسودة أولية تحتاج مراجعة بشرية. الذكاء يساعد — الإنسان يقرر.*"
    : "\n\n---\n*Initial draft requiring human review. AI assists — humans decide.*";
}

export function sourceSection(language: string, files: FileWithContent[]): string {
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

export function header(task: GeneratorTask, language: string): string {
  if (language === "ar") {
    return `# ${task.title || "مسودة"} \n\n**النوع:** ${task.taskType}  \n**تم الإنشاء بواسطة:** ${task.createdByName || "النظام"}  \n`;
  }
  return `# ${task.title || "Draft"} \n\n**Type:** ${task.taskType}  \n**Created by:** ${task.createdByName || "System"}  \n`;
}

export function previewContent(files: FileWithContent[], language: string): string {
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
