import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { PlusIcon } from "@phosphor-icons/react";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateStaff } from "../hooks/useStaff";
import { buildStaffFormSchema } from "../schemas/staff-form.schema";
import type { CreateStaffFormValues } from "../types/staff.types";
import type { User } from "../services/users.service";

const salaryTypes: CreateStaffFormValues["salaryType"][] = ["Monthly", "Daily Wage", "Work Basis", "Contract"];
const paymentAccountTypes: CreateStaffFormValues["paymentAccountType"][] = ["Bank Account", "UPI", "Cash", "Other"];

function emptyValues(): CreateStaffFormValues {
  return {
    mode: "new",
    userId: "",
    newUser: { name: "", email: "", username: "", mobile: "", role: "Supervisor", password: "" },
    assignedProjectId: "",
    salaryType: "Monthly",
    monthlySalary: "",
    allowance: "",
    paymentAccountType: "Bank Account",
    bankType: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    upiType: "",
    upiId: "",
    salaryEffectiveFrom: "",
    lastSalaryRevisionDate: "",
    nextSalaryReviewDate: "",
    remarks: "",
  };
}

export function StaffDrawer({ users, staffedUserIds }: { users: User[]; staffedUserIds: Set<string> }) {
  const [open, setOpen] = useState(false);
  const schema = buildStaffFormSchema();
  const { control, register, handleSubmit, reset, formState } = useForm<CreateStaffFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });
  const createStaff = useCreateStaff();
  const availableUsers = users.filter((user) => !staffedUserIds.has(user.id) && user.role === "Supervisor");
  const mode = useWatch({ control, name: "mode" });
  const paymentAccountType = useWatch({ control, name: "paymentAccountType" });

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(emptyValues());
    }
    setOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    await createStaff.mutateAsync(values);
    setOpen(false);
  });

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button type="button" size="compact" />}>
        <PlusIcon size={13} />
        Add Supervisor
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Add Supervisor</SheetTitle>
          <SheetDescription>
            Link an existing supervisor login or create a new one — payroll details attach to that account.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            <FormField label="Account">
              <Controller
                control={control}
                name="mode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(value) => { if (value) field.onChange(value); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Create new user</SelectItem>
                      <SelectItem value="existing">Link existing user</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {mode === "existing" ? (
              <FormField label="User">
                <Controller
                  control={control}
                  name="userId"
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value || undefined}
                      onValueChange={(userId) => field.onChange(userId ?? "")}
                      placeholder="Select a user without a staff record"
                      options={availableUsers.map((user) => ({ value: user.id, label: `${user.name} (${user.role})` }))}
                      className="w-full"
                    />
                  )}
                />
                {formState.errors.userId ? (
                  <p className="text-xs text-destructive">{formState.errors.userId.message}</p>
                ) : null}
              </FormField>
            ) : (
              <>
                <FormField label="Name">
                  <Input {...register("newUser.name")} />
                  {formState.errors.newUser?.name ? (
                    <p className="text-xs text-destructive">{formState.errors.newUser.name.message}</p>
                  ) : null}
                </FormField>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Username">
                    <Input {...register("newUser.username")} />
                    {formState.errors.newUser?.username ? (
                      <p className="text-xs text-destructive">{formState.errors.newUser.username.message}</p>
                    ) : null}
                  </FormField>
                  <FormField label="Email">
                    <Input type="email" {...register("newUser.email")} />
                    {formState.errors.newUser?.email ? (
                      <p className="text-xs text-destructive">{formState.errors.newUser.email.message}</p>
                    ) : null}
                  </FormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Mobile">
                    <Input {...register("newUser.mobile")} />
                  </FormField>
                  <FormField label="Role">
                    <p className="flex h-9 items-center text-sm text-muted-foreground">Supervisor</p>
                  </FormField>
                </div>
                <FormField label="Initial Password">
                  <Input type="password" {...register("newUser.password")} />
                  {formState.errors.newUser?.password ? (
                    <p className="text-xs text-destructive">{formState.errors.newUser.password.message}</p>
                  ) : null}
                </FormField>
              </>
            )}

            <FormField label="Salary Type">
              <Controller
                control={control}
                name="salaryType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(value) => { if (value) field.onChange(value); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Monthly Salary">
                <Input type="number" {...register("monthlySalary")} />
              </FormField>
              <FormField label="Allowance">
                <Input type="number" {...register("allowance")} />
              </FormField>
            </div>

            <FormField label="Payment Type">
              <Controller
                control={control}
                name="paymentAccountType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(value) => { if (value) field.onChange(value); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentAccountTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {paymentAccountType === "Bank Account" ? (
              <>
                <FormField label="Bank Name">
                  <Input {...register("bankName")} />
                </FormField>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Account Number">
                    <Input {...register("accountNumber")} />
                  </FormField>
                  <FormField label="IFSC Code">
                    <Input {...register("ifscCode")} />
                  </FormField>
                </div>
              </>
            ) : null}

            {paymentAccountType === "UPI" ? (
              <FormField label="UPI ID">
                <Input {...register("upiId")} />
              </FormField>
            ) : null}
          </div>

          <SheetFooter className="border-t border-border/70">
            <div className="flex items-center justify-end gap-2">
              <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
              <Button type="submit" disabled={createStaff.isPending || formState.isSubmitting}>
                {createStaff.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
