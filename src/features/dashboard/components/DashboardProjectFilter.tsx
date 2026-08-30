import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { cn } from "@/lib/utils";
import type { Project } from "@/features/projects/types/project.types";

interface DashboardProjectFilterProps {
  projects: Project[];
  value: string;
  onChange: (value: string) => void;
}

export function DashboardProjectFilter({ projects, value, onChange }: DashboardProjectFilterProps) {
  return (
    <SearchableSelect
      value={value}
      onValueChange={onChange}
      placeholder="All Projects"
      className={cn(
        "h-10 w-55 bg-card text-xs",
        value !== "all" && "border-primary/60 text-primary ring-1 ring-primary/20",
      )}
      options={[{ value: "all", label: "All Projects" }, ...projects.map((project) => ({ value: project.id, label: project.name }))]}
    />
  );
}
