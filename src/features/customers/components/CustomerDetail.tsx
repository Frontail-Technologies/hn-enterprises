"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ImageSquareIcon, NotePencilIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DatePicker } from "@/components/shared/DatePicker";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { FormField } from "@/components/shared/FormField";
import {
  ImageUploadPreview,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";
import { InfoRow } from "@/components/shared/InfoRow";
import { KeyValueGrid, type KeyValueItem } from "@/components/shared/KeyValueGrid";
import { SectionCard } from "@/components/shared/SectionCard";
import { SectionAnchorTabs } from "@/components/shared/SectionAnchorTabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDynamicFieldsQuery } from "@/features/dynamic-fields/hooks/useDynamicFields";
import type { CustomField, CustomFieldValueType } from "@/features/dynamic-fields/types";
import {
  billingCompletionFields,
  useCommissioningConversionFields,
  deriveLmcPipeCurrentStage,
  useCustomerConnectionFields,
  deriveLmcOverallStatus,
  fittingAccessoryFields,
  giMeasurementFields,
  isolationValveFields,
  lmcPipeRecordFields,
  lmcPipelineFields,
  mdpeFittingFields,
  type FieldDefinition,
  type LmcPipeEditableFields,
  type LmcCivilWork,
} from "../services/customers.service";
import { useWorkProgressListQuery } from "@/features/work-progress/hooks/useWorkProgress";
import { useCustomerQuery, useSetSectionCompletion, useUpsertLmcPipeRecord } from "../hooks/useCustomers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerEvidencePanel, CustomerReportsPanel } from "./CustomerEvidenceReports";
import { CustomerComplaintsPanel } from "./CustomerComplaintsPanel";
import { PageLoading } from "@/components/shared/PageLoading";
import type {
  CompletionSectionKey,
  Customer,
  CustomerSurvey,
  CustomerSurveyRevision,
  LmcEvidenceFile,
  LmcPipeSizeRecord,
  LmcPipelineWork,
  SectionCompletionResult,
} from "../types/customer.types";

const COMPLETION_LABEL: Record<SectionCompletionResult["status"], string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

// Section status is read straight from the backend `sectionCompletion` - never
// recomputed on the client.
function SectionCompletionActions({
  customerId,
  sectionKey,
  sectionLabel,
  result,
}: {
  customerId: string;
  sectionKey: CompletionSectionKey;
  sectionLabel: string;
  result?: SectionCompletionResult;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useSetSectionCompletion(customerId, sectionLabel);
  const isDone = result?.status === "DONE";

  return (
    <div className="flex items-center gap-2">
      <SectionStatusBadge result={result} />
      {isDone ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            Reopen
          </Button>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reopen {sectionLabel}?</DialogTitle>
                <DialogDescription>
                  This will mark the section as In Progress. Existing data will be kept.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate(
                      { sectionKey, completed: false },
                      { onSuccess: () => setConfirmOpen(false) },
                    )
                  }
                >
                  Reopen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ sectionKey, completed: true })}
        >
          Mark Complete
        </Button>
      )}
    </div>
  );
}

function SectionStatusBadge({ result }: { result?: SectionCompletionResult }) {
  if (!result) return null;
  const tone =
    result.status === "DONE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      : result.status === "IN_PROGRESS"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
        : "border-border bg-muted/40 text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}
      title={result.missingRequiredFields.length ? `Missing: ${result.missingRequiredFields.join(", ")}` : undefined}
    >
      {COMPLETION_LABEL[result.status]}
    </span>
  );
}

type CustomerApprovalRow = {
  id: string;
  reference: string;
  module: string;
  submittedBy: string;
  date: string;
  remarks: string;
  status: string;
};

// Dynamic field groups are inserted between these two lists - after
// Complaints, before Approvals / History - since group names (and how many
// there are) come from live data, not a fixed set.
const customerSectionLinksBeforeGroups = [
  { href: "#customer-details", label: "Customer Details" },
  { href: "#survey", label: "Survey" },
  { href: "#gi", label: "GI Measurements" },
  { href: "#isolation", label: "Isolation & Fittings" },
  { href: "#lmc", label: "LMC Pipeline" },
  { href: "#mdpe", label: "MDPE Fittings" },
  { href: "#commissioning", label: "Meter & Commissioning" },
  { href: "#billing", label: "Billing & Remarks" },
  { href: "#documents", label: "Images / Evidence" },
  { href: "#reports", label: "Reports" },
  { href: "#complaints", label: "Complaints" },
];

