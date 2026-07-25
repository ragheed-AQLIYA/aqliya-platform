"use client";
import { TASK_TYPE_INFO } from "./constants";

export function TaskTypeInfo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(TASK_TYPE_INFO).map(([key, info]) => (
        <div
          key={key}
          className="p-3 rounded-md border bg-card hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-primary">{info.icon}</span>
            <span className="text-xs font-medium">
              {key.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">{info.ar}</p>
          <p className="text-[10px] text-muted-foreground">{info.en}</p>
        </div>
      ))}
    </div>
  );
}
