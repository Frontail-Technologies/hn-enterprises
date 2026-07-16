"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArchiveIcon,
  DotsThreeVerticalIcon,
  DownloadSimpleIcon,
  EyeIcon,
  NotePencilIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { ImportDataDialog, type ImportField } from "@/components/shared/ImportDataDialog";
import { PageShell } from "@/components/shared/PageShell";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePanel } from "@/components/shared/TablePanel";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  cityAreaOptions,
  connectionTypeOptions,
  customerMasterSheetColumns,
  customerMasterSheetDemoRows,
  customers,
  customerStatusOptions,
  getCustomerMasterSheetRows,
  getCustomerDisplay,
  lmcPipeRecordFields,
  lmcPipeSizeOptions,
  lmcPipelineFields,
  mdpeFittingFields,
  projectOptions,
} from "../services/customers.service";
import type { Customer } from "../types/customer.types";
import type { CustomerMasterSheetRow } from "../services/customers.service";

const initialFilters = {
  search: "",
  project: "all",
  cityArea: "all",
  connectionType: "all",
  status: "all",
};

type CustomerViewMode = "list" | "master";

const customerImportFields: ImportField[] = [
  { key: "customerName", label: "Customer Name", required: true },
  { key: "mobileNumber", label: "Mobile Number", required: true },
  { key: "fullAddress", label: "Full Address", required: true },
  { key: "project", label: "Project", required: true },
  { key: "siteArea", label: "Site / Area", required: true },
  { key: "bpTrNumber", label: "BP / TR Number", required: true },
  { key: "connectionType", label: "Connection Type", required: true },
  { key: "gpsLocation", label: "GPS Location" },
  { key: "houseType", label: "House Type" },
  { key: "scheme", label: "Scheme" },
  { key: "paymentStatus", label: "Connection Payment Status" },
  { key: "paymentMode", label: "Payment Mode" },
  { key: "initialAmount", label: "Initial Amount" },
  { key: "supervisor", label: "Supervisor" },
  { key: "plumberGroup", label: "Plumber / Group" },
  { key: "fieldExecutive", label: "Field Executive" },
  { key: "meterNumber", label: "Meter Number" },
  { key: "meterType", label: "Meter Type" },
  { key: "regulatorNumber", label: "Regulator Number" },
  { key: "regulatorPressure", label: "Regulator Pressure" },
  ...lmcPipeSizeOptions.flatMap((pipeSize) =>
    lmcPipeRecordFields.map((field) => ({
      key: `lmc.${pipeSize}.${String(field.key)}`,
      label: `${pipeSize} Pipe - ${field.label}`,
    })),
  ),
  ...lmcPipelineFields.map((field) => ({ key: String(field.key), label: field.label })),
  ...mdpeFittingFields.map((field) => ({ key: String(field.key), label: field.label })),
];

