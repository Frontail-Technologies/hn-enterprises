"use client";

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
import { STAFF_DESIGNATIONS, type Staff, type StaffPaymentAccountType, type StaffSalaryType } from "../types/staff.types";
import type { UserStatus } from "../services/users.service";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { StickyFormFooter } from "@/components/shared/StickyFormFooter";
import { PageLoading } from "@/components/shared/PageLoading";
import { AvatarUploadField } from "@/components/shared/AvatarUploadField";

const statuses: UserStatus[] = ["Active", "Inactive", "Suspended"];
const salaryTypes: StaffSalaryType[] = ["Monthly", "Daily Wage", "Work Basis", "Contract"];
const paymentAccountTypes: StaffPaymentAccountType[] = ["Bank Account", "UPI", "Cash", "Other"];

export function StaffEditPage({ id }: { id: string }) {
  const { data: staffMember, isLoading, isError } = useStaffMemberQuery(id);

  if (isLoading) {
    return (
      <PageShell title="Edit Staff">
        <PageLoading />
      </PageShell>
    );
  }

  if (isError || !staffMember) {
    return (
      <PageShell title="Edit Staff">
        <EmptyState
          illustration="error"
          title="Staff member not found"
          description="This record may have been removed, or the connection failed."
        />
      </PageShell>
    );
  }

  return <StaffEditForm id={id} staffMember={staffMember} />;
}

function defaultValuesFromStaff(staffMember: Staff): StaffEditFormValues {
  return {
    designation: staffMember.designation,
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
    avatarUrl: staffMember.avatarUrl,
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
        // A supervisor is a login account and stays a supervisor.
        designation: staffMember.hasLogin ? undefined : values.designation,
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
        avatarUrl: values.avatarUrl,
        mobile: values.mobile,
        role: values.role,
        status: values.status,
      },
    });
    router.push(`/staff/${id}`);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <PageHeader title="Edit Staff" description={`${staffMember.name} · ${staffMember.designation}`} />

      <div className="divide-y divide-border rounded-card border border-border bg-card shadow-card">
        <FormSection
          title="Basic details"
          description={staffMember.hasLogin ? "Photo, name and contact shown across the app and in the mobile app." : "Photo, name and contact. No app access."}
        >
          <AvatarField control={control} name={staffMember.name} userId={staffMember.userId || staffMember.id} />
          {staffMember.hasLogin ? (
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[13px] font-medium text-foreground">Designation</span>
              <p className="flex h-9 items-center text-sm text-muted-foreground">Supervisor</p>
            </label>
          ) : (
            <SelectField label="Designation" control={control} name="designation" options={STAFF_DESIGNATIONS.filter((item) => item !== "Supervisor")} />
          )}
          <EditField label="Name" required registration={register("name")} />
          {formState.errors.name ? <p className="self-end text-xs text-destructive">{formState.errors.name.message}</p> : null}
          <EditField label="Mobile" registration={register("mobile")} />
          <SelectField label="Status" control={control} name="status" options={statuses} />
        </FormSection>

        <FormSection title="Salary" description="Pay structure used for wages and payable days.">
          <SelectField label="Salary type" control={control} name="salaryType" options={salaryTypes} />
          <EditField label="Monthly salary" registration={register("monthlySalary")} type="number" />
          <EditField label="Allowance" registration={register("allowance")} type="number" />
        </FormSection>

        <FormSection title="Bank / UPI" description="Where salary and reimbursements are paid.">
          <SelectField label="Payment type" control={control} name="paymentAccountType" options={paymentAccountTypes} />
          {paymentAccountType === "Bank Account" ? (
            <>
              <EditField label="Bank name" registration={register("bankName")} />
              <EditField label="Account number" registration={register("accountNumber")} />
              <EditField label="IFSC code" registration={register("ifscCode")} />
            </>
          ) : null}
          {paymentAccountType === "UPI" ? <EditField label="UPI ID" registration={register("upiId")} /> : null}
          {paymentAccountType === "Cash" ? (
            <p className="self-end rounded-lg bg-muted/50 px-3 py-2 text-[13px] text-muted-foreground">
              Paid in cash — no bank or UPI details needed.
            </p>
          ) : null}
        </FormSection>

        <FormSection title="Review dates & notes" description="Salary revision history and anything worth remembering.">
          <DateField label="Salary effective from" control={control} name="salaryEffectiveFrom" />
          <DateField label="Last revision" control={control} name="lastSalaryRevisionDate" />
          <DateField label="Next review" control={control} name="nextSalaryReviewDate" />
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-[13px] font-medium text-foreground">Remarks</span>
            <Textarea {...register("remarks")} className="min-h-24" />
          </label>
        </FormSection>
      </div>

      <StickyFormFooter>
        <Link href="/staff" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
        <Button type="submit" disabled={updateStaff.isPending || formState.isSubmitting}>
          {updateStaff.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </StickyFormFooter>
    </form>
  );
}

/** One block of the single edit card: title + hint on the left, fields in two columns on the right. */
function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 p-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 lg:p-6">
      <div>
        <h2 className="text-card-title">{title}</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/** Profile photo field bound to the form (shared picker). */
function AvatarField({ control, name, userId }: { control: Control<StaffEditFormValues>; name: string; userId: string }) {
  return (
    <Controller
      control={control}
      name="avatarUrl"
      render={({ field }) => (
        <AvatarUploadField name={name} value={field.value} onChange={field.onChange} recordId={userId} className="sm:col-span-2" />
      )}
    />
  );
}

function EditField({
  label,
  registration,
  type = "text",
  required,
}: {
  label: string;
  registration: UseFormRegisterReturn;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </span>
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
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] font-medium text-foreground">{label}</span>
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
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] font-medium text-foreground">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <DatePicker value={field.value as string} onChange={field.onChange} />}
      />
    </label>
  );
}
