export type PaymentCategory =
  | "Worker Payments"
  | "Supervisor Payments"
  | "Plumber Payments"
  | "Office / Guest House Rent"
  | "Material Expenses"
  | "Other Expenses";

export type PaymentStatus = "Draft" | "Submitted" | "Approved" | "Rejected";
export type PaymentMode = string;

export type PaymentEvidence = {
  id: string;
  label: string;
  fileName: string;
  fileUrl?: string;
};

export type Payment = {
  id: string;
  category: PaymentCategory;
  plumberId: string;
  paidTo: string;
  siteId: string;
  address: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  mode: PaymentMode;
  status: PaymentStatus;
  purpose: string;
  remarks: string;
  evidence: PaymentEvidence[];
};

export type PaymentFormValues = {
  category: PaymentCategory;
  plumberId: string;
  paidTo: string;
  siteId: string;
  address: string;
  customerId: string;
  amount: string;
  paymentDate: string;
  mode: PaymentMode;
  status: PaymentStatus;
  purpose: string;
  remarks: string;
  evidence: PaymentEvidence[];
};
