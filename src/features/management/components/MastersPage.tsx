"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CaretDownIcon, DownloadSimpleIcon, NotePencilIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDownloadHolidays, useDownloadMasterValues } from "@/features/exports/hooks/useExports";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DatePicker } from "@/components/shared/DatePicker";
import { type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { DeleteImpactDialog } from "@/components/shared/DeleteImpactDialog";
import {
  useCreateHoliday,
  useCreateMasterValue,
  useHolidaysQuery,
  useMasterValuesQuery,
  useMasterValueDeleteImpactQuery,
  useUpdateHoliday,
  useUpdateMasterValue,
  useDeleteMasterValue,
  useDeleteHoliday,
  useBulkDeleteMasterValues,
  useBulkDeleteHolidays,
} from "../hooks/useMasters";
import { CATEGORY_TO_BACKEND } from "../services/masters.service";
import {
  masterTabs,
  type Holiday,
  type HolidayFormValues,
  type HolidayType,
  type MasterTabId,
  type MasterValue,
  type MasterValueCategory,
  type MasterValueFormValues,
  type MasterValueStatus,
} from "../types/masters.types";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";
import { MasterValueImportDrawer } from "./MasterValueImportDrawer";

const statuses: MasterValueStatus[] = ["Active", "Inactive"];
const holidayTypes: HolidayType[] = ["National", "Restricted", "Company"];

export function MastersPage() {
  const [activeTab, setActiveTab] = useState<MasterTabId>("Payment Types");
  const [search, setSearch] = useState("");
  const isHolidayTab = activeTab === "Holidays";
  const category = !isHolidayTab ? (activeTab as MasterValueCategory) : undefined;

  const { data: values = [], isLoading: valuesLoading } = useMasterValuesQuery(category ?? "Payment Types", undefined);
  const { data: holidays = [], isLoading: holidaysLoading } = useHolidaysQuery();

  const valuesSelection = useBulkSelection();
  const holidaysSelection = useBulkSelection();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDeleteValues = useBulkDeleteMasterValues(category ?? "Payment Types");
  const bulkDeleteHolidays = useBulkDeleteHolidays();
  const activeSelection = isHolidayTab ? holidaysSelection : valuesSelection;
  const activeBulkDelete = isHolidayTab ? bulkDeleteHolidays : bulkDeleteValues;

  async function handleBulkDelete() {
    await activeBulkDelete.mutateAsync(Array.from(activeSelection.selectedIds));
    setDeleteOpen(false);
    activeSelection.clear();
  }

  const valueData = useMemo(() => {
    if (!category) return [];
    const query = search.toLowerCase();
    return values.filter(
      (row) => !query || row.value.toLowerCase().includes(query) || row.description.toLowerCase().includes(query),
    );
  }, [values, category, search]);

  const holidayData = useMemo(() => {
    const query = search.toLowerCase();
    return holidays.filter((row) => !query || row.name.toLowerCase().includes(query) || row.type.toLowerCase().includes(query));
  }, [holidays, search]);

  const tableLoading = isHolidayTab ? holidaysLoading : valuesLoading;

  const downloadValues = useDownloadMasterValues();
  const downloadHolidays = useDownloadHolidays();
  const exportPending = downloadValues.isPending || downloadHolidays.isPending;

  function handleExport() {
    const trimmedSearch = search.trim() || undefined;
    if (isHolidayTab) downloadHolidays.mutate({ search: trimmedSearch });
    else if (category) downloadValues.mutate({ category: CATEGORY_TO_BACKEND[category], search: trimmedSearch });
  }

  const valueColumns: ColumnDef<MasterValue>[] = [
    { key: "value", header: "Value", render: (row) => <span className="font-semibold text-foreground">{row.value}</span> },
    { key: "description", header: "Description" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (row) =>
        category ? (
          <div className="flex items-center gap-1">
            <MasterValueDrawer category={category} value={row} iconOnly />
            <MasterValueDeleteButton value={row} category={category} />
          </div>
        ) : null,
    },
  ];

  const holidayColumns: ColumnDef<Holiday>[] = [
    { key: "name", header: "Holiday Name", render: (row) => <span className="font-semibold text-foreground">{row.name}</span> },
    { key: "date", header: "Date", render: (row) => row.date },
    { key: "type", header: "Type" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (row) => (
        <div className="flex items-center gap-1">
          <HolidayDrawer holiday={row} iconOnly />
          <DeleteButton id={row.id} label={row.name} hook={useDeleteHoliday} />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Masters"
      subtitle="Manage system configuration values."
      tabs={
        <UnderlineTabs
          items={masterTabs}
          active={activeTab}
          onChange={(tab) => {
            setActiveTab(tab as MasterTabId);
            setSearch("");
            valuesSelection.clear();
            holidaysSelection.clear();
          }}
        />
      }
      actions={
        <>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={handleExport}
            disabled={exportPending}
          >
            <DownloadSimpleIcon size={15} />
            {exportPending ? "Exporting..." : "Export Excel"}
          </button>
          {category && <MasterValueImportDrawer category={category} />}
          {isHolidayTab ? (
            <HolidayDrawer />
          ) : category ? (
            <MasterValueDrawer category={category} />
          ) : null}
        </>
      }
    >
      {activeTab === "Material Categories" ? (
        <div className="rounded-sm border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Material categories are only groups like GI Pipe, MDPE Pipe, Valve, Tools. Actual stock items are added from Inventory & Material using Add Material.
        </div>
      ) : null}
      <div className="max-w-sm">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={isHolidayTab ? "Search holidays..." : `Search ${activeTab.toLowerCase()}...`}
        />
      </div>
      <BulkDeleteBar
        selectedCount={activeSelection.selectedIds.size}
        onClear={activeSelection.clear}
        onDelete={() => setDeleteOpen(true)}
      />
      {isHolidayTab ? (
        <PaginatedDataTable
          data={holidayData}
          columns={holidayColumns}
          isLoading={tableLoading}
          selection={{
            selectedIds: holidaysSelection.selectedIds,
            onToggleRow: holidaysSelection.toggleRow,
            onTogglePage: holidaysSelection.toggleAllOnPage,
            getRowLabel: (row) => row.name,
          }}
        />
      ) : (
        <PaginatedDataTable
          data={valueData}
          columns={valueColumns}
          isLoading={tableLoading}
          selection={{
            selectedIds: valuesSelection.selectedIds,
            onToggleRow: valuesSelection.toggleRow,
            onTogglePage: valuesSelection.toggleAllOnPage,
            getRowLabel: (row) => row.value,
          }}
        />
      )}

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={activeSelection.selectedIds.size}
        entityLabel={isHolidayTab ? "Holiday" : "Value"}
        isSubmitting={activeBulkDelete.isPending}
        onConfirm={handleBulkDelete}
      />
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function MasterValueDeleteButton({ value, category }: { value: MasterValue; category: MasterValueCategory }) {
  const [open, setOpen] = useState(false);
  const deleteValue = useDeleteMasterValue(category);
  const deactivateValue = useUpdateMasterValue(category, value.id);
  const deleteImpact = useMasterValueDeleteImpactQuery(value.id, { enabled: open });

  return (
    <DeleteImpactDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${value.value}`}
        >
          <TrashIcon size={15} className="text-destructive" />
        </Button>
      }
      entityTypeLabel="Value"
      impact={deleteImpact.data}
      isLoading={deleteImpact.isLoading}
      isError={deleteImpact.isError}
      onRetry={() => void deleteImpact.refetch()}
      isConfirming={deleteValue.isPending}
      onConfirm={async () => {
        await deleteValue.mutateAsync(value.id);
        setOpen(false);
      }}
      isArchiving={deactivateValue.isPending}
      archiveLabel="Deactivate Value"
      onArchive={async () => {
        await deactivateValue.mutateAsync({
          value: value.value,
          description: value.description,
          status: "Inactive",
        });
        setOpen(false);
      }}
    />
  );
}

function DeleteButton({ id, label, hook }: { id: string; label: string; hook: () => { mutate: (id: string) => void; isPending: boolean } }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = hook();

  function handleConfirm() {
    mutate(id);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ActionTooltip label={`Delete "${label}"`}>
        <PopoverTrigger
          aria-label={`Delete ${label}`}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <TrashIcon size={15} className="text-destructive" />
        </PopoverTrigger>
      </ActionTooltip>
      <PopoverContent className="w-64 p-3" side="left">
        <p className="mb-3 text-sm font-medium">Delete &ldquo;{label}&rdquo;?</p>
        <p className="mb-4 text-xs text-muted-foreground">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" variant="destructive" size="sm" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DrawerTrigger({ label, iconOnly }: { label: string; iconOnly?: boolean }) {
  if (iconOnly) {
    return (
      <ActionTooltip label={label}>
        <SheetTrigger
          render={<button type="button" className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label={label} />}
        >
          <NotePencilIcon size={15} />
        </SheetTrigger>
      </ActionTooltip>
    );
  }
  return (
    <SheetTrigger render={<Button type="button" />}>
      <PlusIcon size={15} />
      {label}
    </SheetTrigger>
  );
}

function MasterValueDrawer({
  category,
  value,
  iconOnly = false,
}: {
  category: MasterValueCategory;
  value?: MasterValue;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MasterValueFormValues>(
    value ? { value: value.value, description: value.description, status: value.status } : { value: "", description: "", status: "Active" },
  );
  const [error, setError] = useState("");
  const createValue = useCreateMasterValue(category);
  const updateValue = useUpdateMasterValue(category, value?.id ?? "");
  const isSaving = createValue.isPending || updateValue.isPending;
  const label = value ? "Edit" : "Add Value";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(value ? { value: value.value, description: value.description, status: value.status } : { value: "", description: "", status: "Active" });
      setError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!draft.value.trim()) {
      setError("Value is required");
      return;
    }
    setError("");
    try {
      if (value) await updateValue.mutateAsync(draft);
      else await createValue.mutateAsync(draft);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger label={label} iconOnly={iconOnly} />
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{value ? `Edit ${category}` : `Add ${category}`}</SheetTitle>
          <SheetDescription>Create or update {category.toLowerCase()} options.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <Field label="Value">
            <Input value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} />
          </Field>
          <Field label="Description">
            <Input value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
          </Field>
          <Field label="Status">
            <Select value={draft.status} onValueChange={(status) => { if (status) setDraft((current) => ({ ...current, status: status as MasterValueStatus })); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function HolidayDrawer({ holiday, iconOnly = false }: { holiday?: Holiday; iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HolidayFormValues>(
    holiday ? { name: holiday.name, date: holiday.date, type: holiday.type, status: holiday.status } : { name: "", date: "", type: "National", status: "Active" },
  );
  const [error, setError] = useState("");
  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday(holiday?.id ?? "");
  const isSaving = createHoliday.isPending || updateHoliday.isPending;
  const label = holiday ? "Edit" : "Add Holiday";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(holiday ? { name: holiday.name, date: holiday.date, type: holiday.type, status: holiday.status } : { name: "", date: "", type: "National", status: "Active" });
      setError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!draft.name.trim() || !draft.date) {
      setError("Name and date are required");
      return;
    }
    setError("");
    try {
      if (holiday) await updateHoliday.mutateAsync(draft);
      else await createHoliday.mutateAsync(draft);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger label={label} iconOnly={iconOnly} />
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{holiday ? "Edit Holiday" : "Add Holiday"}</SheetTitle>
          <SheetDescription>Manage national, restricted and company holidays.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <Field label="Holiday Name">
            <Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
          </Field>
          <Field label="Date">
            <DatePicker value={draft.date} onChange={(date) => setDraft((current) => ({ ...current, date }))} placeholder="Select date" className="w-full" />
          </Field>
          <Field label="Type">
            <Select value={draft.type} onValueChange={(type) => { if (type) setDraft((current) => ({ ...current, type: type as HolidayType })); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {holidayTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={draft.status} onValueChange={(status) => { if (status) setDraft((current) => ({ ...current, status: status as MasterValueStatus })); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
