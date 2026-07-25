"use client";

interface Props {
  message: string;
  status: "idle" | "loading" | "success" | "error";
}

const statusStyles: Record<string, string> = {
  error: "bg-destructive/10 text-destructive border border-destructive/20",
  success: "bg-green-500/10 text-green-700 border border-green-500/20",
  loading: "bg-primary/10 text-primary border border-primary/20",
  idle: "bg-muted text-muted-foreground border",
};

export function TbStatusMessage({ message, status }: Props) {
  if (!message) return null;

  return (
    <div className={`p-3 rounded-lg text-sm ${statusStyles[status]}`}>
      {message}
    </div>
  );
}
