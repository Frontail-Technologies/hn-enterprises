"use client";

import { useMemo, useState } from "react";
import { ArrowUUpLeftIcon, ArrowUpRightIcon, FlaskIcon } from "@phosphor-icons/react";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { Button } from "@/components/ui/button";
import { MaterialDrawer } from "@/features/commercial/components/inventory/MaterialDrawer";
import { useInventoryTransactionsPageQuery, useMaterialProjectUsageQuery, usePlumberBalancesQuery } from "@/features/commercial/hooks/useMaterials";
import type { MaterialTransaction, MaterialTransactionType, PlumberBalance, ProjectMaterialUsageRow } from "@/features/commercial/types/material.types";
import { formatDate } from "./project-detail.utils";

type UsageRow = ProjectMaterialUsageRow & { balance: number };

const qty = (value: number) => Number(value.toFixed(3)).toLocaleString("en-IN");

const usageColumns: ListColumn<UsageRow>[] = [
  { id: "name", header: "Material", value: (row) => row.name, isTitle: true, hideable: false, sortable: true, width: 240, grow: true },
  { id: "unit", header: "Unit", value: (row) => row.unit, width: 90 },
  { id: "issued", header: "Issued", value: (row) => row.issued, cell: (row) => qty(row.issued), align: "end", sortable: true, width: 110 },
  { id: "consumed", header: "Used", value: (row) => row.consumed, cell: (row) => qty(row.consumed), align: "end", sortable: true, width: 110 },
  { id: "returned", header: "Returned", value: (row) => row.returned, cell: (row) => qty(row.returned), align: "end", sortable: true, width: 110 },
  { id: "balance", header: "With plumbers", value: (row) => row.balance, cell: (row) => qty(row.balance), align: "end", sortable: true, width: 130 },
];

const balanceColumns: ListColumn<PlumberBalance & { id: string }>[] = [
  { id: "plumberName", header: "Plumber / Labour", value: (row) => row.plumberName || "-", isTitle: true, hideable: false, sortable: true, width: 200, grow: true },
  { id: "materialName", header: "Material", value: (row) => row.materialName || "-", sortable: true, width: 200 },
  { id: "source", header: "Source", value: (row) => (row.source === "pbg" ? "PBG" : row.source ? "Purchase" : "-"), width: 100 },
  { id: "issued", header: "Issued", value: (row) => row.issued, cell: (row) => qty(row.issued), align: "end", width: 100 },
  { id: "consumed", header: "Used", value: (row) => row.consumed, cell: (row) => qty(row.consumed), align: "end", width: 100 },
  { id: "returned", header: "Returned", value: (row) => row.returned, cell: (row) => qty(row.returned), align: "end", width: 100 },
  { id: "balance", header: "Balance", value: (row) => row.balance, cell: (row) => qty(row.balance), align: "end", sortable: true, width: 110 },
];

const TYPE_LABEL: Record<MaterialTransactionType, string> = {
  purchase: "Purchase",
  pbg_issue: "PBG issue",
  pbg_consumption: "PBG consumption",
  issue: "Issue",
  return: "Return",
  adjustment: "Adjustment",
  consumption: "Consumption",
};

const entryColumns: ListColumn<MaterialTransaction>[] = [
  { id: "date", header: "Date", value: (row) => row.transactionDate, cell: (row) => formatDate(row.transactionDate), width: 120 },
  { id: "type", header: "Type", value: (row) => TYPE_LABEL[row.type] ?? row.type, width: 140 },
  { id: "material", header: "Material", value: (row) => row.materialName || "-", isTitle: true, width: 220, grow: true },
  { id: "quantity", header: "Qty", value: (row) => row.quantity, cell: (row) => qty(row.quantity), align: "end", width: 90 },
  { id: "plumber", header: "Plumber / Labour", value: (row) => row.plumberName || "-", width: 180 },
  { id: "customer", header: "Customer", value: (row) => row.customerName || "-", width: 180 },
];

