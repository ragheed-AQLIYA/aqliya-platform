"use client";

import { FileSpreadsheet, FileType } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  inputMode: "json" | "csv";
  inputText: string;
  onModeChange: (mode: "json" | "csv") => void;
  onTextChange: (text: string) => void;
}

export function TbModeTabs({ inputMode, inputText, onModeChange, onTextChange }: Props) {
  return (
    <Tabs
      value={inputMode}
      onValueChange={(v) => onModeChange(v as "json" | "csv")}
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
            value={inputMode === "csv" ? inputText : ""}
            onChange={(e) => onTextChange(e.target.value)}
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
            value={inputMode === "json" ? inputText : ""}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={`[\n  {"accountCode": "44010001", "accountName": "إيرادات عقارية", "debit": 0, "credit": 50000000},\n  {"accountCode": "3204010091", "accountName": "تكلفة خدمات", "debit": 15000000, "credit": 0}\n]`}
            rows={8}
            className="font-mono text-sm"
            dir="ltr"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
