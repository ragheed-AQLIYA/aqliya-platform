"use client";

import { useEffect } from "react";

export function PrintToolbar({ title }: { title: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("auto") === "1") {
      window.print();
    }
  }, []);

  return (
    <div className="no-print fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-lg">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
      >
        {title}
      </button>
    </div>
  );
}
