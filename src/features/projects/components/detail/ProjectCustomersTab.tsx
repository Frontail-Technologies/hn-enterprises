"use client";

import { useSearchParams } from "next/navigation";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CustomersList } from "@/features/customers/components/CustomersList";

export function ProjectCustomersTab({ projectId, onClearStatKey }: { projectId: string; onClearStatKey: () => void }) {
  const searchParams = useSearchParams();
  const statKey = searchParams.get("statKey") ?? undefined;

  return (
    <div className="space-y-3">
      {statKey ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
          <span>
            Showing customers matching <span className="font-semibold">{statKey}</span>
          </span>
          <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={onClearStatKey}>
            <XIcon size={12} />
            Clear filter
          </Button>
        </div>
      ) : null}
      <CustomersList projectId={projectId} statKey={statKey} embedded />
    </div>
  );
}
