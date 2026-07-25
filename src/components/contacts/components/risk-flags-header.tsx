"use client";

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus } from "lucide-react";

interface RiskFlagsHeaderProps {
  activeCount: number;
  showForm: boolean;
  onToggleForm: () => void;
}

export function RiskFlagsHeader({ activeCount, showForm, onToggleForm }: RiskFlagsHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="flex items-center gap-2 text-base">
        <AlertTriangle className="h-5 w-5" />
        علامات المخاطر
        {activeCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {activeCount}
          </Badge>
        )}
      </CardTitle>
      <Button variant="outline" size="sm" onClick={onToggleForm}>
        <Plus className="ml-1 h-4 w-4" />
        {showForm ? "إلغاء" : "إضافة"}
      </Button>
    </CardHeader>
  );
}
