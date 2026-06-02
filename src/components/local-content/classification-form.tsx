import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ClassificationFormProps {
  projectId: string;
  spendRecordId: string;
  supplierId: string;
  supplierName: string;
  classifyAction: (projectId: string, formData: FormData) => Promise<
    | { ok: true; data: unknown }
    | { ok: false; error: string; code?: string }
  >;
}

export function ClassificationForm({
  projectId: _projectId,
  spendRecordId: _spendRecordId,
  supplierId: _supplierId,
  supplierName,
  classifyAction: _classifyAction,
}: ClassificationFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label>{supplierName}</Label>
          <p className="text-sm text-muted-foreground">
            نموذج التصنيف قيد التطوير
          </p>
          <Button disabled>تصنيف</Button>
        </div>
      </CardContent>
    </Card>
  );
}
