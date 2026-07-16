"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  DownloadSimpleIcon,
  EyeIcon,
  FileArrowUpIcon,
  MapPinIcon,
  NotePencilIcon,
  PlusIcon,
  TrashIcon,
  UploadSimpleIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DatePicker } from "@/components/shared/DatePicker";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { LocationPreview } from "@/components/shared/LocationPreview";
import { SectionAnchorTabs } from "@/components/shared/SectionAnchorTabs";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge, type StatusValue } from "@/components/shared/StatusBadge";
import {
  assignedUsers,
  projectDocuments,
  projectSites,
} from "@/features/projects/services/projects.service";
import type {
  ActivityItem,
  AssignedUser,
  Project,
  ProjectDocument,
  ProjectSite,
} from "../types/project.types";

type TargetValues = Record<string, string>;
type ChangeHistoryItem = {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  user: string;
  date: string;
  reason: string;
};

type ProjectPlanningDprItem = {
  id: string;
  date: string;
  activity: string;
  site: string;
  plannedQuantity: string;
  completedQuantity: string;
  delayReason: string;
  supervisor: string;
  status: StatusValue;
};

type ProjectApprovalItem = {
  id: string;
  reference: string;
  module: string;
  submittedBy: string;
  submittedOn: string;
  remarks: string;
  status: StatusValue;
};

const documentCategories = [
  "Tender",
  "LOA",
  "FOA",
  "BG",
  "RO",
  "Statutory",
  "Other",
];

const statusOptions = [
  "Active",
  "In Progress",
  "Not Started",
  "On Hold",
  "Completed",
];
const teamRoleOptions = [
  "Project Manager",
  "Site Supervisor",
  "Survey Lead",
  "Billing Executive",
  "Document Controller",
  "Safety Officer",
];

const projectPlanningDprItems: ProjectPlanningDprItem[] = [
  {
    id: "dpr-1",
    date: "2025-02-12",
    activity: "LMC trenching and pipe laying",
    site: "Shyam Nagar Block A",
    plannedQuantity: "220 m",
    completedQuantity: "185 m",
    delayReason: "-",
    supervisor: "Ramesh Kumar",
    status: "In Progress",
  },
  {
    id: "dpr-2",
    date: "2025-02-13",
    activity: "GI installation follow-up",
    site: "Shyam Nagar Block B",
    plannedQuantity: "18 connections",
    completedQuantity: "14 connections",
    delayReason: "Customer availability",
    supervisor: "Kavita Joshi",
    status: "Pending",
  },
  {
    id: "dpr-3",
    date: "2025-02-14",
    activity: "GC evidence correction",
    site: "Shyam Nagar Block B",
    plannedQuantity: "8 records",
    completedQuantity: "8 records",
    delayReason: "-",
    supervisor: "Amit Rathore",
    status: "Completed",
  },
];

const projectApprovalItems: ProjectApprovalItem[] = [
  {
    id: "approval-1",
    reference: "SUR-553901",
    module: "Survey",
    submittedBy: "Amit Rathore",
    submittedOn: "2025-02-06",
    remarks: "Meter placement revision submitted.",
    status: "Sent Back",
  },
  {
    id: "approval-2",
    reference: "GC-553901",
    module: "GC Upload",
    submittedBy: "Kavita Joshi",
    submittedOn: "2025-02-14",
    remarks: "GC photos pending final review.",
    status: "In Review",
  },
  {
    id: "approval-3",
    reference: "DPR-2025-0214",
    module: "Planning & DPR",
    submittedBy: "Ramesh Kumar",
    submittedOn: "2025-02-14",
    remarks: "Daily progress submitted for site work.",
    status: "Approved",
  },
];

const projectSectionLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#contract", label: "Contract & Targets" },
  { href: "#sites", label: "Sites" },
  { href: "#documents", label: "Documents" },
  { href: "#team", label: "Team" },
  { href: "#planning", label: "Planning & DPR" },
  { href: "#approvals", label: "Approvals" },
];

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">
              {project.name}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
            <span>{project.code}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>{project.city}</span>
          </div>
        </div>
        <Link
          href={`/projects/${project.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          <NotePencilIcon size={15} />
          Edit
        </Link>
      </div>

      <ProjectSectionNav />

      <div className="space-y-4">
        <section id="overview" className="scroll-mt-16">
          <ProjectOverview project={project} />
        </section>
        <section id="contract" className="scroll-mt-16">
          <ContractTargets project={project} />
        </section>
        <section id="sites" className="scroll-mt-16">
          <ProjectSites />
        </section>
        <section id="documents" className="scroll-mt-16">
          <ProjectDocuments />
        </section>
        <section id="team" className="scroll-mt-16">
          <ProjectTeam />
        </section>
        <section id="planning" className="scroll-mt-16">
          <ProjectPlanningDpr />
        </section>
        <section id="approvals" className="scroll-mt-16">
          <ProjectApprovals />
        </section>
        {false ? <ActivityTimeline items={[]} /> : null}
      </div>
    </div>
  );
}

function ProjectSectionNav() {
  return <SectionAnchorTabs items={projectSectionLinks} />;
}

function ProjectPlanningDpr() {
  const columns: ColumnDef<ProjectPlanningDprItem>[] = [
    { key: "date", header: "Date", render: (item) => formatDate(item.date) },
    { key: "activity", header: "Activity", className: "min-w-56" },
    { key: "site", header: "Site" },
    { key: "plannedQuantity", header: "Planned Qty" },
    { key: "completedQuantity", header: "Completed Qty" },
    { key: "delayReason", header: "Delay Reason", className: "min-w-40" },
    { key: "supervisor", header: "Supervisor" },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <SectionCard title="Planning & DPR">
      <DataTable
        columns={columns}
        data={projectPlanningDprItems}
        variant="striped"
      />
    </SectionCard>
  );
}

function ProjectApprovals() {
  const columns: ColumnDef<ProjectApprovalItem>[] = [
    { key: "reference", header: "Reference", className: "font-medium" },
    { key: "module", header: "Module" },
    { key: "submittedBy", header: "Submitted By" },
    {
      key: "submittedOn",
      header: "Submitted On",
      render: (item) => formatDate(item.submittedOn),
    },
    { key: "remarks", header: "Remarks", className: "min-w-64" },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <SectionCard title="Project Approvals">
      <DataTable
        columns={columns}
        data={projectApprovalItems}
        variant="striped"
      />
    </SectionCard>
  );
}

function ProjectOverview({ project }: { project: Project }) {
  const summary = [
    ["Client", project.client],
    ["Consultant", project.consultant],
    ["Contractor", project.contractor],
    ["Project Type", project.projectType],
    ["City", project.city],
    ["Area / Location", project.area],
    ["Start Date", formatDate(project.startDate)],
    ["End Date", formatDate(project.plannedEndDate)],
    ["Contract Value", project.contractValue],
    ["Project Manager", project.assignedManager],
    ["Description", project.description],
  ];

  return (
    <SectionCard title="Project Information">
      <InfoGrid items={summary} />
    </SectionCard>
  );
}

function ProjectSites() {
  const [sites, setSites] = useState<ProjectSite[]>(projectSites);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<ProjectSite | null>(null);
  const [draft, setDraft] = useState<ProjectSite>(emptySite);

  const columns: ColumnDef<ProjectSite>[] = [
    { key: "name", header: "Site Name" },
    { key: "code", header: "Site Code" },
    { key: "city", header: "City" },
    { key: "fullAddress", header: "Address" },
    { key: "plannedConnections", header: "Planned Connections" },
    { key: "supervisor", header: "Supervisor" },
    {
      key: "status",
      header: "Status",
      render: (site) => <StatusBadge status={site.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (site) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="View Map">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="View site map"
              onClick={() => {
                setSelectedSite(site);
                setMapOpen(true);
              }}
            >
              <MapPinIcon size={14} />
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Edit">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit site"
              onClick={() => {
                setEditingId(site.id);
                setDraft(site);
                setDialogOpen(true);
              }}
            >
              <NotePencilIcon size={14} />
            </Button>
          </ActionTooltip>
        </div>
      ),
    },
  ];

  const saveSite = () => {
    if (!draft.name || !draft.code) return;
    if (editingId) {
      setSites((current) =>
        current.map((site) => (site.id === editingId ? draft : site)),
      );
    } else {
      setSites((current) => [
        ...current,
        { ...draft, id: `site-${current.length + 1}` },
      ]);
    }
    setDialogOpen(false);
    setEditingId(null);
    setDraft(emptySite);
  };

  return (
    <SectionCard
      title="Sites"
      action={
        <Button
          size="sm"
          onClick={() => {
            setEditingId(null);
            setDraft(emptySite);
            setDialogOpen(true);
          }}
        >
          <PlusIcon size={14} />
          Add Site
        </Button>
      }
    >
      <DataTable columns={columns} data={sites} variant="striped" />
      <SiteDialog
        open={dialogOpen}
        title={editingId ? "Edit Site" : "Add Site"}
        draft={draft}
        setDraft={setDraft}
        onOpenChange={setDialogOpen}
        onSave={saveSite}
      />
      <SiteMapDialog
        open={mapOpen}
        site={selectedSite}
        onOpenChange={setMapOpen}
      />
    </SectionCard>
  );
}

function ContractTargets({ project }: { project: Project }) {
  const [targetValues, setTargetValues] = useState<TargetValues>({
    "Planned Customers": "5,200",
    "Planned Surveys": "5,800",
    "Planned Plumbing/GI": "4,750",
    "Planned GC": "4,200",
    "Planned Commissioning": "3,850",
    "Planned Conversion": "3,600",
    "Planned JMR": "42",
    "20MM": "18.4 KM",
    "32MM": "12.8 KM",
    "63MM": "8.5 KM",
    "90MM": "4.2 KM",
    "125MM": "1.7 KM",
  });
  const [draftTargets, setDraftTargets] = useState<TargetValues>(targetValues);
  const [reason, setReason] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [history, setHistory] = useState<ChangeHistoryItem[]>([
    {
      id: "hist-1",
      field: "Planned Customers",
      oldValue: "5,000",
      newValue: "5,200",
      user: "Demo Admin",
      date: "2025-01-22",
      reason: "Updated after contract reconciliation.",
    },
  ]);
  const details = [
    ["Contract ID", project.code],
    ["Client", project.client],
    ["Consultant", project.consultant],
    ["Contractor", project.contractor],
    ["Contract Value", project.contractValue],
    ["Start Date", formatDate(project.startDate)],
    ["Planned End Date", formatDate(project.plannedEndDate)],
    ["Billing Method", "Milestone Based"],
  ];
  const targetKeys = [
    "Planned Customers",
    "Planned Surveys",
    "Planned Plumbing/GI",
    "Planned GC",
    "Planned Commissioning",
    "Planned Conversion",
    "Planned JMR",
  ];
  const pipeKeys = ["20MM", "32MM", "63MM", "90MM", "125MM"];

  const saveTargets = () => {
    if (!reason.trim()) return;
    const changes = Object.entries(draftTargets)
      .filter(([key, value]) => targetValues[key] !== value)
      .map(([key, value], index) => ({
        id: `hist-${Date.now()}-${index}`,
        field: key,
        oldValue: targetValues[key],
        newValue: value,
        user: "Demo Admin",
        date: format(new Date(), "yyyy-MM-dd"),
        reason,
      }));

    setTargetValues(draftTargets);
    setHistory((current) => [...changes, ...current]);
    setReason("");
    setEditOpen(false);
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Contract Details">
        <InfoGrid items={details} />
      </SectionCard>
      <SectionCard
        title="Operational Targets"
        action={
          <Button
            size="sm"
            onClick={() => {
              setDraftTargets(targetValues);
              setReason("");
              setEditOpen(true);
            }}
          >
            <NotePencilIcon size={14} />
            Edit Targets
          </Button>
        }
      >
        <InfoGrid items={targetKeys.map((key) => [key, targetValues[key]])} />
      </SectionCard>
      <SectionCard title="Pipe-Size Targets">
        <InfoGrid items={pipeKeys.map((key) => [key, targetValues[key]])} />
      </SectionCard>
      {false ? <SectionCard title="Change History">
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-muted/35 px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{item.field}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.date)}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                {item.oldValue} to {item.newValue}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.user} · {item.reason}
              </p>
            </div>
          ))}
        </div>
      </SectionCard> : null}
      <TargetsDialog
        open={editOpen}
        draftTargets={draftTargets}
        reason={reason}
        targetKeys={targetKeys}
        pipeKeys={pipeKeys}
        onDraftChange={setDraftTargets}
        onReasonChange={setReason}
        onOpenChange={setEditOpen}
        onSave={saveTargets}
      />
    </div>
  );
}

function ProjectDocuments() {
  const [documents, setDocuments] =
    useState<ProjectDocument[]>(projectDocuments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProjectDocument>(emptyDocument);

  const columns: ColumnDef<ProjectDocument>[] = [
    { key: "type", header: "Type" },
    { key: "number", header: "Number" },
    { key: "category", header: "Category" },
    {
      key: "issueDate",
      header: "Issue Date",
      render: (doc) => formatDate(doc.issueDate),
    },
    {
      key: "expiryDate",
      header: "Expiry Date",
      render: (doc) => formatDate(doc.expiryDate),
    },
    { key: "amount", header: "Amount" },
    { key: "fileName", header: "File" },
    {
      key: "actions",
      header: "Actions",
      className: "w-64",
      render: (doc) => (
        <div className="flex flex-wrap items-center gap-1">
          <ActionButton label="Preview" icon={<EyeIcon size={13} />} />
          <ActionButton
            label="Download"
            icon={<DownloadSimpleIcon size={13} />}
          />
          <ActionTooltip label="Edit">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Edit document"
              onClick={() => {
                setEditingId(doc.id);
                setDraft(doc);
                setDialogOpen(true);
              }}
            >
              <NotePencilIcon size={13} />
            </Button>
          </ActionTooltip>
          <ActionButton label="Replace" icon={<UploadSimpleIcon size={13} />} />
          <ActionTooltip label="Delete">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Delete document"
              onClick={() =>
                setDocuments((current) =>
                  current.filter((item) => item.id !== doc.id),
                )
              }
            >
              <TrashIcon size={13} />
            </Button>
          </ActionTooltip>
        </div>
      ),
    },
  ];

  const saveDocument = () => {
    if (!draft.type || !draft.number) return;
    if (editingId) {
      setDocuments((current) =>
        current.map((doc) => (doc.id === editingId ? draft : doc)),
      );
    } else {
      setDocuments((current) => [
        ...current,
        { ...draft, id: `doc-${current.length + 1}` },
      ]);
    }
    setDialogOpen(false);
    setEditingId(null);
    setDraft(emptyDocument);
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Document Categories"
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null);
              setDraft(emptyDocument);
              setDialogOpen(true);
            }}
          >
            <FileArrowUpIcon size={14} />
            Upload Document
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {documentCategories.map((category) => (
            <button
              key={category}
              className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4 text-center text-sm font-semibold text-foreground hover:border-primary hover:bg-primary/5"
              onClick={() => {
                setEditingId(null);
                setDraft({ ...emptyDocument, category, type: category });
                setDialogOpen(true);
              }}
            >
              <FileArrowUpIcon
                size={20}
                className="mx-auto mb-2 text-primary"
              />
              {category}
              <span className="mt-1 block text-xs font-medium text-muted-foreground">
                {
                  documents.filter(
                    (doc) =>
                      doc.category.includes(category) || doc.type === category,
                  ).length
                }{" "}
                uploaded
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Uploaded Documents">
        <DataTable columns={columns} data={documents} variant="striped" />
      </SectionCard>

      <DocumentDialog
        open={dialogOpen}
        title={editingId ? "Edit Document" : "Upload Document"}
        draft={draft}
        setDraft={setDraft}
        onOpenChange={setDialogOpen}
        onSave={saveDocument}
      />
    </div>
  );
}

function ProjectTeam() {
  const [users, setUsers] = useState<AssignedUser[]>(assignedUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AssignedUser>(emptyAssignment);

  const columns: ColumnDef<AssignedUser>[] = [
    { key: "name", header: "Assigned User" },
    { key: "role", header: "Role" },
    { key: "siteArea", header: "Site / Area" },
    {
      key: "assignmentDate",
      header: "Assignment Date",
      render: (user) => formatDate(user.assignmentDate),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="Edit">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit assignment"
              onClick={() => {
                setEditingId(user.id);
                setDraft(user);
                setDialogOpen(true);
              }}
            >
              <NotePencilIcon size={14} />
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Remove">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remove assignment"
              onClick={() =>
                setUsers((current) =>
                  current.filter((item) => item.id !== user.id),
                )
              }
            >
              <TrashIcon size={14} />
            </Button>
          </ActionTooltip>
        </div>
      ),
    },
  ];

  const saveAssignment = () => {
    if (!draft.name || !draft.role) return;
    if (editingId) {
      setUsers((current) =>
        current.map((user) => (user.id === editingId ? draft : user)),
      );
    } else {
      setUsers((current) => [
        ...current,
        { ...draft, id: `user-${current.length + 1}` },
      ]);
    }
    setDialogOpen(false);
    setEditingId(null);
    setDraft(emptyAssignment);
  };

  return (
    <SectionCard
      title="Team"
      action={
        <Button
          size="sm"
          onClick={() => {
            setEditingId(null);
            setDraft(emptyAssignment);
            setDialogOpen(true);
          }}
        >
          <UserPlusIcon size={14} />
          Assign User
        </Button>
      }
    >
      <DataTable columns={columns} data={users} variant="striped" />
      <TeamDialog
        open={dialogOpen}
        title={editingId ? "Edit Assignment" : "Assign User"}
        draft={draft}
        setDraft={setDraft}
        onOpenChange={setDialogOpen}
        onSave={saveAssignment}
      />
    </SectionCard>
  );
}

function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <SectionCard title="Activity">
      <div className="relative space-y-3 before:absolute before:bottom-4 before:left-[5px] before:top-4 before:w-px before:bg-primary/25">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative grid grid-cols-[14px_1fr] gap-3"
          >
            <span className="relative z-10 mt-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/10" />
            <div className="rounded-lg bg-muted/35 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(item.dateTime)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.actor} ·{" "}
                <Link
                  href="#"
                  className="font-semibold text-primary hover:underline"
                >
                  {item.relatedRecord}
                </Link>
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function TargetsDialog({
  open,
  draftTargets,
  reason,
  targetKeys,
  pipeKeys,
  onDraftChange,
  onReasonChange,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  draftTargets: TargetValues;
  reason: string;
  targetKeys: string[];
  pipeKeys: string[];
  onDraftChange: React.Dispatch<React.SetStateAction<TargetValues>>;
  onReasonChange: (reason: string) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Targets</DialogTitle>
          <DialogDescription>
            Changes require a reason and will be recorded in history.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          {[...targetKeys, ...pipeKeys].map((key) => (
            <CompactInput
              key={key}
              label={key}
              value={draftTargets[key] ?? ""}
              onChange={(value) =>
                onDraftChange((current) => ({ ...current, [key]: value }))
              }
            />
          ))}
          <Field label="Change Reason">
            <Textarea
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Required before saving"
              className="min-h-20"
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!reason.trim()} onClick={onSave}>
            Save Targets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SiteDialog({
  open,
  title,
  draft,
  setDraft,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  title: string;
  draft: ProjectSite;
  setDraft: React.Dispatch<React.SetStateAction<ProjectSite>>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Maintain compact project site details.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto pr-1">
          <div className="grid gap-3 md:grid-cols-2">
            <CompactInput
              label="Site Name"
              value={draft.name}
              onChange={(value) =>
                setDraft((current) => ({ ...current, name: value }))
              }
            />
            <CompactInput
              label="Site Code"
              value={draft.code}
              onChange={(value) =>
                setDraft((current) => ({ ...current, code: value }))
              }
            />
            <CompactInput
              label="City"
              value={draft.city}
              onChange={(value) =>
                setDraft((current) => ({ ...current, city: value }))
              }
            />
            <CompactInput
              label="Latitude"
              type="number"
              value={String(draft.latitude)}
              onChange={(value) =>
                setDraft((current) => ({ ...current, latitude: Number(value) }))
              }
            />
            <CompactInput
              label="Longitude"
              type="number"
              value={String(draft.longitude)}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  longitude: Number(value),
                }))
              }
            />
            <CompactInput
              label="Supervisor"
              value={draft.supervisor}
              onChange={(value) =>
                setDraft((current) => ({ ...current, supervisor: value }))
              }
            />
            <CompactInput
              label="Planned Connections"
              type="number"
              value={String(draft.plannedConnections)}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  plannedConnections: Number(value),
                }))
              }
            />
            <CompactInput
              label="Start Date"
              type="date"
              value={draft.startDate}
              onChange={(value) =>
                setDraft((current) => ({ ...current, startDate: value }))
              }
            />
            <CompactInput
              label="End Date"
              type="date"
              value={draft.endDate}
              onChange={(value) =>
                setDraft((current) => ({ ...current, endDate: value }))
              }
            />
            <Field label="Status">
              <Select
                value={draft.status}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    status: (value ?? "Active") as StatusValue,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Full Address">
              <Textarea
                value={draft.fullAddress}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    fullAddress: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Remarks">
              <Textarea
                value={draft.remarks}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    remarks: event.target.value,
                  }))
                }
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Pick on Map">
                <LocationPicker
                  latitude={draft.latitude}
                  longitude={draft.longitude}
                  heightClassName="h-40"
                  onChange={(coordinates) =>
                    setDraft((current) => ({
                      ...current,
                      latitude: coordinates.latitude,
                      longitude: coordinates.longitude,
                    }))
                  }
                />
              </Field>
            </div>
          </div>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Site</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SiteMapDialog({
  open,
  site,
  onOpenChange,
}: {
  open: boolean;
  site: ProjectSite | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!site) return null;
  const mapsHref = `https://www.google.com/maps?q=${site.latitude},${site.longitude}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{site.name}</DialogTitle>
          <DialogDescription>{site.code}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <LocationPreview
            latitude={site.latitude}
            longitude={site.longitude}
          />
          <InfoGrid
            items={[
              ["Address", site.fullAddress],
              [
                "Coordinates",
                `${site.latitude.toFixed(6)}, ${site.longitude.toFixed(6)}`,
              ],
              ["City", site.city],
              ["Supervisor", site.supervisor],
            ]}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Link
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            Open in Google Maps
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentDialog({
  open,
  title,
  draft,
  setDraft,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  title: string;
  draft: ProjectDocument;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDocument>>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Add contract and statutory document details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <CompactInput
            label="Type"
            value={draft.type}
            onChange={(value) =>
              setDraft((current) => ({ ...current, type: value }))
            }
          />
          <CompactInput
            label="Number"
            value={draft.number}
            onChange={(value) =>
              setDraft((current) => ({ ...current, number: value }))
            }
          />
          <Field label="Category">
            <Select
              value={draft.category}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  category: value ?? "Other",
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <CompactInput
            label="Amount"
            value={draft.amount}
            onChange={(value) =>
              setDraft((current) => ({ ...current, amount: value }))
            }
          />
          <CompactInput
            label="Issue Date"
            type="date"
            value={draft.issueDate}
            onChange={(value) =>
              setDraft((current) => ({ ...current, issueDate: value }))
            }
          />
          <CompactInput
            label="Expiry Date"
            type="date"
            value={draft.expiryDate}
            onChange={(value) =>
              setDraft((current) => ({ ...current, expiryDate: value }))
            }
          />
          <CompactInput
            label="File"
            type="file"
            value=""
            onChange={() => undefined}
          />
          <Field label="Remarks">
            <Textarea
              value={draft.remarks}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  remarks: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamDialog({
  open,
  title,
  draft,
  setDraft,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  title: string;
  draft: AssignedUser;
  setDraft: React.Dispatch<React.SetStateAction<AssignedUser>>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Assign a user to a project role and site or area.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <CompactInput
            label="Assigned User"
            value={draft.name}
            onChange={(value) =>
              setDraft((current) => ({ ...current, name: value }))
            }
          />
          <Field label="Role">
            <Select
              value={draft.role || undefined}
              onValueChange={(value) =>
                setDraft((current) => ({ ...current, role: value ?? "" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {teamRoleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <CompactInput
            label="Site / Area"
            value={draft.siteArea}
            onChange={(value) =>
              setDraft((current) => ({ ...current, siteArea: value }))
            }
          />
          <CompactInput
            label="Assignment Date"
            type="date"
            value={draft.assignmentDate}
            onChange={(value) =>
              setDraft((current) => ({ ...current, assignmentDate: value }))
            }
          />
          <Field label="Status">
            <Select
              value={draft.status}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  status: (value ?? "Active") as StatusValue,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoGrid({ items }: { items: string[][] }) {
  return (
    <KeyValueGrid
      items={items.map(([label, value]) => ({ label, value }))}
      columns={2}
    />
  );
}

function ActionButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <ActionTooltip label={label}>
      <Button variant="ghost" size="icon-xs" aria-label={label}>
        {icon}
      </Button>
    </ActionTooltip>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function CompactInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  if (type === "date") {
    return (
      <Field label={label}>
        <DatePicker value={value} onChange={onChange} />
      </Field>
    );
  }

  return (
    <Field label={label}>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function formatDate(value: string) {
  if (!value) return "-";
  return format(parseISO(value), "dd MMM yyyy");
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
}

const emptySite: ProjectSite = {
  id: "new",
  name: "",
  code: "",
  city: "",
  fullAddress: "",
  latitude: 26.8951,
  longitude: 75.7684,
  supervisor: "",
  plannedConnections: 0,
  startDate: "",
  endDate: "",
  status: "Active",
  remarks: "",
};

const emptyDocument: ProjectDocument = {
  id: "new",
  type: "",
  number: "",
  issueDate: "",
  expiryDate: "",
  amount: "",
  category: "Other",
  fileName: "document.pdf",
  remarks: "",
  uploadedOn: format(new Date(), "yyyy-MM-dd"),
  uploadedBy: "Demo Admin",
};

const emptyAssignment: AssignedUser = {
  id: "new",
  name: "",
  role: "",
  siteArea: "",
  assignmentDate: "",
  status: "Active",
};
