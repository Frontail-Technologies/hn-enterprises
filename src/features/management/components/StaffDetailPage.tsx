"use client";

import Link from "next/link";
import { NotePencilIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime } from "../utils/format";
import { staff } from "../data/staff.data";
import { PageShell } from "./shared/PageShell";

export function StaffDetailPage({ id }: { id: string }) {
  const staffMember = staff.find((row) => row.id === id);

  if (!staffMember) {
    return (
      <PageShell title="Staff Details" subtitle="View employee and payment details.">
        <div className="rounded-md bg-muted/30 p-6 text-sm text-muted-foreground">
          Staff record not found.
        </div>
      </PageShell>
    );
  }

  const isBankAccount = staffMember.paymentAccountType === "Bank Account";
  const isUpi = staffMember.paymentAccountType === "UPI";

  return (
    <PageShell
      title={staffMember.name}
      subtitle={`${staffMember.role} : ${staffMember.assignedProjects}`}
      actions={
        <Link
          href={`/staff/${staffMember.id}/edit`}
          className={buttonVariants({ variant: "default" })}
        >
          <NotePencilIcon size={15} />
          Edit Staff
        </Link>
      }
    >
      <div className="space-y-4">
        <section className="rounded-md border border-border/70 bg-background p-4">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Staff Information</h2>
              <p className="text-xs text-muted-foreground">Core profile and assignment details.</p>
            </div>
            <StatusBadge status={staffMember.status} />
          </div>
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Name", value: staffMember.name },
              { label: "Role", value: staffMember.role },
              { label: "Mobile", value: staffMember.contact },
              { label: "Assigned Projects", value: staffMember.assignedProjects },
              { label: "Joining Date", value: formatDate(staffMember.joiningDate) },
              { label: "Last Active", value: formatDateTime(staffMember.lastActive) },
            ]}
          />
        </section>

        <section className="rounded-md border border-border/70 bg-background p-4">
          <div className="mb-3 border-b border-border/70 pb-3">
            <h2 className="text-base font-semibold text-foreground">Salary Details</h2>
            <p className="text-xs text-muted-foreground">Important pay structure fields.</p>
          </div>
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Salary Type", value: staffMember.salaryType },
              { label: "Monthly Salary", value: formatAmount(staffMember.monthlySalary) },
              { label: "Payment Type", value: staffMember.paymentAccountType },
              { label: "Last Revision", value: formatDate(staffMember.lastSalaryRevisionDate) },
            ]}
          />
        </section>

        <section className="rounded-md border border-border/70 bg-background p-4">
          <div className="mb-3 border-b border-border/70 pb-3">
            <h2 className="text-base font-semibold text-foreground">Bank / UPI Details</h2>
            <p className="text-xs text-muted-foreground">Payment destination for salary and reimbursements.</p>
          </div>
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Account Holder", value: staffMember.accountHolderName },
              isBankAccount
                ? { label: "Bank Type", value: staffMember.bankType }
                : { label: "UPI Type", value: isUpi ? staffMember.upiType : "-" },
              isBankAccount
                ? { label: "Bank Name", value: staffMember.bankName }
                : { label: "UPI ID", value: isUpi ? staffMember.upiId : "-" },
              isBankAccount
                ? { label: "Account Number", value: staffMember.accountNumber }
                : { label: "Account Number", value: "-" },
              isBankAccount
                ? { label: "IFSC Code", value: staffMember.ifscCode }
                : { label: "IFSC Code", value: "-" },
            ]}
          />
        </section>

        <div className="flex justify-end">
          <Link href="/staff">
            <Button variant="outline">Back to Staff</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

function formatAmount(value: string) {
  const amount = Number(value);
  if (!amount) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}