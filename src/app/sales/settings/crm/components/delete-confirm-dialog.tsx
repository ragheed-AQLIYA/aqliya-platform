import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import { AR } from "./constants";

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  deleting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{AR.confirmDelete}</DialogTitle>
          <DialogDescription>{AR.confirmDeleteDesc}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleting}>
              {AR.cancel}
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                {AR.delete}
              </>
            ) : (
              AR.delete
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
