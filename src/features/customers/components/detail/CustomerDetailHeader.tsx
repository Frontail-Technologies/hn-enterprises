"use client";

import Link from "next/link";
import { NotePencilIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { InfoRow } from "@/components/shared/InfoRow";
import { SectionAnchorTabs } from "@/components/shared/SectionAnchorTabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Customer } from "../../types/customer.types";

export function CustomerDetailHeader({ customer }: { customer: Customer }) {
  const connection = customer.customerConnection;

  return (
    <DetailHeader
      title={connection.customerName}
      badges={
        <>
          <StatusBadge status={connection.connectionType} />
          <StatusBadge status={customer.status} />
        </>
      }
      meta={
        <>
          <InfoRow label="TR/BP No." value={connection.trBpNo} />
          <InfoRow label="Mobile" value={connection.mobileNo} />
          <InfoRow label="Connection" value={connection.connectionType} />
        </>
      }
      actions={
        <Link
          href={`/customers/${customer.id}?mode=edit`}
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          <NotePencilIcon size={15} />
          Edit
        </Link>
      }
    />
  );
}

export function CustomerSectionNav({ items }: { items: { href: string; label: string }[] }) {
  return <SectionAnchorTabs items={items} />;
}
