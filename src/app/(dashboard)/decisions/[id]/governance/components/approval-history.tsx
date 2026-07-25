"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getApprovalVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "outline";
  }
}

interface ApprovalHistoryProps {
  latestApproval: any;
  approvals: any[];
  reviewActions: any[];
}

export function ApprovalHistory({
  latestApproval,
  approvals,
  reviewActions,
}: ApprovalHistoryProps) {
  return (
    <>
      {latestApproval && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">آخر اعتماد</h3>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {latestApproval.approver || "غير معروف"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {latestApproval.comments}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(latestApproval.createdAt).toLocaleString()}
                </div>
                {latestApproval.recommendationId && (
                  <div className="text-xs text-muted-foreground mt-1">
                    معرف التوصية: {latestApproval.recommendationId}
                  </div>
                )}
              </div>
              <Badge variant={getApprovalVariant(latestApproval.status)}>
                {latestApproval.status}
              </Badge>
            </div>
          </Card>
        </section>
      )}

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">سجل الاعتماد</h3>
        {approvals?.length > 0 ? (
          <div className="space-y-2">
            {approvals.map((approval: any) => (
              <Card key={approval.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {approval.approver?.name || "غير معروف"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {approval.comments}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(approval.createdAt).toLocaleString()}
                    </div>
                    {approval.recommendationId && (
                      <div className="text-xs text-muted-foreground mt-1">
                        اللقطة: {approval.recommendationId}
                      </div>
                    )}
                  </div>
                  <Badge variant={getApprovalVariant(approval.status)}>
                    {approval.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            لا توجد اعتمادات بعد
          </p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">سجل تدقيق المراجعة</h3>
        {reviewActions?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراء</TableHead>
                <TableHead>بواسطة</TableHead>
                <TableHead>التفاصيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewActions.map((action: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>
                    {new Date(action.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {action.action.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{action.user || "غير معروف"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {action.details?.reason ||
                      action.details?.conditions ||
                      action.details?.notes ||
                      action.details?.overrideReason ||
                      "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            لا توجد إجراءات مراجعة بعد
          </p>
        )}
      </section>
    </>
  );
}
