import { cn } from "@/lib/utils";
import type { InventoryTab } from "../../types/commercial.types";

const TAB_LABELS: Record<InventoryTab, string> = {
  stock: "Stock Sheet",
  purchase: "Purchase Register",
  pbgIssue: "PBG Issue",
  pbgConsumption: "PBG Consumption",
  storeIssue: "Store Issue Book",
  totalIssue: "Total Issue",
  plumberBalance: "Plumber Balance",
  plumberConsumption: "Consumption Log",
};

const TAB_ORDER: InventoryTab[] = [
  "stock",
  "purchase",
  "pbgIssue",
  "pbgConsumption",
  "storeIssue",
  "totalIssue",
  "plumberBalance",
  "plumberConsumption",
];

export function InventoryTabNav({
  activeTab,
  onChange,
  counts,
}: {
  activeTab: InventoryTab;
  onChange: (tab: InventoryTab) => void;
  counts: Partial<Record<InventoryTab, number>>;
}) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto border-b border-border/70">
      {TAB_ORDER.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "inline-flex h-10 w-fit shrink-0 cursor-pointer items-center gap-2 border-b-2 px-0.5 text-sm font-medium transition-colors",
            activeTab === tab
              ? "border-b-primary text-primary font-semibold"
              : "border-b-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>{TAB_LABELS[tab]}</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              activeTab === tab
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {counts[tab] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
