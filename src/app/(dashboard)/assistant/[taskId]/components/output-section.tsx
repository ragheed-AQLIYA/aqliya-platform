"use client";

import { useState } from "react";
import { Bot, Sparkles, Edit3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OutputActions } from "@/components/office-ai/output-actions";
import { StatusBadge } from "./status-badge";

interface OutputItem {
  id: string;
  format: string;
  status: string;
  content: string;
  aiProvider: string | null;
  aiPromptVersion: string | null;
  metadata: Record<string, unknown> | null;
}

interface OutputSectionProps {
  outputs: OutputItem[];
  canGenerate: boolean;
  isArchived: boolean;
  onGenerate: () => Promise<void>;
  onUpdateOutput: (outputId: string, formData: FormData) => Promise<void>;
}

export function OutputSection({
  outputs,
  canGenerate,
  isArchived,
  onGenerate,
  onUpdateOutput,
}: OutputSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleUpdateSubmit =
    (outputId: string) => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await onUpdateOutput(outputId, new FormData(e.currentTarget));
      setEditingId(null);
    };

  if (outputs.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Output / المخرجات</CardTitle>
          <CardDescription>
            AI-generated content for this task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bot className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No output yet. Generate a draft to begin.
            </p>
            {canGenerate && !isArchived && (
              <Button onClick={onGenerate} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Generate Draft / توليد مسودة
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Output / المخرجات</CardTitle>
        <CardDescription>AI-generated content for this task</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {outputs.map((output) => (
            <div key={output.id} className="p-4 rounded-md border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {output.format}
                  </Badge>
                  <StatusBadge status={output.status} />
                  {output.status === "draft" &&
                    output.metadata &&
                    !!(output.metadata as Record<string, unknown>)?.editedAt && (
                      <Badge
                        variant="outline"
                        className="text-[9px] text-amber-600 border-amber-300"
                      >
                        Edited
                      </Badge>
                    )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {output.aiProvider} v{output.aiPromptVersion || "?"}
                </span>
              </div>

              <div className="p-3 rounded-md bg-muted/50 text-sm whitespace-pre-wrap mb-2 font-mono leading-relaxed max-h-96 overflow-y-auto">
                {output.content}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                {canGenerate && !isArchived && (
                  <Button
                    onClick={onGenerate}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                )}

                {!isArchived && editingId !== output.id && (
                  <button
                    type="button"
                    onClick={() => setEditingId(output.id)}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit output
                  </button>
                )}

                {!isArchived && editingId === output.id && (
                  <form
                    onSubmit={handleUpdateSubmit(output.id)}
                    className="w-full space-y-2"
                  >
                    <textarea
                      name="content"
                      rows={8}
                      defaultValue={output.content}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="text-xs">
                        Save Revised Output
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <OutputActions
                  outputId={output.id}
                  content={output.content}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
