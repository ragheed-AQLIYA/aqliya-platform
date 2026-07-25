"use client";

// ─── AuditOS L6.6 Review Notes Workflow Board ───

import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, Clock, Plus } from "lucide-react";

import { useReviewNotesBoard } from "./components/use-review-notes-board";
import { BoardTab } from "./components/board-tab";
import { SLATab } from "./components/sla-tab";
import { CreateTab } from "./components/create-tab";

interface ReviewNotesBoardProps {
  engagementId: string;
}

export function ReviewNotesBoard({ engagementId }: ReviewNotesBoardProps) {
  const { state, actions } = useReviewNotesBoard(engagementId);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={state.activeTab} onValueChange={actions.setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="board">
            <ListChecks className="ml-2 h-4 w-4" />
            لوحة الملاحظات
          </TabsTrigger>
          <TabsTrigger value="sla">
            <Clock className="ml-2 h-4 w-4" />
            مؤشرات الأداء
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="ml-2 h-4 w-4" />
            ملاحظة جديدة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <BoardTab
            notes={state.notes}
            filterStatus={state.filterStatus}
            error={state.error}
            respondingId={state.respondingId}
            reviewingId={state.reviewingId}
            escalatingId={state.escalatingId}
            submitting={state.submitting}
            onFilterStatusChange={actions.setFilterStatus}
            onRespond={actions.handleRespond}
            onReview={actions.handleReview}
            onEscalate={actions.handleEscalate}
            onStartWork={actions.handleStartWork}
            onSetRespondingId={actions.setRespondingId}
            onSetReviewingId={actions.setReviewingId}
            onSetEscalatingId={actions.setEscalatingId}
          />
        </TabsContent>

        <TabsContent value="sla">
          <SLATab
            slaMetrics={state.slaMetrics}
            slaTargets={state.slaTargets}
          />
        </TabsContent>

        <TabsContent value="create">
          <CreateTab
            targetType={state.newTargetType}
            targetId={state.newTargetId}
            targetLabel={state.newTargetLabel}
            priority={state.newPriority}
            stage={state.newStage}
            assignee={state.newAssignee}
            comment={state.newComment}
            error={state.error}
            submitting={state.submitting}
            onTargetTypeChange={actions.setNewTargetType}
            onTargetIdChange={actions.setNewTargetId}
            onTargetLabelChange={actions.setNewTargetLabel}
            onPriorityChange={actions.setNewPriority}
            onStageChange={actions.setNewStage}
            onAssigneeChange={actions.setNewAssignee}
            onCommentChange={actions.setNewComment}
            onSubmit={actions.handleCreateNote}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
