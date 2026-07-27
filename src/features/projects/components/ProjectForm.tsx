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
import {
  projectStatusOptions,
} from "@/features/projects/services/projects.service";
import type { Project, ProjectFormValues } from "../types/project.types";

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
      <PageHeader title={isEdit ? "Edit Project" : "Create Project"} />

      <form className="pb-24">
          <div className="rounded-sm border border-border bg-card p-4">
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
              <FormField label="City">
                <Input defaultValue={values.city} placeholder="Enter city" />
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
              <FormField label="Description" className="md:col-span-2 xl:col-span-3">
                <Textarea
                  defaultValue={values.description}
                  placeholder="Brief project scope and notes"
                  className="min-h-28"
                />
              </FormField>
            </div>
          </div>

        <div className="fixed inset-x-3 bottom-3 z-50 flex justify-end gap-2 rounded-sm border border-border bg-card/95 p-2 backdrop-blur sm:inset-x-auto sm:right-5">
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
