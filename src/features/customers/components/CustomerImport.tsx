"use client";

import Link from "next/link";
import {
  DownloadSimpleIcon,
  FileArrowDownIcon,
  FileArrowUpIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { importPreviewRows } from "../services/customers.service";
import type { ImportPreviewRow } from "../types/customer.types";
import { CustomerBreadcrumb } from "./CustomerBreadcrumb";

export function CustomerImport() {
  const validRows = importPreviewRows.filter((row) => row.status === "Valid").length;
  const errorRows = importPreviewRows.length - validRows;

  const columns: ColumnDef<ImportPreviewRow>[] = [
    { key: "rowNumber", header: "Excel Row" },
    { key: "customerName", header: "Customer Name" },
    { key: "mobileNumber", header: "Mobile Number" },
    { key: "bpTrNumber", header: "BP / TR Number" },
    { key: "project", header: "Project" },
    { key: "area", header: "Area" },
    {
      key: "status",
      header: "Validation",
      render: (row) => (
        <StatusBadge status={row.status === "Valid" ? "Approved" : "Rejected"} />
      ),
    },
    {
      key: "errors",
      header: "Errors",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.errors.length ? row.errors.join(", ") : "-"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <CustomerBreadcrumb
        items={[
          { label: "Customers", href: "/customers" },
          { label: "Import Excel" },
        ]}
      />

      <PageHeader
        title="Import Customers"
        subtitle="Upload the fixed customer master template, preview rows, and import valid data."
        actions={
          <Link
            href="/customers"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
        }
      />

      <div className="space-y-4">
        <SectionCard
          title="Upload XLSX"
          action={
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <FileArrowDownIcon size={14} />
              Download Template
            </button>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">
                Customer master XLSX
              </label>
              <Input type="file" accept=".xlsx,.xls" />
              <p className="mt-1 text-xs text-muted-foreground">
                Use the fixed customer master template to avoid rejected rows.
              </p>
            </div>
            <Button type="button">
              <UploadSimpleIcon size={15} />
              Preview Rows
            </Button>
          </div>
        </SectionCard>

        <section className="grid gap-3 md:grid-cols-3">
          <ImportStat label="Preview Rows" value={importPreviewRows.length.toString()} />
          <ImportStat label="Valid Rows" value={validRows.toString()} />
          <ImportStat label="Rows With Errors" value={errorRows.toString()} />
        </section>

        <SectionCard
          title="Preview & Validation"
          action={
            <div className="flex gap-2">
              <button
                type="button"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <DownloadSimpleIcon size={14} />
                Download Rejected Rows
              </button>
              <Button type="button" size="sm">
                <FileArrowUpIcon size={14} />
                Import Valid Rows
              </Button>
            </div>
          }
        >
          <DataTable data={importPreviewRows} columns={columns} variant="striped" />
        </SectionCard>
      </div>
    </div>
  );
}

function ImportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
