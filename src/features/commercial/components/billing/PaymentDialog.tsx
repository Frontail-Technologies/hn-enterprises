import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ReceiptIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/shared/DatePicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/FormField";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBillPayment } from "../../hooks/useBills";
import { billPaymentFormSchema } from "../../schemas/bill-payment.schema";
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

export function PaymentDialog({
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
  const [submitError, setSubmitError] = useState("");
  const createPayment = useCreateBillPayment(billId);
  const { data: paymentModes = [] } = useMasterValuesQuery("Payment Types");

  const form = useForm<BillPaymentFormValues>({
    resolver: zodResolver(billPaymentFormSchema),
    defaultValues: emptyValues(),
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const validationMessage = Object.values(formState.errors)[0]?.message as string | undefined;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(emptyValues());
      setSubmitError("");
    }
    setOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      await createPayment.mutateAsync(values);
      setOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to record payment");
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {iconOnly ? (
        <ActionTooltip label={triggerLabel}>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={triggerLabel}
              />
            }
          >
            {icon ?? <ReceiptIcon size={15} />}
          </DialogTrigger>
        </ActionTooltip>
      ) : (
        <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
          {icon ?? <ReceiptIcon size={15} />}
          {triggerLabel}
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Log a payment received against this bill.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <FormField label="Amount">
            <Input type="number" {...register("amount")} />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Payment Date">
              <Controller
                control={control}
                name="paymentDate"
                render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
              />
            </FormField>
            <FormField label="Mode" className="min-w-0">
              <Controller
                control={control}
                name="mode"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onValueChange={(mode) => field.onChange(mode as PaymentMode)}
                    options={paymentModes.map((mode) => ({ value: mode.value, label: mode.value }))}
                    placeholder="Select payment mode"
                  />
                )}
              />
            </FormField>
          </div>

          <FormField label="Status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(status) => {
                    if (status) field.onChange(status as BillPaymentStatus);
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
              )}
            />
          </FormField>

          <FormField label="Remarks">
            <Textarea {...register("remarks")} className="min-h-20" />
          </FormField>

          {validationMessage || submitError ? (
            <p className="text-xs text-destructive">{validationMessage || submitError}</p>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" onClick={() => void onSubmit()} disabled={createPayment.isPending}>
            {createPayment.isPending ? "Saving..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
