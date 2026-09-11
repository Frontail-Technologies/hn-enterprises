"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { FunnelIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { DatePicker } from "@/components/shared/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FilterConfig } from "./FilterBar";

interface FilterDialogProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  title?: string;
  renderExtra?: (context: {
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
  }) => ReactNode;
}

export function FilterDialog({
  filters,
  values,
  onChange,
  onReset,
  title = "Filters",
  renderExtra,
}: FilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftValues, setDraftValues] = useState(values);

  const activeCount = filters.reduce((count, filter) => {
    const value = values[filter.key];
    const toValue = filter.toKey ? values[filter.toKey] : undefined;
    return (value && value !== "all") || toValue ? count + 1 : count;
  }, 0);

  function updateDraft(key: string, value: string) {
    setDraftValues((current) => ({ ...current, [key]: value }));
  }

  function applyFilters() {
    Object.entries(draftValues).forEach(([key, value]) => {
      if (values[key] !== value) onChange(key, value);
    });
    setOpen(false);
  }

  function resetFilters() {
    onReset();
    setDraftValues(
      Object.fromEntries(
        filters.flatMap((filter) => (filter.toKey ? [[filter.key, "all"], [filter.toKey, "all"]] : [[filter.key, "all"]])),
      ),
    );
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setDraftValues(values);
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" size="compact" />}>
        <FunnelIcon size={12} />
        Filters
        {activeCount > 0 ? (
          <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{filter.placeholder}</Label>
              {filter.type === "dateRange" ? (
                <div className="flex items-center gap-2">
                  <DatePicker
                    value={draftValues[filter.key] || undefined}
                    onChange={(value) => updateDraft(filter.key, value)}
                    placeholder="From"
                  />
                  <DatePicker
                    value={filter.toKey ? draftValues[filter.toKey] || undefined : undefined}
                    onChange={(value) => filter.toKey && updateDraft(filter.toKey, value)}
                    placeholder="To"
                  />
                </div>
              ) : (
                <FilterSelectField
                  filter={filter}
                  value={draftValues[filter.key] ?? "all"}
                  onChange={(value) => updateDraft(filter.key, value)}
                />
              )}
            </div>
          ))}

          {renderExtra?.({ values: draftValues, onChange: updateDraft })}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="compact" onClick={resetFilters}>
            Reset
          </Button>
          <DialogClose render={<Button type="button" size="compact" onClick={applyFilters} />}>
            Apply Filters
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getFilterLabel(filter: FilterConfig, value: string) {
  if (value === "all") return filter.placeholder;
  return filter.options.find((option) => option.value === value)?.label ?? filter.placeholder;
}

function FilterSelectField({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  if (filter.type === "date") {
    return (
      <DatePicker
        value={value === "all" ? undefined : value}
        onChange={onChange}
        placeholder={filter.placeholder}
      />
    );
  }

  if (filter.searchable) {
    return (
      <SearchableSelect
        value={value}
        onValueChange={(next) => onChange(next || "all")}
        placeholder={filter.placeholder}
        className="h-8 w-full text-sm"
        options={[{ value: "all", label: filter.placeholder }, ...filter.options]}
      />
    );
  }

  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? "all")}>
      <SelectTrigger className="w-full" size="sm" title={getFilterLabel(filter, value)}>
        <span className="min-w-0 truncate text-left">{getFilterLabel(filter, value)}</span>
      </SelectTrigger>
      <SelectContent className="w-72 max-w-[calc(100vw-2rem)]">
        <SelectItem value="all" title={filter.placeholder}>
          <span className="block min-w-0 truncate">{filter.placeholder}</span>
        </SelectItem>
        {filter.options.map((option) => (
          <SelectItem key={option.value} value={option.value} title={option.label}>
            <span className="block min-w-0 truncate">{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
