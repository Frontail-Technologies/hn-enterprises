/**
 * Compacts large counts into short notation (999, 1.2K, 12.5K, 1.3M) so a
 * count never has to fit as a raw multi-digit number in a constrained
 * surface (tabs, badges, stat cards). Below 1000 the exact value is shown -
 * this is display-only, the underlying numeric value never changes. Mirrors
 * the mobile app's formatCompactCount (mobile-app/src/utils/format.ts) so
 * both platforms round the same way.
 */
export function formatCompactCount(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs < 1000) return `${sign}${abs}`;

  const units: { threshold: number; suffix: string }[] = [
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];

  for (const unit of units) {
    if (abs >= unit.threshold) {
      const scaled = abs / unit.threshold;
      const rounded = scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
      return `${sign}${rounded}${unit.suffix}`;
    }
  }
  return `${sign}${abs}`;
}

/**
 * Formats a "current / total" stat pair for a constrained stat-card,
 * compacting each side independently (12,450 / 125,000 -> "12.5K / 125K")
 * so a large fraction never renders as a raw, unreadably-long string.
 */
export function formatFractionStat(current: number, total: number): string {
  return `${formatCompactCount(current)} / ${formatCompactCount(total)}`;
}

/**
 * Same overflow rule as formatCompactCount, but for an already-formatted
 * en-IN INR currency string (e.g. "₹1,47,52,130", as produced by the
 * backend's money() formatter) - compacts using Indian lakh/crore notation
 * above 1 lakh so a large rupee amount never has to fit as a raw
 * multi-digit number in a constrained stat card. Below 1 lakh the exact
 * amount is shown as-is.
 */
function formatCompactCurrencyString(amount: number): string {
  const abs = Math.abs(amount);
  const exact = () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  if (abs < 100_000) return exact();

  const sign = amount < 0 ? "-" : "";
  const units: { threshold: number; suffix: string }[] = [
    { threshold: 10_000_000, suffix: "Cr" },
    { threshold: 100_000, suffix: "L" },
  ];

  for (const unit of units) {
    if (abs >= unit.threshold) {
      const scaled = abs / unit.threshold;
      const rounded = scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
      return `₹${sign}${rounded}${unit.suffix}`;
    }
  }
  return exact();
}

/**
 * Compacts a dashboard stat value for a constrained card - a plain integer
 * count ("12450" -> "12.5K") or an en-IN INR currency string
 * ("₹1,47,52,130" -> "₹1.48Cr"). Anything else (an "x / y" fraction,
 * non-numeric text) is returned unchanged. Mirrors the mobile app's
 * formatCompactStatValue/formatCompactCurrency (mobile-app/src/utils/format.ts)
 * so both platforms round the same way. Display-only - the underlying value
 * never changes, and this is only for constrained summary/stat surfaces,
 * never tables, reports, exports, detail pages or form values.
 */
export function formatCompactStatValue(value: string): string {
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) return formatCompactCount(Number(trimmed));

  const currencyMatch = /^₹\s?(-?[\d,]+)$/.exec(trimmed);
  if (currencyMatch) {
    const amount = Number(currencyMatch[1].replace(/,/g, ""));
    if (Number.isFinite(amount)) return formatCompactCurrencyString(amount);
  }

  return trimmed;
}
