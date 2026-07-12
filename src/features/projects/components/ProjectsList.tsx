"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  EyeIcon,
  NotePencilIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { Pagination } from "@/components/shared/Pagination";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  cityOptions,
  projects,
  projectStatusOptions,
} from "@/features/projects/services/projects.service";
import type { Project } from "../types/project.types";

const initialFilters = {
  search: "",
  city: "all",
  status: "all",
};

export function ProjectsList() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredProjects = useMemo(() => {
    const search = filters.search.toLowerCase().trim();

    return projects.filter((project) => {
      const matchesSearch =
        !search ||
        project.name.toLowerCase().includes(search) ||
        project.code.toLowerCase().includes(search) ||
        project.client.toLowerCase().includes(search);
      const matchesCity = filters.city === "all" || project.city === filters.city;
      const matchesStatus =
        filters.status === "all" || project.status === filters.status;

      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [filters]);

  const pagination = usePagination({
    items: filteredProjects,
    pageSize: 8,
  });

  const columns: ColumnDef<Project>[] = [
    {
      key: "name",
      header: "Project Name",
      render: (project) => (
        <Link
          href={`/projects/${project.id}`}
          className="font-semibold text-foreground hover:text-primary"
        >
          {project.name}
        </Link>
      ),
    },
    { key: "code", header: "Project Code" },
    { key: "city", header: "City" },
    { key: "client", header: "Client" },
    { key: "startDate", header: "Start Date" },
    { key: "plannedEndDate", header: "End Date" },
    {
      key: "status",
      header: "Status",
      render: (project) => <StatusBadge status={project.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (project) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="View">
            <Link
              href={`/projects/${project.id}`}
              aria-label="View project"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Edit">
            <Link
              href={`/projects/${project.id}/edit`}
              aria-label="Edit project"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <NotePencilIcon size={15} />
            </Link>
          </ActionTooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Manage project contracts, cities, clients, and status."
        actions={
          <Link
            href="/projects/new"
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            <PlusIcon size={15} />
            New Project
          </Link>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4">
        <FilterSheetButton
          searchKey="search"
          searchPlaceholder="Search projects..."
          title="Project Filters"
          description="Filter projects by city and current status."
          values={filters}
          filters={[
            {
              key: "city",
              placeholder: "All Cities",
              options: cityOptions.map((city) => ({ label: city, value: city })),
            },
            {
              key: "status",
              placeholder: "All Statuses",
              options: projectStatusOptions.map((status) => ({
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
          columns={columns}
          data={pagination.paginatedItems}
          serialNumberStart={pagination.startItem}
          emptyTitle="No projects found"
          emptyDescription="Try changing the search or filters."
          variant="striped"
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
