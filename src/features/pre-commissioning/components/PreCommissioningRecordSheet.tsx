"use client";

import { NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
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
import { preCommissioningStatuses } from "../services/pre-commissioning.service";
import type { PreCommissioningRecord } from "../types/pre-commissioning.types";

const emptyRecord: Partial<PreCommissioningRecord> = {
  referenceNo: "",
  customerName: "",
  bpTrNumber: "",
  customerMobile: "",
  projectName: "",
  siteArea: "",
  assignedPerson: "",
  status: "Pending",
  updatedDate: "",
  checklistDone: 0,
  checklistTotal: 8,
  evidenceCount: 0,
  purgingDate: "",
  purgingPressure: "",
  purgingDuration: "",
  purgingRemarks: "",
  locationSection: "",
  pipeLengths: "",
  valveChambers: "",
  safetyVerification: "",
  installationVerification: "",
  fieldObservation: "",
  remarks: "",
};

export function PreCommissioningRecordSheet({
  record,
  mode = record ? "edit" : "add",
  iconOnly = false,
}: {
  record?: PreCommissioningRecord;
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  const data = { ...emptyRecord, ...record };
  const title = mode === "edit" ? "Edit Pre-Commissioning Record" : "Add Pre-Commissioning Record";
  const actionLabel = mode === "edit" ? "Save Changes" : "Add Record";

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant={iconOnly ? "ghost" : "default"}
            size={iconOnly ? "icon-sm" : "default"}
            aria-label={title}
            title={title}
          />
        }
      >
        {mode === "edit" ? <NotePencilIcon size={15} /> : <PlusIcon size={15} />}
        {!iconOnly ? actionLabel : null}
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-xl">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Maintain compact readiness, purging and assignment details.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <section className="grid gap-3 md:grid-cols-2">
            <Field label="Reference No." defaultValue={data.referenceNo} />
            <Field label="Customer Name" defaultValue={data.customerName} />
            <Field label="BP/TR Number" defaultValue={data.bpTrNumber} />
            <Field label="Customer Mobile" defaultValue={data.customerMobile} />
            <Field label="Project" defaultValue={data.projectName} />
            <Field label="Site / Area" defaultValue={data.siteArea} />
            <Field label="Assigned Person" defaultValue={data.assignedPerson} />
            <StatusSelect defaultValue={data.status ?? "Pending"} />
            <Field label="Location / Section" defaultValue={data.locationSection} />
          </section>

          <section>
            <p className="text-sm font-bold text-foreground">Checklist Progress</p>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <Field label="Completed Items" defaultValue={String(data.checklistDone ?? 0)} />
              <Field label="Total Items" defaultValue={String(data.checklistTotal ?? 8)} />
            </div>
          </section>

          <section>
            <p className="text-sm font-bold text-foreground">Purging Details</p>
            <div className="mt-2 grid gap-3 md:grid-cols-3">
              <Field label="Purging Date" defaultValue={data.purgingDate} />
              <Field label="Pressure" defaultValue={data.purgingPressure} />
              <Field label="Duration" defaultValue={data.purgingDuration} />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="Pipe Lengths" defaultValue={data.pipeLengths} />
              <Field label="Valve Chambers" defaultValue={data.valveChambers} />
            </div>
            <TextareaField
              label="Purging Remarks"
              defaultValue={data.purgingRemarks}
              className="mt-3"
            />
          </section>

          <section className="grid gap-3">
            <TextareaField
              label="Safety / Installation Verification"
              defaultValue={data.safetyVerification}
            />
            <TextareaField
              label="Installation Verification"
              defaultValue={data.installationVerification}
            />
            <TextareaField label="Field Observations" defaultValue={data.fieldObservation} />
            <TextareaField label="Remarks" defaultValue={data.remarks} />
          </section>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <SheetClose render={<Button type="button" />}>{actionLabel}</SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue?: string | number;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-foreground">{label}</span>
      <Input defaultValue={defaultValue ?? ""} className="h-9" />
    </label>
  );
}

function TextareaField({
  label,
  defaultValue,
  className,
}: {
  label: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-bold text-foreground">{label}</span>
      <Textarea defaultValue={defaultValue ?? ""} className="min-h-20" />
    </label>
  );
}

function StatusSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-foreground">Status</span>
      <Select defaultValue={defaultValue}>
        <SelectTrigger className="h-9 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {preCommissioningStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
