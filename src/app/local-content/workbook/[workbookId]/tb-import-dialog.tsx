"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useTbImport } from "./components/use-tb-import";
import { TbImportTrigger } from "./components/tb-import-trigger";
import { TbFileUpload } from "./components/tb-file-upload";
import { TbModeTabs } from "./components/tb-mode-tabs";
import { TbParseButton } from "./components/tb-parse-button";
import { TbStatusMessage } from "./components/tb-status-message";
import { TbParseWarnings } from "./components/tb-parse-warnings";
import { TbParsedSummary } from "./components/tb-parsed-summary";
import { TbImportFooter } from "./components/tb-import-footer";

interface Props {
  workbookId: string;
  projectId: string;
  disabled?: boolean;
}

export function TbImportDialog({ workbookId, projectId, disabled }: Props) {
  const {
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
  } = useTbImport({ workbookId, projectId });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <TbImportTrigger disabled={disabled} />
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>استيراد ميزان المراجعة / Import Trial Balance</DialogTitle>
          <DialogDescription>
            ألصق بيانات الميزان (CSV أو JSON) أو حمّل ملف. سيتم تعبئة بنود الدفتر آلياً حسب الأنماط المطابقة.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <TbFileUpload fileInputRef={fileInputRef} onFileUpload={handleFileUpload} />

          <TbModeTabs
            inputMode={inputMode}
            inputText={inputText}
            onModeChange={handleModeChange}
            onTextChange={handleTextChange}
          />

          {parsedLines === null && (
            <TbParseButton disabled={!inputText.trim()} onParse={handleParse} />
          )}

          <TbStatusMessage message={message} status={status} />

          <TbParseWarnings
            parseErrors={parseErrors}
            hasLines={!!parsedLines && parsedLines.length > 0}
          />

          {parsedLines && parsedLines.length > 0 && (
            <TbParsedSummary parsedLines={parsedLines} />
          )}
        </div>

        <DialogFooter>
          <TbImportFooter
            hasParsedLines={!!parsedLines && parsedLines.length > 0}
            status={status}
            onCancel={() => handleOpenChange(false)}
            onImport={handleImport}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
