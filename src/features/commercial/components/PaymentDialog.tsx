"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DatePicker } from "@/components/shared/DatePicker";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";
import { useRosterQuery } from "@/features/management/hooks/useAttendance";
import { useCustomerSelectorOptions } from "@/features/customers/hooks/useCustomerSelectorOptions";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { paymentTabs } from "../data/payments.data";
import { useCreatePayment, useUpdatePayment } from "../hooks/usePayments";
import { paymentFormSchema } from "../schemas/payment.schema";
import type { Payment, PaymentCategory, PaymentFormValues, PaymentStatus } from "../types/payment.types";
import { ImageProofField } from "./shared/ImageProofField";

const categories = paymentTabs as PaymentCategory[];
const statuses: PaymentStatus[] = ["Draft", "Submitted", "Approved", "Rejected"];

function emptyValues(defaultCategory: PaymentCategory, defaultProjectId = ""): PaymentFormValues {
  return {
    category: defaultCategory,
    plumberId: "",
    paidTo: "",
    address: "",
    customerId: "",
    projectId: defaultProjectId,
    supervisorId: "",
    amount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    mode: "Cash",
    status: "Draft",
    purpose: "",
    remarks: "",
    evidence: [],
  };
}

function valuesFromPayment(payment: Payment): PaymentFormValues {
  return {
    category: payment.category,
    plumberId: payment.plumberId,
    paidTo: payment.paidTo,
    address: payment.address,
    customerId: payment.customerId,
    projectId: payment.projectId,
    supervisorId: payment.supervisorId,
    amount: String(payment.amount),
    paymentDate: payment.paymentDate,
    mode: payment.mode,
    status: payment.status,
    purpose: payment.purpose,
    remarks: payment.remarks,
    evidence: payment.evidence,
  };
}

export function PaymentDialog({
  payment,
  defaultCategory,
  defaultProjectId,
  defaultProjectName,
  iconOnly = false,
}: {
  payment?: Payment;
  defaultCategory?: PaymentCategory;
  defaultProjectId?: string;
  defaultProjectName?: string;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { data: paymentModes = [] } = useMasterValuesQuery("Payment Types");
  const { data: plumbers = [] } = usePlumbersQuery();
  const { options: customerOptions, isLoading: customersLoading, onSearchChange: onCustomerSearchChange } =
    useCustomerSelectorOptions(payment?.customerId);
  const { data: supervisors = [] } = useRosterQuery("supervisor");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment(payment?.id ?? "");
  const isSaving = createPayment.isPending || updatePayment.isPending;
  const label = payment ? "Edit" : "Add Payment / Expense";

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: payment ? valuesFromPayment(payment) : emptyValues(defaultCategory ?? categories[0], defaultProjectId),
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const isPlumberCategory = useWatch({ control, name: "category" }) === "Plumber Payments";
  const validationMessage = Object.values(formState.errors)[0]?.message as string | undefined;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(payment ? valuesFromPayment(payment) : emptyValues(defaultCategory ?? categories[0], defaultProjectId));
      setSubmitError("");
    }
    setOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      if (payment) {
        await updatePayment.mutateAsync(values);
      } else {
        await createPayment.mutateAsync(values);
      }
      setOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save payment");
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {iconOnly ? (
        <ActionTooltip label={label}>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={label}
              />
            }
          >
            <NotePencilIcon size={15} />
          </DialogTrigger>
        </ActionTooltip>
      ) : (
        <DialogTrigger render={<Button type="button" size="compact" />}>
          <PlusIcon size={13} />
          {label}
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>{payment ? "Edit Payment / Expense" : "Add Payment / Expense"}</DialogTitle>
          <DialogDescription>Record payment, receipt and approval information.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {defaultProjectId && defaultProjectName ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Project</span>
              <span className="font-semibold text-foreground">{defaultProjectName}</span>
            </div>
          ) : null}
          <FormField label="Category">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(category) => {
                    if (category) field.onChange(category as PaymentCategory);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Customer">
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || undefined}
                  onValueChange={(customerId) => field.onChange(customerId ?? "")}
                  placeholder="Select customer"
                  searchPlaceholder="Search by name, BR/TR or mobile..."
                  options={customerOptions}
                  isLoading={customersLoading}
                  onSearchChange={onCustomerSearchChange}
                  className="w-full"
                />
              )}
            />
          </FormField>

          {isAdmin ? (
            <FormField label="Supervisor (this expense belongs to)">
              <Controller
                control={control}
                name="supervisorId"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value || undefined}
                    onValueChange={(supervisorId) => field.onChange(supervisorId ?? "")}
                    placeholder="Select supervisor"
                    options={supervisors.map((supervisor) => ({ value: supervisor.id, label: supervisor.name }))}
                    className="w-full"
                  />
                )}
              />
            </FormField>
          ) : null}

          <FormField label="Purpose / What Bought">
            <Input {...register("purpose")} placeholder="E.g. Pipe clamp purchase" />
          </FormField>

          {isPlumberCategory ? (
            <FormField label="Plumber / Team">
              <Controller
                control={control}
                name="plumberId"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value || undefined}
                    onValueChange={(plumberId) => field.onChange(plumberId ?? "")}
                    placeholder="Select plumber / team"
                    options={plumbers.map((plumber) => ({ value: plumber.id, label: plumber.name }))}
                    className="w-full"
                  />
                )}
              />
            </FormField>
          ) : (
            <FormField label="Payee">
              <Input {...register("paidTo")} placeholder="Person or vendor name" />
            </FormField>
          )}

          <FormField label="Address">
            <Input {...register("address")} placeholder="Site / work address (optional)" />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Amount">
              <Input type="number" {...register("amount")} />
            </FormField>
            <FormField label="Date">
              <Controller
                control={control}
                name="paymentDate"
                render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
              />
            </FormField>
          </div>

          <FormField label="Payment Mode">
            <Controller
              control={control}
              name="mode"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onValueChange={(mode) => field.onChange(mode)}
                  options={paymentModes.map((mode) => ({ value: mode.value, label: mode.value }))}
                  placeholder="Select payment mode"
                />
              )}
            />
          </FormField>

          <Controller
            control={control}
            name="evidence"
            render={({ field }) => (
              <ImageProofField
                label="Receipt / Photo"
                description="Upload payment proof, expense bill or receipt image."
                images={field.value}
                onChange={field.onChange}
                module="expenses"
              />
            )}
          />

          <FormField label="Status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(status) => { if (status) field.onChange(status as PaymentStatus); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
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
          <Button type="button" onClick={() => void onSubmit()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
