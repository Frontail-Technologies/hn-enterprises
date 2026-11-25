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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateStaff } from "../hooks/useStaff";
import { buildStaffFormSchema } from "../schemas/staff-form.schema";
import { STAFF_DESIGNATIONS, type CreateStaffFormValues } from "../types/staff.types";
import type { User } from "../services/users.service";

const salaryTypes: CreateStaffFormValues["salaryType"][] = ["Monthly", "Daily Wage", "Work Basis", "Contract"];
const paymentAccountTypes: CreateStaffFormValues["paymentAccountType"][] = ["Bank Account", "UPI", "Cash", "Other"];

function emptyValues(): CreateStaffFormValues {
  return {
    designation: "Supervisor",
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

/** "Add Staff" dialog. */
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
  const designation = useWatch({ control, name: "designation" });
  const isSupervisor = designation === "Supervisor";
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" size="compact" />}>
        <PlusIcon size={13} />
        Add Staff
      </DialogTrigger>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-3">
          <DialogTitle>Add Staff</DialogTitle>
          <DialogDescription>
            {isSupervisor
              ? "Supervisors get a login for the mobile app: link an existing one or create a new one."
              : `${designation}s have no app access, only their details and salary are kept.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="grid flex-1 content-start gap-4 overflow-y-auto px-6 py-4 sm:grid-cols-2">
            <FormField label="Designation" required className="sm:col-span-2">
              <Controller
                control={control}
                name="designation"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(value) => { if (value) field.onChange(value); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_DESIGNATIONS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {!isSupervisor ? (
              <>
                <FormField label="Name" required>
                  <Input {...register("newUser.name")} />
                  {formState.errors.newUser?.name ? (
                    <p className="text-xs text-destructive">{formState.errors.newUser.name.message}</p>
                  ) : null}
                </FormField>
                <FormField label="Mobile">
                  <Input {...register("newUser.mobile")} />
                </FormField>
              </>
            ) : null}

            {isSupervisor ? (
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
            ) : null}

            {!isSupervisor ? null : mode === "existing" ? (
              <FormField label="User" required>
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
                <FormField label="Name" required>
                  <Input {...register("newUser.name")} />
                  {formState.errors.newUser?.name ? (
                    <p className="text-xs text-destructive">{formState.errors.newUser.name.message}</p>
                  ) : null}
                </FormField>
                  <FormField label="Username" required>
                    <Input {...register("newUser.username")} />
                    {formState.errors.newUser?.username ? (
                      <p className="text-xs text-destructive">{formState.errors.newUser.username.message}</p>
                    ) : null}
                  </FormField>
                  <FormField label="Email" required>
                    <Input type="email" {...register("newUser.email")} />
                    {formState.errors.newUser?.email ? (
                      <p className="text-xs text-destructive">{formState.errors.newUser.email.message}</p>
                    ) : null}
                  </FormField>
                  <FormField label="Mobile">
                    <Input {...register("newUser.mobile")} />
                  </FormField>
                  <FormField label="Role">
                    <p className="flex h-9 items-center text-sm text-muted-foreground">Supervisor</p>
                  </FormField>
                <FormField label="Initial Password" required className="sm:col-span-2">
                  <Input type="password" {...register("newUser.password")} />
                  {formState.errors.newUser?.password ? (
                    <p className="text-xs text-destructive">{formState.errors.newUser.password.message}</p>
                  ) : null}
                </FormField>
              </>
            )}

            <FormField label="Salary Type" className="sm:col-span-2">
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

              <FormField label="Monthly Salary">
                <Input type="number" {...register("monthlySalary")} />
              </FormField>
              <FormField label="Allowance">
                <Input type="number" {...register("allowance")} />
              </FormField>

            <FormField label="Payment Type" className="sm:col-span-2">
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
                <FormField label="Bank Name" className="sm:col-span-2">
                  <Input {...register("bankName")} />
                </FormField>
                  <FormField label="Account Number">
                    <Input {...register("accountNumber")} />
                  </FormField>
                  <FormField label="IFSC Code">
                    <Input {...register("ifscCode")} />
                  </FormField>
              </>
            ) : null}

            {paymentAccountType === "UPI" ? (
              <FormField label="UPI ID" className="sm:col-span-2">
                <Input {...register("upiId")} />
              </FormField>
            ) : null}
          </div>

          <DialogFooter className="flex w-full shrink-0 flex-row items-center justify-end border-t border-border px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={createStaff.isPending || formState.isSubmitting}>
                {createStaff.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
