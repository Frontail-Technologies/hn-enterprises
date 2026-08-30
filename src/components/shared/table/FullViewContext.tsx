"use client";

import { createContext, useContext, type ReactNode } from "react";

const FullViewContext = createContext(false);

export function FullViewProvider({ active, children }: { active: boolean; children: ReactNode }) {
  const inherited = useContext(FullViewContext);
  return <FullViewContext.Provider value={active || inherited}>{children}</FullViewContext.Provider>;
}

export function useFullViewActive() {
  return useContext(FullViewContext);
}
