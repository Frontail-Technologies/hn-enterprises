import { z } from "zod";
import type { BillStatus } from "../types/bill.types";

export const billFormSchema = z
  .object({
    projectId: z.string(),
    billNumber: z.string(),
    billDate: z.string(),
    dueDate: z.string(),
    totalAmount: z.string(),
    tax: z.string(),
    status: z.custom<BillStatus>(),
    remarks: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.projectId) {
      ctx.addIssue({ code: "custom", path: ["projectId"], message: "Project, bill number and total amount are required" });
    }
    if (!values.billNumber.trim()) {
      ctx.addIssue({ code: "custom", path: ["billNumber"], message: "Project, bill number and total amount are required" });
    }
    if (!values.totalAmount) {
      ctx.addIssue({ code: "custom", path: ["totalAmount"], message: "Project, bill number and total amount are required" });
    }
  });
