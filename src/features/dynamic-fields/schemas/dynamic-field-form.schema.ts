import { z } from "zod";
import type { CustomFieldAccess, CustomFieldValueType } from "../types";
import type { MasterValueStatus } from "@/features/management/types/masters.types";

export function buildDynamicFieldFormSchema() {
  return z
    .object({
      label: z.string(),
      group: z.string(),
      valueType: z.custom<CustomFieldValueType>(),
      dropdownOptions: z.array(z.object({ value: z.string() })),
      required: z.boolean(),
      supervisorAccess: z.custom<CustomFieldAccess>(),
      status: z.custom<MasterValueStatus>(),
    })
    .superRefine((values, ctx) => {
      if (!values.label.trim()) {
        ctx.addIssue({ code: "custom", path: ["label"], message: "Label is required" });
      }
      if (!values.group.trim()) {
        ctx.addIssue({ code: "custom", path: ["group"], message: "Group is required" });
      }
      if (values.valueType === "Dropdown" && values.dropdownOptions.length === 0) {
        ctx.addIssue({ code: "custom", path: ["dropdownOptions"], message: "Add at least one dropdown option" });
      }
    });
}

export type DynamicFieldFormValues = z.infer<ReturnType<typeof buildDynamicFieldFormSchema>>;
