import { z } from "zod";
import type { ProjectStatus } from "../types/project.types";

export const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  code: z.string(),
  client: z.string(),
  consultant: z.string(),
  contractor: z.string(),
  projectType: z.string(),
  city: z.string(),
  area: z.string(),
  description: z.string(),
  startDate: z.string(),
  plannedEndDate: z.string(),
  status: z.custom<ProjectStatus>(),
  contractValue: z.string(),
  assignedManager: z.string(),
});

export type ProjectFormSchemaValues = z.infer<typeof projectFormSchema>;
