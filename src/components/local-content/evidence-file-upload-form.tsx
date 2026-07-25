"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceFileUploadTrigger } from "./components/evidence-file-upload-trigger";
import { EvidenceFileInput } from "./components/evidence-file-input";
import { EvidenceTypeSelect } from "./components/evidence-type-select";
import { SupplierSelect } from "./components/supplier-select";
import { ErrorBanner } from "./components/error-banner";
import { UploadResultCard } from "./components/upload-result-card";
import { FormActions } from "./components/form-actions";
import { useEvidenceFileUpload } from "./components/use-evidence-file-upload";

interface EvidenceFileUploadFormProps {
  projectId: string;
  suppliers: { id: string; name: string }[];
  onSuccess?: () => void;
}

export function EvidenceFileUploadForm({
  projectId,
  suppliers,
  onSuccess,
}: EvidenceFileUploadFormProps) {
  const { open, loading, error, result, fileInputRef, handleSubmit, setOpen, close } =
    useEvidenceFileUpload(projectId, onSuccess);

  if (!open) {
    return <EvidenceFileUploadTrigger onClick={() => setOpen(true)} />;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">رفع ملف دليل</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <EvidenceFileInput ref={fileInputRef} />
          <EvidenceTypeSelect />
          <SupplierSelect suppliers={suppliers} />
          {error && <ErrorBanner message={error} />}
          {result && (
            <UploadResultCard
              filename={result.filename}
              mimeType={result.mimeType}
              sizeBytes={result.sizeBytes}
              evidenceType={result.evidenceType}
            />
          )}
          <FormActions loading={loading} onClose={close} />
        </form>
      </CardContent>
    </Card>
  );
}
