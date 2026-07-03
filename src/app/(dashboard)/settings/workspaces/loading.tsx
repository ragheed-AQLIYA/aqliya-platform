import { Layout } from "lucide-react";

export default function WorkspacesLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <Layout className="h-12 w-12 text-primary/40 animate-pulse" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-muted-foreground">
          جارٍ تحميل مساحات العمل...
        </p>
        <p className="text-sm text-muted-foreground/60">
          Workspaces is loading...
        </p>
      </div>
    </div>
  );
}
