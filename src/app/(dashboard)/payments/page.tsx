import type { Metadata } from "next";
import { PaymentsExpensesPage } from "@/features/commercial/components/PaymentsExpensesPage";

export const metadata: Metadata = { title: "Payments & Expenses" };

export default function Page() {
  return <PaymentsExpensesPage />;
}
