import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Upload, PlusCircle } from "lucide-react";
import { CATEGORY_LABELS } from "./constants";
import type { DataRequestWithItems } from "@/lib/local-content/workbook/types";
import type { WorkbookDetailActions, WorkbookDetailState } from "../use-workbook-detail";

interface Props {
  dataRequests: DataRequestWithItems[];
  state: WorkbookDetailState;
  actions: WorkbookDetailActions;
}

export function DataRequestsTab({ dataRequests, state, actions }: Props) {
  const { canAccessRequests, isLoading } = state;

  if (!canAccessRequests) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>استورد الميزان أولا لتعبئة الدفتر.</p>
      </div>
    );
  }

  if (dataRequests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>لا توجد طلبات بيانات بعد.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={actions.handleGenerateRequest}
          disabled={isLoading === "gen-request"}
        >
          <PlusCircle className="h-4 w-4 ml-1" />
          إنشاء طلب بيانات
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dataRequests.map((req) => (
        <Card key={req.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{req.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge>{req.status}</Badge>
                {req.status === "draft" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => actions.handleSendRequest(req.id)}
                    disabled={isLoading === `send-${req.id}`}
                  >
                    <Send className="h-3 w-3 ml-1" />
                    إرسال
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => actions.handleViewRequestText(req.id)}
                >
                  عرض النص
                </Button>
              </div>
            </div>
            {req.description && (
              <p className="text-xs text-muted-foreground">
                {req.description}
              </p>
            )}
            {req.sentAt && (
              <p className="text-xs text-muted-foreground">
                أُرسل: {req.sentAt.toLocaleDateString("ar-SA")}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {req.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm p-2 border rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.label}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </Badge>
                      {item.evidenceRequired && (
                        <span className="text-blue-500">إثبات</span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.status === "fulfilled"
                        ? "default"
                        : item.status === "waived"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {item.status === "fulfilled"
                      ? "مكتمل"
                      : item.status === "waived"
                        ? "متنازل"
                        : "مفتوح"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
