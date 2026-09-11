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
import { useCustomerSelectorOptions } from "@/features/customers/hooks/useCustomerSelectorOptions";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useRosterQuery } from "@/features/management/hooks/useAttendance";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { useCreateMaterialTransaction, useMaterialsQuery } from "../../hooks/useMaterials";
import { buildMaterialTransactionSchema } from "../../schemas/material-transaction.schema";
import type {
  AdjustmentDirection,
  MaterialSource,
  MaterialTransactionFormValues,
  MaterialTransactionType,
} from "../../types/material.types";
import { ImageProofField } from "../shared/ImageProofField";

const TYPE_LABELS: Record<MaterialTransactionType, string> = {
  purchase: "Add Purchase",
  pbg_issue: "Add PBG Issue",
  pbg_consumption: "Add PBG Consumption",
  issue: "Issue Material",
  return: "Return Material",
  adjustment: "Adjust Balance",
  consumption: "Add Consumption",
};

const TYPE_DESCRIPTIONS: Record<MaterialTransactionType, string> = {
  purchase: "Record vendor invoice, material quantity, rate and bill proof.",
  pbg_issue: "Record free-issue material received from client/vendor.",
  pbg_consumption: "Record PBG material consumption against RA bill/reference.",
  issue: "Issue material to plumber, team or site with handover proof.",
  return: "Record material returned by plumber or site team.",
  adjustment: "Correct plumber balance after physical verification.",
  consumption: "Record customer/site material consumption for reconciliation.",
};

function emptyValues(): MaterialTransactionFormValues {
  return {
    materialId: "",
    quantity: "",
    transactionDate: format(new Date(), "yyyy-MM-dd"),
    source: "",
    direction: "",
    projectId: "",
    referenceNo: "",
    vendorName: "",
    rate: "",
    billAmount: "",
    plumberId: "",
    supervisorId: "",
    paymentId: "",
    siteId: "",
    address: "",
    storeLabel: "",
    customerId: "",
    reportNo: "",
    condition: "Reusable",
    adjustmentType: "Correction",
    vehicleNo: "",
    vehicleQty: "",
    evidence: [],
    remarks: "",
  };
}

