"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspaceAction } from "./actions";

export function WorkspaceCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const form = new FormData(e.currentTarget);
      const name = form.get("name") as string;
      const description = (form.get("description") as string) || undefined;
      const category = (form.get("category") as string) || undefined;

      const result = await createWorkspaceAction({ name, description, category });
      setLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    },
    [router],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        مساحة عمل جديدة
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء مساحة عمل جديدة</DialogTitle>
          <DialogDescription>
            مساحة العمل تحتوي على المحتوى الخاص بك. أدخل الاسم والوصف.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">الاسم *</label>
            <Input name="name" required placeholder="اسم مساحة العمل" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">الوصف</label>
            <Textarea
              name="description"
              placeholder="وصف مساحة العمل (اختياري)"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">التصنيف</label>
            <Input name="category" placeholder="مثل: تسويق، تقارير، مستندات" />
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              إنشاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
