import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
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
import { FormField } from "@/components/shared/FormField";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerSelectorOptions } from "@/features/customers/hooks/useCustomerSelectorOptions";
import { useCreateComplaint, useUpdateComplaint } from "../../hooks/useComplaints";
import { buildComplaintFormSchema, type ComplaintFormSchemaValues } from "../../schemas/complaint-form.schema";
import type { Complaint, ComplaintPriority } from "../../types/complaint.types";

const complaintPriorities: ComplaintPriority[] = ["Low", "Medium", "High"];

function emptyValues(): ComplaintFormSchemaValues {
  return {
    customerId: "",
    title: "",
    description: "",
    priority: "Medium",
  };
}

function valuesFromComplaint(complaint: Complaint): ComplaintFormSchemaValues {
  return {
    customerId: complaint.customerId,
    title: complaint.title,
    description: complaint.description,
    priority: complaint.priority,
  };
}

export function ComplaintDialog({
  complaint,
  preselectedCustomerId,
  triggerLabel,
  icon,
  iconOnly = false,
}: {
  complaint?: Complaint;
  preselectedCustomerId?: string;
  triggerLabel: string;
  icon?: ReactNode;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const schema = buildComplaintFormSchema();
  const { control, register, handleSubmit, reset, formState } = useForm<ComplaintFormSchemaValues>({
    resolver: zodResolver(schema),
    defaultValues: complaint ? valuesFromComplaint(complaint) : { ...emptyValues(), customerId: preselectedCustomerId ?? "" },
  });
  const { options: customerOptions, isLoading: customersLoading, onSearchChange } = useCustomerSelectorOptions(
    complaint?.customerId ?? preselectedCustomerId,
  );
  const createComplaint = useCreateComplaint();
  const updateComplaint = useUpdateComplaint(complaint?.id ?? "");
  const isSaving = createComplaint.isPending || updateComplaint.isPending || formState.isSubmitting;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(complaint ? valuesFromComplaint(complaint) : { ...emptyValues(), customerId: preselectedCustomerId ?? "" });
    }
    setOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    if (complaint) {
      await updateComplaint.mutateAsync(values);
    } else {
      await createComplaint.mutateAsync(values);
    }
    setOpen(false);
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
          <DialogTitle>{complaint ? "Edit Complaint" : "Raise Complaint"}</DialogTitle>
          <DialogDescription>Raise and track complaints against a customer.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {!preselectedCustomerId && (
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
                      onSearchChange={onSearchChange}
                      className="w-full"
                    />
                  )}
                />
                {formState.errors.customerId ? (
                  <p className="text-xs text-destructive">{formState.errors.customerId.message}</p>
                ) : null}
              </FormField>
            )}

            <FormField label="Title">
              <Input {...register("title")} />
              {formState.errors.title ? <p className="text-xs text-destructive">{formState.errors.title.message}</p> : null}
            </FormField>

            <FormField label="Priority">
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(priority) => { if (priority) field.onChange(priority); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintPriorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Description">
              <Textarea {...register("description")} className="min-h-24" />
              {formState.errors.description ? (
                <p className="text-xs text-destructive">{formState.errors.description.message}</p>
              ) : null}
            </FormField>
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Complaint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
