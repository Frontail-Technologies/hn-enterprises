import { z } from "zod";
import type { PlumberFormValues, PlumberStatus, PlumberType } from "../types/plumber.types";

export function buildPlumberFormSchema() {
  return z.object({
    name: z.string().min(1, "Name is required"),
    type: z.custom<PlumberType>(),
    contactNumber: z.string(),
    status: z.custom<PlumberStatus>(),
    remarks: z.string(),
  });
}

export type { PlumberFormValues };
