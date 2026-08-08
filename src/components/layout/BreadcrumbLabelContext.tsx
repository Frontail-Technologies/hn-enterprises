"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type BreadcrumbLabelContextValue = {
  label: string | null;
  setLabel: (label: string | null) => void;
};

const BreadcrumbLabelContext = createContext<BreadcrumbLabelContextValue | null>(null);

export function BreadcrumbLabelProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);
  return (
    <BreadcrumbLabelContext.Provider value={{ label, setLabel }}>
      {children}
    </BreadcrumbLabelContext.Provider>
  );
}

function useBreadcrumbLabelContext() {
  const context = useContext(BreadcrumbLabelContext);
  if (!context) throw new Error("useBreadcrumbLabelContext must be used within BreadcrumbLabelProvider");
  return context;
}

export function useBreadcrumbLastLabel() {
  return useBreadcrumbLabelContext().label;
}

// A detail page calls this with a human-readable label for its own dynamic
// route segment (e.g. a bill number instead of the raw UUID in the URL) -
// the global auto-breadcrumb in the layout uses it in place of the raw
// segment text for the last crumb, so the page doesn't need to render a
// second, duplicate breadcrumb of its own.
export function useBreadcrumbLabel(label: string | null | undefined) {
  const { setLabel } = useBreadcrumbLabelContext();

  useEffect(() => {
    setLabel(label ?? null);
    return () => setLabel(null);
  }, [label, setLabel]);
}
