"use client";

import { useParams } from "next/navigation";
import { useTaskDetail } from "./components/use-task-detail";
import { TaskHeader } from "./components/task-header";
import { StatusStepper } from "./components/status-stepper";
import { InstructionsCard } from "./components/instructions-card";
import { SourceFilesCard } from "./components/source-files-card";
import { OutputSection } from "./components/output-section";
import { ReviewSection } from "./components/review-section";
import { ReExtractSection } from "./components/re-extract-section";

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;

  const {
    task,
    workspaceName,
    projectName,
    loading,
    error,
    currentStepIndex,
    canGenerate,
    canReview,
    hasFiles,
    isArchived,
    handleUpdateTask,
    handleAddFile,
    handleRemoveFile,
    handleGenerate,
    handleUpdateOutput,
    handleSubmitForReview,
    handleApprove,
    handleReject,
    handleArchive,
    handleReExtract,
  } = useTaskDetail(taskId);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!task) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Task not found.
      </div>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto" dir="rtl">
      <TaskHeader
        title={task.title}
        taskType={task.taskType}
        language={task.language}
        createdByName={task.createdByName}
        createdAt={task.createdAt}
        workspaceName={workspaceName}
        projectName={projectName}
        isArchived={isArchived}
        instructions={task.instructions}
        onUpdateTask={handleUpdateTask}
      />

      <StatusStepper
        currentStepIndex={currentStepIndex}
        status={task.status}
      />

      <InstructionsCard instructions={task.instructions} />

      <SourceFilesCard
        files={task.sourceFiles}
        isArchived={isArchived}
        canGenerate={canGenerate}
        onAddFile={handleAddFile}
        onRemoveFile={handleRemoveFile}
      />

      <OutputSection
        outputs={task.outputs}
        canGenerate={canGenerate}
        isArchived={isArchived}
        onGenerate={handleGenerate}
        onUpdateOutput={handleUpdateOutput}
      />

      <ReviewSection
        status={task.status}
        isArchived={isArchived}
        canReview={canReview}
        onSubmitForReview={handleSubmitForReview}
        onApprove={handleApprove}
        onReject={handleReject}
        onArchive={handleArchive}
      />

      <ReExtractSection
        files={task.sourceFiles}
        isArchived={isArchived}
        onReExtract={handleReExtract}
      />
    </main>
  );
}
