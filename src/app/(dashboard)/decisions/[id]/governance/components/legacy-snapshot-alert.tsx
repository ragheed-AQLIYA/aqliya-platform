"use client";

import { Card } from "@/components/ui/card";

interface LegacySnapshotAlertProps {
  isLegacySnapshot: boolean;
  approvedSnapshot: any;
}

export function LegacySnapshotAlert({
  isLegacySnapshot,
  approvedSnapshot,
}: LegacySnapshotAlertProps) {
  if (!isLegacySnapshot || !approvedSnapshot) return null;

  return (
    <Card className="p-4 mb-6 border-amber-200 bg-amber-50">
      <h3 className="text-sm font-semibold text-amber-800 mb-1">
        لقطة اعتماد سابقة
      </h3>
      <p className="text-sm text-amber-700">
        تم إنشاء هذا الاعتماد قبل إدخال اللقطات غير القابلة للتعديل. يُعرض
        المحتوى من سجل التوصية المرتبط، وقد يكون قد تغيّر منذ الاعتماد.
      </p>
    </Card>
  );
}
