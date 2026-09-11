import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type SearchableSelectOption = {
  value: string;
  label: string;
  /** Secondary identifying text (e.g. a BR/TR number) shown under the label and always searchable, even when not part of `label` itself. */
  secondary?: string;
  /** Extra terms cmdk should match against besides `label` (e.g. the BR/TR number when it isn't already folded into `label`). */
  keywords?: string[];
};

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  /**
   * Opts into remote/async search mode: `options` is treated as already
   * server-filtered (cmdk's own local filtering is disabled) and this is
   * called with the debounced (~300ms) search text on every change.
   * Omit for the default fully-local filtering behavior.
   */
  onSearchChange?: (search: string) => void;
  /** Shows a small spinner next to the search input while a remote search is in flight. */
  isLoading?: boolean;
}

function triggerLabel(option: SearchableSelectOption) {
  return option.secondary ? `${option.label} — ${option.secondary}` : option.label;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  onSearchChange,
  isLoading = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const isAsync = Boolean(onSearchChange);
  const debouncedSearchText = useDebouncedValue(searchText, 300);
  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    if (isAsync) onSearchChange?.(debouncedSearchText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAsync, debouncedSearchText]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setSearchText("");
    setOpen(nextOpen);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between font-normal", className)}
          />
        }
      >
        <span
          className="truncate"
          title={selectedOption ? triggerLabel(selectedOption) : undefined}
        >
          {selectedOption ? triggerLabel(selectedOption) : <span className="text-muted-foreground">{placeholder}</span>}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) min-w-[200px] max-w-[400px] p-0" align="start">
        <Command shouldFilter={!isAsync}>
          <div className="relative">
            <CommandInput
              placeholder={searchPlaceholder}
              value={isAsync ? searchText : undefined}
              onValueChange={isAsync ? setSearchText : undefined}
            />
            {isAsync && isLoading ? (
              <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  keywords={option.keywords ?? (option.secondary ? [option.secondary] : undefined)}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4 shrink-0", value === option.value ? "opacity-100" : "opacity-0")}
                  />
                  {option.secondary ? (
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate" title={option.label}>
                        {option.label}
                      </span>
                      <span className="truncate text-xs text-muted-foreground" title={option.secondary}>
                        {option.secondary}
                      </span>
                    </span>
                  ) : (
                    <span className="truncate" title={option.label}>
                      {option.label}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
