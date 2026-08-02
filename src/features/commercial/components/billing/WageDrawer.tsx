import { useState, type ReactNode } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useUpsertWage } from "../../hooks/useWages";
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

export function WageDrawer({
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
  const [values, setValues] = useState<WageFormValues>(wage ? valuesFromWage(wage) : emptyValues(month));
  const [saveError, setSaveError] = useState("");
  const { data: plumbers = [] } = usePlumbersQuery();
  const upsertWage = useUpsertWage();
  const label = triggerLabel ?? (wage ? "Edit Wage Entry" : "Add Wage Entry");

  function set<K extends keyof WageFormValues>(key: K, value: WageFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(wage ? valuesFromWage(wage) : emptyValues(month));
      setSaveError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!values.plumberId || !values.wageRate || !values.daysWorked) {
      setSaveError("Plumber, wage rate and days worked are required");
      return;
    }
    setSaveError("");
    try {
      await upsertWage.mutateAsync(values);
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save wage entry");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {iconOnly ? (
        <ActionTooltip label={label}>
          <SheetTrigger
            render={
              <button
                type="button"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label={label}
              />
            }
          >
            {icon ?? <PlusIcon size={15} />}
          </SheetTrigger>
        </ActionTooltip>
      ) : (
        <SheetTrigger render={<Button type="button" />}>
          {icon ?? <PlusIcon size={15} />}
          {label}
        </SheetTrigger>
      )}
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{wage ? "Edit Wage Entry" : "Add Wage Entry"}</SheetTitle>
          <SheetDescription>Payroll entry for {month}.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Plumber / Worker</span>
            <Select
              value={values.plumberId || undefined}
              onValueChange={(plumberId) => set("plumberId", plumberId ?? "")}
              disabled={Boolean(wage)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select plumber" />
              </SelectTrigger>
              <SelectContent>
                {plumbers.map((plumber) => (
                  <SelectItem key={plumber.id} value={plumber.id}>
                    {plumber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Category</span>
            <Select value={values.category} onValueChange={(category) => { if (category) set("category", category as WageCategory); }}>
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
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Rate of Wage</span>
              <Input type="number" value={values.wageRate} onChange={(event) => set("wageRate", event.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Days Worked</span>
              <Input type="number" value={values.daysWorked} onChange={(event) => set("daysWorked", event.target.value)} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">PF</span>
              <Input type="number" value={values.pf} onChange={(event) => set("pf", event.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">ESIC</span>
              <Input type="number" value={values.esic} onChange={(event) => set("esic", event.target.value)} />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <Select value={values.status} onValueChange={(status) => { if (status) set("status", status as WageStatus); }}>
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
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Remarks</span>
            <Textarea value={values.remarks} onChange={(event) => set("remarks", event.target.value)} className="min-h-20" />
          </label>

          {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={upsertWage.isPending}>
              {upsertWage.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
