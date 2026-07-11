"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArchiveIcon,
  ClockCounterClockwiseIcon,
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
import { FilterBar } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
  customers,
  customerStageOptions,
  customerStatusOptions,
  projectOptions,
} from "../services/customers.service";
import type { Customer } from "../types/customer.types";

const initialFilters = {
  search: "",
  project: "all",
  cityArea: "all",
  connectionType: "all",
  currentStage: "all",
  status: "all",
};

export function CustomersList() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredCustomers = useMemo(() => {
    const search = filters.search.toLowerCase().trim();

    return customers.filter((customer) => {
      const cityArea = `${customer.city} / ${customer.siteArea}`;
      const matchesSearch =
        !search ||
        customer.name.toLowerCase().includes(search) ||
        customer.mobileNumber.includes(search) ||
        customer.bpTrNumber.toLowerCase().includes(search) ||
        customer.meterNumber.toLowerCase().includes(search) ||
        customer.fullAddress.toLowerCase().includes(search);
      const matchesProject =
        filters.project === "all" || customer.projectId === filters.project;
      const matchesCityArea =
        filters.cityArea === "all" || cityArea === filters.cityArea;
      const matchesConnection =
        filters.connectionType === "all" ||
        customer.connectionType === filters.connectionType;
      const matchesStage =
        filters.currentStage === "all" || customer.currentStage === filters.currentStage;
      const matchesStatus =
        filters.status === "all" || customer.status === filters.status;

      return (
        matchesSearch &&
        matchesProject &&
        matchesCityArea &&
        matchesConnection &&
        matchesStage &&
        matchesStatus
      );
    });
  }, [filters]);

  const pagination = usePagination({
    items: filteredCustomers,
    pageSize: 8,
  });

  const columns: ColumnDef<Customer>[] = [
    {
      key: "name",
      header: "Customer Name",
      render: (customer) => (
        <Link
          href={`/customers/${customer.id}`}
          className="font-semibold text-foreground hover:text-primary"
        >
          {customer.name}
        </Link>
      ),
    },
    { key: "bpTrNumber", header: "BP / TR Number" },
    { key: "mobileNumber", header: "Mobile Number" },
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
    { key: "connectionType", header: "Connection Type" },
    { key: "meterNumber", header: "Meter Number" },
    {
      key: "currentStage",
      header: "Current Stage",
      render: (customer) => <StatusBadge status={customer.currentStage} />,
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
              href={`/customers/${customer.id}/edit`}
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
              <DropdownMenuItem
                render={
                  <Link href={`/customers/${customer.id}?tab=activity`}>
                    <ClockCounterClockwiseIcon size={14} />
                    Open Timeline
                  </Link>
                }
              />
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
    <div>
      <PageHeader
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
      />

      <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <FilterBar
          searchKey="search"
          searchPlaceholder="Search name, mobile, BP/TR, meter or address..."
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
              key: "currentStage",
              placeholder: "All Stages",
              options: customerStageOptions.map((stage) => ({
                label: stage,
                value: stage,
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

        <DataTable
          data={pagination.paginatedItems}
          columns={columns}
          variant="striped"
          emptyTitle="No customers found"
          emptyDescription="Try changing filters or add a customer."
          serialNumberStart={pagination.startItem}
        />

        <Pagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          totalItems={pagination.totalItems}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          onPageChange={pagination.setPage}
        />
      </div>
    </div>
  );
}
