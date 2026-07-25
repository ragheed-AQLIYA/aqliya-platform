"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Policy } from "./types";
import { PolicyEditForm } from "./policy-edit-form";
import { PolicyViewCard } from "./policy-view-card";

type Props = {
  policies: Policy[];
  editingModel: string | null;
  editDays: number;
  editAction: "delete" | "archive" | "anonymize";
  editEnabled: boolean;
  onStartEdit: (policy: Policy) => void;
  onSave: (modelName: string) => void;
  onReset: (modelName: string) => void;
  onCancelEdit: () => void;
  onEditDaysChange: (days: number) => void;
  onEditActionChange: (action: "delete" | "archive" | "anonymize") => void;
  onEditEnabledChange: (enabled: boolean) => void;
};

export function PolicyList({
  policies,
  editingModel,
  editDays,
  editAction,
  editEnabled,
  onStartEdit,
  onSave,
  onReset,
  onCancelEdit,
  onEditDaysChange,
  onEditActionChange,
  onEditEnabledChange,
}: Props) {
  if (policies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">قائمة السياسات</CardTitle>
          <CardDescription>0 سياسة احتفاظ بالبيانات</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            لا توجد سياسات احتفاظ
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">قائمة السياسات</CardTitle>
        <CardDescription>
          {policies.length} سياسة احتفاظ بالبيانات
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {policies.map((policy) => (
            <div
              key={policy.modelName}
              className={`rounded-md border p-4 ${
                policy.overridden
                  ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                  : !policy.enabled
                    ? "border-muted bg-muted/30"
                    : "border-muted bg-card"
              }`}
            >
              {editingModel === policy.modelName ? (
                <PolicyEditForm
                  policy={policy}
                  editDays={editDays}
                  editAction={editAction}
                  editEnabled={editEnabled}
                  onSave={onSave}
                  onCancel={onCancelEdit}
                  onDaysChange={onEditDaysChange}
                  onActionChange={onEditActionChange}
                  onEnabledChange={onEditEnabledChange}
                />
              ) : (
                <PolicyViewCard
                  policy={policy}
                  onEdit={onStartEdit}
                  onReset={onReset}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
