"use client";

import { useEffect, useState } from "react";

import { Popup } from "@/app/components/Popup";

const popupStorageKey = "learn-bet.popup-message";

export function GlobalPopup() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(popupStorageKey);
    if (!stored) return;
    setMessage(stored);
    window.localStorage.removeItem(popupStorageKey);
  }, []);

  if (!message) return null;

  return (
    <Popup
      message={message}
      visible={Boolean(message)}
      onClose={() => setMessage(null)}
    />
  );
}

export const setGlobalPopupMessage = (value: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(popupStorageKey, value);
};