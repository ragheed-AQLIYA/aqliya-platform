"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateForecastAction } from "../actions";

export function ForecastCalculateButton({
  forecastId,
}: {
  forecastId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await calculateForecastAction(forecastId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }, [forecastId, router]);

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCalculate}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Calculator className="h-3 w-3" />
        )}
        احسب
      </Button>
      {error ? (
        <p className="text-[10px] text-destructive mt-1">{error}</p>
      ) : null}
    </div>
  );
}
