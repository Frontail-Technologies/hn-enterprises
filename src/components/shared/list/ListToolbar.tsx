"use client";

import { useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import {
  CaretDownIcon,
  CheckIcon,
  ColumnsIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { DatePicker } from "@/components/shared/DatePicker";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ListState } from "./useListState";
import type { ListColumn, ListFilter } from "./types";

type SelectFilter = Extract<ListFilter, { options: unknown }>;

const isSelect = (filter: ListFilter): filter is SelectFilter => filter.type !== "dateRange";
const shortDate = (value: string) => format(parseISO(value), "dd MMM yyyy");

function QuickFilter({ filter, state }: { filter: SelectFilter; state: ListState }) {
  const [open, setOpen] = useState(false);
  const value = state.filters[filter.id];
  const selected = filter.options.find((option) => option.value === value);
  const choose = (next: string) => {
    state.setFilter(filter.id, next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="compact"
            className={cn("max-w-56 font-normal", selected && "border-primary/40 bg-primary-soft text-foreground hover:bg-primary-soft")}
          />
        }
      >
        <span className="truncate">{selected ? `${filter.label}: ${selected.label}` : filter.label}</span>
        <CaretDownIcon size={12} className="shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0">
        <Command>
          {filter.options.length > 7 ? <CommandInput placeholder={`Search ${filter.label.toLowerCase()}...`} /> : null}
          <CommandList>
            <CommandEmpty>No matches</CommandEmpty>
            <CommandGroup>
              <CommandItem value={`__all ${filter.label}`} onSelect={() => choose("")}>
                <CheckIcon size={14} className={cn(value ? "opacity-0" : "opacity-100")} />
                All
              </CommandItem>
              {filter.options.map((option) => (
                <CommandItem key={option.value} value={`${option.label} ${option.value}`} onSelect={() => choose(option.value)}>
                  <CheckIcon size={14} className={cn(option.value === value ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FiltersPanel({ filters, state, resultCount }: { filters: ListFilter[]; state: ListState; resultCount?: number }) {
  const [open, setOpen] = useState(false);
  const count = filters.filter((filter) => state.filters[filter.id] || (filter.type === "dateRange" && state.filters[filter.toId])).length;

  return (
    <>
      <Button variant="outline" size="compact" onClick={() => setOpen(true)}>
        <FunnelSimpleIcon size={14} />
        Filters
        {count ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{count}</span>
        ) : null}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-sm">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
            {filters.map((filter) => (
              <section key={filter.id} className="flex flex-col gap-2">
                <h3 className="text-[13px] font-semibold text-foreground">{filter.label}</h3>
                {isSelect(filter) ? (
                  <SearchableSelect
                    value={state.filters[filter.id] ?? "all"}
                    onValueChange={(value) => state.setFilter(filter.id, value === "all" ? "" : value)}
                    options={[{ value: "all", label: `All ${filter.label.toLowerCase()}` }, ...filter.options]}
                    className="h-9 w-full"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker value={state.filters[filter.id]} onChange={(value) => state.setFilter(filter.id, value)} placeholder="From" className="h-9" />
                    <DatePicker value={state.filters[filter.toId]} onChange={(value) => state.setFilter(filter.toId, value)} placeholder="To" className="h-9" />
                  </div>
                )}
              </section>
            ))}
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="ghost" onClick={state.clearFilters}>
              Clear all
            </Button>
            <Button onClick={() => setOpen(false)}>{resultCount == null ? "Done" : `Show ${resultCount.toLocaleString("en-IN")} results`}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

function ColumnsMenu<T>({ columns, state }: { columns: ListColumn<T>[]; state: ListState }) {
  const hideable = columns.filter((column) => column.hideable !== false);
  if (hideable.length < 2) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="compact" />}>
        <ColumnsIcon size={14} />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          {hideable.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={state.isColumnVisible(column.id, column.defaultHidden)}
              onCheckedChange={(checked) => state.setColumnVisible(column.id, Boolean(checked))}
            >
              {column.header}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={state.resetColumns}>Reset to default</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card ps-3 pe-1 text-xs font-medium text-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <XIcon size={11} weight="bold" />
      </button>
    </span>
  );
}

export function FilterChips({ filters, state }: { filters: ListFilter[]; state: ListState }) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (state.search.trim()) chips.push({ key: "search", label: `Search: “${state.search.trim()}”`, onRemove: () => state.setSearch("") });
  for (const filter of filters) {
    if (isSelect(filter)) {
      const value = state.filters[filter.id];
      if (!value) continue;
      const label = filter.options.find((option) => option.value === value)?.label ?? value;
      chips.push({ key: filter.id, label: `${filter.label}: ${label}`, onRemove: () => state.setFilter(filter.id, "") });
    } else {
      const from = state.filters[filter.id];
      const to = state.filters[filter.toId];
      if (!from && !to) continue;
      const range = from && to ? `${shortDate(from)} – ${shortDate(to)}` : from ? `from ${shortDate(from)}` : `until ${shortDate(to!)}`;
      chips.push({
        key: filter.id,
        label: `${filter.label}: ${range}`,
        onRemove: () => {
          state.setFilter(filter.id, "");
          state.setFilter(filter.toId, "");
        },
      });
    }
  }
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
      ))}
      <Button variant="link" size="sm" className="h-7 px-1" onClick={state.clearFilters}>
        Clear all
      </Button>
    </div>
  );
}

export function ListToolbar<T>({
  columns,
  filters,
  state,
  searchPlaceholder = "Search...",
  resultCount,
  actions,
  searchable = true,
}: {
  columns: ListColumn<T>[];
  filters: ListFilter[];
  state: ListState;
  searchPlaceholder?: string;
  resultCount?: number;
  actions?: ReactNode;
  searchable?: boolean;
}) {
  const panelFilters = filters.filter((filter) => !(isSelect(filter) && filter.quick));

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {searchable ? (
      <div className="relative w-full lg:max-w-xs">
        <MagnifyingGlassIcon size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={state.search}
          onChange={(event) => state.setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search"
          className="h-8 rounded-lg pl-9 text-[13px] md:text-[13px]"
        />
      </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 lg:ms-auto">
        {filters.filter(isSelect).filter((filter) => filter.quick).map((filter) => (
          <QuickFilter key={filter.id} filter={filter} state={state} />
        ))}
        {/* The Filters panel holds only filters that are not already toolbar dropdowns. */}
        {panelFilters.length ? <FiltersPanel filters={panelFilters} state={state} resultCount={resultCount} /> : null}
        <ColumnsMenu columns={columns} state={state} />
        {actions}
      </div>
    </div>
  );
}
