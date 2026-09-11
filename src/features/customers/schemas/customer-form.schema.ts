import { z } from "zod";
import type {
  BillingCompletionStatus,
  CommissioningConversionDetails,
  CustomerCompletionAudit,
  CustomerConnectionDetails,
  CustomerDocument,
  CustomerFormValues,
  CustomerLatestComplaint,
  CustomerSectionCompletion,
  CustomerStatus,
  CustomerSurvey,
  FittingsAccessories,
  GiMeasurements,
  LmcPipelineWork,
  MdpeFittings,
  UploadedImage,
  ValvesRegulators,
} from "../types/customer.types";

/**
 * Mirrors `CustomerFormValues` exactly. Validation only encodes rules that
 * already existed in `CustomerForm`'s pre-migration `handleSave` guard clause
 * (`customerName` and `projectId` always required; `plumberId` required on
 * create only) - no new required fields or rules are introduced.
 */
export function buildCustomerFormSchema(mode: "create" | "edit") {
  return z
    .object({
      status: z.custom<CustomerStatus>(),
      projectId: z.string().min(1, "Project is required"),
      siteId: z.string(),
      projectName: z.string(),
      siteArea: z.string(),
      city: z.string(),
      customerConnection: z.custom<CustomerConnectionDetails>(),
      giMeasurements: z.custom<GiMeasurements>(),
      valvesRegulators: z.custom<ValvesRegulators>(),
      fittingsAccessories: z.custom<FittingsAccessories>(),
      lmcPipelineWork: z.custom<LmcPipelineWork>(),
      mdpeFittings: z.custom<MdpeFittings>(),
      commissioningConversion: z.custom<CommissioningConversionDetails>(),
      billingCompletion: z.custom<BillingCompletionStatus>(),
      survey: z.custom<CustomerSurvey>().optional(),
      media: z.custom<UploadedImage[]>(),
      documents: z.custom<CustomerDocument[]>(),
      customFields: z.custom<Record<string, string | boolean>>().optional(),
      sectionCompletion: z.custom<CustomerSectionCompletion>().optional(),
      completionAudit: z.custom<CustomerCompletionAudit>().optional(),
      latestComplaint: z.custom<CustomerLatestComplaint | null>().optional(),
    })
    .superRefine((values, ctx) => {
      if (!values.customerConnection.customerName.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["customerConnection", "customerName"],
          message: "Customer name is required",
        });
      }
      if (mode === "create" && !values.customerConnection.plumberId) {
        ctx.addIssue({
          code: "custom",
          path: ["customerConnection", "plumberId"],
          message: "Assigned plumber is required",
        });
      }
    });
}

export type { CustomerFormValues };
