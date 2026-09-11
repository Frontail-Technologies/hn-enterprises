"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DashboardProjectFilterProps {
  projects: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function DashboardProjectFilter({ projects, value, onChange }: DashboardProjectFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedName = projects.find((project) => project.id === value)?.name;
  const isFiltered = value !== "all";

  function select(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-8 w-full justify-between px-3 text-xs font-normal sm:w-44",
              isFiltered && "border-primary/50 text-primary",
            )}
          />
        }
      >
        <span className="truncate">{selectedName ?? "All Projects"}</span>
        <CaretDownIcon size={12} className="size-3 shrink-0 opacity-60" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList className="max-h-80">
            <CommandEmpty>No projects found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="All Projects" data-checked={value === "all"} onSelect={() => select("all")}>
                All Projects
              </CommandItem>
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  data-checked={value === project.id}
                  onSelect={() => select(project.id)}
                >
                  <span className="truncate" title={project.name}>
                    {project.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
