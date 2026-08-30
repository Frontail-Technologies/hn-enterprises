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

export function useBreadcrumbLabel(label: string | null | undefined) {
  const { setLabel } = useBreadcrumbLabelContext();

  useEffect(() => {
    setLabel(label ?? null);
    return () => setLabel(null);
  }, [label, setLabel]);
}
