"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { FunnelIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
import { cn } from "@/lib/utils";
import type { FilterConfig } from "./FilterBar";

interface FilterSheetButtonProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  searchKey?: string;
  searchPlaceholder?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  renderExtra?: (context: {
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
  }) => ReactNode;
  className?: string;
}

export function FilterSheetButton({
  filters,
  values,
  onChange,
  onReset,
  searchKey,
  searchPlaceholder = "Search...",
  title = "Filters",
  description = "Refine the records shown in this table.",
  children,
  renderExtra,
  className,
}: FilterSheetButtonProps) {
  const [open, setOpen] = useState(false);
  const [draftValues, setDraftValues] = useState(values);
  const showInlineFilters = filters.length <= 2 && !children && !renderExtra;

  const activeCount = filters.reduce((count, filter) => {
    const value = values[filter.key];
    return value && value !== "all" ? count + 1 : count;
  }, 0);

  function updateDraft(key: string, value: string) {
    setDraftValues((current) => ({ ...current, [key]: value }));
  }

  function applyFilters() {
    Object.entries(draftValues).forEach(([key, value]) => {
      if (values[key] !== value) onChange(key, value);
    });
  }

  function resetFilters() {
    onReset();
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setDraftValues(values);
    setOpen(nextOpen);
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {searchKey ? (
        <div className="relative min-w-0">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={15}
          />
          <Input
            placeholder={searchPlaceholder}
            value={values[searchKey] ?? ""}
            onChange={(event) => onChange(searchKey, event.target.value)}
            className="h-9 w-72 max-w-full pl-9"
          />
        </div>
      ) : null}

      {showInlineFilters ? (
        <>
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={values[filter.key] ?? "all"}
              onValueChange={(value) => onChange(filter.key, value ?? "all")}
            >
              <SelectTrigger
                className="h-9 w-48 max-w-full"
                title={getFilterLabel(filter, values[filter.key] ?? "all")}
              >
                <span className="min-w-0 truncate text-left">
                  {getFilterLabel(filter, values[filter.key] ?? "all")}
                </span>
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
          ))}
          {activeCount > 0 || (searchKey && values[searchKey]) ? (
            <Button type="button" variant="outline" size="default" className="h-9" onClick={onReset}>
              Reset
            </Button>
          ) : null}
        </>
      ) : (
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger
            render={
              <Button type="button" variant="outline" size="default" className="h-9" />
            }
          >
            <FunnelIcon size={14} />
            Filters
            {activeCount > 0 ? (
              <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                {activeCount}
              </span>
            ) : null}
          </SheetTrigger>
          <SheetContent className="w-full border-border bg-card sm:max-w-md">
            <SheetHeader className="border-b border-border/70">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {filter.placeholder}
                  </Label>
                  <Select
                    value={draftValues[filter.key] ?? "all"}
                    onValueChange={(value) => updateDraft(filter.key, value ?? "all")}
                  >
                    <SelectTrigger
                      className="h-9 w-full"
                      title={getFilterLabel(filter, draftValues[filter.key] ?? "all")}
                    >
                      <span className="min-w-0 truncate text-left">
                        {getFilterLabel(filter, draftValues[filter.key] ?? "all")}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="w-80 max-w-[calc(100vw-2rem)]">
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
                </div>
              ))}

              {renderExtra?.({ values: draftValues, onChange: updateDraft })}
              {children}
            </div>

            <SheetFooter className="border-t border-border/70">
              <div className="flex items-center justify-between gap-2">
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <SheetClose render={<Button type="button" onClick={applyFilters} />}>
                  Apply Filters
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

function getFilterLabel(filter: FilterConfig, value: string) {
  if (value === "all") return filter.placeholder;
  return filter.options.find((option) => option.value === value)?.label ?? filter.placeholder;
}
