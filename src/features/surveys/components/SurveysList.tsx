"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  DownloadSimpleIcon,
  EyeIcon,
  NotePencilIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DatePicker } from "@/components/shared/DatePicker";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { ImportDataDialog, type ImportField } from "@/components/shared/ImportDataDialog";
import { PageShell } from "@/components/shared/PageShell";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePanel } from "@/components/shared/TablePanel";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  submissionStatusOptions,
  surveys,
  surveyProjectOptions,
  surveySiteOptions,
  surveySupervisorOptions,
  workableStatusOptions,
} from "../services/surveys.service";
import type { Survey } from "../types/survey.types";

const initialFilters = {
  search: "",
  project: "all",
  site: "all",
  supervisor: "all",
  workableStatus: "all",
  submissionStatus: "all",
  dateFrom: "",
  dateTo: "",
};

const surveyImportFields: ImportField[] = [
  { key: "customerIdentifier", label: "Customer / BP TR Number", required: true },
  { key: "project", label: "Project", required: true },
  { key: "siteArea", label: "Site / Area", required: true },
  { key: "surveyDate", label: "Survey Date", required: true },
  { key: "supervisor", label: "Supervisor", required: true },
  { key: "gpsLocation", label: "GPS Location" },
  { key: "houseType", label: "House Type" },
  { key: "connectionType", label: "Connection Type" },
  { key: "siteAccessibility", label: "Site Accessibility" },
  { key: "meterPlacement", label: "Meter Placement Possibility" },
  { key: "pipelineRoute", label: "Pipeline Route Availability" },
  { key: "civilWorkRequired", label: "Civil Work Required" },
  { key: "workableStatus", label: "Workable Status" },
  { key: "reason", label: "Reason" },
  { key: "recommendedAction", label: "Recommended Action" },
  { key: "remarks", label: "Survey Remarks" },
];

