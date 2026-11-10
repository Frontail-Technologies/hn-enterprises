import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small decorative illustrations for empty states. Drawn on a 160x120 grid
 * with theme tokens only, so they follow the brand palette (and any future
 * dark theme) without separate assets.
 */
export type EmptyIllustrationName =
  | "records"
  | "search"
  | "customers"
  | "projects"
  | "materials"
  | "billing"
  | "calendar"
  | "checklist"
  | "documents"
  | "allClear"
  | "error";

const C = {
  backdrop: "var(--muted)",
  shadow: "color-mix(in oklch, var(--foreground) 7%, transparent)",
  surface: "var(--card)",
  line: "var(--border-strong)",
  fill: "var(--muted)",
  accent: "var(--primary)",
  accentSoft: "var(--primary-soft)",
  navy: "var(--secondary-action)",
  white: "var(--card)",
  success: "var(--success)",
  successSoft: "var(--success-soft)",
  danger: "var(--destructive)",
} as const;

const sheet = { fill: C.surface, stroke: C.line, strokeWidth: 1.5 } as const;
const bar = (x: number, y: number, w: number, color: string = C.fill) => (
  <rect x={x} y={y} width={w} height={4} rx={2} fill={color} />
);
const sparkle = (x: number, y: number, s = 4, color: string = C.accent) => (
  <path
    d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`}
    fill={color}
  />
);

const ART: Record<EmptyIllustrationName, ReactNode> = {
  records: (
    <>
      <rect x={50} y={26} width={52} height={66} rx={6} {...sheet} transform="rotate(-7 76 59)" />
      <rect x={60} y={28} width={52} height={66} rx={6} {...sheet} />
      {bar(68, 38, 20, C.accent)}
      {bar(68, 50, 36)}
      {bar(68, 60, 30)}
      {bar(68, 70, 34)}
      {bar(68, 80, 22)}
      <circle cx={112} cy={90} r={11} fill={C.navy} />
      <path d="M112 85v10M107 90h10" stroke={C.white} strokeWidth={2.2} strokeLinecap="round" />
      {sparkle(44, 30)}
      {sparkle(124, 36, 3, C.navy)}
    </>
  ),
  search: (
    <>
      <rect x={46} y={26} width={54} height={68} rx={6} {...sheet} />
      {[38, 50, 62, 74].map((y) => (
        <path key={y} d={`M54 ${y + 2}h38`} stroke={C.line} strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" />
      ))}
      <circle cx={102} cy={68} r={17} fill={C.surface} fillOpacity={0.85} stroke={C.navy} strokeWidth={4} />
      <path d="M93 63a10 10 0 0 1 8-6" stroke={C.accent} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <path d="M114 80l12 12" stroke={C.navy} strokeWidth={7} strokeLinecap="round" />
      {sparkle(124, 40)}
    </>
  ),
  customers: (
    <>
      <rect x={38} y={32} width={58} height={48} rx={8} {...sheet} />
      <circle cx={54} cy={50} r={7} fill={C.fill} />
      {bar(66, 46, 20)}
      {bar(66, 54, 14)}
      <rect x={62} y={46} width={62} height={50} rx={8} {...sheet} />
      <circle cx={80} cy={65} r={10} fill={C.accentSoft} />
      <circle cx={80} cy={62} r={3.6} fill={C.accent} />
      <path d="M73.5 71a7 7 0 0 1 13 0" fill={C.accent} />
      {bar(95, 59, 20, C.navy)}
      {bar(95, 68, 14)}
      {bar(72, 84, 42)}
      {sparkle(128, 38)}
    </>
  ),
  projects: (
    <>
      <rect x={48} y={46} width={38} height={54} rx={3} {...sheet} />
      {[54, 66, 78].map((y) =>
        [55, 69].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width={8} height={7} rx={1.5} fill={C.fill} />),
      )}
      <rect x={62} y={88} width={10} height={12} rx={1.5} fill={C.accentSoft} />
      <path d="M67 46V22" stroke={C.navy} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M67 23h17l-4 5 4 5H67z" fill={C.accent} />
      <path d="M93 96h12" stroke={C.navy} strokeWidth={6} strokeLinecap="round" />
      <circle cx={93} cy={96} r={4.5} fill={C.surface} stroke={C.navy} strokeWidth={2} />
      <path d="M117 100l7-26 7 26z" fill={C.accent} />
      <path d="M119.6 90.5h8.8" stroke={C.white} strokeWidth={3} />
      <path d="M113 100h22" stroke={C.navy} strokeWidth={2.5} strokeLinecap="round" />
      {sparkle(110, 40)}
    </>
  ),
  materials: (
    <>
      <rect x={42} y={64} width={36} height={36} rx={3} {...sheet} />
      <rect x={78} y={64} width={36} height={36} rx={3} {...sheet} />
      <rect x={60} y={30} width={36} height={34} rx={3} fill={C.accentSoft} stroke={C.line} strokeWidth={1.5} />
      <path d="M60 64v36M96 64v36M78 30v34" stroke={C.accent} strokeWidth={3} />
      {bar(48, 90, 12)}
      {bar(84, 90, 12)}
      {[
        [124, 94],
        [136, 94],
        [130, 83],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={6} fill={C.surface} stroke={C.navy} strokeWidth={2.5} />
          <circle cx={x} cy={y} r={2} fill={C.navy} />
        </g>
      ))}
      {sparkle(112, 40)}
    </>
  ),
  billing: (
    <>
      <path
        d="M54 26q0-4 4-4h44q4 0 4 4v70l-6.5-4-6.5 4-6.5-4-6.5 4-6.5-4-6.5 4-6.5-4-6.5 4z"
        {...sheet}
        strokeLinejoin="round"
      />
      {bar(62, 32, 18, C.accent)}
      {bar(62, 46, 36)}
      {bar(62, 56, 28)}
      {bar(62, 66, 32)}
      <path d="M62 78h36" stroke={C.line} strokeWidth={1.5} strokeDasharray="3 3" />
      <circle cx={112} cy={84} r={13} fill={C.accent} />
      <circle cx={112} cy={84} r={9} fill="none" stroke={C.white} strokeOpacity={0.45} strokeWidth={1.5} />
      <path d="M108 79h8M108 82.5h8M110 79c5 0 5 7 0 7h-2l6 5" stroke={C.white} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {sparkle(44, 40, 3.5, C.navy)}
    </>
  ),
  calendar: (
    <>
      <rect x={46} y={30} width={66} height={64} rx={8} {...sheet} />
      <path d="M46 38a8 8 0 0 1 8-8h50a8 8 0 0 1 8 8v8H46z" fill={C.navy} />
      <rect x={60} y={24} width={5} height={13} rx={2.5} fill={C.accent} />
      <rect x={93} y={24} width={5} height={13} rx={2.5} fill={C.accent} />
      {[58, 70, 82].map((y) =>
        [58, 72, 86, 100].map((x) =>
          x === 86 && y === 70 ? (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={5.5} fill={C.accent} />
          ) : (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill={C.fill} />
          ),
        ),
      )}
      <circle cx={114} cy={90} r={12} fill={C.surface} stroke={C.navy} strokeWidth={2.5} />
      <path d="M114 84v6l4 3" stroke={C.navy} strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </>
  ),
  checklist: (
    <>
      <rect x={52} y={24} width={56} height={74} rx={6} {...sheet} />
      <rect x={66} y={18} width={28} height={11} rx={4} fill={C.navy} />
      {[42, 58, 74].map((y, index) => (
        <g key={y}>
          {index === 0 ? (
            <>
              <rect x={60} y={y} width={10} height={10} rx={2.5} fill={C.accent} />
              <path d={`M62.5 ${y + 5}l2 2.2 3.5-4.2`} stroke={C.white} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </>
          ) : (
            <rect x={60.75} y={y + 0.75} width={8.5} height={8.5} rx={2.2} fill="none" stroke={C.line} strokeWidth={1.5} />
          )}
          {bar(76, y + 3, index === 0 ? 24 : index === 1 ? 20 : 26)}
        </g>
      ))}
      {sparkle(120, 36)}
      {sparkle(40, 72, 3, C.navy)}
    </>
  ),
  documents: (
    <>
      <path d="M42 40a4 4 0 0 1 4-4h20l6 6h42a4 4 0 0 1 4 4v48a4 4 0 0 1-4 4H46a4 4 0 0 1-4-4z" fill={C.accentSoft} />
      <rect x={56} y={28} width={46} height={42} rx={3} {...sheet} />
      {bar(63, 36, 18, C.navy)}
      {bar(63, 46, 32)}
      {bar(63, 55, 26)}
      <path d="M40 56a4 4 0 0 1 4-4h76a3 3 0 0 1 3 3.5l-5 38.5a4 4 0 0 1-4 4H46a4 4 0 0 1-4-4z" fill={C.accent} />
      <rect x={70} y={64} width={22} height={5} rx={2.5} fill={C.white} fillOpacity={0.55} />
      {sparkle(124, 34)}
    </>
  ),
  allClear: (
    <>
      <circle cx={80} cy={60} r={27} fill={C.successSoft} stroke={C.success} strokeWidth={3} />
      <path d="M68 60l8.5 8.5L93 52" stroke={C.success} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {sparkle(118, 32, 5)}
      {sparkle(42, 42, 4, C.navy)}
      {sparkle(122, 82, 3, C.navy)}
      <circle cx={44} cy={84} r={2.5} fill={C.accent} />
      <circle cx={112} cy={24} r={2} fill={C.success} />
    </>
  ),
  error: (
    <>
      <path
        d="M58 84a15 15 0 0 1-1-30 21 21 0 0 1 40-6 17 17 0 0 1 7 36z"
        {...sheet}
        strokeLinejoin="round"
      />
      {bar(64, 64, 22)}
      {bar(64, 72, 14)}
      <circle cx={106} cy={84} r={12} fill={C.danger} />
      <path d="M106 78v7" stroke={C.white} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={106} cy={89.5} r={1.5} fill={C.white} />
    </>
  ),
};

interface EmptyIllustrationProps {
  name: EmptyIllustrationName;
  className?: string;
}

export function EmptyIllustration({ name, className }: EmptyIllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-40", className)}
    >
      <circle cx={80} cy={60} r={46} fill={C.backdrop} />
      <ellipse cx={80} cy={106} rx={42} ry={3.5} fill={C.shadow} />
      {ART[name]}
    </svg>
  );
}
