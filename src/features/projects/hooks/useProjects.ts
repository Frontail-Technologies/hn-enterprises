import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsApi } from "../services/projects.service";
import type { ProjectFormValues, ProjectSite, ProjectDocument } from "../types/project.types";

const projectsKey = ["projects"] as const;
const projectKey = (id: string) => ["projects", id] as const;
const sitesKey = (projectId: string) => ["projects", projectId, "sites"] as const;
const documentsKey = (projectId: string) => ["projects", projectId, "documents"] as const;
const summaryKey = (projectId: string) => ["projects", projectId, "summary"] as const;
const teamKey = (projectId: string) => ["projects", projectId, "team"] as const;

export function useProjectsQuery(search?: string) {
  return useQuery({
    queryKey: [...projectsKey, search ?? ""],
    queryFn: () => projectsApi.list(search),
  });
}

export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: projectKey(id),
    queryFn: () => projectsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ProjectFormValues) => projectsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKey });
      toast.success("Project created successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to create project"),
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ProjectFormValues) => projectsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKey });
      queryClient.invalidateQueries({ queryKey: projectKey(id) });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update project"),
  });
}

// Only fetched while the delete dialog is actually open (`enabled`) - opening the
// dialog is what triggers the check, not rendering the trigger button (§11).
export function useProjectDeleteImpactQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...projectKey(id), "delete-impact"],
    queryFn: () => projectsApi.getDeleteImpact(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    // A fresh check every time the dialog opens - the whole point is to catch
    // records added since the last time it was open, not serve a stale cache.
    staleTime: 0,
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKey });
      toast.success("Project deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete project"),
  });
}

export function useBulkDeleteProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => projectsApi.bulkDelete(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: projectsKey });
      toast.success(`${result.count} project${result.count === 1 ? "" : "s"} deleted`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete projects"),
  });
}

export function useProjectSitesQuery(projectId: string) {
  return useQuery({
    queryKey: sitesKey(projectId),
    queryFn: () => projectsApi.listSites(projectId),
    enabled: Boolean(projectId),
  });
}

export function useSaveProjectSite(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (site: ProjectSite) =>
      site.id && site.id !== "new"
        ? projectsApi.updateSite(projectId, site)
        : projectsApi.createSite(projectId, site),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sitesKey(projectId) });
      toast.success("Site saved successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to save site"),
  });
}

export function useProjectDocumentsQuery(projectId: string) {
  return useQuery({
    queryKey: documentsKey(projectId),
    queryFn: () => projectsApi.listDocuments(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateProjectDocument(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc: ProjectDocument) => projectsApi.createDocument(projectId, doc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(projectId) });
      toast.success("Document uploaded successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to upload document"),
  });
}

export function useDeleteProjectDocument(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => projectsApi.deleteDocument(projectId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(projectId) });
      toast.success("Document deleted");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to delete document"),
  });
}

// Overview tab - one lightweight aggregate call instead of several unrelated
// requests just to draw KPI cards (§4).
export function useProjectSummaryQuery(projectId: string) {
  return useQuery({
    queryKey: summaryKey(projectId),
    queryFn: () => projectsApi.getSummary(projectId),
    enabled: Boolean(projectId),
  });
}

// Team tab - only fetched when that tab is actually opened (§22), via the
// `enabled` option below.
export function useProjectTeamQuery(projectId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: teamKey(projectId),
    queryFn: () => projectsApi.getTeam(projectId),
    enabled: Boolean(projectId) && (options.enabled ?? true),
  });
}
