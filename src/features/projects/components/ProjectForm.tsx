"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { DatePicker } from "@/components/shared/DatePicker";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  cityOptions,
  projectStatusOptions,
} from "@/features/projects/services/projects.service";
import type { Project, ProjectFormValues } from "../types/project.types";
import { ProjectBreadcrumb } from "./ProjectBreadcrumb";

const defaultValues: ProjectFormValues = {
  name: "",
  code: "",
  client: "",
  consultant: "",
  contractor: "",
  projectType: "",
  city: "",
  area: "",
  description: "",
  startDate: "",
  plannedEndDate: "",
  status: "Draft",
  contractValue: "",
  assignedManager: "",
};

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: Project;
}

export function ProjectForm({ mode, project }: ProjectFormProps) {
  const values = project ?? defaultValues;
  const isEdit = mode === "edit";
  const [startDate, setStartDate] = useState(values.startDate);
  const [plannedEndDate, setPlannedEndDate] = useState(values.plannedEndDate);

  return (
    <div>
      <ProjectBreadcrumb
        items={[
          { label: "Projects", href: "/projects" },
          ...(isEdit && project
            ? [
                { label: project.name, href: `/projects/${project.id}` },
                { label: "Edit" },
              ]
            : [{ label: "Create Project" }]),
        ]}
      />

      <PageHeader
        title={isEdit ? "Edit Project" : "Create Project"}
        subtitle={
          isEdit
            ? "Update project contract and delivery information."
            : "Add contract, location, and ownership details for a new project."
        }
      />

      <form className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Project Name">
            <Input defaultValue={values.name} placeholder="Shyam Nagar CGD Project" />
          </Field>
          <Field label="Project Code / Contract ID">
            <Input defaultValue={values.code} placeholder="CGD-SN-2025" />
          </Field>
          <Field label="Client">
            <Input defaultValue={values.client} placeholder="Client name" />
          </Field>
          <Field label="Consultant">
            <Input defaultValue={values.consultant} placeholder="Consultant name" />
          </Field>
          <Field label="Contractor">
            <Input defaultValue={values.contractor} placeholder="Contractor name" />
          </Field>
          <Field label="Project Type">
            <Input defaultValue={values.projectType} placeholder="CGD Network" />
          </Field>
          <Field label="City">
            <Select defaultValue={values.city || undefined}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {[...cityOptions, "Kota", "Jodhpur"].map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Area / Location">
            <Input defaultValue={values.area} placeholder="Area or site location" />
          </Field>
          <Field label="Status">
            <Select defaultValue={values.status}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Start Date">
            <DatePicker value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="Planned End Date">
            <DatePicker value={plannedEndDate} onChange={setPlannedEndDate} />
          </Field>
          <Field label="Contract Value">
            <Input defaultValue={values.contractValue} placeholder="Rs 12.50 Cr" />
          </Field>
          <Field label="Assigned Supervisor / Project Manager">
            <Input defaultValue={values.assignedManager} placeholder="Manager name" />
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            defaultValue={values.description}
            placeholder="Brief project scope and notes"
            className="min-h-24"
          />
        </Field>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
          <Link
            href={isEdit && project ? `/projects/${project.id}` : "/projects"}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          {!isEdit ? (
            <Button type="button" variant="secondary">
              Save Draft
            </Button>
          ) : null}
          <Button type="button">{isEdit ? "Save Changes" : "Create Project"}</Button>
        </div>
      </form>
    </div>
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
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  );
}
