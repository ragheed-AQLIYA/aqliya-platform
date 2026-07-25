"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InstructionsCard({
  instructions,
}: {
  instructions: string | null;
}) {
  if (!instructions) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-sm">Instructions / التعليمات</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm p-3 rounded-md bg-muted whitespace-pre-wrap">
          {instructions}
        </p>
      </CardContent>
    </Card>
  );
}
