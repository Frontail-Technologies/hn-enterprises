import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/shared/DatePicker";
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
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useAllProjectSitesQuery } from "../../hooks/useAllProjectSites";
import { useCreateMaterialTransaction, useMaterialsQuery } from "../../hooks/useMaterials";
import type { MaterialTransactionFormValues, MaterialTransactionType } from "../../types/material.types";
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
    referenceNo: "",
    vendorName: "",
    rate: "",
    billAmount: "",
    plumberId: "",
    supervisorName: "",
    siteId: "",
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
}: {
  type: MaterialTransactionType;
  triggerLabel?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<MaterialTransactionFormValues>(emptyValues());
  const [saveError, setSaveError] = useState("");
  const { data: materials = [] } = useMaterialsQuery();
  const { data: plumbers = [] } = usePlumbersQuery();
  const { data: sites = [] } = useAllProjectSitesQuery();
  const { data: customers = [] } = useCustomersQuery();
  const createTransaction = useCreateMaterialTransaction(type);
  const label = triggerLabel ?? TYPE_LABELS[type];

  function set<K extends keyof MaterialTransactionFormValues>(key: K, value: MaterialTransactionFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(emptyValues());
      setSaveError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!values.materialId || !values.quantity || Number(values.quantity) <= 0) {
      setSaveError("Material and a valid quantity are required");
      return;
    }
    setSaveError("");
    try {
      await createTransaction.mutateAsync(values);
      setOpen(false);
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

  const siteField = (
    <Field label="Site">
      <Select value={values.siteId || undefined} onValueChange={(siteId) => set("siteId", siteId ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select site" />
        </SelectTrigger>
        <SelectContent>
          {sites.map((site) => (
            <SelectItem key={site.id} value={site.id}>
              {site.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );

  const customerField = (
    <Field label="Customer / BP No.">
      <Select
        value={values.customerId || undefined}
        onValueChange={(customerId) => set("customerId", customerId ?? "")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select customer" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.customerConnection.customerName} ({customer.customerConnection.trBpNo})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
      <SheetContent className="w-full border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{label}</SheetTitle>
          <SheetDescription>{TYPE_DESCRIPTIONS[type]}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {materialField}

          {type === "purchase" ? (
            <>
              <Field label="Invoice / Reference No.">
                <Input value={values.referenceNo} onChange={(event) => set("referenceNo", event.target.value)} />
              </Field>
              <Field label="Vendor Name">
                <Input value={values.vendorName} onChange={(event) => set("vendorName", event.target.value)} />
              </Field>
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
              <Field label="Person">
                <Input value={values.supervisorName} onChange={(event) => set("supervisorName", event.target.value)} />
              </Field>
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
              {dateField("Issue Date")}
              {plumberField}
              <Field label="Supervisor">
                <Input value={values.supervisorName} onChange={(event) => set("supervisorName", event.target.value)} />
              </Field>
              {siteField}
              {quantityField("Issued Quantity")}
            </>
          ) : null}

          {type === "return" ? (
            <>
              <Field label="Return No.">
                <Input value={values.referenceNo} onChange={(event) => set("referenceNo", event.target.value)} />
              </Field>
              {dateField("Return Date")}
              {plumberField}
              {siteField}
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
              {siteField}
              {plumberField}
              <Field label="Supervisor">
                <Input value={values.supervisorName} onChange={(event) => set("supervisorName", event.target.value)} />
              </Field>
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

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={createTransaction.isPending}>
              {createTransaction.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
