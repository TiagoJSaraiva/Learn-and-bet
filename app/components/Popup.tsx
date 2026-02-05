"use client";

import { useEffect } from "react";

type PopupProps = {
  message: string;
  visible: boolean;
  onClose: () => void;
  durationMs?: number;
};

export function Popup({ message, visible, onClose, durationMs = 4000 }: PopupProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [visible, durationMs, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed left-4 top-4 z-50 max-w-sm rounded-lg border border-red-200 bg-red-600 px-4 py-3 text-sm text-white shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 transition hover:text-white"
          aria-label="Fechar aviso"
        >
          ×
        </button>
      </div>
    </div>
  );
}
