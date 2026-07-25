"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { populateWorkbookFromTbAction } from "@/actions/localcontent-workbook-actions";
import { parseCsvTrialBalance } from "@/lib/local-content/workbook/csv-parser";
import type { TbLine } from "@/lib/local-content/workbook/types";

interface UseTbImportOptions {
  workbookId: string;
  projectId: string;
}

export function useTbImport({ workbookId, projectId }: UseTbImportOptions) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"json" | "csv">("csv");
  const [inputText, setInputText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [parsedLines, setParsedLines] = useState<TbLine[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setInputText("");
    setParsedLines(null);
    setParseErrors([]);
    setStatus("idle");
    setMessage("");
  }, []);

  const handleParse = useCallback(() => {
    setStatus("idle");
    setMessage("");
    setParsedLines(null);
    setParseErrors([]);

    if (!inputText.trim()) {
      setStatus("error");
      setMessage("الرجاء إدخال البيانات أو تحميل ملف");
      return;
    }

    if (inputMode === "json") {
      try {
        const parsed: unknown = JSON.parse(inputText.trim());

        if (!Array.isArray(parsed)) {
          setStatus("error");
          setMessage("يجب أن تكون بيانات JSON مصفوفة (array) من بنود الميزان");
          return;
        }

        const lines: TbLine[] = [];
        for (let i = 0; i < parsed.length; i++) {
          const item = parsed[i] as Record<string, unknown>;
          if (
            typeof item.accountCode !== "string" ||
            typeof item.accountName !== "string" ||
            typeof item.debit !== "number" ||
            typeof item.credit !== "number"
          ) {
            setStatus("error");
            setMessage(
              `البند ${i + 1} غير صالح: يجب أن يحتوي على accountCode (string), accountName (string), debit (number), credit (number)`,
            );
            return;
          }
          lines.push(item as unknown as TbLine);
        }

        if (lines.length === 0) {
          setStatus("error");
          setMessage("المصفوفة فارغة — لا توجد بنود ميزان للاستيراد");
          return;
        }

        setParsedLines(lines);
        setStatus("idle");
        setMessage(`✅ تم تحليل ${lines.length} بند من JSON بنجاح`);
      } catch (e) {
        setStatus("error");
        setMessage(`خطأ في تحليل JSON: ${e instanceof Error ? e.message : "تنسيق غير صالح"}`);
      }
    } else {
      const result = parseCsvTrialBalance(inputText);

      if (result.errors.length > 0) {
        setParseErrors(result.errors);
        setStatus("error");
        setMessage(`خطأ في تحليل CSV: ${result.errors[0]}`);
        return;
      }

      if (result.lines.length === 0) {
        setStatus("error");
        setMessage("لم يتم استخراج أي بنود من ملف CSV");
        return;
      }

      setParsedLines(result.lines);
      setStatus("idle");
      setMessage(`✅ تم تحليل ${result.parsedRows} بند من CSV بنجاح`);

      if (result.errors.length > 0) {
        setParseErrors(result.errors);
      }
    }
  }, [inputText, inputMode]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".csv") || fileName.endsWith(".tsv")) {
      setInputMode("csv");
    } else if (fileName.endsWith(".json")) {
      setInputMode("json");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      setTimeout(() => handleParse(), 100);
    };
    reader.readAsText(file);
  }, [handleParse]);

  const handleImport = useCallback(async () => {
    if (!parsedLines || parsedLines.length === 0) return;

    setStatus("loading");
    setMessage("جاري استيراد بيانات الميزان...");

    const res = await populateWorkbookFromTbAction(projectId, parsedLines);

    if (res.ok) {
      setStatus("success");
      const result = res.data;
      setMessage(
        `✅ تم الاستيراد بنجاح — ${result.autoFilledLines} بند معبأ تلقائياً، ${result.missingLines} بند ناقص`,
      );
      setTimeout(() => {
        setOpen(false);
        resetState();
        router.refresh();
      }, 2000);
    } else {
      setStatus("error");
      setMessage(`خطأ: ${res.error}`);
    }
  }, [parsedLines, projectId, router, resetState]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => resetState(), 200);
    }
    setOpen(newOpen);
  }, [resetState]);

  const handleModeChange = useCallback((mode: "json" | "csv") => {
    setInputMode(mode);
    setParsedLines(null);
    setStatus("idle");
    setMessage("");
    setParseErrors([]);
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
    setStatus("idle");
    setMessage("");
    setParsedLines(null);
    setParseErrors([]);
  }, []);

  return {
    open,
    inputMode,
    inputText,
    status,
    message,
    parsedLines,
    parseErrors,
    fileInputRef,
    handleParse,
    handleFileUpload,
    handleImport,
    handleOpenChange,
    handleModeChange,
    handleTextChange,
  };
}
