import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cable, Plus } from "lucide-react";
import { AR } from "./constants";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="rounded-[20px]" dir="rtl">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Cable className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="mb-1 text-lg font-semibold">{AR.noConnections}</p>
        <p className="mb-6 text-sm text-muted-foreground">
          {AR.noConnectionsDesc}
        </p>
        <Button onClick={onAdd}>
          <Plus className="ml-2 h-4 w-4" />
          {AR.addConnection}
        </Button>
      </CardContent>
    </Card>
  );
}
