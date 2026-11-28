"use client";

import { useMemo } from "react";
import { CurrencyInrIcon, DownloadSimpleIcon, PackageIcon, UsersThreeIcon, WrenchIcon } from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { axisProps, ChartCard, ChartTable, ChartTooltipCard, gridProps, inr, inrCompact, SERIES } from "@/features/dashboard/components/charts/chart-kit";
import { exportRowsToExcel } from "@/lib/export-excel";
import { formatCompactCount } from "@/lib/format";
import { usePeopleReport, type PeopleReportData, type PeopleReportMaterial, type PeopleReportPerson } from "../services/people.service";
import type { ReportFilters } from "../types";

const count = (value: number) => value.toLocaleString("en-IN");
const qty = (value: number) => Number(value.toFixed(3)).toLocaleString("en-IN");

type MaterialRow = PeopleReportMaterial & { id: string };

/**
 * Plumbers & Labour for the period: work done by the customers assigned to
 * each person, material they took / used / returned, and wages.
 */
export function PeopleReport({ filters }: { filters: ReportFilters }) {
  const { data, isLoading, isError, refetch } = usePeopleReport(filters);

  if (filters.from > filters.to) {
    return <EmptyState illustration="calendar" title="Check the period" description="The start date is after the end date." />;
  }
  if (isError) {
    return (
      <div className="rounded-card border border-border bg-card shadow-card">
        <EmptyState illustration="error" title="Couldn't load the plumbers & labour report" action={{ label: "Retry", onClick: () => void refetch() }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Headline data={data} isLoading={isLoading} />
      <TopWorkersChart data={data} isLoading={isLoading} />
      <PeopleTable data={data} isLoading={isLoading} filters={filters} />
      <MaterialTable data={data} isLoading={isLoading} filters={filters} />
    </div>
  );
}

function Headline({ data, isLoading }: { data?: PeopleReportData; isLoading: boolean }) {
  const people = data?.people ?? [];
  const dash = isLoading ? "…" : undefined;
  const plumbers = people.filter((person) => person.category === "plumber").length;
  const labour = people.length - plumbers;
  const stages = people.reduce((sum, person) => sum + person.stagesDone, 0);
  const wages = people.reduce((sum, person) => sum + person.netWages, 0);
  return (
    <CompactStatGrid columns={4}>
      <DashboardStatCard label="Plumbers / Labour" value={dash ?? `${count(plumbers)} / ${count(labour)}`} icon={UsersThreeIcon} tone="primary" dense />
      <DashboardStatCard label="Stages done by their customers" value={dash ?? formatCompactCount(stages)} icon={WrenchIcon} tone="info" dense />
      <DashboardStatCard label="Material entries" value={dash ?? formatCompactCount(people.reduce((sum, person) => sum + person.materialEntries, 0))} icon={PackageIcon} tone="warning" dense />
      <DashboardStatCard label="Net wages" value={dash ?? inrCompact(wages)} fullValue={inr(wages)} icon={CurrencyInrIcon} tone="success" dense />
    </CompactStatGrid>
  );
}

type TooltipProps<T> = { active?: boolean; payload?: readonly { payload?: T }[] };

function TopWorkersChart({ data, isLoading }: { data?: PeopleReportData; isLoading: boolean }) {
  const top = useMemo(
    () =>
      [...(data?.people ?? [])]
        .filter((person) => person.stagesDone > 0)
        .sort((a, b) => b.stagesDone - a.stagesDone)
        .slice(0, 10)
        .map((person) => ({ ...person, label: person.category === "labour" ? `${person.name} (L)` : person.name })),
    [data?.people],
  );
  return (
    <ChartCard
      title="Most work done"
      description="Top 10 by stages their assigned customers reached in this period"
      isLoading={isLoading}
      isEmpty={!top.length}
      emptyText="No work recorded against plumbers or labour in this period. Assign a plumber on the customer to see it here."
      table={<ChartTable headers={["Name", "Type", "Stages done", "Customers"]} rows={top.map((person) => [person.name, person.category === "labour" ? "Labour" : "Plumber", count(person.stagesDone), count(person.assignedCustomers)])} />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }} barCategoryGap="28%">
          <CartesianGrid {...gridProps} horizontal={false} vertical />
          <XAxis type="number" allowDecimals={false} {...axisProps} />
          <YAxis type="category" dataKey="label" width={140} {...axisProps} tick={{ ...axisProps.tick, fill: "var(--foreground)" }} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={(props: TooltipProps<(typeof top)[number]>) => {
              const person = props.active ? props.payload?.[0]?.payload : undefined;
              return person ? (
                <ChartTooltipCard
                  title={person.name}
                  rows={[
                    { label: "Stages done", value: count(person.stagesDone), color: SERIES.primary },
                    { label: "Assigned customers", value: count(person.assignedCustomers), muted: true },
                  ]}
                />
              ) : null;
            }}
          />
          <Bar dataKey="stagesDone" fill={SERIES.primary} maxBarSize={22} radius={[0, 4, 4, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function PeopleTable({ data, isLoading, filters }: { data?: PeopleReportData; isLoading: boolean; filters: ReportFilters }) {
  const list = useListState({ pageSize: 25, storageKey: "report-people", initialSort: { id: "stagesDone", desc: true } });
  const stages = useMemo(() => data?.stages ?? [], [data?.stages]);
  const rows = useMemo(() => data?.people ?? [], [data?.people]);
  const columns = useMemo<ListColumn<PeopleReportPerson>[]>(
    () => [
      { id: "name", header: "Name", value: (row) => row.name, isTitle: true, hideable: false, sortable: true, width: 200, grow: true },
      {
        id: "category",
        header: "Type",
        value: (row) => (row.category === "labour" ? "Labour" : "Plumber"),
        cell: (row) => <Badge variant={row.category === "labour" ? "secondary" : "outline"}>{row.category === "labour" ? "Labour" : "Plumber"}</Badge>,
        sortable: true,
        width: 100,
      },
      { id: "projects", header: "Projects", value: (row) => row.projectNames.join(", ") || "-", width: 200 },
      { id: "assignedCustomers", header: "Customers", value: (row) => row.assignedCustomers, cell: (row) => count(row.assignedCustomers), align: "end", sortable: true, width: 110 },
      { id: "stagesDone", header: "Stages done", value: (row) => row.stagesDone, cell: (row) => <b className="font-semibold tabular-nums">{count(row.stagesDone)}</b>, align: "end", sortable: true, width: 120 },
      ...stages
        .filter((stage) => rows.some((row) => (row.stages?.[stage.key] ?? 0) > 0))
        .map<ListColumn<PeopleReportPerson>>((stage) => ({
          id: `stage-${stage.key}`,
          header: stage.label,
          value: (row) => row.stages?.[stage.key] ?? 0,
          align: "end",
          sortable: true,
          width: 110,
        })),
      { id: "materialEntries", header: "Material entries", value: (row) => row.materialEntries, align: "end", sortable: true, width: 130 },
      { id: "daysWorked", header: "Days worked", value: (row) => row.daysWorked, cell: (row) => (row.daysWorked ? qty(row.daysWorked) : "-"), align: "end", sortable: true, width: 120 },
      { id: "netWages", header: "Net wages", value: (row) => row.netWages, cell: (row) => (row.netWages ? inr(row.netWages) : "-"), align: "end", sortable: true, width: 130 },
    ],
    [stages, rows],
  );
  const view = useClientRows(rows, list, { columns });

  function exportExcel() {
    void exportRowsToExcel(
      `plumbers-labour-${filters.from}-to-${filters.to}`,
      [
        { label: "Name", getValue: (row: PeopleReportPerson) => row.name },
        { label: "Type", getValue: (row: PeopleReportPerson) => (row.category === "labour" ? "Labour" : "Plumber") },
        { label: "Projects", getValue: (row: PeopleReportPerson) => row.projectNames.join(", ") },
        { label: "Customers", getValue: (row: PeopleReportPerson) => row.assignedCustomers },
        { label: "Stages done", getValue: (row: PeopleReportPerson) => row.stagesDone },
        ...stages.map((stage) => ({ label: stage.label, getValue: (row: PeopleReportPerson) => row.stages?.[stage.key] ?? 0 })),
        { label: "Material entries", getValue: (row: PeopleReportPerson) => row.materialEntries },
        { label: "Days worked", getValue: (row: PeopleReportPerson) => row.daysWorked },
        { label: "Net wages", getValue: (row: PeopleReportPerson) => row.netWages },
      ],
      view.rows,
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <div>
        <h2 className="text-section-title">People</h2>
        <p className="text-[13px] text-muted-foreground">
          Work counts the stages reached in this period by customers assigned to each person. Wages cover {data?.months.length === 1 ? "the month" : "the months"} this period touches.
        </p>
      </div>
      <ListTable
        itemLabel="person"
        rows={view.pageRows}
        total={view.total}
        columns={columns}
        state={list}
        isLoading={isLoading}
        searchPlaceholder="Search name or project..."
        empty={{ illustration: "projects", title: "No plumbers or labour for this project." }}
        actions={
          <Button type="button" variant="outline" size="compact" disabled={!view.total} onClick={exportExcel}>
            <DownloadSimpleIcon size={14} />
            Export
          </Button>
        }
      />
    </section>
  );
}

function MaterialTable({ data, isLoading, filters }: { data?: PeopleReportData; isLoading: boolean; filters: ReportFilters }) {
  const list = useListState({ pageSize: 25, storageKey: "report-people-material" });
  const rows = useMemo<MaterialRow[]>(() => (data?.materials ?? []).map((row) => ({ ...row, id: `${row.plumberId}:${row.materialId}` })), [data?.materials]);
  const columns = useMemo<ListColumn<MaterialRow>[]>(
    () => [
      { id: "plumberName", header: "Plumber / Labour", value: (row) => row.plumberName, isTitle: true, hideable: false, sortable: true, width: 200, grow: true },
      { id: "materialName", header: "Material", value: (row) => row.materialName, sortable: true, width: 200 },
      { id: "unit", header: "Unit", value: (row) => row.unit, width: 80 },
      { id: "issued", header: "Issued", value: (row) => row.issued, cell: (row) => qty(row.issued), align: "end", sortable: true, width: 100 },
      { id: "consumed", header: "Used", value: (row) => row.consumed, cell: (row) => qty(row.consumed), align: "end", sortable: true, width: 100 },
      { id: "returned", header: "Returned", value: (row) => row.returned, cell: (row) => qty(row.returned), align: "end", sortable: true, width: 100 },
      { id: "net", header: "Net in period", value: (row) => row.net, cell: (row) => <b className="font-semibold tabular-nums">{qty(row.net)}</b>, align: "end", sortable: true, width: 120 },
    ],
    [],
  );
  const view = useClientRows(rows, list, { columns });

  function exportExcel() {
    void exportRowsToExcel(
      `plumber-material-${filters.from}-to-${filters.to}`,
      [
        { label: "Plumber / Labour", getValue: (row: MaterialRow) => row.plumberName },
        { label: "Material", getValue: (row: MaterialRow) => row.materialName },
        { label: "Unit", getValue: (row: MaterialRow) => row.unit },
        { label: "Issued", getValue: (row: MaterialRow) => row.issued },
        { label: "Used", getValue: (row: MaterialRow) => row.consumed },
        { label: "Returned", getValue: (row: MaterialRow) => row.returned },
        { label: "Adjusted", getValue: (row: MaterialRow) => row.adjusted },
        { label: "Net in period", getValue: (row: MaterialRow) => row.net },
      ],
      view.rows,
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <div>
        <h2 className="text-section-title">Material with each person</h2>
        <p className="text-[13px] text-muted-foreground">Movements in this period only (not the all-time balance).</p>
      </div>
      <ListTable
        itemLabel="row"
        rows={view.pageRows}
        total={view.total}
        columns={columns}
        state={list}
        isLoading={isLoading}
        searchPlaceholder="Search person or material..."
        empty={{ illustration: "materials", title: "No material issued, used or returned in this period." }}
        actions={
          <Button type="button" variant="outline" size="compact" disabled={!view.total} onClick={exportExcel}>
            <DownloadSimpleIcon size={14} />
            Export
          </Button>
        }
      />
    </section>
  );
}
