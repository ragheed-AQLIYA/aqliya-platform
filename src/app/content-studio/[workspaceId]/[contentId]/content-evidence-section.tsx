"use client";

import { Card, CardContent } from "@/components/ui/card";
import { EvidenceHeader } from "./components/evidence-header";
import { EvidenceUploadForm } from "./components/evidence-upload-form";
import { EvidenceList } from "./components/evidence-list";
import { useContentEvidence } from "./components/use-content-evidence";

export function ContentEvidenceSection({
  contentId,
}: {
  contentId: string;
}) {
  const {
    evidence,
    loading,
    error,
    showUpload,
    uploading,
    editingDescription,
    editDescriptionValue,
    setShowUpload,
    handleUpload,
    handleDelete,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleEditChange,
  } = useContentEvidence(contentId);

  return (
    <Card>
      <EvidenceHeader
        onToggleUpload={() => setShowUpload(!showUpload)}
      />
      <CardContent className="space-y-3">
        {showUpload && (
          <EvidenceUploadForm
            uploading={uploading}
            onUpload={handleUpload}
            onCancel={() => setShowUpload(false)}
          />
        )}

        <EvidenceList
          evidence={evidence}
          loading={loading}
          error={error}
          editingDescription={editingDescription}
          editDescriptionValue={editDescriptionValue}
          onDelete={handleDelete}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onEditChange={handleEditChange}
        />
      </CardContent>
    </Card>
  );
}
