import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../services/projects.service";
import type { ProjectFormValues, ProjectSite, ProjectDocument } from "../types/project.types";

const projectsKey = ["projects"] as const;
const projectKey = (id: string) => ["projects", id] as const;
const sitesKey = (projectId: string) => ["projects", projectId, "sites"] as const;
const documentsKey = (projectId: string) => ["projects", projectId, "documents"] as const;

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
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ProjectFormValues) => projectsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKey });
      queryClient.invalidateQueries({ queryKey: projectKey(id) });
    },
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
    },
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
    },
  });
}

export function useDeleteProjectDocument(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => projectsApi.deleteDocument(projectId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(projectId) });
    },
  });
}
