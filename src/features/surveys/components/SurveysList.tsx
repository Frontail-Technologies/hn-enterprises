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
import { FilterBar } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
      const matchesSite = filters.site === "all" || survey.siteArea === filters.site;
      const matchesSupervisor =
        filters.supervisor === "all" || survey.supervisor === filters.supervisor;
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
          className="font-bold text-foreground hover:text-primary"
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
        <span className="font-semibold text-foreground">{survey.photoCount}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (survey) => (
        <SurveyRowActions survey={survey} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Surveys"
        subtitle="Capture field conditions, workable status, and survey approvals."
        actions={
          <>
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "default" })}
            >
              <UploadSimpleIcon size={15} />
              Import Excel
            </button>
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "default" })}
            >
              <DownloadSimpleIcon size={15} />
              Export Excel
            </button>
            <Link
              href="/surveys/new"
              className={buttonVariants({ variant: "default", size: "default" })}
            >
              <PlusIcon size={15} />
              New Survey
            </Link>
          </>
        }
      />

      <div className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <p className="text-sm font-bold text-foreground">Survey Register</p>
            <p className="text-xs font-medium text-muted-foreground">
              Filter by assignment, status and survey date.
            </p>
          </div>
        </div>

        <FilterBar
          searchKey="search"
          searchPlaceholder="Search survey, customer, BP/TR or address..."
          values={filters}
          filters={[
            { key: "project", placeholder: "All Projects", options: surveyProjectOptions },
            {
              key: "site",
              placeholder: "All Area / Site",
              options: surveySiteOptions.map((site) => ({ label: site, value: site })),
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
        />

        <DateRangeControl
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(value) => {
            setFilters((current) => ({ ...current, dateFrom: value }));
            pagination.setPage(1);
          }}
          onDateToChange={(value) => {
            setFilters((current) => ({ ...current, dateTo: value }));
            pagination.setPage(1);
          }}
        />

        {state === "error" ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load surveys</AlertTitle>
            <AlertDescription>Try refreshing the page or clearing filters.</AlertDescription>
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

function SurveyRowActions({ survey }: { survey: Survey }) {
  const editable =
    survey.submissionStatus === "Draft" || survey.submissionStatus === "Sent Back";
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
    <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-1.5">
      <span className="px-1.5 text-xs font-bold text-muted-foreground">Survey Date</span>
      <div className="w-40">
        <DatePicker value={dateFrom} placeholder="From" onChange={onDateFromChange} />
      </div>
      <span className="text-xs font-semibold text-muted-foreground">to</span>
      <div className="w-40">
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
