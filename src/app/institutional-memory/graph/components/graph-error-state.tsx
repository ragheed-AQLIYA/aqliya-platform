import { Card, CardContent } from "@/components/ui/card";

export function GraphErrorState({ error }: { error: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-destructive">
        <p>{error}</p>
      </CardContent>
    </Card>
  );
}
