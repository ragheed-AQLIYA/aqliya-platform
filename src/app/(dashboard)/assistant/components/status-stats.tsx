"use client";
import Link from "next/link";
import { STATUS_LABELS } from "./constants";

interface StatusStatsProps {
  totalTasks: number;
  activeStatus: string;
  getCount: (status: string) => number;
}

const STATUS_LIST = ["draft", "generated", "needs_review", "approved", "rejected", "archived"];

export function StatusStats({ totalTasks, activeStatus, getCount }: StatusStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
      <Link
        href="/assistant"
        className={`p-2 rounded-md border text-center transition-colors ${!activeStatus ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
      >
        <div className="text-lg font-bold">{totalTasks}</div>
        <div className="text-[9px] text-muted-foreground">All</div>
      </Link>
      {STATUS_LIST.map((s) => {
        const label = STATUS_LABELS[s];
        const count = getCount(s);
        return (
          <Link
            key={s}
            href={`/assistant?status=${s}`}
            className={`p-2 rounded-md border text-center transition-colors ${activeStatus === s ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
          >
            <div className="text-lg font-bold">{count}</div>
            <div className="text-[9px] text-muted-foreground truncate">
              {label?.en || s}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
