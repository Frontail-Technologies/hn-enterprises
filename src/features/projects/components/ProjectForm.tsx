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
import { SectionCard } from "@/components/shared/SectionCard";
import { StickyFormFooter } from "@/components/shared/StickyFormFooter";
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
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";

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
  // Project types come from Masters > Project Types (admins manage the list).
  const { data: projectTypeValues = [] } = useMasterValuesQuery("Project Types");
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
    <div className="flex flex-col gap-5">
      <PageHeader
        title={isEdit ? "Edit Project" : "Create Project"}
        description={isEdit ? "Update the project's details, schedule and contract value." : "Set up a new project with its client, schedule and contract value."}
      />

      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
          <SectionCard title="Project details">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FormField label="Project Name" required>
                <Input {...register("name")} placeholder="Project name" />
                {formState.errors.name ? (
                  <p className="text-xs text-destructive">{formState.errors.name.message}</p>
                ) : null}
              </FormField>
              <FormField label="Project Code">
                <Input {...register("code")} placeholder="Leave empty for automatic (PRJ-0001…)" />
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
                <Controller
                  control={control}
                  name="projectType"
                  render={({ field }) => {
                    const options = projectTypeValues
                      .filter((item) => item.status === "Active")
                      .map((item) => ({ value: item.value, label: item.value }));
                    // Keep a saved type selectable even if it isn't in the list (anymore).
                    if (field.value && !options.some((option) => option.value.toLowerCase() === field.value.toLowerCase())) {
                      options.unshift({ value: field.value, label: field.value });
                    }
                    const selected = options.find((option) => option.value.toLowerCase() === (field.value ?? "").toLowerCase());
                    return (
                      <SearchableSelect
                        value={selected?.value}
                        onValueChange={(value) => field.onChange(value ?? "")}
                        placeholder="Select project type"
                        options={options}
                        className="w-full"
                      />
                    );
                  }}
                />
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
            </div>
          </SectionCard>

          <SectionCard title="Schedule & value">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <FormField label="Description" className="md:col-span-2 xl:col-span-3">
                <Textarea {...register("description")} placeholder="Brief project scope and notes" className="min-h-28" />
              </FormField>
            </div>
          </SectionCard>

        {mutation.isError ? (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Unable to save project"}
          </p>
        ) : null}

        <StickyFormFooter
          start={
            isEdit && projectId ? (
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
              note="Goes to the Recycle Bin with everything linked to it. You can restore it within 30 days."
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
            ) : undefined
          }
        >
          <Link
            href={isEdit && projectId ? `/projects/${projectId}` : "/projects"}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={mutation.isPending || formState.isSubmitting}>
            {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </StickyFormFooter>
      </form>
    </div>
  );
}
