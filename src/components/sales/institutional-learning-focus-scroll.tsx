"use client";

import { useEffect } from "react";
import { institutionalLearningRowElementId } from "@/lib/sales/vnext/institutional-learning";

interface InstitutionalLearningFocusScrollProps {
  focusRowId?: string | null;
}

export function InstitutionalLearningFocusScroll({
  focusRowId,
}: InstitutionalLearningFocusScrollProps) {
  useEffect(() => {
    if (!focusRowId) return;
    const element = document.getElementById(
      institutionalLearningRowElementId(focusRowId),
    );
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusRowId]);

  return null;
}
