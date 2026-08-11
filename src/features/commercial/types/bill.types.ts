export type BillStage = "GI" | "GC" | "Commissioning" | "Conversion" | "Other";
export type BillStatus = "Draft" | "Submitted" | "Completed" | "Overdue";
export type BillPaymentStatus = "Pending" | "Cleared" | "Bounced";
export type PaymentMode = string;

export type Bill = {
  id: string;
  projectId: string;
  // Optional now that billing is project-level - a bill may still note which
  // customer's work it relates to, but it isn't required.
  customerId: string;
  billNumber: string;
  stage: BillStage;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  tax: number;
  paidAmount: number;
  pendingAmount: number;
  status: BillStatus;
  remarks: string;
};

export type BillFormValues = {
  projectId: string;
  customerId: string;
  billNumber: string;
  stage: BillStage;
  billDate: string;
  dueDate: string;
  totalAmount: string;
  tax: string;
  status: BillStatus;
  remarks: string;
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
