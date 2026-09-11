"use client";

import { useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
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
import { useCorrectMaterialTransaction } from "../../hooks/useMaterials";
import type {
  AdjustmentDirection,
  CorrectMaterialTransactionInput,
  MaterialSource,
  MaterialTransaction,
} from "../../types/material.types";

const SOURCE_REQUIRED_TYPES = ["issue", "return", "adjustment"];

function prefill(transaction: MaterialTransaction): CorrectMaterialTransactionInput {
  return {
    correctionReason: "",
    quantity: String(transaction.quantity),
    transactionDate: transaction.transactionDate,
    source: transaction.source,
    direction: transaction.quantityDelta < 0 ? "out" : "in",
    projectId: transaction.projectId,
    referenceNo: transaction.referenceNo,
    vendorName: transaction.vendorName,
    rate: transaction.rate != null ? String(transaction.rate) : "",
    billAmount: transaction.billAmount != null ? String(transaction.billAmount) : "",
    plumberId: transaction.plumberId,
    supervisorId: transaction.supervisorId,
    siteId: transaction.siteId,
    address: transaction.address,
    storeLabel: transaction.storeLabel,
    customerId: transaction.customerId,
    reportNo: transaction.reportNo,
    condition: transaction.condition,
    adjustmentType: transaction.adjustmentType,
    vehicleNo: transaction.vehicleNo,
    vehicleQty: transaction.vehicleQty != null ? String(transaction.vehicleQty) : "",
    remarks: transaction.remarks,
  };
}

export function CorrectTransactionDialog({ transaction, materialName }: { transaction: MaterialTransaction; materialName: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CorrectMaterialTransactionInput>(() => prefill(transaction));
  const [error, setError] = useState("");
  const { data: plumbers = [] } = usePlumbersQuery();
  const { data: supervisors = [] } = useRosterQuery("supervisor");
  const { options: customerOptions, isLoading: customersLoading, onSearchChange: onCustomerSearchChange } =
    useCustomerSelectorOptions(values.customerId);
  const { data: projects = [] } = useProjectsQuery();
  const correctTransaction = useCorrectMaterialTransaction();
  const needsSource = SOURCE_REQUIRED_TYPES.includes(transaction.type);

  function set<K extends keyof CorrectMaterialTransactionInput>(key: K, value: CorrectMaterialTransactionInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(prefill(transaction));
      setError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!values.correctionReason.trim()) {
      setError("A correction reason is required");
      return;
    }
    if (!values.quantity || Number(values.quantity) <= 0) {
      setError("A valid quantity is required");
      return;
    }
    if (needsSource && !values.source) {
      setError("Material source (Purchase or PBG) is required");
      return;
    }
    if (transaction.type === "adjustment" && !values.direction) {
      setError("Adjustment direction (In or Out) is required");
      return;
    }
    setError("");
    try {
      await correctTransaction.mutateAsync({ id: transaction.id, input: values });
      setOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save correction");
    }
  }

  const type = transaction.type;

  const sourceField = (
    <FormField label="Material Source">
      <Select value={values.source || undefined} onValueChange={(source) => set("source", (source as MaterialSource) ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="purchase">Purchase</SelectItem>
          <SelectItem value="pbg">PBG</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  );

  const directionField = (
    <FormField label="Direction">
      <Select value={values.direction || undefined} onValueChange={(direction) => set("direction", (direction as AdjustmentDirection) ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="in">In (adds to balance)</SelectItem>
          <SelectItem value="out">Out (reduces balance)</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  );

  const projectField = (
    <FormField label="Project">
      <SearchableSelect
        value={values.projectId || undefined}
        onValueChange={(projectId) => set("projectId", projectId ?? "")}
        placeholder="Select project"
        options={projects.map((project) => ({ value: project.id, label: project.name }))}
        className="w-full"
      />
    </FormField>
  );

  const plumberField = (
    <FormField label="Plumber / Team">
      <SearchableSelect
        value={values.plumberId || undefined}
        onValueChange={(plumberId) => set("plumberId", plumberId ?? "")}
        placeholder="Select plumber / team"
        options={plumbers.map((plumber) => ({ value: plumber.id, label: plumber.name }))}
        className="w-full"
      />
    </FormField>
  );

  const supervisorField = (
    <FormField label="Supervisor">
      <SearchableSelect
        value={values.supervisorId || undefined}
        onValueChange={(supervisorId) => set("supervisorId", supervisorId ?? "")}
        placeholder="Select supervisor"
        options={supervisors.map((supervisor) => ({ value: supervisor.id, label: supervisor.name }))}
        className="w-full"
      />
    </FormField>
  );

  const customerField = (
    <FormField label="Customer / BP No.">
      <SearchableSelect
        value={values.customerId || undefined}
        onValueChange={(customerId) => set("customerId", customerId ?? "")}
        placeholder="Select customer"
        searchPlaceholder="Search by name, BR/TR or mobile..."
        options={customerOptions}
        isLoading={customersLoading}
        onSearchChange={onCustomerSearchChange}
        className="w-full"
      />
    </FormField>
  );

  const addressField = (
    <FormField label="Address">
      <Input value={values.address ?? ""} onChange={(event) => set("address", event.target.value)} />
    </FormField>
  );

  const quantityField = (
    <FormField label="Quantity">
      <Input type="number" value={values.quantity ?? ""} onChange={(event) => set("quantity", event.target.value)} />
    </FormField>
  );

  const dateField = (
    <FormField label="Date">
      <DatePicker value={values.transactionDate} onChange={(value) => set("transactionDate", value)} />
    </FormField>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button type="button" variant="ghost" size="icon-xs" aria-label="Correct transaction" />}
      >
        <PencilSimpleIcon size={14} />
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>Correct Transaction</DialogTitle>
          <DialogDescription>
            {materialName} - this replaces the original row; the original stays on record for audit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Material and transaction type cannot be changed by a correction. To fix those, reverse this transaction and record a new one.
          </div>

          {type === "purchase" ? (
            <>
              <FormField label="Invoice / Reference No.">
                <Input value={values.referenceNo ?? ""} onChange={(event) => set("referenceNo", event.target.value)} />
              </FormField>
              <FormField label="Vendor Name">
                <Input value={values.vendorName ?? ""} onChange={(event) => set("vendorName", event.target.value)} />
              </FormField>
              {projectField}
              {dateField}
              {quantityField}
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Rate">
                  <Input type="number" value={values.rate ?? ""} onChange={(event) => set("rate", event.target.value)} />
                </FormField>
                <FormField label="Bill Amount">
                  <Input type="number" value={values.billAmount ?? ""} onChange={(event) => set("billAmount", event.target.value)} />
                </FormField>
              </div>
            </>
          ) : null}

          {type === "pbg_issue" ? (
            <>
              <FormField label="SIV No.">
                <Input value={values.referenceNo ?? ""} onChange={(event) => set("referenceNo", event.target.value)} />
              </FormField>
              {supervisorField}
              {projectField}
              {dateField}
              {quantityField}
              <FormField label="Vendor Name">
                <Input value={values.vendorName ?? ""} onChange={(event) => set("vendorName", event.target.value)} />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Vehicle No.">
                  <Input value={values.vehicleNo ?? ""} onChange={(event) => set("vehicleNo", event.target.value)} />
                </FormField>
                <FormField label="Vehicle Quantity">
                  <Input type="number" value={values.vehicleQty ?? ""} onChange={(event) => set("vehicleQty", event.target.value)} />
                </FormField>
              </div>
            </>
          ) : null}

          {type === "pbg_consumption" ? (
            <>
              <FormField label="RA Bill No.">
                <Input value={values.referenceNo ?? ""} onChange={(event) => set("referenceNo", event.target.value)} />
              </FormField>
              {customerField}
              {plumberField}
              {dateField}
              {quantityField}
              <FormField label="Vendor Name">
                <Input value={values.vendorName ?? ""} onChange={(event) => set("vendorName", event.target.value)} />
              </FormField>
            </>
          ) : null}

          {type === "issue" ? (
            <>
              <FormField label="Slip No.">
                <Input value={values.referenceNo ?? ""} onChange={(event) => set("referenceNo", event.target.value)} />
              </FormField>
              {sourceField}
              {dateField}
              {plumberField}
              {supervisorField}
              {projectField}
              {addressField}
              {quantityField}
            </>
          ) : null}

          {type === "return" ? (
            <>
              <FormField label="Return No.">
                <Input value={values.referenceNo ?? ""} onChange={(event) => set("referenceNo", event.target.value)} />
              </FormField>
              {sourceField}
              {dateField}
              {plumberField}
              {addressField}
              {quantityField}
              <FormField label="Condition">
                <Select value={values.condition ?? "Reusable"} onValueChange={(condition) => set("condition", condition ?? "Reusable")}>
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
              </FormField>
            </>
          ) : null}

          {type === "adjustment" ? (
            <>
              {plumberField}
              {sourceField}
              {directionField}
              {quantityField}
              <FormField label="Adjustment Type">
                <Select
                  value={values.adjustmentType ?? "Correction"}
                  onValueChange={(adjustmentType) => set("adjustmentType", adjustmentType ?? "Correction")}
                >
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
                <Input value={values.reportNo ?? ""} onChange={(event) => set("reportNo", event.target.value)} />
              </FormField>
              {dateField}
              {quantityField}
            </>
          ) : null}

          <FormField label="Remarks">
            <Textarea value={values.remarks ?? ""} onChange={(event) => set("remarks", event.target.value)} className="min-h-16" />
          </FormField>

          <FormField label="Correction Reason (required)">
            <Textarea
              value={values.correctionReason}
              onChange={(event) => set("correctionReason", event.target.value)}
              className="min-h-16"
              placeholder="Why is this transaction being corrected?"
            />
          </FormField>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" onClick={handleSave} disabled={correctTransaction.isPending}>
            {correctTransaction.isPending ? "Saving..." : "Save Correction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
