import { cn } from "@/lib/utils";
import { inventoryTabs } from "../../data/materials.data";
import type { InventoryTab } from "../../types/commercial.types";

export function InventoryTabNav({
  activeTab,
  onChange,
}: {
  activeTab: InventoryTab;
  onChange: (tab: InventoryTab) => void;
}) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto border-b border-border/70">
      {inventoryTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "inline-flex h-10 w-fit shrink-0 cursor-pointer items-center gap-2 border-b-2 px-0.5 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "border-b-primary text-primary font-semibold"
              : "border-b-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>{tab.label}</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
