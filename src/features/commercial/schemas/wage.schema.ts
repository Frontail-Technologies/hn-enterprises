import { z } from "zod";
import type { WageCategory, WageStatus } from "../types/wage.types";

export const wageFormSchema = z
  .object({
    plumberId: z.string(),
    month: z.string(),
    category: z.custom<WageCategory>(),
    wageRate: z.string(),
    daysWorked: z.string(),
    pf: z.string(),
    esic: z.string(),
    status: z.custom<WageStatus>(),
    remarks: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.plumberId) {
      ctx.addIssue({ code: "custom", path: ["plumberId"], message: "Plumber, wage rate and days worked are required" });
    }
    if (!values.wageRate) {
      ctx.addIssue({ code: "custom", path: ["wageRate"], message: "Plumber, wage rate and days worked are required" });
    }
    if (!values.daysWorked) {
      ctx.addIssue({ code: "custom", path: ["daysWorked"], message: "Plumber, wage rate and days worked are required" });
    }
  });
