"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type BreadcrumbLabelContextValue = {
  labels: Record<string, string>;
  setLabel: (segment: string, label: string | null) => void;
};

const BreadcrumbLabelContext = createContext<BreadcrumbLabelContextValue | null>(null);

export function BreadcrumbLabelProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Record<string, string>>({});

  function setLabel(segment: string, label: string | null) {
    setLabels((current) => {
      if (label == null) {
        if (!(segment in current)) return current;
        const next = { ...current };
        delete next[segment];
        return next;
      }
      if (current[segment] === label) return current;
      return { ...current, [segment]: label };
    });
  }

  return (
    <BreadcrumbLabelContext.Provider value={{ labels, setLabel }}>
      {children}
    </BreadcrumbLabelContext.Provider>
  );
}

function useBreadcrumbLabelContext() {
  const context = useContext(BreadcrumbLabelContext);
  if (!context) throw new Error("useBreadcrumbLabelContext must be used within BreadcrumbLabelProvider");
  return context;
}

export function useBreadcrumbLabels() {
  return useBreadcrumbLabelContext().labels;
}

export function useBreadcrumbLabel(segment: string | null | undefined, label: string | null | undefined) {
  const { setLabel } = useBreadcrumbLabelContext();

  useEffect(() => {
    if (!segment) return;
    setLabel(segment, label ?? null);
    return () => setLabel(segment, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment, label]);
}
