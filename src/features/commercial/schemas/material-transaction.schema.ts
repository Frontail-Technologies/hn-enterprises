import { z } from "zod";
import type { AdjustmentDirection, MaterialEvidence, MaterialSource, MaterialTransactionType } from "../types/material.types";

const SOURCE_REQUIRED_TYPES: MaterialTransactionType[] = ["issue", "return", "adjustment"];

export function buildMaterialTransactionSchema(type: MaterialTransactionType) {
  return z
    .object({
      materialId: z.string(),
      quantity: z.string(),
      transactionDate: z.string(),
      source: z.custom<MaterialSource | "">(),
      direction: z.custom<AdjustmentDirection | "">(),
      projectId: z.string(),
      referenceNo: z.string(),
      vendorName: z.string(),
      rate: z.string(),
      billAmount: z.string(),
      plumberId: z.string(),
      supervisorId: z.string(),
      siteId: z.string(),
      address: z.string(),
      storeLabel: z.string(),
      customerId: z.string(),
      paymentId: z.string(),
      reportNo: z.string(),
      condition: z.string(),
      adjustmentType: z.string(),
      vehicleNo: z.string(),
      vehicleQty: z.string(),
      evidence: z.array(z.custom<MaterialEvidence>()),
      remarks: z.string(),
    })
    .superRefine((values, ctx) => {
      if (!values.materialId || !values.quantity || Number(values.quantity) <= 0) {
        ctx.addIssue({ code: "custom", path: ["materialId"], message: "Material and a valid quantity are required" });
        ctx.addIssue({ code: "custom", path: ["quantity"], message: "Material and a valid quantity are required" });
      }
      if (SOURCE_REQUIRED_TYPES.includes(type) && !values.source) {
        ctx.addIssue({ code: "custom", path: ["source"], message: "Material source (Purchase or PBG) is required" });
      }
      if (type === "adjustment" && !values.direction) {
        ctx.addIssue({ code: "custom", path: ["direction"], message: "Adjustment direction (In or Out) is required" });
      }
    });
}
