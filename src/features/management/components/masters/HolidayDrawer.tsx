"use client";

import { useState } from "react";
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
} from "@/components/ui/sheet";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { DrawerTrigger } from "./DrawerTrigger";
import { useCreateHoliday, useUpdateHoliday } from "../../hooks/useMasters";
import type {
  Holiday,
  HolidayFormValues,
  HolidayType,
  MasterValueStatus,
} from "../../types/masters.types";

const statuses: MasterValueStatus[] = ["Active", "Inactive"];
const holidayTypes: HolidayType[] = ["National", "Restricted", "Company"];

export function HolidayDrawer({ holiday, iconOnly = false }: { holiday?: Holiday; iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HolidayFormValues>(
    holiday ? { name: holiday.name, date: holiday.date, type: holiday.type, status: holiday.status } : { name: "", date: "", type: "National", status: "Active" },
  );
  const [error, setError] = useState("");
  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday(holiday?.id ?? "");
  const isSaving = createHoliday.isPending || updateHoliday.isPending;
  const label = holiday ? "Edit" : "Add Holiday";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(holiday ? { name: holiday.name, date: holiday.date, type: holiday.type, status: holiday.status } : { name: "", date: "", type: "National", status: "Active" });
      setError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!draft.name.trim() || !draft.date) {
      setError("Name and date are required");
      return;
    }
    setError("");
    try {
      if (holiday) await updateHoliday.mutateAsync(draft);
      else await createHoliday.mutateAsync(draft);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger label={label} iconOnly={iconOnly} />
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{holiday ? "Edit Holiday" : "Add Holiday"}</SheetTitle>
          <SheetDescription>Manage national, restricted and company holidays.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <FormField label="Holiday Name">
            <Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
          </FormField>
          <FormField label="Date">
            <DatePicker value={draft.date} onChange={(date) => setDraft((current) => ({ ...current, date }))} placeholder="Select date" className="w-full" />
          </FormField>
          <FormField label="Type">
            <Select value={draft.type} onValueChange={(type) => { if (type) setDraft((current) => ({ ...current, type: type as HolidayType })); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {holidayTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={draft.status} onValueChange={(status) => { if (status) setDraft((current) => ({ ...current, status: status as MasterValueStatus })); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
