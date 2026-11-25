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
import { flushImageUploads } from "@/components/shared/ImageUploadPreview";
import { ImageProofField } from "../shared/ImageProofField";

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
    attachments: [],
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
    attachments: bill.attachments,
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
  const [uploading, setUploading] = useState(false);
  const isSaving = createBill.isPending || updateBill.isPending || uploading;
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
      // Upload new photos first; the bill then stores their URLs.
      setUploading(true);
      let attachments = values.attachments;
      try {
        attachments = await flushImageUploads(values.attachments, "bills", bill?.id);
      } finally {
        setUploading(false);
      }
      form.setValue("attachments", attachments);
      const next = { ...values, attachments };
      if (bill) {
        await updateBill.mutateAsync(next);
      } else {
        await createBill.mutateAsync(next);
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
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-3">
          <DialogTitle>{bill ? "Edit Bill" : "Create Bill"}</DialogTitle>
          <DialogDescription>Create bill records and payment entries.</DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 content-start gap-4 overflow-y-auto px-6 py-4 sm:grid-cols-2">
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

          <FormField label="Status" className="sm:col-span-2">
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

          <FormField label="Remarks" className="sm:col-span-2">
            <Textarea {...register("remarks")} className="min-h-20" />
          </FormField>

          <Controller
            control={control}
            name="attachments"
            render={({ field }) => (
              <ImageProofField
                label="Bill photos"
                description="Photo or scan of the bill. Click a photo to view it."
                images={field.value}
                onChange={field.onChange}
                module="bills"
                recordId={bill?.id}
                className="sm:col-span-2"
              />
            )}
          />

          {validationMessage || submitError ? (
            <p className="text-xs text-destructive sm:col-span-2">{validationMessage || submitError}</p>
          ) : null}
        </div>

        <DialogFooter className="flex w-full shrink-0 flex-row items-center justify-between border-t border-border px-6 py-4 sm:justify-between">
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
              {uploading ? "Uploading photos..." : isSaving ? "Saving..." : "Save Bill"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
