import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { ReceiptIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/shared/DatePicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBillPayment } from "../../hooks/useBills";
import type { BillPaymentFormValues, BillPaymentStatus, PaymentMode } from "../../types/bill.types";
import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";

const paymentStatuses: BillPaymentStatus[] = ["Cleared", "Pending", "Bounced"];

function emptyValues(): BillPaymentFormValues {
  return {
    amount: "",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    mode: "Cash",
    status: "Cleared",
    remarks: "",
  };
}

export function PaymentDrawer({
  billId,
  triggerLabel = "Record Payment",
  icon,
  iconOnly = false,
}: {
  billId: string;
  triggerLabel?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<BillPaymentFormValues>(emptyValues());
  const [saveError, setSaveError] = useState("");
  const createPayment = useCreateBillPayment(billId);
  const { data: paymentModes = [] } = useMasterValuesQuery("Payment Types");

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(emptyValues());
      setSaveError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!values.amount || Number(values.amount) <= 0) {
      setSaveError("Enter a valid payment amount");
      return;
    }
    setSaveError("");
    try {
      await createPayment.mutateAsync(values);
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to record payment");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {iconOnly ? (
        <ActionTooltip label={triggerLabel}>
          <SheetTrigger
            render={
              <button
                type="button"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label={triggerLabel}
              />
            }
          >
            {icon ?? <ReceiptIcon size={15} />}
          </SheetTrigger>
        </ActionTooltip>
      ) : (
        <SheetTrigger render={<Button type="button" variant="outline" size="sm" />}>
          {icon ?? <ReceiptIcon size={15} />}
          {triggerLabel}
        </SheetTrigger>
      )}
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Record Payment</SheetTitle>
          <SheetDescription>Log a payment received against this bill.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Amount</span>
            <Input
              type="number"
              value={values.amount}
              onChange={(event) => setValues((current) => ({ ...current, amount: event.target.value }))}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Payment Date</span>
              <DatePicker
                value={values.paymentDate}
                onChange={(paymentDate) => setValues((current) => ({ ...current, paymentDate }))}
              />
            </label>
            <label className="space-y-1.5 min-w-0">
              <span className="text-xs font-medium text-muted-foreground">Mode</span>
              <SearchableSelect
                value={values.mode}
                onValueChange={(mode) => setValues((current) => ({ ...current, mode: mode as PaymentMode }))}
                options={paymentModes.map((mode) => ({ value: mode.value, label: mode.value }))}
                placeholder="Select payment mode"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <Select
              value={values.status}
              onValueChange={(status) => {
                if (status) setValues((current) => ({ ...current, status: status as BillPaymentStatus }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Remarks</span>
            <Textarea
              value={values.remarks}
              onChange={(event) => setValues((current) => ({ ...current, remarks: event.target.value }))}
              className="min-h-20"
            />
          </label>

          {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={createPayment.isPending}>
              {createPayment.isPending ? "Saving..." : "Record Payment"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
