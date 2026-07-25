"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NoteCard } from "./note-card";

interface BoardTabProps {
  notes: any[];
  filterStatus: string;
  error: string | null;
  respondingId: string | null;
  reviewingId: string | null;
  escalatingId: string | null;
  submitting: boolean;
  onFilterStatusChange: (status: string) => void;
  onRespond: (noteId: string, text: string) => void;
  onReview: (noteId: string, conclusion: string, comment: string) => void;
  onEscalate: (noteId: string, level: string, reason: string) => void;
  onStartWork: (noteId: string) => void;
  onSetRespondingId: (id: string | null) => void;
  onSetReviewingId: (id: string | null) => void;
  onSetEscalatingId: (id: string | null) => void;
}

export function BoardTab({
  notes,
  filterStatus,
  error,
  respondingId,
  reviewingId,
  escalatingId,
  submitting,
  onFilterStatusChange,
  onRespond,
  onReview,
  onEscalate,
  onStartWork,
  onSetRespondingId,
  onSetReviewingId,
  onSetEscalatingId,
}: BoardTabProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "raised", "assigned", "in_progress", "responded", "closed"].map(
          (s) => (
            <Button
              key={s}
              variant={filterStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterStatusChange(s)}
            >
              {s === "all"
                ? `الكل (${notes.length})`
                : `${s} (${notes.filter((n) => n.status === s).length})`}
            </Button>
          ),
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {notes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا توجد ملاحظات مراجعة
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              respondingId={respondingId}
              reviewingId={reviewingId}
              escalatingId={escalatingId}
              submitting={submitting}
              onRespond={onRespond}
              onReview={onReview}
              onEscalate={onEscalate}
              onStartWork={onStartWork}
              onSetRespondingId={onSetRespondingId}
              onSetReviewingId={onSetReviewingId}
              onSetEscalatingId={onSetEscalatingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
