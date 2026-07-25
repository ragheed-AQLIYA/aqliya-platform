"use client";

import { RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReExtractSectionProps {
  files: Array<{
    id: string;
    filename: string;
    extractionStatus: string | null;
  }>;
  isArchived: boolean;
  onReExtract: (fileId: string) => Promise<void>;
}

export function ReExtractSection({
  files,
  isArchived,
  onReExtract,
}: ReExtractSectionProps) {
  if (files.length === 0 || isArchived) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <RefreshCw className="h-5 w-5" /> File Extraction
        </CardTitle>
        <CardDescription>
          Re-extract file content if extraction failed or file was updated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-2 rounded border text-xs"
            >
              <span>
                {f.filename} —{" "}
                <span
                  className={`${
                    f.extractionStatus === "completed"
                      ? "text-green-600"
                      : f.extractionStatus === "failed"
                        ? "text-red-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {f.extractionStatus || "pending"}
                </span>
              </span>
              <Button
                onClick={() => onReExtract(f.id)}
                variant="ghost"
                size="sm"
                className="text-[10px] flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Re-extract
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
