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
import { DatePicker } from "@/components/shared/DatePicker";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Textarea } from "@/components/ui/textarea";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { useCreateComplaint, useUpdateComplaint } from "../../hooks/useComplaints";
import type { Complaint, ComplaintFormValues, ComplaintPriority } from "../../types/complaint.types";

const complaintPriorities: ComplaintPriority[] = ["Low", "Medium", "High"];

function emptyValues(): ComplaintFormValues {
  return {
    customerId: "",
    title: "",
    description: "",
    priority: "Medium",
  };
}

function valuesFromComplaint(complaint: Complaint): ComplaintFormValues {
  return {
    customerId: complaint.customerId,
    title: complaint.title,
    description: complaint.description,
    priority: complaint.priority,
  };
}

export function ComplaintDrawer({
  complaint,
  triggerLabel,
  icon,
  iconOnly = false,
}: {
  complaint?: Complaint;
  triggerLabel: string;
  icon?: ReactNode;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ComplaintFormValues>(complaint ? valuesFromComplaint(complaint) : emptyValues());
  const [saveError, setSaveError] = useState("");
  const { data: customers = [] } = useCustomersQuery();
  const createComplaint = useCreateComplaint();
  const updateComplaint = useUpdateComplaint(complaint?.id ?? "");
  const isSaving = createComplaint.isPending || updateComplaint.isPending;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(complaint ? valuesFromComplaint(complaint) : emptyValues());
      setSaveError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!values.customerId || !values.title.trim() || !values.description.trim()) {
      setSaveError("Customer, title and description are required");
      return;
    }
    setSaveError("");
    try {
      if (complaint) {
        await updateComplaint.mutateAsync(values);
      } else {
        await createComplaint.mutateAsync(values);
      }
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save complaint");
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
          <SheetTitle>{complaint ? "Edit Complaint" : "Raise Complaint"}</SheetTitle>
          <SheetDescription>Raise and track complaints against a customer.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Customer</span>
            <SearchableSelect
              value={values.customerId || undefined}
              onValueChange={(customerId) =>
                setValues((current) => ({ ...current, customerId: customerId ?? "" }))
              }
              placeholder="Select customer"
              options={customers.map((c) => ({ value: c.id, label: c.customerConnection.customerName }))}
              className="w-full"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Title</span>
            <Input
              value={values.title}
              onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Priority</span>
            <Select
              value={values.priority}
              onValueChange={(priority) => {
                if (priority) setValues((current) => ({ ...current, priority: priority as ComplaintPriority }));
              }}
            >
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
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Description</span>
            <Textarea
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24"
            />
          </label>

          {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Complaint"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
