import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Project } from "@/features/projects/types/project.types";

interface DashboardProjectFilterProps {
  projects: Project[];
  value: string;
  onChange: (value: string) => void;
}

export function DashboardProjectFilter({ projects, value, onChange }: DashboardProjectFilterProps) {
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger
        className={cn(
          "h-9 w-45 bg-card text-xs",
          value !== "all" && "border-primary/60 text-primary ring-1 ring-primary/20",
        )}
      >
        <SelectValue placeholder="All Projects" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Projects</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
