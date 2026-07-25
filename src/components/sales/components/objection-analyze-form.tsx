"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, ScanSearch } from "lucide-react";
import type { SalesInteractionView } from "@/lib/sales/interactions";

function interactionLabel(interaction: SalesInteractionView): string {
  const subject = interaction.subject?.trim();
  const summary = interaction.summary?.trim();
  const preview = subject || summary || interaction.type;
  const date = new Intl.DateTimeFormat("ar-SA", { dateStyle: "short" }).format(
    new Date(interaction.occurredAt),
  );
  return `${preview.slice(0, 60)}${preview.length > 60 ? "…" : ""} (${date})`;
}

export function ObjectionAnalyzeForm({
  mode,
  interactionId,
  pastedText,
  loading,
  error,
  interactions,
  onModeChange,
  onInteractionIdChange,
  onPastedTextChange,
  onAnalyze,
}: {
  mode: "interaction" | "paste";
  interactionId: string;
  pastedText: string;
  loading: boolean;
  error: string | null;
  interactions: SalesInteractionView[];
  onModeChange: (mode: "interaction" | "paste") => void;
  onInteractionIdChange: (id: string) => void;
  onPastedTextChange: (text: string) => void;
  onAnalyze: () => void;
}) {
  return (
    <div className="space-y-3 border-t pt-4">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "paste" ? "default" : "outline"}
          onClick={() => onModeChange("paste")}
        >
          نص ملصوق
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "interaction" ? "default" : "outline"}
          onClick={() => onModeChange("interaction")}
          disabled={interactions.length === 0}
        >
          من تفاعل
        </Button>
      </div>

      {mode === "paste" ? (
        <div className="space-y-2">
          <Label htmlFor="objection-paste">نص الاعتراض</Label>
          <Textarea
            id="objection-paste"
            value={pastedText}
            onChange={(e) => onPastedTextChange(e.target.value)}
            placeholder="الصق نص الاعتراض من المكالمة أو البريد…"
            rows={4}
            disabled={loading}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="objection-interaction">التفاعل</Label>
          <Select
            value={interactionId}
            onValueChange={onInteractionIdChange}
            disabled={loading}
          >
            <SelectTrigger id="objection-interaction">
              <SelectValue placeholder="اختر تفاعلاً…" />
            </SelectTrigger>
            <SelectContent>
              {interactions.map((interaction) => (
                <SelectItem key={interaction.id} value={interaction.id}>
                  {interactionLabel(interaction)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        type="button"
        size="sm"
        disabled={
          loading ||
          (mode === "paste"
            ? pastedText.trim().length < 10
            : !interactionId)
        }
        onClick={onAnalyze}
        className="gap-1"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <ScanSearch className="h-4 w-4" />
        )}
        تحليل الاعتراض
      </Button>
    </div>
  );
}
