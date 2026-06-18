"use client";

import { useState, useEffect } from "react";
import { getContactAuditTrail } from "@/actions/contact-actions";
import type { AuditTrailEntry } from "@/actions/contact-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Loader2 } from "lucide-react";

interface AuditTrailViewerProps {
  contactId: string;
}

export function AuditTrailViewer({ contactId }: AuditTrailViewerProps) {
  const [entries, setEntries] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const result = await getContactAuditTrail(contactId);
      if (!cancelled) {
        if (result.ok) {
          setEntries(result.data);
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [contactId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          سجل التدقيق
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري التحميل...
          </div>
        ) : entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">لا يوجد سجل تدقيق</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-3 font-medium whitespace-nowrap">الوقت</th>
                  <th className="text-right py-2 px-3 font-medium whitespace-nowrap">المستخدم</th>
                  <th className="text-right py-2 px-3 font-medium whitespace-nowrap">الإجراء</th>
                  <th className="text-right py-2 px-3 font-medium whitespace-nowrap">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-3 text-muted-foreground whitespace-nowrap text-xs" dir="ltr">
                      {new Date(entry.createdAt).toLocaleString("ar-SA")}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {entry.actorName || entry.actorEmail || "—"}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">{entry.action}</td>
                    <td className="py-2 px-3 text-muted-foreground text-xs max-w-xs truncate">
                      {entry.metadata ? JSON.stringify(entry.metadata).slice(0, 120) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
