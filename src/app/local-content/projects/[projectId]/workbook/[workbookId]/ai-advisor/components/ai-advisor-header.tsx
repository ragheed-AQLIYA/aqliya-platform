"use client";

import Link from "next/link";

interface Props {
  projectId: string;
  workbookId: string;
  workbookTitle: string;
}

export function AiAdvisorHeader({ projectId, workbookId, workbookTitle }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link
            href={`/local-content/projects/${projectId}`}
            className="hover:underline"
          >
            المشروع / Project
          </Link>
          <span>/</span>
          <Link
            href={`/local-content/workbook/${workbookId}`}
            className="hover:underline"
          >
            المصنف / Workbook
          </Link>
          <span>/</span>
          <span>AI Advisor</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          AI Advisor — {workbookTitle}
        </h1>
        <p className="text-muted-foreground">
          تحليل الأنماط، شرح المطابقات، ومراجعة النتائج
        </p>
      </div>
    </div>
  );
}
