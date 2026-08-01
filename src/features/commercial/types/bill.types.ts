export type BillStage = "GI" | "GC" | "Commissioning" | "Conversion" | "Other";
export type BillStatus = "Draft" | "Submitted" | "Completed" | "Overdue";
export type PaymentMode = "Cash" | "UPI" | "NEFT" | "Bank Transfer" | "Cheque" | "Other";

export type Bill = {
  id: string;
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
  customerId: string;
  billNumber: string;
  stage: BillStage;
  billDate: string;
  dueDate: string;
  totalAmount: string;
  tax: string;
  remarks: string;
};

export type BillPayment = {
  id: string;
  billId: string;
  amount: number;
  paymentDate: string;
  mode: PaymentMode;
  remarks: string;
};

export type BillPaymentFormValues = {
  amount: string;
  paymentDate: string;
  mode: PaymentMode;
  remarks: string;
};
