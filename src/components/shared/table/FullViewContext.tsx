"use client";

import { createContext, useContext, type ReactNode } from "react";

const FullViewContext = createContext(false);

/**
 * Composes with any ancestor's own Full View state. A table nested inside
 * another Full View owner doesn't get its own toggle, but still needs to
 * know "an ancestor's Full View is open" so it can drop its own card
 * border/rounding instead of showing a redundant nested shell inside the
 * outer full-view surface. OR-composing with whatever's already in context
 * (rather than always overwriting) is what makes that work regardless of
 * nesting depth.
 */
export function FullViewProvider({ active, children }: { active: boolean; children: ReactNode }) {
  const inherited = useContext(FullViewContext);
  return <FullViewContext.Provider value={active || inherited}>{children}</FullViewContext.Provider>;
}

/** True while this component renders inside an active Full View surface -
 * whether it owns that Full View itself or merely inherits it from an
 * ancestor. */
export function useFullViewActive() {
  return useContext(FullViewContext);
}
