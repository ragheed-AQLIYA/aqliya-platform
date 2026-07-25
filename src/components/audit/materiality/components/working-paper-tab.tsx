"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

interface WorkingPaperTabProps {
  workingPaper: string | null;
  loading: boolean;
  onGenerateWorkingPaper: () => void;
}

export function WorkingPaperTab({ workingPaper, loading, onGenerateWorkingPaper }: WorkingPaperTabProps) {
  return (
    <TabsContent value="paper" className="space-y-4">
      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ورقة عمل الأهمية النسبية
          </CardTitle>
          <CardDescription>
            وثيقة توثيق الأهمية النسبية وفقاً لـ ISA 320
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workingPaper ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900">
              {workingPaper}
            </pre>
          ) : (
            <p className="text-muted-foreground">
              اضغط على "إنشاء ورقة العمل" لعرض وثيقة الأهمية النسبية
            </p>
          )}
          <Button
            variant="outline"
            className="mt-4"
            onClick={onGenerateWorkingPaper}
            disabled={loading}
          >
            <FileText className="ml-2 h-4 w-4" />
            {loading ? "جارٍ الإنشاء..." : "إنشاء ورقة العمل"}
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
