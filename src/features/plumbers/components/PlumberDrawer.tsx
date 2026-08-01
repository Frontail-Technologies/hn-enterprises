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
import { Textarea } from "@/components/ui/textarea";
import { useCreatePlumber, useUpdatePlumber } from "../hooks/usePlumbers";
import type { Plumber, PlumberFormValues } from "../types/plumber.types";

const emptyValues: PlumberFormValues = {
  name: "",
  type: "individual",
  contactNumber: "",
  status: "active",
  remarks: "",
};

export function PlumberDrawer({
  open,
  onOpenChange,
  plumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plumber?: Plumber;
}) {
  const [values, setValues] = useState<PlumberFormValues>(
    plumber
      ? {
          name: plumber.name,
          type: plumber.type,
          contactNumber: plumber.contactNumber,
          status: plumber.status,
          remarks: plumber.remarks,
        }
      : emptyValues,
  );
  const [saveError, setSaveError] = useState("");
  const createPlumber = useCreatePlumber();
  const updatePlumber = useUpdatePlumber(plumber?.id ?? "");
  const isSaving = createPlumber.isPending || updatePlumber.isPending;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(
        plumber
          ? {
              name: plumber.name,
              type: plumber.type,
              contactNumber: plumber.contactNumber,
              status: plumber.status,
              remarks: plumber.remarks,
            }
          : emptyValues,
      );
      setSaveError("");
    }
    onOpenChange(nextOpen);
  }

  async function handleSave() {
    if (!values.name.trim()) {
      setSaveError("Name is required");
      return;
    }
    setSaveError("");
    try {
      if (plumber) {
        await updatePlumber.mutateAsync(values);
      } else {
        await createPlumber.mutateAsync(values);
      }
      onOpenChange(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save plumber");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{plumber ? "Edit Plumber" : "Add Plumber"}</SheetTitle>
          <SheetDescription>
            {plumber
              ? "Update this plumber's roster details."
              : "Add an individual plumber or a named team/crew to the roster."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Name</span>
            <Input
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. Rahim Sheikh or Group A"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Type</span>
              <Select
                value={values.type}
                onValueChange={(value) => {
                  if (value) setValues((current) => ({ ...current, type: value as "individual" | "team" }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <Select
                value={values.status}
                onValueChange={(value) => {
                  if (value) setValues((current) => ({ ...current, status: value as "active" | "inactive" }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Contact Number</span>
            <Input
              value={values.contactNumber}
              onChange={(event) => setValues((current) => ({ ...current, contactNumber: event.target.value }))}
            />
          </label>

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

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Plumber"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
