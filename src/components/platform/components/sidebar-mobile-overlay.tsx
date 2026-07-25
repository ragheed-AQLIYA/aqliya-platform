"use client";

interface SidebarMobileOverlayProps {
  mobileOpen: boolean;
  onCloseMobile?: () => void;
}

export function SidebarMobileOverlay({
  mobileOpen,
  onCloseMobile,
}: SidebarMobileOverlayProps) {
  if (!mobileOpen) return null;
  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 md:hidden"
      onClick={onCloseMobile}
      aria-hidden="true"
    />
  );
}