export function MaterialDrawer({
  type,
  triggerLabel,
  icon,
  iconOnly = false,
  variant = "default",
  hideTrigger = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  type: MaterialTransactionType;
  triggerLabel?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  variant?: "default" | "outline";
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const [submitError, setSubmitError] = useState("");
  const { data: materials = [] } = useMaterialsQuery();
  const { data: plumbers = [] } = usePlumbersQuery();
  const { data: supervisors = [] } = useRosterQuery("supervisor");
  const { options: customerOptions, isLoading: customersLoading, onSearchChange: onCustomerSearchChange } =
    useCustomerSelectorOptions();
  const { data: projects = [] } = useProjectsQuery();
  const createTransaction = useCreateMaterialTransaction(type);
  const label = triggerLabel ?? TYPE_LABELS[type];

  const form = useForm<MaterialTransactionFormValues>({
    resolver: zodResolver(buildMaterialTransactionSchema(type)),
    defaultValues: emptyValues(),
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const validationMessage = Object.values(formState.errors)[0]?.message as string | undefined;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(emptyValues());
      setSubmitError("");
    }
    if (controlledOnOpenChange) controlledOnOpenChange(nextOpen);
    else setUncontrolledOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      await createTransaction.mutateAsync(values);
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save transaction");
    }
  });

  const materialField = (
    <FormField label="Material">
      <Controller
        control={control}
        name="materialId"
        render={({ field }) => (
          <SearchableSelect
            value={field.value || undefined}
            onValueChange={(materialId) => field.onChange(materialId ?? "")}
            placeholder="Select material"
            options={materials.map((material) => ({ value: material.id, label: material.name }))}
            className="w-full"
          />
        )}
      />
    </FormField>
  );

  const plumberField = (
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
  );

  const supervisorField = (
    <FormField label="Supervisor">
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
  );

  const addressField = (
    <FormField label="Address">
      <Input {...register("address")} placeholder="Site / delivery address" />
    </FormField>
  );

  const customerField = (
    <FormField label="Customer / BP No.">
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
  );

  const sourceField = (
    <FormField label="Material Source">
      <Controller
        control={control}
        name="source"
        render={({ field }) => (
          <Select value={field.value || undefined} onValueChange={(source) => field.onChange((source as MaterialSource) ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="pbg">PBG</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );

  const directionField = (
    <FormField label="Direction">
      <Controller
        control={control}
        name="direction"
        render={({ field }) => (
          <Select value={field.value || undefined} onValueChange={(direction) => field.onChange((direction as AdjustmentDirection) ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">In (adds to balance)</SelectItem>
              <SelectItem value="out">Out (reduces balance)</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );

  const projectField = (
    <FormField label="Project (optional)">
      <Controller
        control={control}
        name="projectId"
        render={({ field }) => (
          <SearchableSelect
            value={field.value || undefined}
            onValueChange={(projectId) => field.onChange(projectId ?? "")}
            placeholder="Select project"
            options={projects.map((project) => ({ value: project.id, label: project.name }))}
            className="w-full"
          />
        )}
      />
    </FormField>
  );

  const quantityField = (labelText: string) => (
    <FormField label={labelText}>
      <Input type="number" {...register("quantity")} />
    </FormField>
  );

  const dateField = (labelText: string) => (
    <FormField label={labelText}>
      <Controller
        control={control}
        name="transactionDate"
        render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
      />
    </FormField>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {hideTrigger ? null : iconOnly ? (
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
        <DialogTrigger render={<Button type="button" variant={variant} size="compact" />}>
          {icon ?? <PlusIcon size={13} />}
          {label}
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{TYPE_DESCRIPTIONS[type]}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {materialField}

          {type === "purchase" ? (
            <>
              <FormField label="Invoice / Reference No.">
                <Input {...register("referenceNo")} />
              </FormField>
              <FormField label="Vendor Name">
                <Input {...register("vendorName")} />
              </FormField>
              {projectField}
              {dateField("Purchase Date")}
              {quantityField("Quantity")}
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Rate">
                  <Input type="number" {...register("rate")} />
                </FormField>
                <FormField label="Bill Amount">
                  <Input type="number" {...register("billAmount")} />
                </FormField>
              </div>
            </>
          ) : null}

          {type === "pbg_issue" ? (
            <>
              <FormField label="SIV No.">
                <Input {...register("referenceNo")} />
              </FormField>
              {supervisorField}
              {projectField}
              {dateField("Issue Date")}
              {quantityField("Quantity")}
              <FormField label="Vendor Name">
                <Input {...register("vendorName")} />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Vehicle No.">
                  <Input {...register("vehicleNo")} />
                </FormField>
                <FormField label="Vehicle Quantity">
                  <Input type="number" {...register("vehicleQty")} />
                </FormField>
              </div>
            </>
          ) : null}

          {type === "pbg_consumption" ? (
            <>
              <FormField label="RA Bill No.">
                <Input {...register("referenceNo")} />
              </FormField>
              {customerField}
              {plumberField}
              {dateField("Consumption Date")}
              {quantityField("Total Consumption")}
              <FormField label="Vendor Name">
                <Input {...register("vendorName")} />
              </FormField>
            </>
          ) : null}

          {type === "issue" ? (
            <>
              <FormField label="Slip No.">
                <Input {...register("referenceNo")} />
              </FormField>
              {sourceField}
              {dateField("Issue Date")}
              {plumberField}
              {supervisorField}
              {projectField}
              {addressField}
              {quantityField("Issued Quantity")}
            </>
          ) : null}

          {type === "return" ? (
            <>
              <FormField label="Return No.">
                <Input {...register("referenceNo")} />
              </FormField>
              {sourceField}
              {dateField("Return Date")}
              {plumberField}
              {addressField}
              {quantityField("Return Quantity")}
              <FormField label="Condition">
                <Controller
                  control={control}
                  name="condition"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(condition) => field.onChange(condition ?? "Reusable")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Reusable", "Damaged", "Scrap", "Review"].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </>
          ) : null}

          {type === "adjustment" ? (
            <>
              {plumberField}
              {sourceField}
              {directionField}
              {quantityField("Adjustment Quantity")}
              <FormField label="Adjustment Type">
                <Controller
                  control={control}
                  name="adjustmentType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(adjustmentType) => field.onChange(adjustmentType ?? "Correction")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Correction", "Damaged", "Lost", "Found", "Manual Adjustment"].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </>
          ) : null}

          {type === "consumption" ? (
            <>
              {customerField}
              {addressField}
              {plumberField}
              {supervisorField}
              <FormField label="Report No.">
                <Input {...register("reportNo")} />
              </FormField>
              {dateField("Consumption Date")}
              {quantityField("Used Quantity")}
            </>
          ) : null}

          <Controller
            control={control}
            name="evidence"
            render={({ field }) => (
              <ImageProofField
                label="Proof / Receipt Photo"
                description="Upload bill, slip, handover proof or site photo."
                images={field.value}
                onChange={field.onChange}
                module="inventory"
              />
            )}
          />

          <FormField label="Remarks">
            <Textarea {...register("remarks")} className="min-h-20" />
          </FormField>

          {validationMessage || submitError ? (
            <p className="text-xs text-destructive">{validationMessage || submitError}</p>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" onClick={() => void onSubmit()} disabled={createTransaction.isPending}>
            {createTransaction.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