const customerSectionLinksAfterGroups = [{ href: "#approvals", label: "Approvals / History" }];

function groupAnchorId(group: string) {
  return `custom-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export function CustomerDetail({ customerId }: { customerId: string }) {
  const { data: customer, isLoading, isError } = useCustomerQuery(customerId);
  const searchParams = useSearchParams();
  const initialPipeId = searchParams.get("pipe");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const { data: dynamicFields = [] } = useDynamicFieldsQuery("Active");
  const customerConnectionFields = useCustomerConnectionFields();
  const commissioningConversionFields = useCommissioningConversionFields();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !customer) {
    return <p className="p-4 text-sm text-destructive">Unable to load this customer.</p>;
  }

  const connection = customer.customerConnection;
  const completion = customer.sectionCompletion;

  const visibleFieldGroups = groupVisibleDynamicFields(dynamicFields, isAdmin);
  const sectionLinks = [
    ...customerSectionLinksBeforeGroups,
    ...Object.keys(visibleFieldGroups).map((group) => ({ href: `#${groupAnchorId(group)}`, label: group })),
    ...customerSectionLinksAfterGroups,
  ];

  return (
    <div className="space-y-4">
      <DetailHeader
        title={connection.customerName}
        badges={
          <>
            <StatusBadge status={connection.connectionType} />
            <StatusBadge status={customer.status} />
          </>
        }
        meta={
          <>
            <InfoRow label="TR/BP No." value={connection.trBpNo} />
            <InfoRow label="Mobile" value={connection.mobileNo} />
            <InfoRow label="Connection" value={connection.connectionType} />
          </>
        }
        actions={
          <Link
            href={`/customers/${customer.id}?mode=edit`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            <NotePencilIcon size={15} />
            Edit
          </Link>
        }
      />

      <CustomerSectionNav items={sectionLinks} />

      <div className="space-y-4">
        <section id="customer-details" className="scroll-mt-16">
          <SectionCard title="Customer & Connection Details">
            <KeyValueGrid
              items={[
                { label: "Project", value: customer.projectName },
                { label: "Site / Area", value: customer.siteArea },
                { label: "Created", value: formatDate(customer.createdDate) },
                ...itemsFromFields(customerConnectionFields, connection),
              ]}
              columns={3}
            />
          </SectionCard>
        </section>

        <section id="survey" className="scroll-mt-16">
          <CustomerSurveyDetail survey={customer.survey} completion={completion?.survey} />
        </section>

        <section id="gi" className="scroll-mt-16">
          <SectionCard
            title="GI Installation Measurements"
            action={<SectionCompletionActions customerId={customer.id} sectionKey="giMeasurements" sectionLabel="GI Measurements" result={completion?.giMeasurements} />}
          >
            <KeyValueGrid items={itemsFromFields(giMeasurementFields, customer.giMeasurements)} columns={3} />
          </SectionCard>
        </section>

        <section id="isolation" className="scroll-mt-16">
          <div className="space-y-4">
            <SectionCard
              title="Isolation Valves & Regulators"
              action={<SectionCompletionActions customerId={customer.id} sectionKey="valvesRegulators" sectionLabel="Isolation & Regulators" result={completion?.valvesRegulators} />}
            >
              <KeyValueGrid items={itemsFromFields(isolationValveFields, customer.valvesRegulators)} columns={3} />
            </SectionCard>
            <SectionCard
              title="Fittings & Accessories"
              action={<SectionCompletionActions customerId={customer.id} sectionKey="fittingsAccessories" sectionLabel="Fittings & Accessories" result={completion?.fittingsAccessories} />}
            >
              <KeyValueGrid items={itemsFromFields(fittingAccessoryFields, customer.fittingsAccessories)} columns={3} />
            </SectionCard>
          </div>
        </section>

        <section id="lmc" className="scroll-mt-16">
          <LmcPipelineDetail
            key={customer.id}
            customerId={customer.id}
            values={customer.lmcPipelineWork}
            initialPipeId={initialPipeId}
            completion={completion?.lmc}
          />
        </section>

        <section id="mdpe" className="scroll-mt-16">
          <SectionCard
            title="MDPE Fittings"
            action={<SectionCompletionActions customerId={customer.id} sectionKey="mdpeFittings" sectionLabel="MDPE Fittings" result={completion?.mdpeFittings} />}
          >
            <KeyValueGrid items={itemsFromFields(mdpeFittingFields, customer.mdpeFittings)} columns={3} />
          </SectionCard>
        </section>

        <section id="commissioning" className="scroll-mt-16">
          <SectionCard title="Commissioning & Conversion" action={<SectionStatusBadge result={completion?.commissioning} />}>
            <KeyValueGrid
              items={itemsFromFields(commissioningConversionFields, customer.commissioningConversion)}
              columns={2}
            />
          </SectionCard>
        </section>

        <section id="billing" className="scroll-mt-16">
          <SectionCard title="Billing & Completion Status">
            <KeyValueGrid
              items={itemsFromFields(billingCompletionFields, customer.billingCompletion)}
              columns={2}
            />
          </SectionCard>
        </section>

        <section id="documents" className="scroll-mt-16">
          <CustomerEvidencePanel
            survey={customer.survey}
            lmcPipelineWork={customer.lmcPipelineWork}
            documents={customer.documents}
            customerId={customer.id}
          />
        </section>

        <section id="reports" className="scroll-mt-16">
          <CustomerReportsPanel customerId={customer.id} customer={customer} />
        </section>

        <section id="complaints" className="scroll-mt-16">
          <CustomerComplaintsPanel customerId={customer.id} />
        </section>

        {Object.entries(visibleFieldGroups).map(([group, fields]) => (
          <section key={group} id={groupAnchorId(group)} className="scroll-mt-16">
            <SectionCard title={group}>
              <KeyValueGrid
                items={fields.map((field) => ({
                  label: field.label,
                  value: formatDynamicFieldValue(customer.customFields?.[field.key], field.valueType),
                }))}
                columns={3}
              />
            </SectionCard>
          </section>
        ))}

        <section id="approvals" className="scroll-mt-16">
          <CustomerApprovalsHistory customer={customer} />
        </section>
      </div>
    </div>
  );
}

