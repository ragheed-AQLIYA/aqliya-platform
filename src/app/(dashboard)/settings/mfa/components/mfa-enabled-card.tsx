"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  onDisableClick: () => void;
}

export function MFAEnabledCard({ onDisableClick }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تم تفعيل التحقق بخطوتين</CardTitle>
        <CardDescription>
          حسابك محمي بالتحقق بخطوتين. يمكنك تعطيله في أي وقت.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={onDisableClick}>
          تعطيل التحقق بخطوتين
        </Button>
      </CardContent>
    </Card>
  );
}
