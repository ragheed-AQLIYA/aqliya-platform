"use client";

import { Label } from "@/components/ui/label";

interface SupplierSelectProps {
  suppliers: { id: string; name: string }[];
}

export function SupplierSelect({ suppliers }: SupplierSelectProps) {
  return (
    <div>
      <Label htmlFor="supplierId">مرتبط بمورد (اختياري)</Label>
      <select
        id="supplierId"
        name="supplierId"
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
      >
        <option value="">بدون</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
