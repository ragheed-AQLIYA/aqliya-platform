import { cn } from "@/lib/utils";

interface ExecutiveSurfaceProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ExecutiveSurface({
  title,
  children,
  className,
}: ExecutiveSurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/70 bg-gradient-to-br from-background to-muted/20 p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      {title && <h3 className="mb-6 text-xl font-black">{title}</h3>}
      {children}
    </div>
  );
}
