"use client";

import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportDropdownProps {
  t: (key: string, params?: Record<string, string>) => string;
  exporting: "pdf" | "xlsx" | null;
  onExport: (format: "pdf" | "xlsx") => void;
}

export function ExportDropdown({ t, exporting, onExport }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting !== null}>
          {exporting ? (
            <Loader2 className="size-4 me-1 animate-spin" />
          ) : (
            <Download className="size-4 me-1" />
          )}
          {exporting
            ? t("exporting", { format: exporting.toUpperCase() })
            : t("export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onExport("pdf")}>
          <FileText className="size-4 me-2" />
          {t("exportPDF")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("xlsx")}>
          <FileSpreadsheet className="size-4 me-2" />
          {t("exportXLSX")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
