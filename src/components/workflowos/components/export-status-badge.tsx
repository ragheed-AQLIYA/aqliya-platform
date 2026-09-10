"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface ExportStatusBadgeProps {
  status: string;
}

export function ExportStatusBadge({ status }: ExportStatusBadgeProps) {
  switch (status) {
    case "none":
      return <Badge variant="outline">لم يُطلب بعد</Badge>;
    case "requested":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="ms-1 h-3 w-3" />
          قيد المراجعة
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle2 className="ms-1 h-3 w-3" />
          معتمد
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="ms-1 h-3 w-3" />
          مرفوض
        </Badge>
      );
    default:
      return null;
  }
}
