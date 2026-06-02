"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function AccountBriefExportButton({ accountId }: { accountId: string }) {
  function handleExport() {
    window.open(
      `/sales/accounts/${accountId}/brief/export`,
      "_blank",
      "noopener",
    );
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 ml-1" />
        طباعة
      </Button>
      <Button type="button" size="sm" onClick={handleExport}>
        <Printer className="h-4 w-4 ml-1" />
        تصدير HTML
      </Button>
    </div>
  );
}
