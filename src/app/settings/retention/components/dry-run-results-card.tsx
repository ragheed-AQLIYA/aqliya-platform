"use client";

import { Badge } from "@/components/ui/badge";
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
import type { DryRunResult } from "./types";
import { actionLabel, actionVariant, daysLabel, getModelLabel } from "./utils";

type Props = { results: DryRunResult[]; totalRecords: number };

export function DryRunResultsCard({ results, totalRecords }: Props) {
  return (
    <Card className="mb-6 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-lg">نتائج المعاينة</CardTitle>
        <CardDescription>
          {totalRecords} سجل سيكون متأثراً
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>النموذج</TableHead>
              <TableHead>الإجراء</TableHead>
              <TableHead>السجلات</TableHead>
              <TableHead>فترة الاحتفاظ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  لا توجد سجلات منتهية الصلاحية
                </TableCell>
              </TableRow>
            ) : (
              results.map((r) => (
                <TableRow key={r.modelName}>
                  <TableCell className="font-medium">
                    {getModelLabel(r.modelName)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionVariant(r.action)}>
                      {actionLabel(r.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.recordsFound}</TableCell>
                  <TableCell>{daysLabel(r.retentionDays)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
