"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useRiskFlags } from "./components/use-risk-flags";
import { RiskFlagsHeader } from "./components/risk-flags-header";
import { RiskFlagForm } from "./components/risk-flag-form";
import { ActiveFlagsSection } from "./components/active-flags-section";
import { ResolvedFlagsSection } from "./components/resolved-flags-section";
import type { RiskFlag } from "@/actions/contact-actions";

interface RiskFlagsPanelProps {
  contactId: string;
  initialFlags: RiskFlag[];
}

export function RiskFlagsPanel({ contactId, initialFlags }: RiskFlagsPanelProps) {
  const {
    flags,
    loading,
    showForm,
    setShowForm,
    type,
    setType,
    severity,
    setSeverity,
    description,
    setDescription,
    error,
    activeFlags,
    resolvedFlags,
    handleAdd,
    handleResolve,
  } = useRiskFlags(contactId, initialFlags);

  return (
    <Card>
      <RiskFlagsHeader
        activeCount={activeFlags.length}
        showForm={showForm}
        onToggleForm={() => setShowForm((p) => !p)}
      />
      <CardContent className="space-y-3">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
        )}

        {showForm && (
          <RiskFlagForm
            type={type}
            severity={severity}
            description={description}
            loading={loading}
            onTypeChange={setType}
            onSeverityChange={setSeverity}
            onDescriptionChange={setDescription}
            onAdd={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        )}

        {flags.length === 0 && !showForm && (
          <p className="text-muted-foreground text-sm">لا توجد علامات مخاطر</p>
        )}

        <ActiveFlagsSection
          flags={activeFlags}
          loading={loading}
          onResolve={handleResolve}
        />

        <ResolvedFlagsSection flags={resolvedFlags} />
      </CardContent>
    </Card>
  );
}
