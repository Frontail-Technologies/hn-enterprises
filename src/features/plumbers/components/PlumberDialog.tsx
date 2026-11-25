import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import type { Plumber, PlumberCategory, PlumberFormValues } from "../types/plumber.types";
import { categoryLabel } from "../utils/plumber-label";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { AvatarUploadField } from "@/components/shared/AvatarUploadField";

const emptyValues = (category: PlumberCategory): PlumberFormValues => ({
  name: "",
  category,
  type: "individual",
  contactNumber: "",
  avatarUrl: "",
  status: "active",
  remarks: "",
});

function valuesFromPlumber(plumber: Plumber): PlumberFormValues {
  return {
    name: plumber.name,
    category: plumber.category,
    type: plumber.type,
    contactNumber: plumber.contactNumber,
    avatarUrl: plumber.avatarUrl,
    status: plumber.status,
    remarks: plumber.remarks,
  };
}

export function PlumberDialog({
  open,
  onOpenChange,
  plumber,
  category = "plumber",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plumber?: Plumber;
  /** For a new record: plumber or labour. */
  category?: PlumberCategory;
}) {
  const kind = categoryLabel(plumber?.category ?? category);
  const schema = buildPlumberFormSchema();
  const { control, register, handleSubmit, reset, formState } = useForm<PlumberFormValues>({
    resolver: zodResolver(schema),
    defaultValues: plumber ? valuesFromPlumber(plumber) : emptyValues(category),
  });
  const watchedName = useWatch({ control, name: "name" });
  const createPlumber = useCreatePlumber();
  const updatePlumber = useUpdatePlumber(plumber?.id ?? "");
  const deletePlumber = useDeletePlumber();
  const isSaving = createPlumber.isPending || updatePlumber.isPending || formState.isSubmitting;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(plumber ? valuesFromPlumber(plumber) : emptyValues(category));
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
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-3">
          <DialogTitle>{plumber ? `Edit ${kind}` : `Add ${kind}`}</DialogTitle>
          <DialogDescription>
            {kind === "Labour" ? "A labourer or a labour team/crew." : "An individual plumber or a plumber team/crew."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <Controller
              control={control}
              name="avatarUrl"
              render={({ field }) => (
                <AvatarUploadField name={watchedName || kind} value={field.value} onChange={field.onChange} recordId={plumber?.id} />
              )}
            />
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

          <DialogFooter className="flex w-full shrink-0 flex-row items-center justify-between border-t border-border px-6 py-4 sm:justify-between">
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
                {isSaving ? "Saving..." : `Save ${kind}`}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
