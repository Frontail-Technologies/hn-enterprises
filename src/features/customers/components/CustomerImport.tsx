"use client";

import type { ColumnDef } from "@/components/shared/DataTable";
import { ImportDataPage } from "@/components/shared/ImportDataPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { customerImportFields } from "../services/customer-import.config";
import { importPreviewRows } from "../services/customers.service";
import type { ImportPreviewRow } from "../types/customer.types";

export function CustomerImport() {
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
    <ImportDataPage
      title="Import Customers"
      moduleName="Customer Master"
      description="Drag and drop an Excel or CSV file here. This full-page import view gives enough room to verify template fields and preview row errors before import."
      backHref="/customers"
      backLabel="Back to Customers"
      fields={customerImportFields}
      previewRows={importPreviewRows}
      previewColumns={columns}
      getRowStatus={(row) => (row.status === "Valid" ? "valid" : "error")}
      emptyTitle="No customer rows previewed"
    />
  );
}
