"use client";

import { useEffect } from "react";

/**
 * A file dropped anywhere except an upload box makes the browser open it
 * (replacing the app, or - in the desktop app - opening it in another
 * program). Upload boxes handle their own drops first; this only cancels
 * the stray ones.
 */
export function FileDropGuard() {
  useEffect(() => {
    const cancel = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    };
    window.addEventListener("dragover", cancel);
    window.addEventListener("drop", cancel);
    return () => {
      window.removeEventListener("dragover", cancel);
      window.removeEventListener("drop", cancel);
    };
  }, []);
  return null;
}
