"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { NotePencilIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateUser, useResetUserPassword, useUpdateUser, useDeleteUser } from "../hooks/useUsers";
import { buildUserFormSchema, type UserFormValues } from "../schemas/user-form.schema";
import type { User, UserRole, UserStatus } from "../services/users.service";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

const roles: UserRole[] = ["Super Admin", "Supervisor"];
const statuses: UserStatus[] = ["Active", "Inactive", "Suspended"];

function emptyValues(): UserFormValues {
  return { name: "", username: "", email: "", mobile: "", role: "Supervisor", status: "Active", password: "", newPassword: "" };
}

function valuesFromUser(user: User): UserFormValues {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
    password: "",
    newPassword: "",
  };
}

export function UserDialog({
  user,
  iconOnly = false,
}: {
  user?: User;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const schema = buildUserFormSchema(user ? "edit" : "create");
  const { control, register, handleSubmit, reset, formState } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: user ? valuesFromUser(user) : emptyValues(),
  });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id ?? "");
  const resetPassword = useResetUserPassword(user?.id ?? "");
  const deleteUser = useDeleteUser();
  const isSaving = createUser.isPending || updateUser.isPending || resetPassword.isPending || formState.isSubmitting;
  const label = user ? "Edit User" : "Add User";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(user ? valuesFromUser(user) : emptyValues());
    }
    setOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    if (user) {
      await updateUser.mutateAsync({
        name: values.name,
        username: values.username,
        email: values.email,
        mobile: values.mobile,
        role: values.role,
        status: values.status,
      });
      if (values.newPassword) await resetPassword.mutateAsync(values.newPassword);
    } else {
      await createUser.mutateAsync({
        name: values.name,
        username: values.username,
        email: values.email,
        mobile: values.mobile,
        role: values.role,
        status: values.status,
        password: values.password,
      });
    }
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {iconOnly ? (
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
            <NotePencilIcon size={15} />
          </DialogTrigger>
        </ActionTooltip>
      ) : (
        <DialogTrigger render={<Button type="button" size="compact" />}>
          <PlusIcon size={13} />
          {label}
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            {user ? "Update access, role or reset the password." : "Create a real login with an initial password."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <FormField label="Name">
              <Input {...register("name")} />
              {formState.errors.name ? <p className="text-xs text-destructive">{formState.errors.name.message}</p> : null}
            </FormField>
            <FormField label="Mobile">
              <Input {...register("mobile")} />
            </FormField>
            <FormField label="Username">
              <Input {...register("username")} disabled={Boolean(user)} />
              {formState.errors.username ? <p className="text-xs text-destructive">{formState.errors.username.message}</p> : null}
            </FormField>
            <FormField label="Email">
              <Input type="email" {...register("email")} disabled={Boolean(user)} />
              {formState.errors.email ? <p className="text-xs text-destructive">{formState.errors.email.message}</p> : null}
            </FormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Role">
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(role) => { if (role) field.onChange(role); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
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
                    <Select value={field.value} onValueChange={(status) => { if (status) field.onChange(status); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            {user ? (
              <div className="rounded-lg border border-border/70 bg-surface-muted/35 p-3">
                <p className="text-sm font-semibold text-foreground">Reset Password</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Leave blank if you do not want to change it.
                </p>
                <div className="mt-3">
                  <Input type="password" placeholder="New password" {...register("newPassword")} />
                </div>
              </div>
            ) : (
              <FormField label="Password">
                <Input type="password" {...register("password")} />
                {formState.errors.password ? (
                  <p className="text-xs text-destructive">{formState.errors.password.message}</p>
                ) : null}
              </FormField>
            )}
          </div>

          <DialogFooter className="mx-0 mb-0 flex w-full shrink-0 flex-row items-center justify-between rounded-b-xl border-t bg-muted/50 p-4 sm:justify-between">
            {user?.id ? (
              <DeleteConfirmDialog
                itemName={user.name}
                isOpen={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Delete ${user.name}`}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <TrashIcon size={13} />
                  </Button>
                }
                isConfirming={deleteUser.isPending}
                onConfirm={() => {
                  // Controlled + isConfirming mode (§ DeleteConfirmDialog):
                  // the confirm button no longer auto-closes on click, so
                  // this only ever fires once, and only closes either dialog
                  // once the delete has actually succeeded. On failure,
                  // useDeleteUser's own onError shows the toast, both dialogs
                  // stay open, and the form/data is untouched.
                  if (deleteUser.isPending) return;
                  deleteUser.mutate(user.id, {
                    onSuccess: () => {
                      setDeleteConfirmOpen(false);
                      setOpen(false);
                    },
                  });
                }}
              />
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
