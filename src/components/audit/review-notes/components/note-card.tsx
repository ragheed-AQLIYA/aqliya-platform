"use client";

import { Loader2, AlertTriangle, CheckCircle2, Clock, User, Flag, Send, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusColor, priorityColor, statusLabel, priorityLabel } from "./utils";
import { ResponseForm } from "./response-form";
import { EscalationForm } from "./escalation-form";
import { ReviewForm } from "./review-form";

interface NoteCardProps {
  note: any;
  respondingId: string | null;
  reviewingId: string | null;
  escalatingId: string | null;
  submitting: boolean;
  onRespond: (noteId: string, text: string) => void;
  onReview: (noteId: string, conclusion: string, comment: string) => void;
  onEscalate: (noteId: string, level: string, reason: string) => void;
  onStartWork: (noteId: string) => void;
  onSetRespondingId: (id: string | null) => void;
  onSetReviewingId: (id: string | null) => void;
  onSetEscalatingId: (id: string | null) => void;
}

export function NoteCard({
  note,
  respondingId,
  reviewingId,
  escalatingId,
  submitting,
  onRespond,
  onReview,
  onEscalate,
  onStartWork,
  onSetRespondingId,
  onSetReviewingId,
  onSetEscalatingId,
}: NoteCardProps) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge className={priorityColor(note.priority)}>
                {priorityLabel(note.priority)}
              </Badge>
              <Badge className={statusColor(note.status)}>
                {statusLabel(note.status)}
              </Badge>
              {note.reviewNoteNumber && (
                <span className="text-xs font-mono text-muted-foreground">
                  {note.reviewNoteNumber}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {note.targetLabel || `${note.targetType}: ${note.targetId}`}
            </p>
            <p className="font-medium mt-2">{note.comment}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {note.raiserName || note.raiserId}
              </span>
              {note.assignedToId && (
                <span className="flex items-center gap-1">
                  <Flag className="h-3 w-3" />
                  مكلف لـ: {note.assignedToId}
                </span>
              )}
              {note.slaTargetHours && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  SLA: {note.slaTargetHours} ساعة
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Response section */}
        {note.status !== "closed" && note.status !== "reviewed" && (
          <div className="mt-3 border-t pt-3">
            {/* Respond */}
            {respondingId === note.id ? (
              <ResponseForm
                onSubmit={(text) => onRespond(note.id, text)}
                onCancel={() => onSetRespondingId(null)}
              />
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onSetRespondingId(note.id)}>
                  <MessageSquare className="ml-1 h-3 w-3" />
                  رد
                </Button>
                {["raised", "assigned"].includes(note.status) && (
                  <Button size="sm" variant="outline" onClick={() => onStartWork(note.id)}>
                    <Clock className="ml-1 h-3 w-3" />
                    بدء العمل
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => onSetEscalatingId(note.id)}>
                  <AlertTriangle className="ml-1 h-3 w-3" />
                  تصعيد
                </Button>
              </div>
            )}

            {/* Escalation form */}
            {escalatingId === note.id && (
              <EscalationForm
                onSubmit={(level, reason) => onEscalate(note.id, level, reason)}
                onCancel={() => onSetEscalatingId(null)}
              />
            )}

            {/* Review/close section */}
            {reviewingId === note.id ? (
              <ReviewForm
                onSubmit={(conclusion, comment) => onReview(note.id, conclusion, comment)}
                onCancel={() => onSetReviewingId(null)}
              />
            ) : (
              note.status === "responded" || note.status === "evidenced" ? (
                <Button size="sm" className="mt-2" onClick={() => onSetReviewingId(note.id)}>
                  <CheckCircle2 className="ml-1 h-3 w-3" />
                  مراجعة وإغلاق
                </Button>
              ) : null
            )}
          </div>
        )}

        {/* Escalations */}
        {note.escalations && note.escalations.length > 0 && (
          <div className="mt-2 space-y-1">
            {note.escalations.map((esc: any) => (
              <div key={esc.id} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                <AlertTriangle className="h-3 w-3" />
                {esc.escalationLevel}: {esc.reason}
                {esc.resolvedAt && (
                  <Badge className="bg-green-100 text-green-700">تم الحل</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Response & closure info */}
        {note.responseDescription && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
            <p className="text-xs font-medium text-muted-foreground mb-1">الرد:</p>
            <p>{note.responseDescription}</p>
          </div>
        )}
        {note.closedAt && (
          <p className="mt-1 text-xs text-green-600">
            أغلقت: {new Date(note.closedAt).toLocaleDateString("ar-SA")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
