"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DecisionRolesProps {
  owner: any;
  reviewer: any;
  approver: any;
}

export function DecisionRoles({ owner, reviewer, approver }: DecisionRolesProps) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold mb-4">أدوار القرار</h3>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">المالك</div>
          <div className="font-medium">
            {owner?.name || "غير معيّن"}
          </div>
          <div className="text-xs text-muted-foreground">
            {owner?.email}
          </div>
          <Badge variant="outline" className="mt-1">
            {owner?.role}
          </Badge>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">المراجع</div>
          <div className="font-medium">
            {reviewer?.name || "غير معيّن"}
          </div>
          <div className="text-xs text-muted-foreground">
            {reviewer?.email}
          </div>
          <Badge variant="outline" className="mt-1">
            {reviewer?.role}
          </Badge>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">المعتمِد</div>
          <div className="font-medium">
            {approver?.name || "غير معيّن"}
          </div>
          <div className="text-xs text-muted-foreground">
            {approver?.email}
          </div>
          <Badge variant="outline" className="mt-1">
            {approver?.role}
          </Badge>
        </Card>
      </div>
    </section>
  );
}
