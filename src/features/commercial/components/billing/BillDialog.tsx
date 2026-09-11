import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
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
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { useCreateBill, useUpdateBill, useDeleteBill } from "../../hooks/useBills";
import { billFormSchema } from "../../schemas/bill.schema";
import type { Bill, BillFormValues, BillStatus } from "../../types/bill.types";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

const billStatuses: BillStatus[] = ["Draft", "Submitted", "Completed", "Overdue"];

function emptyValues(defaultProjectId = ""): BillFormValues {
  return {
    projectId: defaultProjectId,
    billNumber: "",
    billDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: "",
    totalAmount: "",
    tax: "",
    status: "Draft",
    remarks: "",
  };
}

function valuesFromBill(bill: Bill): BillFormValues {
  return {
    projectId: bill.projectId,
    billNumber: bill.billNumber,
    billDate: bill.billDate,
    dueDate: bill.dueDate,
    totalAmount: String(bill.totalAmount),
    tax: String(bill.tax),
    status: bill.status,
    remarks: bill.remarks,
  };
}

export function BillDialog({
  bill,
  triggerLabel,
  icon,
  iconOnly = false,
  defaultProjectId,
  defaultProjectName,
}: {
  bill?: Bill;
  triggerLabel: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  defaultProjectId?: string;
  defaultProjectName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { data: projects = [] } = useProjectsQuery();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill(bill?.id ?? "");
  const deleteBill = useDeleteBill();
  const isSaving = createBill.isPending || updateBill.isPending;
  const projectLocked = Boolean(defaultProjectId) && !bill;

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: bill ? valuesFromBill(bill) : emptyValues(defaultProjectId),
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const validationMessage = Object.values(formState.errors)[0]?.message as string | undefined;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(bill ? valuesFromBill(bill) : emptyValues(defaultProjectId));
      setSubmitError("");
    }
    setOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      if (bill) {
        await updateBill.mutateAsync(values);
      } else {
        await createBill.mutateAsync(values);
      }
      setOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save bill");
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
            {icon ?? <PlusIcon size={15} />}
          </DialogTrigger>
        </ActionTooltip>
      ) : (
        <DialogTrigger render={<Button type="button" size="compact" />}>
          {icon ?? <PlusIcon size={13} />}
          {triggerLabel}
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>{bill ? "Edit Bill" : "Create Bill"}</DialogTitle>
          <DialogDescription>Create bill records and payment entries.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <FormField label="Project">
            {projectLocked ? (
              <div className="flex h-9 items-center rounded-lg border border-border bg-muted/30 px-3 text-sm font-medium text-foreground">
                {defaultProjectName || "-"}
              </div>
            ) : (
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value || undefined}
                    onValueChange={(projectId) => field.onChange(projectId ?? "")}
                    placeholder="Select project"
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                    className="w-full"
                  />
                )}
              />
            )}
          </FormField>

          <FormField label="Bill Number">
            <Input {...register("billNumber")} />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Bill Date">
              <Controller
                control={control}
                name="billDate"
                render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
              />
            </FormField>
            <FormField label="Total Amount">
              <Input type="number" {...register("totalAmount")} />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Tax">
              <Input type="number" {...register("tax")} />
            </FormField>
            <FormField label="Due Date">
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
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
                    if (status) field.onChange(status as BillStatus);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {billStatuses.map((status) => (
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

        <DialogFooter className="mx-0 mb-0 flex w-full flex-row items-center justify-between sm:justify-between">
          {bill?.id ? (
            <DeleteConfirmDialog
              itemName="this bill"
              onConfirm={async () => {
                await deleteBill.mutateAsync(bill.id);
                setOpen(false);
              }}
            />
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="button" onClick={() => void onSubmit()} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Bill"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
