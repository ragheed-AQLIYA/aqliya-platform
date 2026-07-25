"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EvidenceUploadForm({
  uploading,
  onUpload,
  onCancel,
}: {
  uploading: boolean;
  onUpload: (file: File, description: string, evidenceType: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState("attachment");

  async function handleSubmit() {
    if (!selectedFile) return;
    await onUpload(selectedFile, description, evidenceType);
    setSelectedFile(null);
    setDescription("");
    setEvidenceType("attachment");
  }

  return (
    <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
      <div className="space-y-1">
        <Label htmlFor="evidence-file">الملف</Label>
        <Input
          id="evidence-file"
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.csv,.txt,.pptx,.ppt"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="evidence-type">النوع</Label>
        <Select value={evidenceType} onValueChange={setEvidenceType}>
          <SelectTrigger id="evidence-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="attachment">مرفق</SelectItem>
            <SelectItem value="reference">مرجع</SelectItem>
            <SelectItem value="source">مصدر</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="evidence-desc">وصف (اختياري)</Label>
        <Textarea
          id="evidence-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف مختصر للمستند..."
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!selectedFile || uploading}>
          {uploading ? "جاري الرفع..." : "رفع"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
