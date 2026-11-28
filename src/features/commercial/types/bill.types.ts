import type { ImagePreviewItem } from "@/components/shared/ImageUploadPreview";

export type BillStatus = "Draft" | "Submitted" | "Completed" | "Overdue";
export type BillPaymentStatus = "Pending" | "Cleared" | "Bounced";
export type PaymentMode = string;

export type Bill = {
  id: string;
  projectId: string;
  /** Server-joined from projects - no need to load the full projects list to resolve this. */
  projectName: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  tax: number;
  /** Deductions by the client. */
  tdsIncome: number;
  tdsGst: number;
  prs: number;
  bankGuarantee: number;
  bgReleased: number;
  holdAmount: number;
  holdReleased: number;
  /** Bank guarantee / hold amounts the client still keeps. */
  bgHeld: number;
  holdHeld: number;
  /** total + tax - TDS - PRS - BG held - hold held. */
  netPayable: number;
  paidAmount: number;
  pendingAmount: number;
  status: BillStatus;
  remarks: string;
  /** Bill photos. */
  attachments: ImagePreviewItem[];
};

export type BillFormValues = {
  projectId: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  totalAmount: string;
  tax: string;
  tdsIncome: string;
  tdsGst: string;
  prs: string;
  bankGuarantee: string;
  holdAmount: string;
  status: BillStatus;
  remarks: string;
  attachments: ImagePreviewItem[];
};

export type BillPayment = {
  id: string;
  billId: string;
  amount: number;
  paymentDate: string;
  mode: PaymentMode;
  status: BillPaymentStatus;
  remarks: string;
};

export type BillPaymentFormValues = {
  amount: string;
  paymentDate: string;
  mode: PaymentMode;
  status: BillPaymentStatus;
  remarks: string;
};
