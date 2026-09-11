"use client";

import { useState } from "react";
import { DeleteImpactAction } from "@/components/shared/DeleteImpactAction";
import {
  useDeleteMasterValue,
  useMasterValueDeleteImpactQuery,
  useUpdateMasterValue,
} from "../../hooks/useMasters";
import type { MasterValue, MasterValueCategory } from "../../types/masters.types";

export function MasterValueDeleteButton({ value, category }: { value: MasterValue; category: MasterValueCategory }) {
  const [open, setOpen] = useState(false);
  const deleteValue = useDeleteMasterValue(category);
  const deactivateValue = useUpdateMasterValue(category, value.id);
  const deleteImpact = useMasterValueDeleteImpactQuery(value.id, { enabled: open });

  return (
    <DeleteImpactAction
      open={open}
      onOpenChange={setOpen}
      itemName={value.value}
      entityTypeLabel="Value"
      triggerSize="icon-sm"
      triggerClassName=""
      iconSize={15}
      iconClassName="text-destructive"
      impact={deleteImpact.data}
      isImpactLoading={deleteImpact.isLoading}
      isImpactError={deleteImpact.isError}
      onRetryImpact={() => void deleteImpact.refetch()}
      isDeleting={deleteValue.isPending}
      onDelete={() => deleteValue.mutateAsync(value.id)}
      isDeactivating={deactivateValue.isPending}
      deactivateLabel="Deactivate Value"
      onDeactivate={() =>
        deactivateValue.mutateAsync({
          value: value.value,
          description: value.description,
          status: "Inactive",
        })
      }
    />
  );
}
