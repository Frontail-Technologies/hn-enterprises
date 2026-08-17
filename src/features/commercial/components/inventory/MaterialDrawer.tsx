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
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useRosterQuery } from "@/features/management/hooks/useAttendance";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { useCreateMaterialTransaction, useMaterialsQuery } from "../../hooks/useMaterials";
import type {
  AdjustmentDirection,
  MaterialSource,
  MaterialTransactionFormValues,
  MaterialTransactionType,
} from "../../types/material.types";
import { ImageProofField } from "../shared/ImageProofField";

// Which types need an explicit source (they can move either PBG or purchased stock);
// everywhere else source is implied by the transaction type itself (see backend
// materials.service.ts's IMPLIED_SOURCE) and asking again would be redundant.
const SOURCE_REQUIRED_TYPES: MaterialTransactionType[] = ["issue", "return", "adjustment"];

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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
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
  // Lets a caller demote this to a secondary/outline action when several
  // MaterialDrawers sit side by side (§3 - only one should read as primary).
  variant?: "default" | "outline";
  // Renders no trigger of its own - open/onOpenChange are driven externally
  // (e.g. a dropdown menu item), so the same form can be launched without a
  // second visible button competing for attention.
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const [values, setValues] = useState<MaterialTransactionFormValues>(emptyValues());
  const [saveError, setSaveError] = useState("");
  const { data: materials = [] } = useMaterialsQuery();
  const { data: plumbers = [] } = usePlumbersQuery();
  const { data: supervisors = [] } = useRosterQuery("supervisor");
  const { data: customers = [] } = useCustomersQuery();
  const { data: projects = [] } = useProjectsQuery();
  const createTransaction = useCreateMaterialTransaction(type);
  const label = triggerLabel ?? TYPE_LABELS[type];
  const needsSource = SOURCE_REQUIRED_TYPES.includes(type);

  function set<K extends keyof MaterialTransactionFormValues>(key: K, value: MaterialTransactionFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(emptyValues());
      setSaveError("");
    }
    if (controlledOnOpenChange) controlledOnOpenChange(nextOpen);
    else setUncontrolledOpen(nextOpen);
  }

  async function handleSave() {
    if (!values.materialId || !values.quantity || Number(values.quantity) <= 0) {
      setSaveError("Material and a valid quantity are required");
      return;
    }
    if (needsSource && !values.source) {
      setSaveError("Material source (Purchase or PBG) is required");
      return;
    }
    if (type === "adjustment" && !values.direction) {
      setSaveError("Adjustment direction (In or Out) is required");
      return;
    }
    setSaveError("");
    try {
      await createTransaction.mutateAsync(values);
      handleOpenChange(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save transaction");
    }
  }

  const materialField = (
    <Field label="Material">
      <Select
        value={values.materialId || undefined}
        onValueChange={(materialId) => set("materialId", materialId ?? "")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select material" />
        </SelectTrigger>
        <SelectContent>
          {materials.map((material) => (
            <SelectItem key={material.id} value={material.id}>
              {material.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );

  const plumberField = (
    <Field label="Plumber / Team">
      <Select
        value={values.plumberId || undefined}
        onValueChange={(plumberId) => set("plumberId", plumberId ?? "")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select plumber / team" />
        </SelectTrigger>
        <SelectContent>
          {plumbers.map((plumber) => (
            <SelectItem key={plumber.id} value={plumber.id}>
              {plumber.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );

  const supervisorField = (
    <Field label="Supervisor">
      <Select
        value={values.supervisorId || undefined}
        onValueChange={(supervisorId) => set("supervisorId", supervisorId ?? "")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select supervisor" />
        </SelectTrigger>
        <SelectContent>
          {supervisors.map((supervisor) => (
            <SelectItem key={supervisor.id} value={supervisor.id}>
              {supervisor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );

  const addressField = (
    <Field label="Address">
      <Input value={values.address} onChange={(event) => set("address", event.target.value)} placeholder="Site / delivery address" />
    </Field>
  );

  const customerField = (
    <Field label="Customer / BP No.">
      <SearchableSelect
        value={values.customerId || undefined}
        onValueChange={(customerId) => set("customerId", customerId ?? "")}
        placeholder="Select customer"
        options={customers.map(c => ({ value: c.id, label: `${c.customerConnection.customerName} (${c.customerConnection.trBpNo})` }))}
        className="w-full"
      />
    </Field>
  );

  const sourceField = (
    <Field label="Material Source">
      <Select value={values.source || undefined} onValueChange={(source) => set("source", (source as MaterialSource) ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="purchase">Purchase</SelectItem>
          <SelectItem value="pbg">PBG</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );

  const directionField = (
    <Field label="Direction">
      <Select
        value={values.direction || undefined}
        onValueChange={(direction) => set("direction", (direction as AdjustmentDirection) ?? "")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="in">In (adds to balance)</SelectItem>
          <SelectItem value="out">Out (reduces balance)</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );

  const projectField = (
    <Field label="Project (optional)">
      <SearchableSelect
        value={values.projectId || undefined}
        onValueChange={(projectId) => set("projectId", projectId ?? "")}
        placeholder="Select project"
        options={projects.map((project) => ({ value: project.id, label: project.name }))}
        className="w-full"
      />
    </Field>
  );

  const quantityField = (labelText: string) => (
    <Field label={labelText}>
      <Input type="number" value={values.quantity} onChange={(event) => set("quantity", event.target.value)} />
    </Field>
  );

  const dateField = (labelText: string) => (
    <Field label={labelText}>
      <DatePicker value={values.transactionDate} onChange={(value) => set("transactionDate", value)} />
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {hideTrigger ? null : iconOnly ? (
        <ActionTooltip label={label}>
          <DialogTrigger
            render={
              <button
                type="button"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label={label}
              />
            }
          >
            {icon ?? <PlusIcon size={15} />}
          </DialogTrigger>
        </ActionTooltip>
      ) : (
        <DialogTrigger render={<Button type="button" variant={variant} />}>
          {icon ?? <PlusIcon size={15} />}
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
              <Field label="Invoice / Reference No.">
                <Input value={values.referenceNo} onChange={(event) => set("referenceNo", event.target.value)} />
              </Field>
              <Field label="Vendor Name">
                <Input value={values.vendorName} onChange={(event) => set("vendorName", event.target.value)} />
              </Field>
              {projectField}
              {dateField("Purchase Date")}
              {quantityField("Quantity")}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Rate">
                  <Input type="number" value={values.rate} onChange={(event) => set("rate", event.target.value)} />
                </Field>
                <Field label="Bill Amount">
                  <Input
                    type="number"
                    value={values.billAmount}
                    onChange={(event) => set("billAmount", event.target.value)}
                  />
                </Field>
              </div>
            </>
          ) : null}

          {type === "pbg_issue" ? (
            <>
              <Field label="SIV No.">
                <Input value={values.referenceNo} onChange={(event) => set("referenceNo", event.target.value)} />
              </Field>
              {supervisorField}
              {projectField}
              {dateField("Issue Date")}
              {quantityField("Quantity")}
              <Field label="Vendor Name">
                <Input value={values.vendorName} onChange={(event) => set("vendorName", event.target.value)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Vehicle No.">
                  <Input value={values.vehicleNo} onChange={(event) => set("vehicleNo", event.target.value)} />
                </Field>
                <Field label="Vehicle Quantity">
                  <Input
                    type="number"
                    value={values.vehicleQty}
                    onChange={(event) => set("vehicleQty", event.target.value)}
                  />
                </Field>
              </div>
            </>
          ) : null}

          {type === "pbg_consumption" ? (
            <>
              <Field label="RA Bill No.">
                <Input value={values.referenceNo} onChange={(event) => set("referenceNo", event.target.value)} />
              </Field>
              {customerField}
              {plumberField}
              {dateField("Consumption Date")}
              {quantityField("Total Consumption")}
              <Field label="Vendor Name">
                <Input value={values.vendorName} onChange={(event) => set("vendorName", event.target.value)} />
              </Field>
            </>
          ) : null}

          {type === "issue" ? (
            <>
              <Field label="Slip No.">
                <Input value={values.referenceNo} onChange={(event) => set("referenceNo", event.target.value)} />
              </Field>
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
              <Field label="Return No.">
                <Input value={values.referenceNo} onChange={(event) => set("referenceNo", event.target.value)} />
              </Field>
              {sourceField}
              {dateField("Return Date")}
              {plumberField}
              {addressField}
              {quantityField("Return Quantity")}
              <Field label="Condition">
                <Select value={values.condition} onValueChange={(condition) => set("condition", condition ?? "Reusable")}>
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
              </Field>
            </>
          ) : null}

          {type === "adjustment" ? (
            <>
              {plumberField}
              {sourceField}
              {directionField}
              {quantityField("Adjustment Quantity")}
              <Field label="Adjustment Type">
                <Select
                  value={values.adjustmentType}
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
              </Field>
            </>
          ) : null}

          {type === "consumption" ? (
            <>
              {customerField}
              {addressField}
              {plumberField}
              {supervisorField}
              <Field label="Report No.">
                <Input value={values.reportNo} onChange={(event) => set("reportNo", event.target.value)} />
              </Field>
              {dateField("Consumption Date")}
              {quantityField("Used Quantity")}
            </>
          ) : null}

          <ImageProofField
            label="Proof / Receipt Photo"
            description="Upload bill, slip, handover proof or site photo."
            images={values.evidence}
            onChange={(evidence) => set("evidence", evidence)}
            module="inventory"
          />

          <Field label="Remarks">
            <Textarea
              value={values.remarks}
              onChange={(event) => set("remarks", event.target.value)}
              className="min-h-20"
            />
          </Field>

          {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" onClick={handleSave} disabled={createTransaction.isPending}>
            {createTransaction.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