export function CustomersList() {
  const [filters, setFilters] = useState(initialFilters);
  const [viewMode, setViewMode] = useState<CustomerViewMode>("master");

  const filteredCustomers = useMemo(() => {
    const search = filters.search.toLowerCase().trim();

    return customers.filter((customer) => {
      const display = getCustomerDisplay(customer);
      const cityArea = `${customer.city} / ${customer.siteArea}`;
      const matchesSearch =
        !search ||
        display.name.toLowerCase().includes(search) ||
        display.mobile.includes(search) ||
        display.trBpNo.toLowerCase().includes(search) ||
        display.meterNo.toLowerCase().includes(search) ||
        display.address.toLowerCase().includes(search);
      const matchesProject =
        filters.project === "all" || customer.projectId === filters.project;
      const matchesCityArea =
        filters.cityArea === "all" || cityArea === filters.cityArea;
      const matchesConnection =
        filters.connectionType === "all" ||
        display.connectionType === filters.connectionType;
      const matchesStatus =
        filters.status === "all" || customer.status === filters.status;

      return (
        matchesSearch &&
        matchesProject &&
        matchesCityArea &&
        matchesConnection &&
        matchesStatus
      );
    });
  }, [filters]);

  const pagination = usePagination({
    items: filteredCustomers,
    pageSize: 8,
  });

  const masterSheetRows = useMemo(
    () => [...getCustomerMasterSheetRows(customers), ...customerMasterSheetDemoRows],
    [],
  );

  const masterSheetColumns: ExcelColumn<CustomerMasterSheetRow>[] = useMemo(
    () =>
      customerMasterSheetColumns.map((column) => ({
        ...column,
        getValue: (row) => row.values[column.key],
      })),
    [],
  );

  const columns: ColumnDef<Customer>[] = [
    {
      key: "name",
      header: "Customer Name",
      render: (customer) => (
        <Link
          href={`/customers/${customer.id}`}
          className="font-semibold text-foreground hover:text-primary"
        >
          {getCustomerDisplay(customer).name}
        </Link>
      ),
    },
    {
      key: "bpTrNumber",
      header: "BP / TR Number",
      render: (customer) => getCustomerDisplay(customer).trBpNo,
    },
    {
      key: "mobileNumber",
      header: "Mobile Number",
      render: (customer) => getCustomerDisplay(customer).mobile,
    },
    {
      key: "projectArea",
      header: "Project / Area",
      render: (customer) => (
        <div className="min-w-44">
          <p className="font-medium text-foreground">{customer.projectName}</p>
          <p className="text-xs text-muted-foreground">{customer.siteArea}</p>
        </div>
      ),
    },
    {
      key: "connectionType",
      header: "Connection Type",
      render: (customer) => getCustomerDisplay(customer).connectionType,
    },
    {
      key: "meterNumber",
      header: "Meter Number",
      render: (customer) => getCustomerDisplay(customer).meterNo || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (customer) => <StatusBadge status={customer.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (customer) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="View">
            <Link
              href={`/customers/${customer.id}`}
              aria-label="View customer"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
            <ActionTooltip label="Edit">
              <Link
                href={`/customers/${customer.id}?mode=edit`}
                aria-label="Edit customer"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              >
              <NotePencilIcon size={15} />
            </Link>
          </ActionTooltip>
          <DropdownMenu>
            <ActionTooltip label="More actions">
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="More customer actions"
                    className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                  >
                    <DotsThreeVerticalIcon size={15} />
                  </button>
                }
              />
            </ActionTooltip>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem render={<Link href={`/customers/${customer.id}?tab=images`}>Images / Documents</Link>} />
              <DropdownMenuItem variant="destructive">
                <ArchiveIcon size={14} />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <PageShell
        title="Customers"
        subtitle="Manage customer connections, field assignment, meters, and stages."
        actions={
          <>
            <ImportDataDialog
              moduleName="Customers"
              fields={customerImportFields}
              description="Upload customer master data using the fixed customer template."
              trigger={
                <button
                  type="button"
                  className={buttonVariants({ variant: "outline", size: "default" })}
                >
                  <UploadSimpleIcon size={15} />
                  Import Excel
                </button>
              }
            />
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "default" })}
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
      <div className="mb-3 flex w-fit gap-6 border-b border-border/70">
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={viewButtonClass(viewMode === "list")}
        >
          List View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("master")}
          className={viewButtonClass(viewMode === "master")}
        >
          Master Sheet
        </button>
      </div>

      {viewMode === "list" ? (
        <TablePanel
          title="Customer Records"
          subtitle="Search and review customer master workflow status."
          toolbar={
            <FilterSheetButton
              searchKey="search"
              searchPlaceholder="Search name, mobile, BP/TR, meter or address..."
              title="Customer Filters"
              description="Filter customer records by project, area, connection type, stage and status."
              values={filters}
              filters={[
                {
                  key: "project",
                  placeholder: "All Projects",
                  options: projectOptions,
                },
                {
                  key: "cityArea",
                  placeholder: "All City / Area",
                  options: cityAreaOptions.map((area) => ({ label: area, value: area })),
                },
                {
                  key: "connectionType",
                  placeholder: "All Types",
                  options: connectionTypeOptions.map((type) => ({
                    label: type,
                    value: type,
                  })),
                },
                {
                  key: "status",
                  placeholder: "All Statuses",
                  options: customerStatusOptions.map((status) => ({
                    label: status,
                    value: status,
                  })),
                },
              ]}
              onChange={(key, value) => {
                setFilters((current) => ({ ...current, [key]: value }));
                pagination.setPage(1);
              }}
              onReset={() => {
                setFilters(initialFilters);
                pagination.setPage(1);
              }}
            />
          }
          pagination={
            <Pagination
              compact
              page={pagination.page}
              pageCount={pagination.pageCount}
              totalItems={pagination.totalItems}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              onPageChange={pagination.setPage}
            />
          }
        >
          <DataTable
            data={pagination.paginatedItems}
            columns={columns}
            variant="striped"
            emptyTitle="No customers found"
            emptyDescription="Try changing filters or add a customer."
            serialNumberStart={pagination.startItem}
            stickyHeader
            stickyLastColumn
            containerClassName="rounded-none border-0"
          />
        </TablePanel>
      ) : (
        <TablePanel
          title="Customer Master Sheet"
          subtitle="Excel-style customer master data with fixed customer columns and per-column filters."
        >
          <ExcelDataGrid
            columns={masterSheetColumns}
            rows={masterSheetRows}
            emptyTitle="No customer master records found"
          />
        </TablePanel>
      )}
    </PageShell>
  );
}

function viewButtonClass(active: boolean) {
  return [
    "h-10 border-b-2 border-transparent px-0.5 text-sm font-medium transition-colors",
    active
      ? "border-primary text-primary font-semibold"
      : "text-muted-foreground hover:text-foreground",
  ].join(" ");
}
