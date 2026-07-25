"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClonePolicyFormProps {
  cloneName: string;
  onCloneNameChange: (value: string) => void;
  clonePending: boolean;
  onClone: () => void;
}

export function ClonePolicyForm({
  cloneName,
  onCloneNameChange,
  clonePending,
  onClone,
}: ClonePolicyFormProps) {
  return (
    <div className="border-t pt-4 space-y-2">
      <Label htmlFor="clone-policy-name">نسخ سياسة مخصصة من الحالية</Label>
      <div className="flex flex-wrap gap-2 max-w-lg">
        <Input
          id="clone-policy-name"
          placeholder="مثال: Shalfa Policy v2"
          value={cloneName}
          onChange={(e) => onCloneNameChange(e.target.value)}
          className="max-w-xs"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!cloneName.trim() || clonePending}
          onClick={onClone}
        >
          {clonePending ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="ml-2 h-4 w-4" />
          )}
          إنشاء نسخة
        </Button>
      </div>
    </div>
  );
}
