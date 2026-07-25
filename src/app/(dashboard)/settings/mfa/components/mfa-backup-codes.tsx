"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  codes: string[];
  saved: boolean;
  onSaved: () => void;
}

export function MFABackupCodes({ codes, saved, onSaved }: Props) {
  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <CardHeader>
        <CardTitle className="text-base">رموز الاسترجاع الطارئة</CardTitle>
        <CardDescription>
          احفظ هذه الرموز في مكان آمن. كل رمز يمكن استخدامه مرة واحدة فقط.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-sm space-y-1 mb-4" dir="ltr">
          {codes.map((code, i) => (
            <div key={i} className="p-1 bg-background rounded">{code}</div>
          ))}
        </div>
        {!saved && (
          <Button variant="outline" size="sm" onClick={onSaved}>
            لقد حفظت الرموز
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
