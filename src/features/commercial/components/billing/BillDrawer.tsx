import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/shared/DatePicker";
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
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { useCreateBill, useUpdateBill, useDeleteBill } from "../../hooks/useBills";
import type { Bill, BillFormValues, BillStage, BillStatus } from "../../types/bill.types";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

const billStages: BillStage[] = ["GI", "GC", "Commissioning", "Conversion", "Other"];
const billStatuses: BillStatus[] = ["Draft", "Submitted", "Completed", "Overdue"];
const CUSTOMER_NONE = "__none__";

function emptyValues(defaultProjectId = ""): BillFormValues {
  return {
    projectId: defaultProjectId,
    customerId: "",
    billNumber: "",
    stage: "Other",
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
    customerId: bill.customerId,
    billNumber: bill.billNumber,
    stage: bill.stage,
    billDate: bill.billDate,
    dueDate: bill.dueDate,
    totalAmount: String(bill.totalAmount),
    tax: String(bill.tax),
    status: bill.status,
    remarks: bill.remarks,
  };
}

export function BillDrawer({
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
  /** Locks the bill to a project when created from inside a project's Billing tab. */
  defaultProjectId?: string;
  defaultProjectName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<BillFormValues>(
    bill ? valuesFromBill(bill) : emptyValues(defaultProjectId),
  );
  const [saveError, setSaveError] = useState("");
  const { data: projects = [] } = useProjectsQuery();
  // Customer is an optional reference scoped to the chosen project, so only
  // that project's customers are offered.
  const { data: customers = [] } = useCustomersQuery({ projectId: values.projectId || undefined });
  const createBill = useCreateBill();
  const updateBill = useUpdateBill(bill?.id ?? "");
  const deleteBill = useDeleteBill();
  const isSaving = createBill.isPending || updateBill.isPending;
  const projectLocked = Boolean(defaultProjectId) && !bill;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(bill ? valuesFromBill(bill) : emptyValues(defaultProjectId));
      setSaveError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!values.projectId || !values.billNumber.trim() || !values.totalAmount) {
      setSaveError("Project, bill number and total amount are required");
      return;
    }
    setSaveError("");
    try {
      if (bill) {
        await updateBill.mutateAsync(values);
      } else {
        await createBill.mutateAsync(values);
      }
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save bill");
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
            {icon ?? <PlusIcon size={15} />}
          </SheetTrigger>
        </ActionTooltip>
      ) : (
        <SheetTrigger render={<Button type="button" />}>
          {icon ?? <PlusIcon size={15} />}
          {triggerLabel}
        </SheetTrigger>
      )}
      <SheetContent className="w-full border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{bill ? "Edit Bill" : "Create Bill"}</SheetTitle>
          <SheetDescription>Create bill records and payment entries.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Project</span>
            {projectLocked ? (
              <div className="flex h-9 items-center rounded-lg border border-border bg-muted/30 px-3 text-sm font-medium text-foreground">
                {defaultProjectName || "-"}
              </div>
            ) : (
              <SearchableSelect
                value={values.projectId || undefined}
                onValueChange={(projectId) =>
                  // Changing project clears any customer that belonged to the old one.
                  setValues((current) => ({ ...current, projectId: projectId ?? "", customerId: "" }))
                }
                placeholder="Select project"
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                className="w-full"
              />
            )}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Customer (optional)</span>
            <SearchableSelect
              value={values.customerId || undefined}
              onValueChange={(customerId) =>
                setValues((current) => ({
                  ...current,
                  customerId: customerId && customerId !== CUSTOMER_NONE ? customerId : "",
                }))
              }
              placeholder={values.projectId ? "Select customer" : "Select a project first"}
              disabled={!values.projectId}
              options={[
                { value: CUSTOMER_NONE, label: "— No specific customer —" },
                ...customers.map((c) => ({ value: c.id, label: c.customerConnection.customerName })),
              ]}
              className="w-full"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Bill Number</span>
            <Input
              value={values.billNumber}
              onChange={(event) => setValues((current) => ({ ...current, billNumber: event.target.value }))}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Billing Stage</span>
              <Select
                value={values.stage}
                onValueChange={(stage) => {
                  if (stage) setValues((current) => ({ ...current, stage: stage as BillStage }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Bill Date</span>
              <DatePicker
                value={values.billDate}
                onChange={(billDate) => setValues((current) => ({ ...current, billDate }))}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Total Amount</span>
              <Input
                type="number"
                value={values.totalAmount}
                onChange={(event) => setValues((current) => ({ ...current, totalAmount: event.target.value }))}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Tax</span>
              <Input
                type="number"
                value={values.tax}
                onChange={(event) => setValues((current) => ({ ...current, tax: event.target.value }))}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Due Date</span>
              <DatePicker
                value={values.dueDate}
                onChange={(dueDate) => setValues((current) => ({ ...current, dueDate }))}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <Select
                value={values.status}
                onValueChange={(status) => {
                  if (status) setValues((current) => ({ ...current, status: status as BillStatus }));
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
            </label>
          </div>

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

        <SheetFooter className="border-t border-border/70 flex w-full flex-row justify-between sm:justify-between items-center mt-auto">
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
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Bill"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
