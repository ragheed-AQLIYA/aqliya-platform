"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  mfaEnabled: boolean;
}

export function MFAStatusHeader({ mfaEnabled }: Props) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <h1 className="text-2xl font-bold">التحقق بخطوتين (MFA)</h1>
      <Badge variant={mfaEnabled ? "default" : "outline"}>
        {mfaEnabled ? "مُفعّل" : "غير مُفعّل"}
      </Badge>
    </div>
  );
}