const ACTIONS: { type: MaterialTransactionType; label: string; icon: React.ReactNode }[] = [
  { type: "issue", label: "Issue", icon: <ArrowUpRightIcon size={13} /> },
  { type: "return", label: "Return", icon: <ArrowUUpLeftIcon size={13} /> },
  { type: "consumption", label: "Consumption", icon: <FlaskIcon size={13} /> },
];

/**
 * The project's material: per material issued / used / returned, what each
 * plumber or labourer still holds for this project, and the latest entries.
 * New entries from here start with this project chosen.
 */
export function ProjectMaterialTab({ projectId }: { projectId: string }) {
  const usageList = useListState({ pageSize: 25, storageKey: "project-material-usage" });
  const balanceList = useListState({ pageSize: 25, storageKey: "project-material-balances" });
  const entryList = useListState({ pageSize: 25, storageKey: "project-material-entries" });
  const [openType, setOpenType] = useState<MaterialTransactionType | null>(null);

  const usageQuery = useMaterialProjectUsageQuery(projectId);
  const usage = useMemo<UsageRow[]>(
    () => (usageQuery.data ?? []).map((row) => ({ ...row, balance: row.issued - row.consumed - row.returned })),
    [usageQuery.data],
  );
  const usageRows = useClientRows(usage, usageList, { columns: usageColumns });

  const balancesQuery = usePlumberBalancesQuery({ projectId });
  const balances = useMemo(
    () =>
      (balancesQuery.data ?? [])
        .filter((row) => Math.abs(row.balance) > 0.0005)
        .map((row) => ({ ...row, id: `${row.plumberId}:${row.materialId}:${row.source}` })),
    [balancesQuery.data],
  );
  const balanceRows = useClientRows(balances, balanceList, { columns: balanceColumns });

  const entriesQuery = useInventoryTransactionsPageQuery({ projectId, page: entryList.page, limit: entryList.pageSize }, true);
  const entries = entriesQuery.data?.rows ?? [];
  const entryTotal = entriesQuery.data?.pagination?.total ?? entries.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {ACTIONS.map((action) => (
          <Button key={action.type} type="button" size="compact" variant={action.type === "issue" ? "default" : "outline"} onClick={() => setOpenType(action.type)}>
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
      {ACTIONS.map((action) => (
        <MaterialDrawer
          key={action.type}
          type={action.type}
          hideTrigger
          defaultProjectId={projectId}
          open={openType === action.type}
          onOpenChange={(open) => setOpenType(open ? action.type : null)}
        />
      ))}

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title">Material for this project</h2>
        <ListTable
          itemLabel="material"
          rows={usageRows.pageRows}
          total={usageRows.total}
          columns={usageColumns}
          state={usageList}
          isLoading={usageQuery.isLoading}
          isError={usageQuery.isError}
          onRetry={() => void usageQuery.refetch()}
          searchPlaceholder="Search materials..."
          empty={{ illustration: "materials", title: "No material issued to this project yet." }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title">With plumbers and labour</h2>
        <ListTable
          itemLabel="balance"
          rows={balanceRows.pageRows}
          total={balanceRows.total}
          columns={balanceColumns}
          state={balanceList}
          isLoading={balancesQuery.isLoading}
          isError={balancesQuery.isError}
          onRetry={() => void balancesQuery.refetch()}
          searchPlaceholder="Search plumber or material..."
          empty={{ illustration: "materials", title: "Nobody holds material for this project." }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title">Entries</h2>
        <ListTable
          itemLabel="entry"
          rows={entries}
          total={entryTotal}
          columns={entryColumns}
          state={entryList}
          searchable={false}
          isLoading={entriesQuery.isLoading}
          isError={entriesQuery.isError}
          onRetry={() => void entriesQuery.refetch()}
          empty={{ illustration: "materials", title: "No material entries for this project yet." }}
        />
      </section>
    </div>
  );
}
