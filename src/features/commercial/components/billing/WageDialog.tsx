import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { FormField } from "@/components/shared/FormField";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
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
import { useUpsertWage } from "../../hooks/useWages";
import { wageFormSchema } from "../../schemas/wage.schema";
import type { WageCategory, WageFormValues, WageRecord, WageStatus } from "../../types/wage.types";

const categories: WageCategory[] = ["High Skilled", "Skilled", "Unskilled"];
const statuses: WageStatus[] = ["Pending", "Approved", "Paid"];

function emptyValues(month: string): WageFormValues {
  return {
    plumberId: "",
    month,
    category: "Unskilled",
    wageRate: "",
    daysWorked: "",
    pf: "0",
    esic: "0",
    status: "Pending",
    remarks: "",
  };
}

function valuesFromWage(wage: WageRecord): WageFormValues {
  return {
    plumberId: wage.plumberId,
    month: wage.month,
    category: wage.category,
    wageRate: String(wage.wageRate),
    daysWorked: String(wage.daysWorked),
    pf: String(wage.pf),
    esic: String(wage.esic),
    status: wage.status,
    remarks: wage.remarks,
  };
}

export function WageDialog({
  month,
  wage,
  triggerLabel,
  icon,
  iconOnly = false,
}: {
  month: string;
  wage?: WageRecord;
  triggerLabel?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { data: plumbers = [] } = usePlumbersQuery();
  const upsertWage = useUpsertWage();
  const label = triggerLabel ?? (wage ? "Edit Wage Entry" : "Add Wage Entry");

  const form = useForm<WageFormValues>({
    resolver: zodResolver(wageFormSchema),
    defaultValues: wage ? valuesFromWage(wage) : emptyValues(month),
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const validationMessage = Object.values(formState.errors)[0]?.message as string | undefined;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(wage ? valuesFromWage(wage) : emptyValues(month));
      setSubmitError("");
    }
    setOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      await upsertWage.mutateAsync(values);
      setOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save wage entry");
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
            {icon ?? <PlusIcon size={15} />}
          </DialogTrigger>
        </ActionTooltip>
      ) : (
        <DialogTrigger render={<Button type="button" size="compact" />}>
          {icon ?? <PlusIcon size={13} />}
          {label}
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>{wage ? "Edit Wage Entry" : "Add Wage Entry"}</DialogTitle>
          <DialogDescription>Payroll entry for {month}.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <FormField label="Plumber / Worker">
            <Controller
              control={control}
              name="plumberId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || undefined}
                  onValueChange={(plumberId) => field.onChange(plumberId ?? "")}
                  placeholder="Select plumber"
                  options={plumbers.map((plumber) => ({ value: plumber.id, label: plumber.name }))}
                  disabled={Boolean(wage)}
                  className="w-full"
                />
              )}
            />
          </FormField>

          <FormField label="Category">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(category) => { if (category) field.onChange(category as WageCategory); }}>
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

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Rate of Wage">
              <Input type="number" {...register("wageRate")} />
            </FormField>
            <FormField label="Days Worked">
              <Input type="number" {...register("daysWorked")} />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="PF">
              <Input type="number" {...register("pf")} />
            </FormField>
            <FormField label="ESIC">
              <Input type="number" {...register("esic")} />
            </FormField>
          </div>

          <FormField label="Status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(status) => { if (status) field.onChange(status as WageStatus); }}>
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
          <Button type="button" onClick={() => void onSubmit()} disabled={upsertWage.isPending}>
            {upsertWage.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
