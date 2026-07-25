"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesEvidenceLinkView } from "@/lib/sales/evidence-links";

export function AccountBriefEvidenceCard({
  evidenceCount,
  evidenceLinks,
}: {
  evidenceCount: number;
  evidenceLinks: SalesEvidenceLinkView[];
}) {
  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          الأدلة ({evidenceCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y- 2 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{evidenceCount}</span>{" "}
          دليل مرتبط بهذا الحساب.
        </p>
        {evidenceLinks.length > 0 ? (
          <ul className="space-y-1 text-muted-foreground">
            {evidenceLinks.map((link) => (
              <li key={link.id}>
                {link.title}
                <span className="text-xs"> ({link.evidenceId})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">لا روابط أدلة.</p>
        )}
      </CardContent>
    </Card>
  );
}
