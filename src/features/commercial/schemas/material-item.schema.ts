import { z } from "zod";

export const materialItemFormSchema = z.object({
  name: z.string(),
  category: z.string(),
  unit: z.string(),
  reorderLevel: z.string(),
}).superRefine((values, ctx) => {
  if (!values.name.trim()) {
    ctx.addIssue({ code: "custom", path: ["name"], message: "Material name is required." });
  }
  if (!values.unit.trim()) {
    ctx.addIssue({ code: "custom", path: ["unit"], message: "Unit is required." });
  }
});
