export type MaterialTransactionType =
  | "purchase"
  | "pbg_issue"
  | "pbg_consumption"
  | "issue"
  | "return"
  | "adjustment"
  | "consumption";

export type MaterialSource = "purchase" | "pbg";
export type AdjustmentDirection = "in" | "out";
export type MaterialTransactionLinkType = "reversal" | "correction";

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
  source: MaterialSource | "";
  projectId: string;
  referenceNo: string;
  vendorName: string;
  rate: number | null;
  billAmount: number | null;
  plumberId: string;
  supervisorId: string;
  supervisorName: string;
  siteId: string;
  address: string;
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
  relatedTransactionId: string;
  linkType: MaterialTransactionLinkType | "";
  correctionReason: string;
  isReversed: boolean;
  isCorrected: boolean;
  /** Server-joined display labels - no need to load the full plumbers/projects/customers/materials lists to resolve these. */
  plumberName: string;
  projectName: string;
  customerName: string;
  materialName: string;
};

export type MaterialOverview = {
  material: Material;
  summary: {
    availableQty: number;
    receivedQty: number;
    issuedQty: number;
    consumedQty: number;
    returnedQty: number;
    plumberBalanceCount: number;
  };
};

export type InventoryDetailTab = "purchase" | "storeIssue" | "consumption" | "plumberLedger" | "transactions";

/** InventoryPage's tab-count badges - one COUNT/GROUP BY per domain type, never the underlying rows. */
export type InventoryOverview = {
  stockCount: number;
  purchaseCount: number;
  pbgIssueCount: number;
  pbgConsumptionCount: number;
  storeIssueCount: number;
  totalIssueCount: number;
  plumberBalanceCount: number;
  plumberConsumptionCount: number;
};

/** InventoryPage's "Total Issue" tab - one row per material, computed server-side (SUM/COUNT/MAX, GROUP BY materialId). */
export type TotalIssueSummaryRow = {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  totalIssued: number;
  transactionCount: number;
  lastIssueDate: string;
};

/** ProjectDetail → Materials tab summary - one whole-project row per material. */
export type ProjectMaterialUsageRow = {
  id: string;
  materialId: string;
  name: string;
  unit: string;
  issued: number;
  consumed: number;
  returned: number;
};

export type StockBalance = {
  materialId: string;
  balance: number;
};

export type CorrectMaterialTransactionInput = {
  correctionReason: string;
  quantity?: string;
  transactionDate?: string;
  source?: MaterialSource | "";
  direction?: AdjustmentDirection | "";
  projectId?: string;
  referenceNo?: string;
  vendorName?: string;
  rate?: string;
  billAmount?: string;
  plumberId?: string;
  supervisorId?: string;
  siteId?: string;
  address?: string;
  storeLabel?: string;
  customerId?: string;
  reportNo?: string;
  condition?: string;
  adjustmentType?: string;
  vehicleNo?: string;
  vehicleQty?: string;
  remarks?: string;
};

export type MaterialTransactionFormValues = {
  materialId: string;
  quantity: string;
  transactionDate: string;
  source: MaterialSource | "";
  direction: AdjustmentDirection | "";
  projectId: string;
  referenceNo: string;
  vendorName: string;
  rate: string;
  billAmount: string;
  plumberId: string;
  supervisorId: string;
  siteId: string;
  address: string;
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
  source: MaterialSource | "";
  projectId: string;
  issued: number;
  consumed: number;
  returned: number;
  adjusted: number;
  balance: number;
  /** Server-joined - no need to load the full plumbers/projects/materials lists to resolve these. */
  plumberName: string;
  projectName: string;
  materialName: string;
};
