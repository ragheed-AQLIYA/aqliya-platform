"use client";

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  if (collapsed) return null;

  return (
    <div className="shrink-0 border-t p-3">
      <div className="rounded-md bg-muted/50 px-3 py-2">
        <div className="text-[10px] font-medium tracking-wider text-muted-foreground">
          منصة ذكاء مؤسسي خاص ومحكوم
        </div>
        <div className="text-[10px] text-muted-foreground/60 mt-0.5">
          الإصدار 1.1
        </div>
      </div>
    </div>
  );
}
