"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { TrashIcon } from "@phosphor-icons/react";
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
  useProjectDeleteImpactQuery,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/hooks/useProjects";
import { projectFormSchema } from "../schemas/project-form.schema";
import type { ProjectFormValues } from "../types/project.types";
import { PageLoading } from "@/components/shared/PageLoading";
import { DeleteImpactDialog } from "@/components/shared/DeleteImpactDialog";

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
  const { control, register, handleSubmit, formState } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialValues,
  });
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(projectId ?? "");
  const archiveProject = useUpdateProject(projectId ?? "");
  const deleteProject = useDeleteProject();
  const mutation = isEdit ? updateProject : createProject;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteImpact = useProjectDeleteImpactQuery(projectId ?? "", { enabled: deleteDialogOpen });

  const values = useWatch({ control }) as ProjectFormValues;

  const onSubmit = handleSubmit(async (formValues) => {
    const saved = await mutation.mutateAsync(formValues);
    router.push(`/projects/${isEdit && projectId ? projectId : saved.id}`);
  });

  return (
    <div>
      <PageHeader title={isEdit ? "Edit Project" : "Create Project"} />

      <form
        className="pb-24"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
          <div className="rounded-sm border border-border bg-card p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FormField label="Project Name">
                <Input {...register("name")} placeholder="Project name" />
                {formState.errors.name ? (
                  <p className="text-xs text-destructive">{formState.errors.name.message}</p>
                ) : null}
              </FormField>
              <FormField label="Project Code">
                <Input {...register("code")} placeholder="CGD-SN-2025" />
              </FormField>
              <FormField label="Client">
                <Input {...register("client")} placeholder="Client name" />
              </FormField>
              <FormField label="Consultant">
                <Input {...register("consultant")} placeholder="Consultant name" />
              </FormField>
              <FormField label="Contractor">
                <Input {...register("contractor")} placeholder="Contractor" />
              </FormField>
              <FormField label="Project Type">
                <Input {...register("projectType")} placeholder="CGD Network" />
              </FormField>
              <FormField label="City">
                <Input {...register("city")} placeholder="Enter city" />
              </FormField>
              <FormField label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value ?? "Draft"} onValueChange={(value) => { if (value) field.onChange(value); }}>
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
                  )}
                />
              </FormField>
              <FormField label="Start Date">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
                />
              </FormField>
              <FormField label="Planned End Date">
                <Controller
                  control={control}
                  name="plannedEndDate"
                  render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
                />
              </FormField>
              <FormField label="Contract Value">
                <Input {...register("contractValue")} placeholder="Rs 12.50 Cr" />
              </FormField>
              <FormField label="Assigned Supervisor / Project Manager">
                <Input {...register("assignedManager")} placeholder="Manager name" />
              </FormField>
              <FormField label="Description" className="md:col-span-2 xl:col-span-3">
                <Textarea {...register("description")} placeholder="Brief project scope and notes" className="min-h-28" />
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
            <DeleteImpactDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <TrashIcon size={14} />
                  Delete
                </Button>
              }
              entityTypeLabel="Project"
              impact={deleteImpact.data}
              isLoading={deleteImpact.isLoading}
              isError={deleteImpact.isError}
              onRetry={() => void deleteImpact.refetch()}
              isConfirming={deleteProject.isPending}
              onConfirm={async () => {
                await deleteProject.mutateAsync(projectId);
                setDeleteDialogOpen(false);
                router.push("/projects");
              }}
              isArchiving={archiveProject.isPending}
              onArchive={async () => {
                await archiveProject.mutateAsync({ ...values, status: "Archived" });
                setDeleteDialogOpen(false);
                router.push(`/projects/${projectId}`);
              }}
            />
          )}
          <Link
            href={isEdit && projectId ? `/projects/${projectId}` : "/projects"}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={mutation.isPending || formState.isSubmitting}>
            {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
