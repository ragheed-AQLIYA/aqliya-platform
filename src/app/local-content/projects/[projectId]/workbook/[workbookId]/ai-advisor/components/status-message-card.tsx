"use client";

import { Card, CardContent } from "@/components/ui/card";

interface Props {
  message: string | null;
}

export function StatusMessageCard({ message }: Props) {
  if (!message) return null;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="py-3">
        <p className="text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}
