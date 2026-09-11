import { z } from "zod";
import type { ComplaintPriority } from "../types/complaint.types";

export function buildComplaintFormSchema() {
  return z
    .object({
      customerId: z.string(),
      title: z.string(),
      description: z.string(),
      priority: z.custom<ComplaintPriority>(),
    })
    .superRefine((values, ctx) => {
      if (!values.customerId) {
        ctx.addIssue({ code: "custom", path: ["customerId"], message: "Customer is required" });
      }
      if (!values.title.trim()) {
        ctx.addIssue({ code: "custom", path: ["title"], message: "Title is required" });
      }
      if (!values.description.trim()) {
        ctx.addIssue({ code: "custom", path: ["description"], message: "Description is required" });
      }
    });
}

export type ComplaintFormSchemaValues = z.infer<ReturnType<typeof buildComplaintFormSchema>>;
