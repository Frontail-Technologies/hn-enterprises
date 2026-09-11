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
  address: string;
  customerId: string;
  customerName: string;
  /** Server-joined - BR/TR keeps customer identity unambiguous without loading the full customer list. */
  customerTrBpNumber: string;
  projectId: string;
  amount: number;
  paymentDate: string;
  mode: PaymentMode;
  status: PaymentStatus;
  purpose: string;
  remarks: string;
  evidence: PaymentEvidence[];
  /** Whose expense it financially is - never the same as createdById unless self-created. */
  supervisorId: string;
  supervisorName: string;
  /** The actual authenticated actor who created the record (may be an admin, on behalf of supervisorId). */
  createdById: string;
  createdByName: string;
};

export type PaymentFormValues = {
  category: PaymentCategory;
  plumberId: string;
  paidTo: string;
  address: string;
  customerId: string;
  projectId: string;
  /** Admin-only "create on behalf of" selection - see PaymentDialog. */
  supervisorId: string;
  amount: string;
  paymentDate: string;
  mode: PaymentMode;
  status: PaymentStatus;
  purpose: string;
  remarks: string;
  evidence: PaymentEvidence[];
};
