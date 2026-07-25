"use client";

import { useState, useCallback } from "react";

export function useDecisionDetail() {
  const [activeTab, setActiveTab] = useState("overview");

  const onTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  return { activeTab, onTabChange };
}
