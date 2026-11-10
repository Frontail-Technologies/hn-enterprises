"use client";

import Link from "next/link";
import { BuildingsIcon, HashIcon, MapPinIcon, NotePencilIcon, PhoneIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { RecordHeader } from "@/components/shared/record";
import { SectionAnchorTabs } from "@/components/shared/SectionAnchorTabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Customer } from "../../types/customer.types";

export function CustomerDetailHeader({ customer }: { customer: Customer }) {
  const connection = customer.customerConnection;
  const place = [customer.siteArea, customer.city].filter(Boolean).join(", ");

  return (
    <RecordHeader
      title={connection.customerName}
      badges={
        <>
          <StatusBadge status={connection.connectionType} />
          <StatusBadge status={customer.status} />
        </>
      }
      meta={[
        { icon: HashIcon, label: connection.trBpNo ? `TR/BP ${connection.trBpNo}` : null },
        { icon: PhoneIcon, label: connection.mobileNo },
        {
          icon: BuildingsIcon,
          label: customer.projectName ? (
            <Link href={`/projects/${customer.projectId}`} className="hover:text-foreground hover:underline">
              {customer.projectName}
            </Link>
          ) : null,
        },
        { icon: MapPinIcon, label: place },
      ]}
      actions={
        <Link href={`/customers/${customer.id}?mode=edit`} className={buttonVariants({ variant: "outline" })}>
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
