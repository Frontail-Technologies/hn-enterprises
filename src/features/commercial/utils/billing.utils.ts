import type { Bill } from "../types/bill.types";

export function getBillHref(bill: Bill) {
  return `/billing/${bill.id}`;
}
