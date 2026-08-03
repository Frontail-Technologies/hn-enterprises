"use client";

import { useMemo, useState, type ReactNode } from "react";
import { DownloadSimpleIcon, NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { Input } from "@/components/ui/input";
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
import {
  useCreateCustomField,
  useCreateHoliday,
  useCreateMasterValue,
  useCustomFieldsQuery,
  useHolidaysQuery,
  useMasterValuesQuery,
  useUpdateCustomField,
  useUpdateHoliday,
  useUpdateMasterValue,
} from "../hooks/useMasters";
import {
  masterTabs,
  type CustomField,
  type CustomFieldFormValues,
  type CustomFieldValueType,
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

const valueTypes: CustomFieldValueType[] = ["Text", "Number", "Date", "Amount", "Yes / No", "Dropdown"];
const statuses: MasterValueStatus[] = ["Active", "Inactive"];
const holidayTypes: HolidayType[] = ["National", "Restricted", "Company"];

export function MastersPage() {
  const [activeTab, setActiveTab] = useState<MasterTabId>("Payment Types");
  const [search, setSearch] = useState("");
  const isColumnTab = activeTab === "Master Sheet Columns";
  const isHolidayTab = activeTab === "Holidays";
  const category = !isColumnTab && !isHolidayTab ? (activeTab as MasterValueCategory) : undefined;

  const { data: values = [], isLoading: valuesLoading } = useMasterValuesQuery(category ?? "Payment Types", undefined);
  const { data: customFields = [], isLoading: customFieldsLoading } = useCustomFieldsQuery();
  const { data: holidays = [], isLoading: holidaysLoading } = useHolidaysQuery();

  const valueData = useMemo(() => {
    if (!category) return [];
    const query = search.toLowerCase();
    return values.filter(
      (row) => !query || row.value.toLowerCase().includes(query) || row.description.toLowerCase().includes(query),
    );
  }, [values, category, search]);

  const columnData = useMemo(() => {
    const query = search.toLowerCase();
    return customFields.filter(
      (row) =>
        !query ||
        row.label.toLowerCase().includes(query) ||
        row.key.toLowerCase().includes(query) ||
        row.group.toLowerCase().includes(query),
    );
  }, [customFields, search]);

  const holidayData = useMemo(() => {
    const query = search.toLowerCase();
    return holidays.filter((row) => !query || row.name.toLowerCase().includes(query) || row.type.toLowerCase().includes(query));
  }, [holidays, search]);

  const tableLoading = isColumnTab ? customFieldsLoading : isHolidayTab ? holidaysLoading : valuesLoading;

  const valueExportColumns: ExportColumn<MasterValue>[] = [
    { label: "Value", getValue: (row) => row.value },
    { label: "Description", getValue: (row) => row.description },
    { label: "Status", getValue: (row) => row.status },
  ];

  const columnExportColumns: ExportColumn<CustomField>[] = [
    { label: "Column Label", getValue: (row) => row.label },
    { label: "Group", getValue: (row) => row.group },
    { label: "Value Type", getValue: (row) => row.valueType },
    { label: "Options", getValue: (row) => (row.valueType === "Dropdown" ? row.dropdownOptions.join(", ") : "-") },
    { label: "Required", getValue: (row) => (row.required ? "Yes" : "No") },
    { label: "Status", getValue: (row) => row.status },
  ];

  const holidayExportColumns: ExportColumn<Holiday>[] = [
    { label: "Holiday Name", getValue: (row) => row.name },
    { label: "Date", getValue: (row) => row.date },
    { label: "Type", getValue: (row) => row.type },
    { label: "Status", getValue: (row) => row.status },
  ];

  function handleExport() {
    if (isColumnTab) void exportRowsToExcel("master-sheet-columns.xlsx", columnExportColumns, columnData);
    else if (isHolidayTab) void exportRowsToExcel("holidays.xlsx", holidayExportColumns, holidayData);
    else void exportRowsToExcel(`${activeTab.toLowerCase().replace(/\s+/g, "-")}.xlsx`, valueExportColumns, valueData);
  }

  const valueColumns: ColumnDef<MasterValue>[] = [
    { key: "value", header: "Value", render: (row) => <span className="font-semibold text-foreground">{row.value}</span> },
    { key: "description", header: "Description" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: (row) => (category ? <MasterValueDrawer category={category} value={row} iconOnly /> : null),
    },
  ];

  const columnColumns: ColumnDef<CustomField>[] = [
    { key: "label", header: "Column Label", render: (row) => <span className="font-semibold text-foreground">{row.label}</span> },
    { key: "group", header: "Group" },
    { key: "valueType", header: "Value Type" },
    { key: "dropdownOptions", header: "Options", render: (row) => (row.valueType === "Dropdown" ? row.dropdownOptions.join(", ") : "-") },
    { key: "required", header: "Required", render: (row) => (row.required ? "Yes" : "No") },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: (row) => <CustomFieldDrawer field={row} iconOnly />,
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
      className: "w-20",
      render: (row) => <HolidayDrawer holiday={row} iconOnly />,
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
          }}
        />
      }
      actions={
        <>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={handleExport}
          >
            <DownloadSimpleIcon size={15} />
            Export Excel
          </button>
          {isColumnTab ? (
            <CustomFieldDrawer />
          ) : isHolidayTab ? (
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
          placeholder={
            isColumnTab ? "Search columns..." : isHolidayTab ? "Search holidays..." : `Search ${activeTab.toLowerCase()}...`
          }
        />
      </div>
      {isColumnTab ? (
        <PaginatedDataTable data={columnData} columns={columnColumns} isLoading={tableLoading} />
      ) : isHolidayTab ? (
        <PaginatedDataTable data={holidayData} columns={holidayColumns} isLoading={tableLoading} />
      ) : (
        <PaginatedDataTable data={valueData} columns={valueColumns} isLoading={tableLoading} />
      )}
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

function CustomFieldDrawer({ field, iconOnly = false }: { field?: CustomField; iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CustomFieldFormValues>(
    field
      ? { key: field.key, label: field.label, group: field.group, width: String(field.width), valueType: field.valueType, dropdownOptions: field.dropdownOptions, required: field.required, status: field.status }
      : { key: "", label: "", group: "", width: "150", valueType: "Text", dropdownOptions: [], required: false, status: "Active" },
  );
  const [optionInput, setOptionInput] = useState("");
  const [error, setError] = useState("");
  const createField = useCreateCustomField();
  const updateField = useUpdateCustomField(field?.id ?? "");
  const isSaving = createField.isPending || updateField.isPending;
  const label = field ? "Edit" : "Add Column";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(
        field
          ? { key: field.key, label: field.label, group: field.group, width: String(field.width), valueType: field.valueType, dropdownOptions: field.dropdownOptions, required: field.required, status: field.status }
          : { key: "", label: "", group: "", width: "150", valueType: "Text", dropdownOptions: [], required: false, status: "Active" },
      );
      setOptionInput("");
      setError("");
    }
    setOpen(nextOpen);
  }

  function addOption() {
    const next = optionInput.trim();
    if (!next || draft.dropdownOptions.includes(next)) return;
    setDraft((current) => ({ ...current, dropdownOptions: [...current.dropdownOptions, next] }));
    setOptionInput("");
  }

  async function handleSave() {
    if (!field && !draft.key.trim()) {
      setError("Key is required");
      return;
    }
    if (!draft.label.trim() || !draft.group.trim()) {
      setError("Label and group are required");
      return;
    }
    setError("");
    try {
      if (field) await updateField.mutateAsync(draft);
      else await createField.mutateAsync(draft);
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
          <SheetTitle>{field ? "Edit Column" : "Add Column"}</SheetTitle>
          <SheetDescription>Configure an extra customer master-sheet column.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {!field ? (
            <Field label="Key (used to store the value, e.g. kycVerified)">
              <Input value={draft.key} onChange={(event) => setDraft((current) => ({ ...current, key: event.target.value }))} />
            </Field>
          ) : null}
          <Field label="Column Label">
            <Input value={draft.label} onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))} />
          </Field>
          <Field label="Group">
            <Input value={draft.group} onChange={(event) => setDraft((current) => ({ ...current, group: event.target.value }))} />
          </Field>
          <Field label="Width">
            <Input type="number" value={draft.width} onChange={(event) => setDraft((current) => ({ ...current, width: event.target.value }))} />
          </Field>
          <Field label="Value Type">
            <Select value={draft.valueType} onValueChange={(valueType) => { if (valueType) setDraft((current) => ({ ...current, valueType: valueType as CustomFieldValueType })); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {valueTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {draft.valueType === "Dropdown" ? (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Dropdown Options</span>
              <div className="flex gap-2">
                <Input
                  value={optionInput}
                  onChange={(event) => setOptionInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addOption();
                    }
                  }}
                  placeholder="Enter option"
                />
                <Button type="button" size="icon" onClick={addOption} aria-label="Add option">
                  <PlusIcon size={15} />
                </Button>
              </div>
              {draft.dropdownOptions.length ? (
                <div className="flex flex-wrap gap-2">
                  {draft.dropdownOptions.map((option) => (
                    <span key={option} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-foreground">
                      {option}
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDraft((current) => ({ ...current, dropdownOptions: current.dropdownOptions.filter((item) => item !== option) }))}
                        aria-label={`Remove ${option}`}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <Field label="Required">
            <Select
              value={draft.required ? "Yes" : "No"}
              onValueChange={(value) => { if (value) setDraft((current) => ({ ...current, required: value === "Yes" })); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
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
