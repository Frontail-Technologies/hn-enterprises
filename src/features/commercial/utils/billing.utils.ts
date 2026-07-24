import { bills } from "../data/bills.data";

export function getBill(id: string) {
  return bills.find((item) => item.id === id) ?? bills[0];
}

export function getBillByNumber(billNumber: string) {
  return bills.find((item) => item.billNumber === billNumber) ?? bills[0];
}

export function getBillHref(bill: (typeof bills)[number]) {
  return "customerId" in bill && bill.customerId
    ? `/customers/${bill.customerId}?tab=billing`
    : `/billing/${bill.id}`;
}