function CustomerSectionNav({ items }: { items: { href: string; label: string }[] }) {
  return <SectionAnchorTabs items={items} />;
}

function groupVisibleDynamicFields(fields: CustomField[], isAdmin: boolean) {
  const groups: Record<string, CustomField[]> = {};
  for (const field of fields) {
    if (!isAdmin && field.supervisorAccess === "Admin Only") continue;
    (groups[field.group] ??= []).push(field);
  }
  for (const key of Object.keys(groups)) {
    groups[key] = [...groups[key]].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return groups;
}

function formatDynamicFieldValue(value: string | boolean | undefined, valueType: CustomFieldValueType) {
  if (value === undefined || value === null || value === "") return "-";
  if (valueType === "Yes / No" || typeof value === "boolean") {
    return value === true || value === "true" ? "Yes" : "No";
  }
  if (valueType === "Date") return formatDate(String(value));
  return String(value);
}

function CustomerApprovalsHistory({ customer }: { customer: Customer }) {
  const { data: workProgressUpdates = [] } = useWorkProgressListQuery({ customerId: customer.id });
  const rows: CustomerApprovalRow[] = [
    customer.survey
      ? {
          id: `${customer.survey.id}-approval`,
          reference: customer.survey.surveyId,
          module: "Survey",
          submittedBy: customer.survey.submittedBy || customer.survey.assignedSurveyor,
          date: customer.survey.submissionDate || customer.survey.surveyDate,
          remarks: customer.survey.approvalComments || customer.survey.notes || "-",
          status: customer.survey.approvalStatus,
        }
      : null,
    ...customer.documents.map((document) => ({
      id: `${document.id}-approval`,
      reference: document.referenceNumber || document.fileName,
      module: document.category,
      submittedBy: document.uploadedBy,
      date: document.uploadedOn,
      remarks: document.remarks || "-",
      status: document.status,
    })),
    {
      id: "billing-approval",
      reference: customer.customerConnection.trBpNo,
      module: "Billing",
      submittedBy: customer.customerConnection.supervisorName || "-",
      date: customer.createdDate,
      remarks: customer.billingCompletion.remark || "-",
      status: customer.billingCompletion.paymentStatus,
    },
  ].filter(Boolean) as CustomerApprovalRow[];

  const columns: ColumnDef<CustomerApprovalRow>[] = [
    { key: "reference", header: "Reference", className: "font-medium" },
    { key: "module", header: "Module" },
    { key: "submittedBy", header: "Submitted By" },
    { key: "date", header: "Date", render: (row) => formatDateTime(row.date) },
    { key: "remarks", header: "Remarks", className: "min-w-64" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Approvals">
        <DataTable columns={columns} data={rows} variant="striped" />
      </SectionCard>

      <SectionCard title="Activity History">
        {workProgressUpdates.length ? (
          <div className="relative space-y-3 before:absolute before:left-2.5 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {workProgressUpdates.map((update) => (
              <div key={update.id} className="relative flex gap-3">
                <span className="mt-1 h-5 w-5 rounded-full border-4 border-background bg-primary" />
                <div className="rounded-lg bg-muted/20 px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    {update.stage} — {update.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {update.remarks || update.nextRequiredAction || "-"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {update.supervisor?.name ?? "-"} - {formatDateTime(update.createdAt)} - {update.stage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No work progress updates recorded yet.</p>
        )}
      </SectionCard>
    </div>
  );
}

function CustomerSurveyDetail({ survey, completion }: { survey?: CustomerSurvey; completion?: SectionCompletionResult }) {
  if (!survey) {
    return (
      <SectionCard
        title="Survey"
        action={
          <Button type="button" variant="outline" size="sm">
            Create Survey
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          No survey record is available for this customer yet.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
        <SectionCard
          title="Survey Details"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <SectionStatusBadge result={completion} />
              <Button type="button" variant="outline" size="sm">
                Edit
              </Button>
              <Button type="button" variant="outline" size="sm">
                Submit
              </Button>
              <Button type="button" size="sm">
                Resubmit
              </Button>
            </div>
          }
        >
          <KeyValueGrid
            columns={3}
            items={[
              { label: "Survey ID", value: survey.surveyId },
              { label: "Survey Date", value: formatDate(survey.surveyDate) },
              { label: "Assigned Surveyor", value: survey.assignedSurveyor },
              { label: "GPS / Location", value: `${survey.latitude}, ${survey.longitude}` },
              { label: "Capture Accuracy", value: survey.captureAccuracy },
              { label: "Workable Status", value: <StatusBadge status={survey.workableStatus} /> },
              { label: "Approval Status", value: <StatusBadge status={survey.approvalStatus} /> },
              { label: "Submitted By", value: survey.submittedBy || "-" },
              { label: "Submitted On", value: formatDateTime(survey.submissionDate) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Initial Measurements">
          <p className="text-sm font-medium text-foreground">{survey.initialMeasurements || "-"}</p>
          <div className="mt-3">
            <KeyValueGrid
              columns={3}
              items={[
                { label: "Site Accessibility", value: <StatusBadge status={survey.siteAccessibility} /> },
                { label: "Meter Placement", value: <StatusBadge status={survey.meterPlacement} /> },
                { label: "Pipeline Route", value: <StatusBadge status={survey.pipelineRoute} /> },
                { label: "Civil Work Required", value: survey.civilWorkRequired },
                { label: "Reason", value: survey.reason || "-" },
                { label: "Expected Resolution", value: formatDate(survey.expectedResolutionDate) },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title="Obstacles / Remarks">
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Obstacles", value: survey.obstaclesRemarks || "-" },
              { label: "Recommended Action", value: survey.recommendedAction || "-" },
              { label: "Survey Notes", value: survey.notes || "-" },
              { label: "Approval Comments", value: survey.approvalComments || "-" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Revision History">
          <SurveyRevisionHistory revisions={survey.revisions} />
        </SectionCard>
    </div>
  );
}

function SurveyRevisionHistory({ revisions }: { revisions: CustomerSurveyRevision[] }) {
  if (!revisions.length) {
    return <p className="text-sm text-muted-foreground">No revisions yet.</p>;
  }

  return (
    <div className="space-y-2">
      {revisions.map((revision) => (
        <div key={revision.id} className="rounded-lg border border-border/70 bg-background px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{revision.revisionNumber}</p>
            <StatusBadge status={revision.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {revision.submittedBy} - {formatDate(revision.date)}
          </p>
          <p className="mt-1 text-xs font-medium text-foreground">{revision.notes}</p>
        </div>
      ))}
    </div>
  );
}

function LmcPipelineDetail({
  customerId,
  values: initialValues,
  initialPipeId,
  completion,
}: {
  customerId: string;
  values: LmcPipelineWork;
  initialPipeId?: string | null;
  completion?: SectionCompletionResult;
}) {
  const [values, setValues] = useState(initialValues);
  const [editingPipeId, setEditingPipeId] = useState<string | null>(initialPipeId ?? null);
  const upsertPipeRecord = useUpsertLmcPipeRecord(customerId);
  const editingPipe = values.pipeRecords.find((record) => record.id === editingPipeId) ?? null;
  const overallStatus = deriveLmcOverallStatus(values.pipeRecords);
  const pipeInputFields = lmcPipeRecordFields.filter(
    (field) => field.key !== "evidence",
  ) as FieldDefinition<Omit<LmcPipeEditableFields, "evidence">>[];

  const updatePipeRecord = (nextRecord: LmcPipeSizeRecord) => {
    setValues((current) => ({
      ...current,
      pipeRecords: current.pipeRecords.map((record) =>
        record.id === nextRecord.id ? nextRecord : record,
      ),
    }));
  };

  const closeSheet = () => {
    if (editingPipe) {
      upsertPipeRecord.mutate(editingPipe);
    }
    setEditingPipeId(null);
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Pipe Size Records"
        action={
          <div className="flex items-center gap-2">
            <SectionStatusBadge result={completion} />
            <StatusBadge status={overallStatus} />
          </div>
        }
      >
        <div className="overflow-hidden rounded-lg border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-muted/35 hover:bg-muted/35">
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Pipe Size</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Length</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Laying Date</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Testing Date</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Purging Date</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Current Stage</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Evidence</TableHead>
                <TableHead className="h-8 px-3 text-right text-xs font-semibold text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {values.pipeRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer border-border/45 bg-card hover:bg-muted/30"
                  onClick={() => setEditingPipeId(record.id)}
                >
                  <TableCell className="px-3 py-2 font-semibold text-foreground">{record.pipeSize}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{record.lengthMetres || "-"}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{formatDate(record.layingDate)}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{formatDate(record.testingDate)}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{formatDate(record.purgingDate)}</TableCell>
                  <TableCell className="px-3 py-2"><StatusBadge status={deriveLmcPipeCurrentStage(record)} /></TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">
                    <EvidencePreview files={record.evidence} />
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPipeId(record.id)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <Sheet open={Boolean(editingPipe)} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="!w-[min(56rem,calc(100vw-1rem))] !max-w-none gap-0 overflow-x-hidden border-l-0 shadow-none">
          {editingPipe ? (
            <>
              <SheetHeader className="bg-muted/20 px-5 py-4">
                <SheetTitle>Edit {editingPipe.pipeSize} Pipe</SheetTitle>
                <SheetDescription>
                  Update this pipe sub-record inside the same customer LMC record.
                </SheetDescription>
              </SheetHeader>
              <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4">
                <SectionFields
                  fields={pipeInputFields}
                  values={pickPipeEditableFields(editingPipe)}
                  onChange={(next) => updatePipeRecord({ ...editingPipe, ...next })}
                />
                <div className="mt-4">
                  <FormField label="Evidence Images">
                    <ImageUploadPreview
                      key={editingPipe.id}
                      className="min-w-0"
                      images={evidenceFilesToImages(editingPipe.evidence)}
                      onChange={(images) =>
                        updatePipeRecord({
                          ...editingPipe,
                          evidence: imagesToEvidenceFiles(images),
                        })
                      }
                      module="customers"
                      recordId={customerId}
                    />
                  </FormField>
                </div>
              </div>
              <SheetFooter className="bg-card/95 px-5 py-4">
                <Button type="button" disabled={upsertPipeRecord.isPending} onClick={closeSheet}>
                  {upsertPipeRecord.isPending ? "Saving..." : "Done"}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <SectionCard title="Civil / Surface Work">
        <KeyValueGrid items={itemsFromFields(lmcPipelineFields, pickCivilFields(values))} columns={3} />
      </SectionCard>
    </div>
  );
}

function pickCivilFields(values: LmcPipelineWork): LmcCivilWork {
  return {
    fourMetresUnderGc: values.fourMetresUnderGc,
    fourMetresAboveGc: values.fourMetresAboveGc,
    tfHalfInch: values.tfHalfInch,
    tfOneInch: values.tfOneInch,
    pcc: values.pcc,
    rccNalaCrossing: values.rccNalaCrossing,
    paverBlocks: values.paverBlocks,
    malua: values.malua,
    hardRock: values.hardRock,
  };
}

function pickPipeEditableFields(record: LmcPipeSizeRecord): Omit<LmcPipeEditableFields, "evidence"> {
  return {
    lengthMetres: record.lengthMetres,
    layingDate: record.layingDate,
    testingDate: record.testingDate,
    purgingDate: record.purgingDate,
    layingStatus: record.layingStatus,
    testingStatus: record.testingStatus,
    purgingStatus: record.purgingStatus,
    jointFittingDetails: record.jointFittingDetails,
    remarks: record.remarks,
  };
}

function SectionFields<T extends Record<string, string | boolean>>({
  fields,
  values,
  onChange,
}: {
  fields: FieldDefinition<T>[];
  values: T;
  onChange: (values: T) => void;
}) {
  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <MasterField
          key={String(field.key)}
          field={field}
          value={values[field.key]}
          onChange={(value) => onChange({ ...values, [field.key]: value })}
        />
      ))}
    </div>
  );
}

function MasterField<T extends Record<string, string | boolean>>({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition<T>;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  if (field.input === "textarea") {
    return (
      <FormField label={field.label}>
        <Textarea value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} rows={3} />
      </FormField>
    );
  }

  if (field.input === "date") {
    return (
      <FormField label={field.label}>
        <DatePicker value={String(value ?? "")} onChange={onChange} className="w-full min-w-0" />
      </FormField>
    );
  }

  if (field.input === "select") {
    return (
      <FormField label={field.label}>
        <Select value={String(value || "") || undefined} onValueChange={(next) => onChange(next ?? "")}>
          <SelectTrigger className="w-full min-w-0">
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    );
  }

  return (
    <FormField label={field.label}>
      <Input
        type={field.input === "number" ? "number" : "text"}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}


function itemsFromFields<T extends Record<string, string | boolean>>(
  fields: { key: keyof T; label: string; input?: string }[],
  values: T,
): KeyValueItem[] {
  return fields.map((field) => ({
    label: field.label,
    value: formatValue(values[field.key], field.input),
  }));
}

function formatValue(value: string | boolean, input?: string) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (!value) return "-";
  if (input === "date") return formatDate(value);
  return value;
}

function EvidencePreview({ files }: { files: LmcEvidenceFile[] }) {
  if (!files.length) return <span>-</span>;

  return (
    <div className="flex max-w-56 flex-wrap gap-1.5">
      {files.map((file) => (
        <span
          key={file.id}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/25 px-1.5 py-1 text-xs text-foreground"
          title={file.fileName}
        >
          {file.fileUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.fileUrl} alt={file.fileName} className="h-4 w-4 rounded-xs object-cover" />
          ) : (
            <ImageSquareIcon size={14} className="text-primary" />
          )}
          <span className="max-w-24 truncate">{file.fileName}</span>
        </span>
      ))}
    </div>
  );
}

function evidenceFilesToImages(files: LmcEvidenceFile[]): ImagePreviewItem[] {
  return files.map((file) => ({
    id: file.id,
    label: file.label,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    status: file.fileUrl ? "uploaded" : undefined,
  }));
}

function imagesToEvidenceFiles(images: ImagePreviewItem[]): LmcEvidenceFile[] {
  return images.map((image) => ({
    id: image.id,
    label: image.label,
    fileName: image.fileName,
    fileUrl: image.fileUrl,
  }));
}

function formatDate(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
