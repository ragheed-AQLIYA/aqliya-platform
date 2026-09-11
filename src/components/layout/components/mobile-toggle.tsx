"use client";

import { Menu, X } from "lucide-react";

type MobileToggleProps = {
  open: boolean;
  locale: "ar" | "en";
  onToggle: () => void;
  ariaLabelOpen: string;
  ariaLabelClose: string;
};

export function MobileToggle({
  open,
  onToggle,
  ariaLabelOpen,
  ariaLabelClose,
}: MobileToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 md:hidden"
      aria-label={open ? ariaLabelClose : ariaLabelOpen}
      aria-expanded={open}
      aria-controls="mobile-main-menu"
    >
      {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
    </button>
  );
}
