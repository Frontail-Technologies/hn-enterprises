"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtIcon, EnvelopeSimpleIcon, IdentificationBadgeIcon, NotePencilIcon, PhoneIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoading } from "@/components/shared/PageLoading";
import { DetailRows, RecordHeader, RecordLayout } from "@/components/shared/record";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime } from "../utils/format";
import { useStaffMemberQuery } from "../hooks/useStaff";
import { UserAvatar } from "@/components/shared/UserAvatar";

export function StaffDetailPage({ id }: { id: string }) {
  const { data: staffMember, isLoading, isError } = useStaffMemberQuery(id);
  useBreadcrumbLabel(id, staffMember?.name);
  const router = useRouter();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !staffMember) {
    return (
      <EmptyState
        illustration="error"
        title="Staff member not found"
        description="This record may have been removed, or the connection failed."
        action={{ label: "Back to staff", onClick: () => router.push("/staff") }}
      />
    );
  }

  const isBankAccount = staffMember.paymentAccountType === "Bank Account";
  const isUpi = staffMember.paymentAccountType === "UPI";

  return (
    <div className="flex flex-col gap-5">
      <RecordHeader
        leading={<UserAvatar name={staffMember.name} src={staffMember.avatarUrl} size="lg" />}
        title={staffMember.name}
        badges={<StatusBadge status={staffMember.status} />}
        meta={[
          { icon: IdentificationBadgeIcon, label: staffMember.designation },
          ...(staffMember.hasLogin ? [{ icon: AtIcon, label: staffMember.username }] : []),
          ...(staffMember.contact ? [{ icon: PhoneIcon, label: staffMember.contact }] : []),
          ...(staffMember.hasLogin ? [{ icon: EnvelopeSimpleIcon, label: staffMember.email }] : []),
        ]}
        actions={
          <>
            <Link href={`/staff/${staffMember.id}/edit`} className={buttonVariants({ variant: "default" })}>
              <NotePencilIcon size={15} />
              Edit
            </Link>
          </>
        }
      />

      <RecordLayout
        rail={
          <SectionCard title="Account">
            <DetailRows
              rows={staffMember.hasLogin ? [
                { label: "Designation", value: staffMember.designation },
                // Their login role is "supervisor" (mobile app, own projects only); show the job title instead.
                { label: "App access", value: staffMember.role === "Supervisor" ? "Mobile app" : staffMember.role },
                { label: "Username", value: staffMember.username },
                { label: "Mobile", value: staffMember.contact },
                { label: "Email", value: staffMember.email },
                { label: "Last login", value: staffMember.lastLogin ? formatDateTime(staffMember.lastLogin) : "Never" },
                { label: "Status", value: <StatusBadge status={staffMember.status} /> },
              ] : [
                { label: "Designation", value: staffMember.designation },
                { label: "Mobile", value: staffMember.contact || "-" },
                { label: "App access", value: "None" },
                { label: "Status", value: <StatusBadge status={staffMember.status} /> },
              ]}
            />
          </SectionCard>
        }
      >
        <SectionCard title="Salary details" description="Pay structure and review dates.">
          <DetailRows
            rows={[
              { label: "Salary type", value: staffMember.salaryType },
              { label: "Monthly salary", value: formatAmount(staffMember.monthlySalary) },
              { label: "Allowance", value: formatAmount(staffMember.allowance) },
              { label: "Payment type", value: staffMember.paymentAccountType },
              { label: "Last revision", value: staffMember.lastSalaryRevisionDate ? formatDate(staffMember.lastSalaryRevisionDate) : "-" },
              { label: "Next review", value: staffMember.nextSalaryReviewDate ? formatDate(staffMember.nextSalaryReviewDate) : "-" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Bank / UPI details" description="Payment destination for salary and reimbursements.">
          <DetailRows
            rows={[
              { label: "Account holder", value: staffMember.accountHolderName || "-" },
              isBankAccount
                ? { label: "Bank type", value: staffMember.bankType || "-" }
                : { label: "UPI type", value: isUpi ? staffMember.upiType || "-" : "-" },
              isBankAccount
                ? { label: "Bank name", value: staffMember.bankName || "-" }
                : { label: "UPI ID", value: isUpi ? staffMember.upiId || "-" : "-" },
              { label: "Account number", value: isBankAccount ? staffMember.accountNumber || "-" : "-" },
              { label: "IFSC code", value: isBankAccount ? staffMember.ifscCode || "-" : "-" },
            ]}
          />
        </SectionCard>
      </RecordLayout>
    </div>
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
