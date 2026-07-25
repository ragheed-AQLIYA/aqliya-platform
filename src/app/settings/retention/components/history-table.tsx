"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RunHistory } from "./types";

type Props = { history: RunHistory[] };

export function HistoryTable({ history }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">سجل تشغيل السياسات</CardTitle>
        <CardDescription>
          عمليات تطبيق سياسات الاحتفاظ السابقة
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            لا توجد عمليات سابقة
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>بواسطة</TableHead>
                <TableHead>السجلات المتأثرة</TableHead>
                <TableHead>المدة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.completedAt).toLocaleString("ar-SA")}
                  </TableCell>
                  <TableCell>{entry.triggeredBy}</TableCell>
                  <TableCell>{entry.totalAffected}</TableCell>
                  <TableCell>{entry.durationMs}ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
