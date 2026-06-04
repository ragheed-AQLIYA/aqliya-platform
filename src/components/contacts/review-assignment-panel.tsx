"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";

interface Reviewer {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Review {
  id: string;
  reviewType: string;
  status: string;
  reviewerId: string;
  reviewerName: string | null;
  reason: string | null;
  reviewerNotes: string | null;
  reviewDueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  approvals: {
    id: string;
    approverName: string | null;
    status: string;
    note: string | null;
    createdAt: string;
  }[];
}

interface ReviewAssignmentPanelProps {
  contactId: string;
  organizationId: string;
  reviews: Review[];
  availableReviewers: Reviewer[];
  userRole: string;
}

export function ReviewAssignmentPanel({
  contactId,
  organizationId,
  reviews,
  availableReviewers,
  userRole,
}: ReviewAssignmentPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [reviewType, setReviewType] = useState("sensitivity");
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [completeReviewId, setCompleteReviewId] = useState("");

  const REVIEW_STATUS_LABELS: Record<string, string> = {
    pending: "قيد المراجعة",
    approved: "معتمد",
    changes_requested: "تعديلات مطلوبة",
    rejected: "مرفوض",
  };

  const REVIEW_STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    changes_requested: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
  };

  const REVIEW_TYPE_LABELS: Record<string, string> = {
    sensitivity: "مراجعة حساسية",
    accuracy: "مراجعة دقة",
    completeness: "مراجعة اكتمال",
    custom: "مخصص",
  };

  async function handleAssign() {
    if (!selectedReviewer) return;
    setLoading("assign");
    try {
      const { assignReviewer } = await import("@/actions/contact-review-actions");
      await assignReviewer(contactId, selectedReviewer, reviewType, reason || undefined, dueDate || undefined);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleComplete(reviewId: string) {
    setLoading(`complete-${reviewId}`);
    try {
      const { completeReview } = await import("@/actions/contact-review-actions");
      await completeReview(reviewId, notes || undefined);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  const canManage = userRole === "ADMIN" || userRole === "OPERATOR";
  const pendingReviews = reviews.filter((r) => r.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          إدارة المراجعات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage && (
          <details className="border rounded-lg p-3">
            <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground">
              <UserPlus className="inline ml-1 h-4 w-4" />
              تعيين مراجع جديد
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-sm font-medium">المراجع</label>
                <select
                  value={selectedReviewer}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="">اختر مراجع...</option>
                  {availableReviewers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">نوع المراجعة</label>
                <select
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="sensitivity">مراجعة حساسية</option>
                  <option value="accuracy">مراجعة دقة</option>
                  <option value="completeness">مراجعة اكتمال</option>
                  <option value="custom">مخصص</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">السبب</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="سبب المراجعة"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">تاريخ الاستحقاق</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                />
              </div>
              <Button
                onClick={handleAssign}
                disabled={loading === "assign" || !selectedReviewer}
                size="sm"
              >
                {loading === "assign" ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <UserPlus className="ml-1 h-4 w-4" />}
                تعيين مراجع
              </Button>
            </div>
          </details>
        )}

        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">لا توجد مراجعات</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const isOverdue = review.status === "pending" && review.reviewDueDate && new Date(review.reviewDueDate) < new Date();
              return (
                <div key={review.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={REVIEW_STATUS_COLORS[review.status] || ""}>
                        {REVIEW_STATUS_LABELS[review.status] || review.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {REVIEW_TYPE_LABELS[review.reviewType] || review.reviewType}
                      </Badge>
                      {isOverdue && (
                        <AlertTriangle className="h-4 w-4 text-red-500" aria-label="متأخر" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  {review.reviewerName && (
                    <p className="text-sm">المراجع: {review.reviewerName}</p>
                  )}
                  {review.reason && (
                    <p className="text-sm text-muted-foreground">{review.reason}</p>
                  )}
                  {review.reviewDueDate && (
                    <p className="text-xs text-muted-foreground">
                      <Clock className="inline ml-1 h-3 w-3" />
                      تاريخ الاستحقاق: {new Date(review.reviewDueDate).toLocaleDateString("ar-SA")}
                      {isOverdue && <span className="text-red-500"> (متأخر)</span>}
                    </p>
                  )}
                  {review.reviewerNotes && (
                    <p className="text-sm bg-muted p-2 rounded">
                      ملاحظات: {review.reviewerNotes}
                    </p>
                  )}
                  {review.completedAt && (
                    <p className="text-xs text-muted-foreground">
                      اكتملت في: {new Date(review.completedAt).toLocaleDateString("ar-SA")}
                    </p>
                  )}

                  {review.approvals.length > 0 && (
                    <div className="space-y-1 mt-2 border-t pt-2">
                      <p className="text-xs font-medium text-muted-foreground">الموافقات:</p>
                      {review.approvals.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-xs">
                          <span>
                            {a.approverName ?? "مستخدم"}:{" "}
                            {a.status === "approved" ? (
                              <span className="text-green-600">✓ معتمد</span>
                            ) : (
                              <span className="text-red-600">✗ مرفوض</span>
                            )}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(a.createdAt).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {review.status === "pending" && canManage && (
                    <div className="mt-2 space-y-2">
                      <div>
                        <label className="text-xs font-medium">ملاحظات الإكمال</label>
                        <Textarea
                          value={completeReviewId === review.id ? notes : ""}
                          onChange={(e) => {
                            setCompleteReviewId(review.id);
                            setNotes(e.target.value);
                          }}
                          placeholder="ملاحظات المراجعة"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleComplete(review.id)}
                          disabled={loading === `complete-${review.id}`}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {loading === `complete-${review.id}` ? (
                            <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="ml-1 h-4 w-4" />
                          )}
                          إكمال المراجعة
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pendingReviews.length > 0 && (
          <div className="border-t pt-2">
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>{pendingReviews.length} مراجعة (مراجعات) معلقة</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
