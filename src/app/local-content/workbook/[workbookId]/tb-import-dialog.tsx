"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { populateWorkbookFromTbAction } from "@/actions/localcontent-workbook-actions";
import { parseCsvTrialBalance } from "@/lib/local-content/workbook/csv-parser";
import type { TbLine } from "@/lib/local-content/workbook/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, FileType } from "lucide-react";

interface Props {
  workbookId: string;
  projectId: string;
  disabled?: boolean;
}

export function TbImportDialog({ workbookId, projectId, disabled }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"json" | "csv">("csv");
  const [inputText, setInputText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [parsedLines, setParsedLines] = useState<TbLine[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = () => {
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
      // CSV mode
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect file type from extension
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
  };

  const handleImport = async () => {
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
        setInputText("");
        setParsedLines(null);
        setParseErrors([]);
        setStatus("idle");
        setMessage("");
        router.refresh();
      }, 2000);
    } else {
      setStatus("error");
      setMessage(`خطأ: ${res.error}`);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        setInputText("");
        setParsedLines(null);
        setParseErrors([]);
        setStatus("idle");
        setMessage("");
      }, 200);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Upload className="h-4 w-4 ml-1" />
          استيراد ميزان
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>استيراد ميزان المراجعة / Import Trial Balance</DialogTitle>
          <DialogDescription>
            ألصق بيانات الميزان (CSV أو JSON) أو حمّل ملف. سيتم تعبئة بنود الدفتر آلياً حسب الأنماط المطابقة.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload */}
          <div>
            <Label>تحميل ملف / Upload File</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.json,text/csv,application/json"
                onChange={handleFileUpload}
                className="text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <span className="text-xs text-muted-foreground">CSV أو TSV أو JSON</span>
            </div>
          </div>

          {/* Mode tabs: CSV / JSON */}
          <Tabs
            value={inputMode}
            onValueChange={(v) => {
              setInputMode(v as "json" | "csv");
              setParsedLines(null);
              setStatus("idle");
              setMessage("");
              setParseErrors([]);
            }}
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="csv">
                <FileType className="h-4 w-4 ml-1" />
                CSV
              </TabsTrigger>
              <TabsTrigger value="json">
                <FileSpreadsheet className="h-4 w-4 ml-1" />
                JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="csv" className="space-y-3">
              <div>
                <Label>بيانات CSV / TSV</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setStatus("idle");
                    setMessage("");
                    setParsedLines(null);
                    setParseErrors([]);
                  }}
                  placeholder={`Account Code,Account Name,Debit,Credit
44010001,إيرادات عقارية,0,50000000
3204010091,تكلفة خدمات,15000000,0`}
                  rows={8}
                  className="font-mono text-sm"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  يدعم الفواصل (,) والفاصلة المنقوطة (;) وعلامات التبويب. يتعرف على رؤوس الأعمدة بالعربية والإنجليزية.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="json" className="space-y-3">
              <div>
                <Label>بيانات JSON</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setStatus("idle");
                    setMessage("");
                    setParsedLines(null);
                    setParseErrors([]);
                  }}
                  placeholder={`[\n  {"accountCode": "44010001", "accountName": "إيرادات عقارية", "debit": 0, "credit": 50000000},\n  {"accountCode": "3204010091", "accountName": "تكلفة خدمات", "debit": 15000000, "credit": 0}\n]`}
                  rows={8}
                  className="font-mono text-sm"
                  dir="ltr"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Parse button */}
          {parsedLines === null && (
            <Button
              variant="secondary"
              onClick={handleParse}
              disabled={!inputText.trim()}
              className="w-full"
            >
              <FileSpreadsheet className="h-4 w-4 ml-1" />
              تحليل البيانات / Parse
            </Button>
          )}

          {/* Status message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                status === "error"
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : status === "success"
                    ? "bg-green-500/10 text-green-700 border border-green-500/20"
                    : status === "loading"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted text-muted-foreground border"
              }`}
            >
              {message}
            </div>
          )}

          {/* Parse warnings */}
          {parseErrors.length > 0 && parsedLines && parsedLines.length > 0 && (
            <div className="p-2 rounded-lg text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20">
              <p className="font-medium mb-1">تحذيرات:</p>
              {parseErrors.map((err, i) => (
                <p key={i}>⚠ {err}</p>
              ))}
            </div>
          )}

          {/* Parsed summary */}
          {parsedLines && parsedLines.length > 0 && (
            <div className="text-sm text-muted-foreground border rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="font-medium mb-1">
                البنود المستوردة ({parsedLines.length}):
              </p>
              {parsedLines.slice(0, 10).map((line, idx) => (
                <div key={idx} className="flex gap-2 text-xs font-mono py-0.5">
                  <span className="w-24 truncate">{line.accountCode}</span>
                  <span className="flex-1 truncate">{line.accountName}</span>
                  <span className="w-24 text-left shrink-0">
                    {line.debit > 0
                      ? `مدين ${line.debit.toLocaleString("ar-SA")}`
                      : line.credit > 0
                        ? `دائن ${line.credit.toLocaleString("ar-SA")}`
                        : "-"}
                  </span>
                </div>
              ))}
              {parsedLines.length > 10 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ...و {parsedLines.length - 10} بند آخر
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={status === "loading"}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleImport}
            disabled={!parsedLines || parsedLines.length === 0 || status === "loading"}
          >
            {status === "loading" ? "جاري الاستيراد..." : "استيراد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
