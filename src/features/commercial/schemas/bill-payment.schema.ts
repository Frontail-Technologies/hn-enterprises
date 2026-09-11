import { z } from "zod";
import type { BillPaymentStatus, PaymentMode } from "../types/bill.types";

export const billPaymentFormSchema = z
  .object({
    amount: z.string(),
    paymentDate: z.string(),
    mode: z.custom<PaymentMode>(),
    status: z.custom<BillPaymentStatus>(),
    remarks: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.amount || Number(values.amount) <= 0) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Enter a valid payment amount" });
    }
  });
