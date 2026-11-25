import { z } from "zod";
import type { PlumberCategory, PlumberFormValues, PlumberStatus, PlumberType } from "../types/plumber.types";

export function buildPlumberFormSchema() {
  return z.object({
    name: z.string().min(1, "Name is required"),
    category: z.custom<PlumberCategory>(),
    type: z.custom<PlumberType>(),
    contactNumber: z.string(),
    avatarUrl: z.string(),
    status: z.custom<PlumberStatus>(),
    remarks: z.string(),
  });
}

export type { PlumberFormValues };