export function SurveysList() {
  const [filters, setFilters] = useState(initialFilters);
  const [state] = useState<"ready" | "loading" | "error">("ready");

  const filteredSurveys = useMemo(() => {
    const search = filters.search.toLowerCase().trim();
    const dateFrom = filters.dateFrom ? parseISO(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? parseISO(filters.dateTo) : null;

    return surveys.filter((survey) => {
      const surveyDate = parseISO(survey.surveyDate);
      const matchesSearch =
        !search ||
        survey.surveyId.toLowerCase().includes(search) ||
        survey.customerName.toLowerCase().includes(search) ||
        survey.bpTrNumber.toLowerCase().includes(search) ||
        survey.fullAddress.toLowerCase().includes(search);
      const matchesProject =
        filters.project === "all" || survey.projectId === filters.project;
      const matchesSite =
        filters.site === "all" || survey.siteArea === filters.site;
      const matchesSupervisor =
        filters.supervisor === "all" ||
        survey.supervisor === filters.supervisor;
      const matchesWorkable =
        filters.workableStatus === "all" ||
        survey.workableStatus === filters.workableStatus;
      const matchesSubmission =
        filters.submissionStatus === "all" ||
        survey.submissionStatus === filters.submissionStatus;
      const matchesDateFrom = !dateFrom || surveyDate >= dateFrom;
      const matchesDateTo = !dateTo || surveyDate <= dateTo;

      return (
        matchesSearch &&
        matchesProject &&
        matchesSite &&
        matchesSupervisor &&
        matchesWorkable &&
        matchesSubmission &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [filters]);

  const pagination = usePagination({ items: filteredSurveys, pageSize: 8 });

  const columns: ColumnDef<Survey>[] = [
    {
      key: "surveyId",
      header: "Survey ID",
      render: (survey) => (
        <Link
          href={`/surveys/${survey.id}`}
          className="font-semibold text-foreground hover:text-primary"
        >
          {survey.surveyId}
        </Link>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      render: (survey) => (
        <div>
          <p className="font-semibold text-foreground">{survey.customerName}</p>
          <p className="text-xs text-muted-foreground">{survey.mobileNumber}</p>
        </div>
      ),
    },
    { key: "bpTrNumber", header: "BP / TR Number" },
    {
      key: "projectSite",
      header: "Project / Site",
      render: (survey) => (
        <div className="min-w-44">
          <p className="font-medium text-foreground">{survey.projectName}</p>
          <p className="text-xs text-muted-foreground">{survey.siteArea}</p>
        </div>
      ),
    },
    { key: "supervisor", header: "Supervisor" },
    {
      key: "surveyDate",
      header: "Survey Date",
      render: (survey) => formatDate(survey.surveyDate),
    },
    {
      key: "workableStatus",
      header: "Workable Status",
      render: (survey) => <StatusBadge status={survey.workableStatus} />,
    },
    {
      key: "submissionStatus",
      header: "Submission Status",
      render: (survey) => <StatusBadge status={survey.submissionStatus} />,
    },
    {
      key: "photoCount",
      header: "Photos",
      render: (survey) => (
        <span className="font-semibold text-foreground">
          {survey.photoCount}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (survey) => <SurveyRowActions survey={survey} />,
    },
  ];

  return (
    <PageShell
        title="Surveys"
        subtitle="Capture field conditions, workable status, and survey approvals."
        actions={
          <>
            <ImportDataDialog
              moduleName="Surveys"
              fields={surveyImportFields}
              description="Upload survey records using the fixed survey import template."
              trigger={
                <button
                  type="button"
                  className={buttonVariants({
                    variant: "outline",
                    size: "default",
                  })}
                >
                  <UploadSimpleIcon size={15} />
                  Import Excel
                </button>
              }
            />
            <button
              type="button"
              className={buttonVariants({
                variant: "outline",
                size: "default",
              })}
            >
              <DownloadSimpleIcon size={15} />
              Export Excel
            </button>
            <Link
              href="/surveys/new"
              className={buttonVariants({
                variant: "default",
                size: "default",
              })}
            >
              <PlusIcon size={15} />
              New Survey
            </Link>
          </>
        }
      >
      <TablePanel
        title="Survey Queue"
        subtitle="Review survey submissions, evidence and approval state."
        toolbar={
          <FilterSheetButton
            searchKey="search"
            searchPlaceholder="Search survey, customer, BP/TR or address..."
            title="Survey Filters"
            description="Filter surveys by assignment, status and survey date."
            values={filters}
            filters={[
              {
                key: "project",
                placeholder: "All Projects",
                options: surveyProjectOptions,
              },
              {
                key: "site",
                placeholder: "All Area / Site",
                options: surveySiteOptions.map((site) => ({
                  label: site,
                  value: site,
                })),
              },
              {
                key: "supervisor",
                placeholder: "All Supervisors",
                options: surveySupervisorOptions.map((supervisor) => ({
                  label: supervisor,
                  value: supervisor,
                })),
              },
              {
                key: "workableStatus",
                placeholder: "All Workable",
                options: workableStatusOptions.map((status) => ({
                  label: status,
                  value: status,
                })),
              },
              {
                key: "submissionStatus",
                placeholder: "All Submissions",
                options: submissionStatusOptions.map((status) => ({
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
            renderExtra={({ values, onChange }) => (
              <DateRangeControl
                dateFrom={values.dateFrom}
                dateTo={values.dateTo}
                onDateFromChange={(value) => onChange("dateFrom", value)}
                onDateToChange={(value) => onChange("dateTo", value)}
              />
            )}
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

        {state === "error" ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load surveys</AlertTitle>
            <AlertDescription>
              Try refreshing the page or clearing filters.
            </AlertDescription>
          </Alert>
        ) : null}

        <DataTable
          data={state === "error" ? [] : pagination.paginatedItems}
          columns={columns}
          isLoading={state === "loading"}
          variant="striped"
          emptyTitle="No surveys found"
          emptyDescription="Try changing the filters or create a new survey."
          serialNumberStart={pagination.startItem}
          stickyHeader
          stickyLastColumn
          containerClassName="rounded-none border-0"
        />
      </TablePanel>
    </PageShell>
  );
}

function SurveyRowActions({ survey }: { survey: Survey }) {
  const editable =
    survey.submissionStatus === "Draft" ||
    survey.submissionStatus === "Sent Back";
  const canResubmit = survey.submissionStatus === "Sent Back";

  return (
    <div className="flex items-center gap-1">
      <ActionTooltip label="View Survey">
        <Link
          href={`/surveys/${survey.id}`}
          aria-label="View survey"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <EyeIcon size={15} />
        </Link>
      </ActionTooltip>
      {editable ? (
        <ActionTooltip label="Edit Survey">
          <Link
            href={`/surveys/${survey.id}/edit`}
            aria-label="Edit survey"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <NotePencilIcon size={15} />
          </Link>
        </ActionTooltip>
      ) : null}
      {canResubmit ? (
        <ActionTooltip label="Resubmit Survey">
          <Link
            href={`/surveys/${survey.id}/edit?mode=resubmit`}
            aria-label="Resubmit survey"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <PaperPlaneTiltIcon size={15} />
          </Link>
        </ActionTooltip>
      ) : null}
    </div>
  );
}

function DateRangeControl({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-muted-foreground">
        Survey Date
      </span>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <DatePicker
          value={dateFrom}
          placeholder="From"
          onChange={onDateFromChange}
        />
        <span className="hidden text-xs font-semibold text-muted-foreground sm:block">
          to
        </span>
        <DatePicker value={dateTo} placeholder="To" onChange={onDateToChange} />
      </div>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "-";

  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}
