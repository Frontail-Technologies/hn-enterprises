"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch, type Control, type UseFormRegisterReturn } from "react-hook-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/shared/DatePicker";
import { PageHeader } from "@/components/shared/PageHeader";
import { useStaffMemberQuery, useUpdateStaff } from "../hooks/useStaff";
import { buildStaffEditFormSchema, type StaffEditFormValues } from "../schemas/staff-edit-form.schema";
import type { Staff, StaffPaymentAccountType, StaffSalaryType } from "../types/staff.types";
import type { UserStatus } from "../services/users.service";
import { PageShell } from "@/components/shared/PageShell";
import { PageLoading } from "@/components/shared/PageLoading";

const statuses: UserStatus[] = ["Active", "Inactive", "Suspended"];
const salaryTypes: StaffSalaryType[] = ["Monthly", "Daily Wage", "Work Basis", "Contract"];
const paymentAccountTypes: StaffPaymentAccountType[] = ["Bank Account", "UPI", "Cash", "Other"];

export function StaffEditPage({ id }: { id: string }) {
  const { data: staffMember, isLoading, isError } = useStaffMemberQuery(id);

  if (isLoading) {
    return (
      <PageShell
        title="Edit Supervisor"
        contentClassName="space-y-3 rounded-card border border-border bg-card p-4"
      >
        <PageLoading className="min-h-24 rounded-lg border border-border/70 bg-muted/20" />
      </PageShell>
    );
  }

  if (isError || !staffMember) {
    return (
      <PageShell
        title="Edit Supervisor"
        contentClassName="space-y-3 rounded-card border border-border bg-card p-4"
      >
        <div className="rounded-lg border border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
          Supervisor record not found.
        </div>
      </PageShell>
    );
  }

  return <StaffEditForm id={id} staffMember={staffMember} />;
}

function defaultValuesFromStaff(staffMember: Staff): StaffEditFormValues {
  return {
    name: staffMember.name,
    mobile: staffMember.contact,
    role: staffMember.role,
    status: staffMember.status,
    assignedProjectId: staffMember.assignedProjectId,
    salaryType: staffMember.salaryType,
    monthlySalary: staffMember.monthlySalary,
    allowance: staffMember.allowance,
    paymentAccountType: staffMember.paymentAccountType,
    bankType: staffMember.bankType,
    bankName: staffMember.bankName,
    accountHolderName: staffMember.accountHolderName,
    accountNumber: staffMember.accountNumber,
    ifscCode: staffMember.ifscCode,
    upiType: staffMember.upiType,
    upiId: staffMember.upiId,
    salaryEffectiveFrom: staffMember.salaryEffectiveFrom,
    lastSalaryRevisionDate: staffMember.lastSalaryRevisionDate,
    nextSalaryReviewDate: staffMember.nextSalaryReviewDate,
    remarks: staffMember.remarks,
  };
}

function StaffEditForm({ id, staffMember }: { id: string; staffMember: Staff }) {
  const router = useRouter();
  const updateStaff = useUpdateStaff(id);
  const schema = buildStaffEditFormSchema();
  const { control, register, handleSubmit, formState } = useForm<StaffEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValuesFromStaff(staffMember),
  });
  const paymentAccountType = useWatch({ control, name: "paymentAccountType" });

  const onSubmit = handleSubmit(async (values) => {
    await updateStaff.mutateAsync({
      values: {
        assignedProjectId: values.assignedProjectId,
        salaryType: values.salaryType,
        monthlySalary: values.monthlySalary,
        allowance: values.allowance,
        paymentAccountType: values.paymentAccountType,
        bankType: values.bankType,
        bankName: values.bankName,
        accountHolderName: values.accountHolderName,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode,
        upiType: values.upiType,
        upiId: values.upiId,
        salaryEffectiveFrom: values.salaryEffectiveFrom,
        lastSalaryRevisionDate: values.lastSalaryRevisionDate,
        nextSalaryReviewDate: values.nextSalaryReviewDate,
        remarks: values.remarks,
      },
      userPatch: {
        name: values.name,
        mobile: values.mobile,
        role: values.role,
        status: values.status,
      },
    });
    router.push(`/staff/${id}`);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-20">
      <PageHeader title="Edit Supervisor" />

      <section className="rounded-lg border border-border/70 bg-card">
        <div className="border-b border-border/70 px-4 py-3">
          <p className="text-base font-semibold text-foreground">{staffMember.name}</p>
          <p className="text-sm text-muted-foreground">{staffMember.role}</p>
        </div>

        <div className="grid gap-6 p-4 lg:grid-cols-2">
          <FormSection title="Basic Details">
            <EditField label="Name" registration={register("name")} />
            <EditField label="Mobile" registration={register("mobile")} />
            <SelectField label="Status" control={control} name="status" options={statuses} />
          </FormSection>

          <FormSection title="Salary Details">
            <SelectField label="Salary Type" control={control} name="salaryType" options={salaryTypes} />
            <EditField label="Monthly Salary" registration={register("monthlySalary")} type="number" />
            <EditField label="Allowance" registration={register("allowance")} type="number" />
          </FormSection>

          <FormSection title="Bank / UPI Details">
            <SelectField label="Payment Type" control={control} name="paymentAccountType" options={paymentAccountTypes} />
            {paymentAccountType === "Bank Account" ? (
              <>
                <EditField label="Bank Name" registration={register("bankName")} />
                <EditField label="Account Number" registration={register("accountNumber")} />
                <EditField label="IFSC Code" registration={register("ifscCode")} />
              </>
            ) : null}
            {paymentAccountType === "UPI" ? <EditField label="UPI ID" registration={register("upiId")} /> : null}
            {paymentAccountType === "Cash" ? (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Cash payment selected. No bank or UPI details required.
              </p>
            ) : null}
          </FormSection>

          <FormSection title="Review Dates">
            <DateField label="Salary Effective From" control={control} name="salaryEffectiveFrom" />
            <DateField label="Last Revision Date" control={control} name="lastSalaryRevisionDate" />
            <DateField label="Next Review Date" control={control} name="nextSalaryReviewDate" />
          </FormSection>

          <FormSection title="Notes">
            <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-start">
              <span className="text-xs font-medium text-muted-foreground">Remarks</span>
              <Textarea {...register("remarks")} className="min-h-24" />
            </label>
          </FormSection>
        </div>
      </section>

      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-2 border-t border-border bg-card/95 px-6 py-3 shadow-sm backdrop-blur">
        <Link href="/staff" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
        <Button type="submit" disabled={updateStaff.isPending || formState.isSubmitting}>
          {updateStaff.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="border-b border-border/70 pb-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function EditField({
  label,
  registration,
  type = "text",
}: {
  label: string;
  registration: UseFormRegisterReturn;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input type={type} {...registration} />
    </label>
  );
}

function SelectField<Name extends keyof StaffEditFormValues & string>({
  label,
  control,
  name,
  options,
}: {
  label: string;
  control: Control<StaffEditFormValues>;
  name: Name;
  options: readonly string[];
}) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value as string} onValueChange={(next) => { if (next) field.onChange(next); }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </label>
  );
}

function DateField<Name extends keyof StaffEditFormValues & string>({
  label,
  control,
  name,
}: {
  label: string;
  control: Control<StaffEditFormValues>;
  name: Name;
}) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <DatePicker value={field.value as string} onChange={field.onChange} />}
      />
    </label>
  );
}
