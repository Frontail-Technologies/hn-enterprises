"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { DeleteImpactResult } from "@/components/shared/delete-impact.types";

/** What the admin ticks in a customer delete dialog. */
export type CustomerDeleteChoices = {
  deletePlans: boolean;
  deletePayments: boolean;
  deleteMaterial: boolean;
};

export const DEFAULT_CUSTOMER_DELETE_CHOICES: CustomerDeleteChoices = {
  deletePlans: false,
  deletePayments: false,
  deleteMaterial: false,
};

const countOf = (impact: DeleteImpactResult | undefined, key: string) =>
  impact?.dependencies.find((dependency) => dependency.key === key)?.count ?? 0;

/** Plans + DPRs linked to the customer (must be deleted with it). */
export function planCount(impact: DeleteImpactResult | undefined) {
  return countOf(impact, "sitePlans") + countOf(impact, "dprRecords");
}

/**
 * Checkboxes for the records linked to a customer that are not deleted by
 * default. With `impact` (single delete) each line shows its count and only
 * lines with records appear; without it (bulk delete) all three are offered.
 */
export function CustomerDeleteOptions({
  choices,
  onChange,
  impact,
  disabled,
}: {
  choices: CustomerDeleteChoices;
  onChange: (next: CustomerDeleteChoices) => void;
  impact?: DeleteImpactResult;
  disabled?: boolean;
}) {
  const plans = planCount(impact);
  const payments = countOf(impact, "payments");
  const material = countOf(impact, "materialTransactions");
  const show = (count: number) => !impact || count > 0;
  const label = (count: number, one: string, many: string) => (impact ? `${count} ${count === 1 ? one : many}` : many);

  const rows: { key: keyof CustomerDeleteChoices; visible: boolean; title: string; hint: string }[] = [
    {
      key: "deletePlans",
      visible: show(plans),
      title: `Delete ${label(plans, "plan / DPR", "plans and DPRs")}`,
      hint: "Required: a customer can't be deleted while it has plans or DPRs.",
    },
    {
      key: "deletePayments",
      visible: show(payments),
      title: `Delete ${label(payments, "payment / expense", "payments and expenses")}`,
      hint: "If not ticked, they stay in the project as \"Deleted customer (name)\".",
    },
    {
      key: "deleteMaterial",
      visible: show(material),
      title: `Delete ${label(material, "material entry", "material entries")}`,
      hint: "Changes stock and plumber balances. If not ticked, they stay without the customer.",
    },
  ];
  const visible = rows.filter((row) => row.visible);
  if (!visible.length) return null;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground">Also linked to this customer</p>
      {visible.map((row) => (
        <label key={row.key} className="flex cursor-pointer items-start gap-2.5">
          <Checkbox
            className="mt-0.5"
            checked={choices[row.key]}
            disabled={disabled}
            onCheckedChange={(checked) => onChange({ ...choices, [row.key]: Boolean(checked) })}
          />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{row.title}</span>
            <span className="text-xs text-muted-foreground">{row.hint}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
