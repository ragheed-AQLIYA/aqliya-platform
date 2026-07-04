"use client";

import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function WorkflowOSNotFound() {
  return (
    <main className="mx-auto max-w-4xl p-8" dir="rtl">
      <Card className="border-dashed border-amber-200 dark:border-amber-900/50">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
            <FileQuestion className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">الصفحة غير موجودة</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              الصفحة التي تبحث عنها غير موجودة في مساحة WorkflowOS. قد تكون
              محذوفة أو الرابط غير صحيح.
            </p>
          </div>
          <Link href="/workflowos">
            <Button size="sm">
              <Home className="ms-1 h-4 w-4" />
              العودة إلى WorkflowOS
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
