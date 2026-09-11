import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/FormField";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePlumber, useUpdatePlumber, useDeletePlumber } from "../hooks/usePlumbers";
import { buildPlumberFormSchema } from "../schemas/plumber-form.schema";
import type { Plumber, PlumberFormValues } from "../types/plumber.types";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

const emptyValues: PlumberFormValues = {
  name: "",
  type: "individual",
  contactNumber: "",
  status: "active",
  remarks: "",
};

function valuesFromPlumber(plumber: Plumber): PlumberFormValues {
  return {
    name: plumber.name,
    type: plumber.type,
    contactNumber: plumber.contactNumber,
    status: plumber.status,
    remarks: plumber.remarks,
  };
}

export function PlumberDialog({
  open,
  onOpenChange,
  plumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plumber?: Plumber;
}) {
  const schema = buildPlumberFormSchema();
  const { control, register, handleSubmit, reset, formState } = useForm<PlumberFormValues>({
    resolver: zodResolver(schema),
    defaultValues: plumber ? valuesFromPlumber(plumber) : emptyValues,
  });
  const createPlumber = useCreatePlumber();
  const updatePlumber = useUpdatePlumber(plumber?.id ?? "");
  const deletePlumber = useDeletePlumber();
  const isSaving = createPlumber.isPending || updatePlumber.isPending || formState.isSubmitting;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(plumber ? valuesFromPlumber(plumber) : emptyValues);
    }
    onOpenChange(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    if (plumber) {
      await updatePlumber.mutateAsync(values);
    } else {
      await createPlumber.mutateAsync(values);
    }
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>{plumber ? "Edit Plumber" : "Add Plumber"}</DialogTitle>
          <DialogDescription>
            {plumber
              ? "Update this plumber's roster details."
              : "Add an individual plumber or a named team/crew to the roster."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <FormField label="Name">
              <Input {...register("name")} placeholder="e.g. Rahim Sheikh or Group A" />
              {formState.errors.name ? (
                <p className="text-xs text-destructive">{formState.errors.name.message}</p>
              ) : null}
            </FormField>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Type">
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value) => { if (value) field.onChange(value); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value) => { if (value) field.onChange(value); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <FormField label="Contact Number">
              <Input {...register("contactNumber")} />
            </FormField>

            <FormField label="Remarks">
              <Textarea {...register("remarks")} className="min-h-20" />
            </FormField>
          </div>

          <DialogFooter className="mx-0 mb-0 flex w-full shrink-0 flex-row items-center justify-between rounded-b-xl border-t bg-muted/50 p-4 sm:justify-between">
            {plumber?.id ? (
              <DeleteConfirmDialog
                itemName={plumber.name}
                onConfirm={async () => {
                  await deletePlumber.mutateAsync(plumber.id);
                  onOpenChange(false);
                }}
              />
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Plumber"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
