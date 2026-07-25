"use client";

import { ScrollText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { SkillInfo } from "./types";
import { levelLabel } from "./utils";

interface SkillsTableProps {
  skills: SkillInfo[];
  evalRunning: boolean;
  evalSkillId: string | null;
  onRunSkill: (skillId: string) => void;
}

export function SkillsTable({ skills, evalRunning, evalSkillId, onRunSkill }: SkillsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScrollText className="h-5 w-5" />
          المهارات
        </CardTitle>
        <CardDescription>
          {skills.length} مهارة — {skills.filter((s) => s.hasDataset).length} منها جاهزة للتقييم
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المهارة</TableHead>
              <TableHead className="text-right">المستوى</TableHead>
              <TableHead className="text-right">التصنيف</TableHead>
              <TableHead className="text-right">بيانات</TableHead>
              <TableHead className="text-right">معايير</TableHead>
              <TableHead className="text-right">الإجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.skillId}>
                <TableCell className="font-medium">
                  {skill.skillName}
                  <div className="text-muted-foreground text-xs">{skill.version}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{levelLabel(skill.level)}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {skill.category}
                </TableCell>
                <TableCell>
                  {skill.hasDataset ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      —
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {skill.criteriaCount > 0 ? (
                    <span>{skill.criteriaCount}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={evalRunning || !skill.hasDataset}
                    onClick={() => onRunSkill(skill.skillId)}
                  >
                    {evalRunning && evalSkillId === skill.skillId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "تشغيل"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
