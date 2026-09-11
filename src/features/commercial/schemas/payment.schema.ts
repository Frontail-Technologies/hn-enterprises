import { z } from "zod";
import type { PaymentCategory, PaymentEvidence, PaymentMode, PaymentStatus } from "../types/payment.types";

export const paymentFormSchema = z
  .object({
    category: z.custom<PaymentCategory>(),
    plumberId: z.string(),
    paidTo: z.string(),
    address: z.string(),
    customerId: z.string(),
    projectId: z.string(),
    supervisorId: z.string(),
    amount: z.string(),
    paymentDate: z.string(),
    mode: z.custom<PaymentMode>(),
    status: z.custom<PaymentStatus>(),
    purpose: z.string(),
    remarks: z.string(),
    evidence: z.array(z.custom<PaymentEvidence>()),
  })
  .superRefine((values, ctx) => {
    if (!values.amount || Number(values.amount) <= 0) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Enter a valid amount" });
    }
  });
