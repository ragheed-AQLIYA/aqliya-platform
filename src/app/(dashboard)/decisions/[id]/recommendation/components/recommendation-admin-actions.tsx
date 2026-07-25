"use client";

import { Button } from "@/components/ui/button";

interface Props {
  isVisible: boolean;
  saving: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function RecommendationAdminActions({ isVisible, saving, onPublish, onUnpublish }: Props) {
  return (
    <div className="mb-4 flex gap-2">
      {isVisible ? (
        <Button type="button" variant="outline" onClick={onUnpublish} disabled={saving}>
          إلغاء نشر التوصية
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={onPublish} disabled={saving}>
          نشر التوصية
        </Button>
      )}
    </div>
  );
}
