"use client";

import { Copy, Download, Printer } from "lucide-react";
import { useState } from "react";

interface OutputActionsProps {
  outputId: string;
  content: string;
}

export function OutputActions({ outputId, content }: OutputActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.open(
      `/api/office-ai/download?outputId=${outputId}&format=print`,
      "_blank",
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded border hover:bg-muted/50"
      >
        <Copy className="h-3 w-3" />
        {copied ? "Copied!" : "Copy"}
      </button>
      <a
        href={`/api/office-ai/download?outputId=${outputId}&format=md`}
        target="_blank"
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded border hover:bg-muted/50"
      >
        <Download className="h-3 w-3" /> .md
      </a>
      <a
        href={`/api/office-ai/download?outputId=${outputId}&format=txt`}
        target="_blank"
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded border hover:bg-muted/50"
      >
        <Download className="h-3 w-3" /> .txt
      </a>
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded border hover:bg-muted/50"
      >
        <Printer className="h-3 w-3" /> Print
      </button>
    </div>
  );
}
