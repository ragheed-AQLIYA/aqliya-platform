"use client";

import { Label } from "@/components/ui/label";

export function EvidenceTypeSelect() {
  return (
    <div>
      <Label htmlFor="evidenceType">نوع الدليل</Label>
      <select
        id="evidenceType"
        name="evidenceType"
        required
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
      >
        <option value="">اختر...</option>
        <option value="certificate">شهادة محتوى محلي</option>
        <option value="contract">عقد</option>
        <option value="attestation">إقرار</option>
        <option value="invoice">فاتورة</option>
        <option value="registration">سجل تجاري</option>
        <option value="other">أخرى</option>
      </select>
    </div>
  );
}
