"use client";

import type { ReactNode } from "react";
import {
  DownloadSimpleIcon,
  EyeIcon,
  NotePencilIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { type ColumnDef } from "@/components/shared/DataTable";
import { DrawerShell } from "@/components/shared/DrawerShell";
import { QuickField } from "@/components/shared/QuickField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { documents } from "../data/documents.data";
import { formatDate } from "../utils/format";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

export function DocumentsPage() {
  const columns: ColumnDef<(typeof documents)[number]>[] = [
    {
      key: "name",
      header: "Document Name",
      render: (row) => <b>{row.name}</b>,
    },
    { key: "category", header: "Category" },
    { key: "module", header: "Related Module" },
    { key: "uploadedBy", header: "Uploaded By" },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: () => <IconActions preview download remove />,
    },
  ];
  return (
    <PageShell
      title="Documents"
      subtitle="Central document management for operational files."
      actions={<DocumentDrawer />}
    >
      <PaginatedDataTable data={documents} columns={columns} />
    </PageShell>
  );
}

function DocumentDrawer() {
  return (
    <DrawerShell
      title="Upload Document"
      description="Add a file to the central document register."
      triggerLabel="Upload Document"
      icon={<UploadSimpleIcon size={15} />}
    >
      <QuickField label="Document Name" />
      <QuickField
        label="Category"
        select
        options={[
          "Customer Documents",
          "Project Documents",
          "Reports",
          "Certificates",
          "Other",
        ]}
      />
      <QuickField label="Related Module" />
      <QuickField label="File" />
    </DrawerShell>
  );
}

function IconActions({
  preview,
  download,
  remove,
  edit,
}: {
  preview?: boolean;
  download?: boolean;
  remove?: boolean;
  edit?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {preview ? (
        <ActionIcon label="Preview" icon={<EyeIcon size={15} />} />
      ) : null}
      {download ? (
        <ActionIcon label="Download" icon={<DownloadSimpleIcon size={15} />} />
      ) : null}
      {edit ? (
        <ActionIcon label="Edit" icon={<NotePencilIcon size={15} />} />
      ) : null}
      {remove ? (
        <ActionIcon label="Delete" icon={<TrashIcon size={15} />} />
      ) : null}
    </div>
  );
}

function ActionIcon({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <ActionTooltip label={label}>
      <button
        type="button"
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        aria-label={label}
      >
        {icon}
      </button>
    </ActionTooltip>
  );
}
