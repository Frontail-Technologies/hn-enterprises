export type MaterialTransactionType =
  | "purchase"
  | "pbg_issue"
  | "pbg_consumption"
  | "issue"
  | "return"
  | "adjustment"
  | "consumption";

export type MaterialStatus = "Active" | "Low Stock" | "Out of Stock";

export type Material = {
  id: string;
  name: string;
  category: string;
  unit: string;
  reorderLevel: number;
  currentBalance: number;
  status: MaterialStatus;
};

export type MaterialFormValues = {
  name: string;
  category: string;
  unit: string;
  reorderLevel: string;
};

export type MaterialEvidence = {
  id: string;
  label: string;
  fileName: string;
  fileUrl?: string;
};

export type MaterialTransaction = {
  id: string;
  materialId: string;
  type: MaterialTransactionType;
  quantity: number;
  quantityDelta: number;
  referenceNo: string;
  vendorName: string;
  rate: number | null;
  billAmount: number | null;
  plumberId: string;
  supervisorId: string;
  supervisorName: string;
  siteId: string;
  storeLabel: string;
  customerId: string;
  paymentId: string;
  reportNo: string;
  condition: string;
  adjustmentType: string;
  vehicleNo: string;
  vehicleQty: number | null;
  transactionDate: string;
  evidence: MaterialEvidence[];
  remarks: string;
};

export type MaterialTransactionFormValues = {
  materialId: string;
  quantity: string;
  transactionDate: string;
  referenceNo: string;
  vendorName: string;
  rate: string;
  billAmount: string;
  plumberId: string;
  supervisorId: string;
  siteId: string;
  storeLabel: string;
  customerId: string;
  paymentId: string;
  reportNo: string;
  condition: string;
  adjustmentType: string;
  vehicleNo: string;
  vehicleQty: string;
  evidence: MaterialEvidence[];
  remarks: string;
};

export type PlumberBalance = {
  plumberId: string;
  materialId: string;
  issued: number;
  consumed: number;
  returned: number;
  balance: number;
};
