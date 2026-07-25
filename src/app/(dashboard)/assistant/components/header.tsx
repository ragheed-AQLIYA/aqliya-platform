"use client";
import { Bot, Shield } from "lucide-react";

export function AssistantHeader() {
  return (
    <>
      <div className="flex items-center gap-3 mb-1">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Office AI Assistant</h1>
        <span className="text-lg text-muted-foreground">
          / مساعد العمل الذكي
        </span>
      </div>
      <div className="flex items-center gap-2 mb-6 p-3 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Governed work assistant — not a chatbot. All outputs are draft until
          human-reviewed. Source files must be referenced before final use. No
          autonomous decisions.
        </p>
      </div>
    </>
  );
}
