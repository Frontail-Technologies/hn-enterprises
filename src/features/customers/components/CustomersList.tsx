"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DownloadSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageShell } from "@/components/shared/PageShell";
import { TablePanel } from "@/components/shared/TablePanel";
import { exportRowsToExcel } from "@/lib/export-excel";
import {
  buildCustomerMasterSheetColumns,
  getCustomerMasterSheetRows,
  type CustomerMasterSheetRow,
} from "../services/customers.service";
import { useCustomersQuery } from "../hooks/useCustomers";
import { useCustomFieldsQuery } from "@/features/management/hooks/useMasters";

export function CustomersList() {
  const router = useRouter();
  const [masterSheetSearch, setMasterSheetSearch] = useState("");
  const { data: customers = [], isLoading } = useCustomersQuery();
  const { data: activeCustomFields = [] } = useCustomFieldsQuery("Active");
  const realCustomerIds = useMemo(() => new Set(customers.map((customer) => customer.id)), [customers]);

  const masterSheetRows = useMemo(() => getCustomerMasterSheetRows(customers), [customers]);

  const masterSheetColumns: ExcelColumn<CustomerMasterSheetRow>[] = useMemo(
    () =>
      buildCustomerMasterSheetColumns(activeCustomFields).map((column) => ({
        ...column,
        getValue: (row) => row.values[column.key],
      })),
    [activeCustomFields],
  );

  const filteredMasterSheetRows = useMemo(() => {
    const search = masterSheetSearch.trim().toLowerCase();
    if (!search) return masterSheetRows;

    return masterSheetRows.filter((row) =>
      masterSheetColumns.some((column) => {
        const value = column.getValue(row);
        return String(value ?? "").toLowerCase().includes(search);
      }),
    );
  }, [masterSheetColumns, masterSheetRows, masterSheetSearch]);

  return (
    <PageShell
      title="Customers"
      subtitle="Manage customer connections, field assignment, meters, and stages."
      actions={
        <>
          <Link
            href="/customers/import"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            <UploadSimpleIcon size={15} />
            Import Excel
          </Link>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={() => void exportRowsToExcel("customers.xlsx", masterSheetColumns, filteredMasterSheetRows)}
          >
            <DownloadSimpleIcon size={15} />
            Export Excel
          </button>
          <Link
            href="/customers/new"
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            <PlusIcon size={15} />
            Add Customer
          </Link>
        </>
      }
    >
      <TablePanel
        title="Customer Master Sheet"
        subtitle="Excel-style customer master data with fixed customer columns and per-column filters."
        toolbar={
          <div className="relative max-w-md">
            <MagnifyingGlassIcon
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={masterSheetSearch}
              onChange={(event) => setMasterSheetSearch(event.target.value)}
              placeholder="Search master sheet..."
              className="h-9 pl-9"
            />
          </div>
        }
      >
        <ExcelDataGrid
          columns={masterSheetColumns}
          rows={filteredMasterSheetRows}
          maxHeightClassName="h-[calc(100vh-240px)]"
          emptyTitle="No customer master records found"
          isLoading={isLoading}
          onRowClick={(row) => {
            if (realCustomerIds.has(row.customerId)) {
              router.push(`/customers/${row.customerId}/edit`);
            }
          }}
          getRowClassName={(row) =>
            realCustomerIds.has(row.customerId)
              ? undefined
              : "cursor-default text-muted-foreground"
          }
        />
      </TablePanel>
    </PageShell>
  );
}
