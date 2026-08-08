"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  useCreateProject,
  useProjectQuery,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/hooks/useProjects";
import type { ProjectFormValues } from "../types/project.types";
import { PageLoading } from "@/components/shared/PageLoading";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

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
  projectId?: string;
}

export function ProjectForm({ mode, projectId }: ProjectFormProps) {
  const isEdit = mode === "edit";
  const { data: project, isLoading: isLoadingProject } = useProjectQuery(projectId ?? "");

  if (isEdit && isLoadingProject) {
    return <PageLoading />;
  }

  return (
    <ProjectFormFields
      key={project?.id ?? "create"}
      mode={mode}
      projectId={projectId}
      initialValues={project ?? defaultValues}
    />
  );
}

function ProjectFormFields({
  mode,
  projectId,
  initialValues,
}: {
  mode: "create" | "edit";
  projectId?: string;
  initialValues: ProjectFormValues;
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(projectId ?? "");
  const deleteProject = useDeleteProject();
  const mutation = isEdit ? updateProject : createProject;

  const setField = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    if (!(values.name || "").trim()) return;
    const saved = await mutation.mutateAsync(values);
    router.push(`/projects/${isEdit && projectId ? projectId : saved.id}`);
  };

  return (
    <div>
      <PageHeader title={isEdit ? "Edit Project" : "Create Project"} />

      <form
        className="pb-24"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
          <div className="rounded-sm border border-border bg-card p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FormField label="Project Name">
                <Input
                  value={values.name || ""}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="Project name"
                />
              </FormField>
              <FormField label="Project Code">
                <Input
                  value={values.code || ""}
                  onChange={(event) => setField("code", event.target.value)}
                  placeholder="CGD-SN-2025"
                />
              </FormField>
              <FormField label="Client">
                <Input
                  value={values.client || ""}
                  onChange={(event) => setField("client", event.target.value)}
                  placeholder="Client name"
                />
              </FormField>
              <FormField label="Consultant">
                <Input
                  value={values.consultant || ""}
                  onChange={(event) => setField("consultant", event.target.value)}
                  placeholder="Consultant name"
                />
              </FormField>
              <FormField label="Contractor">
                <Input
                  value={values.contractor || ""}
                  onChange={(event) => setField("contractor", event.target.value)}
                  placeholder="Contractor"
                />
              </FormField>
              <FormField label="Project Type">
                <Input
                  value={values.projectType || ""}
                  onChange={(event) => setField("projectType", event.target.value)}
                  placeholder="CGD Network"
                />
              </FormField>
              <FormField label="City">
                <Input
                  value={values.city || ""}
                  onChange={(event) => setField("city", event.target.value)}
                  placeholder="Enter city"
                />
              </FormField>
              <FormField label="Status">
                <Select value={values.status ?? "Draft"} onValueChange={(value) => setField("status", (value ?? "Draft") as ProjectFormValues["status"])}>
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
                <DatePicker value={values.startDate} onChange={(value) => setField("startDate", value)} />
              </FormField>
              <FormField label="Planned End Date">
                <DatePicker
                  value={values.plannedEndDate}
                  onChange={(value) => setField("plannedEndDate", value)}
                />
              </FormField>
              <FormField label="Contract Value">
                <Input
                  value={values.contractValue || ""}
                  onChange={(event) => setField("contractValue", event.target.value)}
                  placeholder="Rs 12.50 Cr"
                />
              </FormField>
              <FormField label="Assigned Supervisor / Project Manager">
                <Input
                  value={values.assignedManager || ""}
                  onChange={(event) => setField("assignedManager", event.target.value)}
                  placeholder="Manager name"
                />
              </FormField>
              <FormField label="Description" className="md:col-span-2 xl:col-span-3">
                <Textarea
                  value={values.description || ""}
                  onChange={(event) => setField("description", event.target.value)}
                  placeholder="Brief project scope and notes"
                  className="min-h-28"
                />
              </FormField>
            </div>
          </div>

        {mutation.isError ? (
          <p className="mt-3 text-sm text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Unable to save project"}
          </p>
        ) : null}

        <div className="fixed inset-x-3 bottom-3 z-50 flex justify-end gap-2 rounded-sm border border-border bg-card/95 p-2 backdrop-blur sm:inset-x-auto sm:right-5">
          {isEdit && projectId && (
            <DeleteConfirmDialog
              itemName={initialValues.name}
              onConfirm={async () => {
                await deleteProject.mutateAsync(projectId);
                router.push("/projects");
              }}
            />
          )}
          <Link
            href={isEdit && projectId ? `/projects/${projectId}` : "/projects"}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
