"use client";

import { useState, type ReactNode } from "react";
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
import { staff } from "../data/staff.data";
import { PageShell } from "./shared/PageShell";

export function StaffEditPage({ id }: { id: string }) {
  const staffMember = staff.find((row) => row.id === id);
  const [paymentAccountType, setPaymentAccountType] = useState(
    staffMember?.paymentAccountType ?? "Bank Account",
  );

  if (!staffMember) {
    return (
      <PageShell
        title="Edit Staff"
        subtitle="Update employee and salary details."
      >
        <div className="rounded-lg border border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
          Staff record not found.
        </div>
      </PageShell>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Edit Staff"
        subtitle="Update employee, assignment and salary details."
      />

      <section className="rounded-lg border border-border/70 bg-card">
        <div className="border-b border-border/70 px-4 py-3">
          <p className="text-base font-semibold text-foreground">
            {staffMember.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {staffMember.role} : {staffMember.assignedProjects}
          </p>
        </div>

        <div className="grid gap-6 p-4 lg:grid-cols-2">
          <FormSection title="Basic Details">
            <EditField label="Name" defaultValue={staffMember.name} />
            <EditField label="Mobile" defaultValue={staffMember.contact} />
            <EditField
              label="Role"
              select
              defaultValue={staffMember.role}
              options={[
                "Supervisor",
                "Field Executive",
                "Plumber Team",
                "Admin",
              ]}
            />
            <EditField
              label="Status"
              select
              defaultValue={staffMember.status}
              options={["Active", "Inactive"]}
            />
          </FormSection>

          <FormSection title="Assignment">
            <EditField
              label="Assigned Projects"
              defaultValue={staffMember.assignedProjects}
            />
            <EditDateField
              label="Joining Date"
              defaultValue={staffMember.joiningDate}
            />
          </FormSection>

          <FormSection title="Salary Details">
            <EditField
              label="Salary Type"
              select
              defaultValue={staffMember.salaryType}
              options={["Monthly", "Daily Wage", "Work Basis", "Contract"]}
            />
            <EditField
              label="Monthly Salary"
              defaultValue={staffMember.monthlySalary}
            />
          </FormSection>

          <FormSection title="Bank / UPI Details">
            <EditField
              label="Payment Type"
              select
              defaultValue={paymentAccountType}
              options={["Bank Account", "UPI", "Cash", "Other"]}
              onValueChange={setPaymentAccountType}
            />
            {paymentAccountType === "Bank Account" ? (
              <>
                <EditField
                  label="Bank Type"
                  select
                  defaultValue={staffMember.bankType}
                  options={[
                    "Savings",
                    "Current",
                    "Salary Account",
                    "Jan Dhan",
                    "Other",
                  ]}
                />
                <EditField
                  label="Bank Name"
                  defaultValue={staffMember.bankName}
                />
                <EditField
                  label="Account Number"
                  defaultValue={staffMember.accountNumber}
                />
                <EditField
                  label="IFSC Code"
                  defaultValue={staffMember.ifscCode}
                />
              </>
            ) : null}
            {paymentAccountType === "UPI" ? (
              <>
                <EditField
                  label="UPI Type"
                  select
                  defaultValue={staffMember.upiType}
                  options={[
                    "Personal UPI",
                    "Team UPI",
                    "Business UPI",
                    "PhonePe",
                    "Google Pay",
                    "Paytm",
                    "Other",
                  ]}
                />
                <EditField label="UPI ID" defaultValue={staffMember.upiId} />
              </>
            ) : null}
            {paymentAccountType === "Cash" ? (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Cash payment selected. No bank or UPI details required.
              </p>
            ) : null}
          </FormSection>

          <FormSection title="Notes">
            <EditField
              label="Remarks"
              textarea
              defaultValue="Salary and assignment details can be updated after approval."
            />
          </FormSection>
        </div>
      </section>

      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-2 border-t border-border bg-card/95 px-6 py-3 shadow-sm backdrop-blur">
        <Link href="/staff" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
        <Button type="button">Save Changes</Button>
      </div>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
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
  defaultValue = "",
  select,
  textarea,
  options = [],
  onValueChange,
}: {
  label: string;
  defaultValue?: string;
  select?: boolean;
  textarea?: boolean;
  options?: string[];
  onValueChange?: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {select ? (
        <Select
          defaultValue={defaultValue || options[0]}
          onValueChange={(value) => {
            if (value) onValueChange?.(value);
          }}
        >
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
      ) : textarea ? (
        <Textarea defaultValue={defaultValue} className="min-h-24" />
      ) : (
        <Input defaultValue={defaultValue} />
      )}
    </label>
  );
}

function EditDateField({
  label,
  defaultValue = "",
}: {
  label: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <DatePicker value={value} onChange={setValue} />
    </label>
  );
}
