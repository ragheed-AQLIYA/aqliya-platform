"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCollections,
  createCollection,
  deleteCollection,
} from "@/actions/institutional-memory-actions";
import type { CollectionData } from "@/actions/institutional-memory-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, RefreshCw, FolderOpen } from "lucide-react";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setLoading(true);
    const res = await getCollections();
    setLoading(false);
    if (res.success && res.data) {
      setCollections(res.data);
      setError(null);
    } else {
      setError(res.error ?? "فشل في تحميل المجموعات");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await getCollections();
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) {
        setCollections(res.data);
        setError(null);
      } else {
        setError(res.error ?? "فشل في تحميل المجموعات");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const res = await createCollection({ name: name.trim(), description: description.trim() });
    setCreating(false);
    if (res.success) {
      setDialogOpen(false);
      setName("");
      setDescription("");
      load(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المجموعة؟")) return;
    const res = await deleteCollection(id);
    if (res.success) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مجموعات الذاكرة المؤسسية</h1>
          <p className="text-sm text-muted-foreground">
            Institutional Memory Collections — مجموعات محفوظة من أحداث الذاكرة
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load(true)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-1 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 ml-1" />
                مجموعة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>مجموعة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الاسم</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسم المجموعة"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف المجموعة (اختياري)"
                    dir="rtl"
                  />
                </div>
                <Button onClick={handleCreate} disabled={creating || !name.trim()}>
                  {creating ? "جاري الإنشاء..." : "إنشاء"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && collections.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-3xl mb-2">📁</p>
            <p className="font-bold text-muted-foreground">لا توجد مجموعات بعد</p>
            <p className="text-sm text-muted-foreground">
              أنشئ مجموعة جديدة لتنظيم أحداث الذاكرة المؤسسية
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && collections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <Card key={col.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{col.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(col.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {col.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {col.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{col.eventCount} حدث</span>
                  {col.createdBy && (
                    <span>بواسطة {col.createdBy.name ?? "النظام"}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
