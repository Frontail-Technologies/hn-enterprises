"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/shared/DatePicker";
import { type ColumnDef } from "@/components/shared/DataTable";
import { DrawerShell } from "@/components/shared/DrawerShell";
import { QuickField } from "@/components/shared/QuickField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import {
  configurableMasterSheetColumns,
  holidayRecords,
  masterSheetColumnValueTypes,
  masterTabs,
  masterValues,
  type HolidayType,
  type MasterSheetColumnValueType,
  type MasterTabId,
  type MasterValueCategory,
} from "../masters.config";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

export function MastersPage() {
  const [activeTab, setActiveTab] = useState<MasterTabId>("Payment Types");
  const [search, setSearch] = useState("");
  const isColumnTab = activeTab === "Master Sheet Columns";
  const isHolidayTab = activeTab === "Holidays";

  const valueData = useMemo(() => {
    const query = search.toLowerCase();
    return masterValues.filter(
      (row) =>
        row.category === activeTab &&
        (!query ||
          row.value.toLowerCase().includes(query) ||
          row.description.toLowerCase().includes(query)),
    );
  }, [activeTab, search]);
  const columns: ColumnDef<(typeof masterValues)[number]>[] = [
    {
      key: "value",
      header: "Value",
      render: (row) => (
        <span className="font-semibold text-foreground">{row.value}</span>
      ),
    },
    { key: "description", header: "Description" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: () => (
        <MasterValueDrawer
          category={activeTab as MasterValueCategory}
          mode="edit"
          iconOnly
        />
      ),
    },
  ];
  const columnData = useMemo(() => {
    const query = search.toLowerCase();
    return configurableMasterSheetColumns.filter(
      (row) =>
        !query ||
        row.label.toLowerCase().includes(query) ||
        row.key.toLowerCase().includes(query) ||
        row.group.toLowerCase().includes(query),
    );
  }, [search]);
  const masterSheetColumnColumns: ColumnDef<
    (typeof configurableMasterSheetColumns)[number]
  >[] = [
    {
      key: "label",
      header: "Column Label",
      render: (row) => (
        <span className="font-semibold text-foreground">{row.label}</span>
      ),
    },
    { key: "group", header: "Group" },
    { key: "valueType", header: "Value Type" },
    {
      key: "dropdownOptions",
      header: "Options",
      render: (row) =>
        row.valueType === "Dropdown" ? row.dropdownOptions?.join(", ") : "-",
    },
    {
      key: "required",
      header: "Required",
      render: (row) => (row.required ? "Yes" : "No"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: () => <MasterSheetColumnDrawer mode="edit" iconOnly />,
    },
  ];
  const holidayData = useMemo(() => {
    const query = search.toLowerCase();
    return holidayRecords.filter(
      (row) => !query || row.name.toLowerCase().includes(query) || row.type.toLowerCase().includes(query),
    );
  }, [search]);
  const holidayColumns: ColumnDef<(typeof holidayRecords)[number]>[] = [
    {
      key: "name",
      header: "Holiday Name",
      render: (row) => (
        <span className="font-semibold text-foreground">{row.name}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => format(parseISO(row.date), "dd MMM yyyy"),
    },
    { key: "type", header: "Type" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: () => <HolidayDrawer mode="edit" iconOnly />,
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
        isColumnTab ? (
          <MasterSheetColumnDrawer />
        ) : isHolidayTab ? (
          <HolidayDrawer />
        ) : (
          <MasterValueDrawer category={activeTab as MasterValueCategory} />
        )
      }
    >
      <div className="max-w-sm">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            isColumnTab
              ? "Search columns..."
              : isHolidayTab
                ? "Search holidays..."
                : `Search ${activeTab.toLowerCase()}...`
          }
        />
      </div>
      {isColumnTab ? (
        <PaginatedDataTable
          data={columnData}
          columns={masterSheetColumnColumns}
        />
      ) : isHolidayTab ? (
        <PaginatedDataTable data={holidayData} columns={holidayColumns} />
      ) : (
        <PaginatedDataTable data={valueData} columns={columns} />
      )}
    </PageShell>
  );
}

function MasterValueDrawer({
  category,
  mode = "add",
  iconOnly = false,
}: {
  category: MasterValueCategory;
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  return (
    <DrawerShell
      title={mode === "edit" ? `Edit ${category}` : `Add ${category}`}
      description={`Create or update ${category.toLowerCase()} options.`}
      triggerLabel={mode === "edit" ? "Edit" : "Add Value"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <QuickField label="Value" />
      <QuickField label="Description" textarea />
      <QuickField label="Status" select options={["Active", "Inactive"]} />
    </DrawerShell>
  );
}

function MasterSheetColumnDrawer({
  mode = "add",
  iconOnly = false,
}: {
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  const [valueType, setValueType] =
    useState<MasterSheetColumnValueType>("Text");
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([
    "Cash",
    "UPI",
  ]);

  return (
    <DrawerShell
      title={mode === "edit" ? "Edit Column" : "Add Column"}
      description="Configure an extra customer master-sheet column."
      triggerLabel={mode === "edit" ? "Edit" : "Add Column"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <QuickField label="Column Label" />
      <QuickField label="Group" />
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-foreground">Value Type</span>
        <Select
          value={valueType}
          onValueChange={(value) => {
            if (value) setValueType(value as MasterSheetColumnValueType);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {masterSheetColumnValueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      {valueType === "Dropdown" ? (
        <DropdownOptionBuilder
          options={dropdownOptions}
          onChange={setDropdownOptions}
        />
      ) : null}
      <QuickField label="Required" select options={["No", "Yes"]} />
      <QuickField label="Status" select options={["Active", "Inactive"]} />
    </DrawerShell>
  );
}

function HolidayDrawer({
  mode = "add",
  iconOnly = false,
}: {
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  const [date, setDate] = useState("");
  const [type, setType] = useState<HolidayType>("National");

  return (
    <DrawerShell
      title={mode === "edit" ? "Edit Holiday" : "Add Holiday"}
      description="Manage national, restricted and company holidays."
      triggerLabel={mode === "edit" ? "Edit" : "Add Holiday"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <QuickField label="Holiday Name" />
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-foreground">Date</span>
        <DatePicker value={date} onChange={setDate} placeholder="Select date" className="w-full" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-foreground">Type</span>
        <Select
          value={type}
          onValueChange={(value) => {
            if (value) setType(value as HolidayType);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["National", "Restricted", "Company"] as HolidayType[]).map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <QuickField label="Status" select options={["Active", "Inactive"]} />
    </DrawerShell>
  );
}

function DropdownOptionBuilder({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const [value, setValue] = useState("");

  const addOption = () => {
    const nextValue = value.trim();
    if (!nextValue || options.includes(nextValue)) return;
    onChange([...options, nextValue]);
    setValue("");
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-foreground">
        Dropdown Options
      </span>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addOption();
            }
          }}
          placeholder="Enter option"
        />
        <Button
          type="button"
          size="icon"
          onClick={addOption}
          aria-label="Add option"
        >
          <PlusIcon size={15} />
        </Button>
      </div>
      {options.length ? (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <span
              key={option}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-foreground"
            >
              {option}
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive"
                onClick={() =>
                  onChange(options.filter((item) => item !== option))
                }
                aria-label={`Remove ${option}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
