import type { BillingView } from "../types/commercial.types";

export const billingTabs: Array<{ id: BillingView; label: string }> = [
  { id: "wages", label: "Wage Register" },
  { id: "bills", label: "Bill Register" },
];

export const paymentHistory = [
  {
    id: "pay-h-1",
    billId: "bill-001",
    date: "2025-02-12",
    amount: 250000,
    mode: "NEFT",
    receivedBy: "Accounts",
    remarks: "First part payment.",
  },
  {
    id: "pay-h-2",
    billId: "bill-001",
    date: "2025-02-16",
    amount: 200000,
    mode: "Cheque",
    receivedBy: "Accounts",
    remarks: "Cheque cleared.",
  },
  {
    id: "pay-h-3",
    billId: "bill-002",
    date: "2025-02-13",
    amount: 18500,
    mode: "Cash",
    receivedBy: "Demo Admin",
    remarks: "Customer paid at office.",
  },
];
