"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PendingFlag, OrgMemory } from "./types";

interface Props {
  pendingFlags: PendingFlag[];
  orgMemory: OrgMemory[];
}

export function FpMemoryTab({ pendingFlags, orgMemory }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="text-lg font-semibold mb-3">
          نتائج خاطئة / False Positive Flags
          {pendingFlags.length > 0 && (
            <Badge variant="destructive" className="mr-2">
              {pendingFlags.length}
            </Badge>
          )}
        </h3>
        {pendingFlags.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              لا توجد نتائج خاطئة بانتظار المراجعة
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {pendingFlags.map((f) => (
              <Card key={f.id} className="border-l-4 border-l-amber-500">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                        {f.accountCode}
                      </code>{" "}
                      <span className="text-sm">{f.accountName}</span>
                      <span className="text-xs text-muted-foreground mr-2">
                        ({f.workbookLineCode})
                      </span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {f.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {f.riskReason}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">
          ذاكرة التجاوزات / Organization Memory
        </h3>
        {orgMemory.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              لا توجد قرارات سابقة مسجلة
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {orgMemory.slice(0, 10).map((m, i) => (
              <Card key={i} className="border-l-4 border-l-purple-500">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                        {m.accountCode}
                      </code>{" "}
                      <Badge
                        variant={
                          m.previousResult === "matched"
                            ? "default"
                            : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {m.previousResult}
                      </Badge>
                    </div>
                    <code className="text-xs text-muted-foreground">
                      {m.workbookLineCode}
                    </code>
                  </div>
                  {m.overrideReason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.overrideReason}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
