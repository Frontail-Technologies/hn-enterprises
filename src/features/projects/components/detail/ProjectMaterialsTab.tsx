"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { ExcelDataGrid } from "@/components/shared/ExcelDataGrid";
import { Pagination } from "@/components/shared/Pagination";
import { SectionCard } from "@/components/shared/SectionCard";
import { useProjectMaterialsTab } from "./hooks/useProjectMaterialsTab";
import { buildMaterialTransactionColumns, materialsSummaryColumns } from "./ProjectMaterialsTab.columns";
import { ProjectTabHeader } from "./ProjectTabHeader";

export function ProjectMaterialsTab({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const { perMaterial, transactions, movementsPagination, isLoading } = useProjectMaterialsTab(projectId, page);

  const transactionColumns = buildMaterialTransactionColumns();
  const hasUsage = perMaterial.length > 0;
  const hasMovements = (movementsPagination?.total ?? transactions.length) > 0;

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Materials" subtitle="Materials issued, consumed or returned within this project." />

      {!isLoading && !hasUsage && !hasMovements ? (
        <SectionCard title="Materials Used on This Project">
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-sm text-muted-foreground">No materials have been issued to this project yet.</p>
            <Link href="/inventory" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Open Inventory
            </Link>
          </div>
        </SectionCard>
      ) : (
        <>
          <SectionCard title="Materials Used on This Project">
            <DataTable
              columns={materialsSummaryColumns}
              data={perMaterial}
              variant="striped"
              emptyTitle="No materials have been issued to this project."
            />
          </SectionCard>

          <SectionCard title="Recent Movements">
            <ExcelDataGrid
              columns={transactionColumns}
              rows={transactions}
              isLoading={isLoading}
              emptyTitle="No material movements recorded for this project."
              maxHeightClassName="max-h-[420px]"
            />
            {movementsPagination && movementsPagination.total > 0 ? (
              <Pagination
                compact
                page={movementsPagination.page}
                pageCount={Math.max(1, movementsPagination.totalPages)}
                totalItems={movementsPagination.total}
                startItem={(movementsPagination.page - 1) * movementsPagination.limit + 1}
                endItem={Math.min(movementsPagination.page * movementsPagination.limit, movementsPagination.total)}
                onPageChange={setPage}
              />
            ) : null}
          </SectionCard>
        </>
      )}
    </div>
  );
}
