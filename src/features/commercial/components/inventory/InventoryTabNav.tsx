import { Tabs, TabsTrigger } from "@/components/ui/tabs";
import { ScrollableTabsList } from "@/components/shared/ScrollableTabsList";
import { formatCompactCount } from "@/lib/format";
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
    <Tabs value={activeTab} onValueChange={(value) => value && onChange(value as InventoryTab)}>
      <ScrollableTabsList>
        {TAB_ORDER.map((tab) => {
          const count = counts[tab] ?? 0;
          return (
            <TabsTrigger key={tab} value={tab} className="shrink-0">
              <span className="whitespace-nowrap">{TAB_LABELS[tab]}</span>
              <span
                title={count.toLocaleString("en-IN")}
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  tab === activeTab ? "bg-white/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {formatCompactCount(count)}
              </span>
            </TabsTrigger>
          );
        })}
      </ScrollableTabsList>
    </Tabs>
  );
}
