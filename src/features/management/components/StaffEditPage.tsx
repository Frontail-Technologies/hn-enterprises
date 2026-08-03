"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import type {
  Staff,
  StaffPaymentAccountType,
  StaffPayrollFormValues,
  StaffSalaryType,
  StaffUserPatchValues,
} from "../types/staff.types";
import type { UserRole, UserStatus } from "../services/users.service";
import { PageShell } from "./shared/PageShell";
import { PageLoading } from "@/components/shared/PageLoading";

const roles: UserRole[] = ["Super Admin", "Admin", "Supervisor", "Field Executive", "Viewer"];
const statuses: UserStatus[] = ["Active", "Inactive", "Suspended"];
const salaryTypes: StaffSalaryType[] = ["Monthly", "Daily Wage", "Work Basis", "Contract"];
const paymentAccountTypes: StaffPaymentAccountType[] = ["Bank Account", "UPI", "Cash", "Other"];

export function StaffEditPage({ id }: { id: string }) {
  const { data: staffMember, isLoading, isError } = useStaffMemberQuery(id);

  if (isLoading) {
    return (
      <PageShell title="Edit Staff" subtitle="Update employee and salary details.">
        <PageLoading className="min-h-24 rounded-lg border border-border/70 bg-muted/20" />
      </PageShell>
    );
  }

  if (isError || !staffMember) {
    return (
      <PageShell title="Edit Staff" subtitle="Update employee and salary details.">
        <div className="rounded-lg border border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
          Staff record not found.
        </div>
      </PageShell>
    );
  }

  return <StaffEditForm id={id} staffMember={staffMember} />;
}

function StaffEditForm({ id, staffMember }: { id: string; staffMember: Staff }) {
  const router = useRouter();
  const updateStaff = useUpdateStaff(id);
  const [payroll, setPayroll] = useState<StaffPayrollFormValues>({
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
  });
  const [userPatch, setUserPatch] = useState<StaffUserPatchValues>({
    name: staffMember.name,
    mobile: staffMember.contact,
    role: staffMember.role,
    status: staffMember.status,
  });
  const [saveError, setSaveError] = useState("");

  function setPayrollField<K extends keyof StaffPayrollFormValues>(key: K, value: StaffPayrollFormValues[K]) {
    setPayroll((current) => ({ ...current, [key]: value }));
  }

  function setUserField<K extends keyof StaffUserPatchValues>(key: K, value: StaffUserPatchValues[K]) {
    setUserPatch((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setSaveError("");
    try {
      await updateStaff.mutateAsync({ values: payroll, userPatch });
      router.push(`/staff/${id}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save staff record");
    }
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader title="Edit Staff" subtitle="Update employee, assignment and salary details." />

      <section className="rounded-lg border border-border/70 bg-card">
        <div className="border-b border-border/70 px-4 py-3">
          <p className="text-base font-semibold text-foreground">{staffMember.name}</p>
          <p className="text-sm text-muted-foreground">{staffMember.role}</p>
        </div>

        <div className="grid gap-6 p-4 lg:grid-cols-2">
          <FormSection title="Basic Details">
            <EditField label="Name" value={userPatch.name} onChange={(value) => setUserField("name", value)} />
            <EditField label="Mobile" value={userPatch.mobile} onChange={(value) => setUserField("mobile", value)} />
            <SelectField label="Role" value={userPatch.role} options={roles} onChange={(value) => setUserField("role", value as UserRole)} />
            <SelectField label="Status" value={userPatch.status} options={statuses} onChange={(value) => setUserField("status", value as UserStatus)} />
          </FormSection>

          <FormSection title="Salary Details">
            <SelectField
              label="Salary Type"
              value={payroll.salaryType}
              options={salaryTypes}
              onChange={(value) => setPayrollField("salaryType", value as StaffSalaryType)}
            />
            <EditField
              label="Monthly Salary"
              value={payroll.monthlySalary}
              onChange={(value) => setPayrollField("monthlySalary", value)}
              type="number"
            />
            <EditField
              label="Allowance"
              value={payroll.allowance}
              onChange={(value) => setPayrollField("allowance", value)}
              type="number"
            />
          </FormSection>

          <FormSection title="Bank / UPI Details">
            <SelectField
              label="Payment Type"
              value={payroll.paymentAccountType}
              options={paymentAccountTypes}
              onChange={(value) => setPayrollField("paymentAccountType", value as StaffPaymentAccountType)}
            />
            {payroll.paymentAccountType === "Bank Account" ? (
              <>
                <EditField label="Bank Name" value={payroll.bankName} onChange={(value) => setPayrollField("bankName", value)} />
                <EditField label="Account Number" value={payroll.accountNumber} onChange={(value) => setPayrollField("accountNumber", value)} />
                <EditField label="IFSC Code" value={payroll.ifscCode} onChange={(value) => setPayrollField("ifscCode", value)} />
              </>
            ) : null}
            {payroll.paymentAccountType === "UPI" ? (
              <EditField label="UPI ID" value={payroll.upiId} onChange={(value) => setPayrollField("upiId", value)} />
            ) : null}
            {payroll.paymentAccountType === "Cash" ? (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Cash payment selected. No bank or UPI details required.
              </p>
            ) : null}
          </FormSection>

          <FormSection title="Review Dates">
            <DateField label="Salary Effective From" value={payroll.salaryEffectiveFrom} onChange={(value) => setPayrollField("salaryEffectiveFrom", value)} />
            <DateField label="Last Revision Date" value={payroll.lastSalaryRevisionDate} onChange={(value) => setPayrollField("lastSalaryRevisionDate", value)} />
            <DateField label="Next Review Date" value={payroll.nextSalaryReviewDate} onChange={(value) => setPayrollField("nextSalaryReviewDate", value)} />
          </FormSection>

          <FormSection title="Notes">
            <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-start">
              <span className="text-xs font-medium text-muted-foreground">Remarks</span>
              <Textarea
                value={payroll.remarks}
                onChange={(event) => setPayrollField("remarks", event.target.value)}
                className="min-h-24"
              />
            </label>
          </FormSection>
        </div>

        {saveError ? <p className="px-4 pb-4 text-xs text-destructive">{saveError}</p> : null}
      </section>

      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-2 border-t border-border bg-card/95 px-6 py-3 shadow-sm backdrop-blur">
        <Link href="/staff" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
        <Button type="button" onClick={handleSave} disabled={updateStaff.isPending}>
          {updateStaff.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
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
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(next) => { if (next) onChange(next); }}>
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
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <DatePicker value={value} onChange={onChange} />
    </label>
  );
}
