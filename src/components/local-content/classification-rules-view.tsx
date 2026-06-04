import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getClassificationBasisLabel,
  type ClassificationRule,
} from "@/lib/local-content/classification-rules";

export function ClassificationRulesView({
  rules,
  source,
}: {
  rules: ClassificationRule[];
  source: "default" | "metadata";
}) {
  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-xl font-bold">قواعد التصنيف</h1>
        <p className="text-sm text-muted-foreground mt-1">
          LC-04 — إدارة قواعد حتمية للتحقق من التصنيفات. المصدر:{" "}
          {source === "metadata" ? "metadata.classificationRules" : "افتراضي"}
        </p>
      </div>

      <ul className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{rule.labelAr}</CardTitle>
                <Badge variant={rule.active ? "default" : "secondary"}>
                  {rule.active ? "نشط" : "معطّل"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>الفئة: {rule.category}</p>
              <p>حد أدنى محلي: {rule.minLocalPct}%</p>
              <p>
                أسس مسموحة:{" "}
                {rule.allowedBases.map(getClassificationBasisLabel).join("، ")}
              </p>
              <p>أقل ثقة: {rule.minConfidence}</p>
            </CardContent>
          </Card>
        ))}
      </ul>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">تخصيص القواعد</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          ضع مصفوفة <code>classificationRules</code> في{" "}
          <code>PlatformOrganization.metadata</code> أو{" "}
          <code>LocalContentProject.metadata</code> بنفس شكل القواعد أعلاه.
        </CardContent>
      </Card>
    </div>
  );
}
