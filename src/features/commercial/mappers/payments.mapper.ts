import type { Payment, PaymentCategory } from "../types/payment.types";

export function categoryCounts(payments: Payment[]): Partial<Record<PaymentCategory, number>> {
  const counts: Partial<Record<PaymentCategory, number>> = {};
  for (const row of payments) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  return counts;
}
