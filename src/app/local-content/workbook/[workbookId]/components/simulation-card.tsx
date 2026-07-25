import type { SimulationResult } from "@/lib/local-content/workbook/simulation-engine";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainIcon } from "./icons";

interface Props {
  simulationResult: SimulationResult | null;
  showSimulation: boolean;
  isLoading: string | null;
  supplierIncrease: string;
  onSupplierIncreaseChange: (value: string) => void;
  onRunSimulation: () => void;
  onToggleSimulation: () => void;
}

function SimulationResultCard({
  simulationResult,
}: {
  simulationResult: SimulationResult;
}) {
  return (
    <div className="p-3 border rounded bg-muted/20">
      <p className="text-xs font-medium mb-2">
        {simulationResult.scenarioLabel}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span>النتيجة الحالية:</span>
        <span className="font-bold">
          {simulationResult.currentScore.overallScore !== null
            ? `${simulationResult.currentScore.overallScore}%`
            : "—"}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>النتيجة المتوقعة:</span>
        <span className="font-bold text-green-600">
          {simulationResult.projectedScore.overallScore !== null
            ? `${simulationResult.projectedScore.overallScore}%`
            : "—"}
        </span>
      </div>
      {simulationResult.delta !== null && (
        <div className="flex items-center justify-between text-sm mt-1">
          <span>الفرق:</span>
          <span
            className={`font-bold ${
              simulationResult.delta >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {simulationResult.delta >= 0 ? "+" : ""}
            {simulationResult.delta}%
          </span>
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
        <span>مستوى الثقة:</span>
        <span>{simulationResult.confidence}%</span>
      </div>
      {simulationResult.assumptions.length > 0 && (
        <div className="mt-2">
          <p className="text-[10px] text-muted-foreground">الافتراضات:</p>
          <ul className="text-[10px] text-muted-foreground list-disc list-inside">
            {simulationResult.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SimulationCard({
  simulationResult,
  showSimulation,
  isLoading,
  supplierIncrease,
  onSupplierIncreaseChange,
  onRunSimulation,
  onToggleSimulation,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BrainIcon className="h-4 w-4" />
          محاكاة &quot;ماذا لو&quot;
        </CardTitle>
        <CardDescription className="text-xs">
          جرب تغيير القيم لترى أثرها على درجة المحتوى المحلي
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block">
              زيادة المشتريات المحلية إلى
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={supplierIncrease}
                onChange={(e) => onSupplierIncreaseChange(e.target.value)}
                placeholder="أدخل القيمة"
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={onRunSimulation}
                disabled={isLoading === "simulation"}
              >
                محاكاة
              </Button>
            </div>
          </div>

          {showSimulation && simulationResult && (
            <SimulationResultCard simulationResult={simulationResult} />
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="mt-3"
          onClick={onToggleSimulation}
        >
          {showSimulation ? "إخفاء" : "عرض المزيد من خيارات المحاكاة"}
        </Button>
      </CardContent>
    </Card>
  );
}
