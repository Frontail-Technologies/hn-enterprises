"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionAnchorTabs } from "@/components/shared/SectionAnchorTabs";
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

const projectFormSectionLinks = [
  { href: "#project-details", label: "Project Details" },
  { href: "#contract-dates", label: "Contract & Dates" },
  { href: "#description", label: "Description" },
];

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

      <SectionAnchorTabs items={projectFormSectionLinks} className="mb-3" />

      <form className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-5">
        <section id="project-details" className="scroll-mt-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FormField label="Project Name">
              <Input defaultValue={values.name} placeholder="Shyam Nagar CGD Project" />
            </FormField>
            <FormField label="Project Code / Contract ID">
              <Input defaultValue={values.code} placeholder="CGD-SN-2025" />
            </FormField>
            <FormField label="Client">
              <Input defaultValue={values.client} placeholder="Client name" />
            </FormField>
            <FormField label="Consultant">
              <Input defaultValue={values.consultant} placeholder="Consultant name" />
            </FormField>
            <FormField label="Contractor">
              <Input defaultValue={values.contractor} placeholder="Contractor name" />
            </FormField>
            <FormField label="Project Type">
              <Input defaultValue={values.projectType} placeholder="CGD Network" />
            </FormField>
          </div>
        </section>

        <section id="contract-dates" className="scroll-mt-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FormField label="City">
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
            </FormField>
            <FormField label="Area / Location">
              <Input defaultValue={values.area} placeholder="Area or site location" />
            </FormField>
            <FormField label="Status">
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
            </FormField>
            <FormField label="Start Date">
              <DatePicker value={startDate} onChange={setStartDate} />
            </FormField>
            <FormField label="Planned End Date">
              <DatePicker value={plannedEndDate} onChange={setPlannedEndDate} />
            </FormField>
            <FormField label="Contract Value">
              <Input defaultValue={values.contractValue} placeholder="Rs 12.50 Cr" />
            </FormField>
            <FormField label="Assigned Supervisor / Project Manager">
              <Input defaultValue={values.assignedManager} placeholder="Manager name" />
            </FormField>
          </div>
        </section>

        <section id="description" className="scroll-mt-12">
          <FormField label="Description">
            <Textarea
              defaultValue={values.description}
              placeholder="Brief project scope and notes"
              className="min-h-24"
            />
          </FormField>
        </section>

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

