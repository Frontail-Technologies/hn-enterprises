import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Two-tone section icons for page headers: navy line work, one orange accent,
 * soft-orange/white fills. Drawn on a 48×48 grid with theme tokens only.
 */
export type PageIconName =
  | "dashboard"
  | "projects"
  | "customers"
  | "complaints"
  | "planning"
  | "inventory"
  | "billing"
  | "payments"
  | "staff"
  | "plumbers"
  | "attendance"
  | "activity"
  | "users"
  | "announcements"
  | "masters"
  | "dynamic-fields"
  | "audit-logs"
  | "documents"
  | "reports"
  | "settings"
  | "default";

const N = "var(--secondary-action)";
const O = "var(--primary)";
const S = "var(--primary-soft)";
const W = "var(--card)";

const line = { stroke: N, strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
const outline = (fill: string) => ({ ...line, fill });
const accent = { stroke: O, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const ICONS: Record<PageIconName, ReactNode> = {
  dashboard: (
    <>
      <rect x={8} y={8} width={14} height={14} rx={3.5} {...outline(S)} />
      <rect x={26} y={8} width={14} height={20} rx={3.5} fill={O} />
      <rect x={8} y={26} width={14} height={14} rx={3.5} {...outline(W)} />
      <rect x={26} y={32} width={14} height={8} rx={3} {...outline(W)} />
    </>
  ),
  projects: (
    <>
      <path d="M19 16V6" {...line} />
      <path d="M19 7h10l-3 3.5 3 3.5H19z" fill={O} />
      <rect x={10} y={16} width={18} height={24} rx={2} {...outline(S)} />
      <rect x={28} y={24} width={10} height={16} rx={2} {...outline(W)} />
      <path d="M15 22h3M21 22h3M15 28h3M21 28h3M15 34h3M21 34h3" {...line} strokeWidth={2.2} />
      <path d="M6 40h36" {...line} />
    </>
  ),
  customers: (
    <>
      <circle cx={31} cy={15} r={5} {...outline(W)} />
      <path d="M23 33a8 8 0 0 1 16 0" {...line} />
      <circle cx={19} cy={19} r={6.5} fill={O} />
      <path d="M8 40a11 10 0 0 1 22 0z" fill={O} />
    </>
  ),
  complaints: (
    <>
      <path d="M8 12a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H22l-8 7v-7h-2a4 4 0 0 1-4-4z" {...outline(S)} />
      <path d="M24 14v8" {...accent} strokeWidth={3.4} />
      <circle cx={24} cy={27} r={2} fill={O} />
    </>
  ),
  planning: (
    <>
      <rect x={11} y={9} width={26} height={32} rx={4} {...outline(W)} />
      <rect x={18} y={6} width={12} height={6} rx={2} fill={N} />
      <path d="M17 20h14" {...line} strokeWidth={2.2} />
      <path d="M16 30l4.5 4.5L31 24" {...accent} />
    </>
  ),
  inventory: (
    <>
      <path d="M8 17l16-8 16 8v17l-16 8-16-8z" {...outline(S)} />
      <path d="M8 17l16 8 16-8M24 25v17" {...line} />
      <path d="M16 13l16 8" {...accent} />
    </>
  ),
  billing: (
    <>
      <path d="M12 7h20a2 2 0 0 1 2 2v31l-4-2.5-4 2.5-4-2.5-4 2.5-4-2.5-4 2.5V9a2 2 0 0 1 2-2z" {...outline(W)} />
      <path d="M16 15h12M16 21h9" {...line} strokeWidth={2.2} />
      <circle cx={34} cy={32} r={8} fill={O} />
      <path d="M31 28.5h6M31 31.5h6M32.5 28.5c4 0 4 6 0 6h-1.2l4.7 3.5" stroke={W} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  payments: (
    <>
      <path d="M11 14l19-7 2.5 7" {...line} />
      <rect x={7} y={14} width={34} height={25} rx={4} {...outline(S)} />
      <rect x={27} y={22} width={14} height={9} rx={3} {...outline(W)} />
      <circle cx={32.5} cy={26.5} r={2.3} fill={O} />
    </>
  ),
  staff: (
    <>
      <circle cx={24} cy={24} r={7} {...outline(W)} />
      <path d="M14 20a10 8.5 0 0 1 20 0z" fill={O} />
      <path d="M11 20.5h26" {...accent} />
      <path d="M11 42a13 10 0 0 1 26 0" {...line} />
    </>
  ),
  plumbers: (
    <>
      <path d="M6 26h20v8H6z" {...outline(S)} />
      <path d="M26 26h6a4 4 0 0 1 4 4v12h-8v-8h-2z" {...outline(S)} />
      <path d="M16 26v-6" {...accent} />
      <path d="M10 18h12" {...accent} />
      <path d="M32 6c-2.5 3.2-3.5 5-3.5 6.5a3.5 3.5 0 0 0 7 0C35.5 11 34.5 9.2 32 6z" fill={O} />
    </>
  ),
  attendance: (
    <>
      <rect x={8} y={11} width={32} height={29} rx={4} {...outline(W)} />
      <path d="M8 15a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v4H8z" fill={N} />
      <path d="M16 7v6M32 7v6" {...line} />
      <path d="M17 29.5l5 5 9.5-10" {...accent} />
    </>
  ),
  activity: (
    <>
      <circle cx={25} cy={25} r={14} {...outline(S)} />
      <path d="M25 17v8l6 4" {...accent} />
      <path d="M7 19l4 4 4-3.5" {...line} />
    </>
  ),
  users: (
    <>
      <circle cx={18} cy={16} r={6} {...outline(W)} />
      <path d="M7 38a11 10 0 0 1 22 0" {...line} />
      <path d="M34 21l7 3v6.5c0 5-3.5 8-7 9.5-3.5-1.5-7-4.5-7-9.5V24z" fill={O} />
      <path d="M30.8 30.5l2.2 2.2 4.2-4.4" stroke={W} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  announcements: (
    <>
      <path d="M10 19h6l15-8v26l-15-8h-6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" {...outline(S)} />
      <path d="M13 29l2 9h4.5l-1.5-9" {...line} />
      <path d="M36 18.5a8 8 0 0 1 0 11" {...accent} />
      <path d="M40 14.5a14 14 0 0 1 0 19" {...accent} strokeWidth={2.4} opacity={0.6} />
    </>
  ),
  masters: (
    <>
      <path d="M10 11v26c0 3 6.3 5 14 5s14-2 14-5V11" {...outline(S)} />
      <path d="M10 20c0 3 6.3 5 14 5s14-2 14-5M10 28.5c0 3 6.3 5 14 5s14-2 14-5" {...line} />
      <ellipse cx={24} cy={11} rx={14} ry={5} fill={O} />
    </>
  ),
  "dynamic-fields": (
    <>
      <path d="M8 14h32M8 24h32M8 34h32" {...line} />
      <circle cx={18} cy={14} r={4.5} fill={O} />
      <circle cx={31} cy={24} r={4.5} {...outline(W)} />
      <circle cx={14} cy={34} r={4.5} {...outline(W)} />
    </>
  ),
  "audit-logs": (
    <>
      <path d="M12 6h16l8 8v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" {...outline(W)} />
      <path d="M28 6v8h8" {...line} />
      <path d="M15 17h8M15 23h6" {...line} strokeWidth={2.2} />
      <circle cx={29} cy={30} r={6} {...accent} fill={W} />
      <path d="M33.5 34.5L40 41" {...accent} />
    </>
  ),
  documents: (
    <>
      <path d="M6 14a3 3 0 0 1 3-3h10l4 4h16a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" {...outline(S)} />
      <rect x={13} y={13} width={22} height={13} rx={2} {...outline(W)} />
      <path d="M6 23h36v13a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill={O} />
    </>
  ),
  reports: (
    <>
      <path d="M9 8v31h31" {...line} />
      <rect x={14} y={26} width={6} height={13} rx={1.5} {...outline(S)} />
      <rect x={23} y={16} width={6} height={23} rx={1.5} fill={O} />
      <rect x={32} y={21} width={6} height={18} rx={1.5} {...outline(S)} />
    </>
  ),
  settings: (
    <>
      {Array.from({ length: 8 }, (_, index) => (
        <rect key={index} x={21.5} y={6} width={5} height={8} rx={1.5} fill={N} transform={`rotate(${index * 45} 24 24)`} />
      ))}
      <circle cx={24} cy={24} r={12} {...outline(S)} />
      <circle cx={24} cy={24} r={5} fill={O} />
    </>
  ),
  default: (
    <>
      <path d="M12 6h16l8 8v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" {...outline(W)} />
      <path d="M28 6v8h8" {...line} />
      <path d="M15 22h16M15 28h16M15 34h10" {...line} strokeWidth={2.2} />
      <circle cx={34} cy={36} r={4} fill={O} />
    </>
  ),
};

/** URL section (first path segment) → icon. */
const SECTION_ICONS: Record<string, PageIconName> = {
  dashboard: "dashboard",
  projects: "projects",
  customers: "customers",
  complaints: "complaints",
  planning: "planning",
  inventory: "inventory",
  billing: "billing",
  payments: "payments",
  staff: "staff",
  plumbers: "plumbers",
  attendance: "attendance",
  activity: "activity",
  users: "users",
  announcements: "announcements",
  masters: "masters",
  "dynamic-fields": "dynamic-fields",
  "audit-logs": "audit-logs",
  documents: "documents",
  reports: "reports",
  settings: "settings",
};

export function pageIconForPath(pathname: string | null | undefined): PageIconName {
  const section = pathname?.split("/").filter(Boolean)[0] ?? "";
  return SECTION_ICONS[section] ?? "default";
}

/** The bare 48×48 icon. */
export function PageIconGlyph({ name, className }: { name: PageIconName; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className={cn("size-7", className)}>
      {ICONS[name]}
    </svg>
  );
}

/** Icon in the standard header tile (white, bordered, soft shadow). */
export function PageIcon({ name, className }: { name: PageIconName; className?: string }) {
  return (
    <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-card", className)}>
      <PageIconGlyph name={name} />
    </span>
  );
}
