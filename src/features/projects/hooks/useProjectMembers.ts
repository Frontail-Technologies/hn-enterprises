import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectMembersApi } from "../services/project-members.service";

const membersKey = (projectId: string) => ["projects", projectId, "members"] as const;

export function useProjectMembersQuery(projectId: string) {
  return useQuery({
    queryKey: membersKey(projectId),
    queryFn: () => projectMembersApi.list(projectId),
    enabled: Boolean(projectId),
  });
}

function useRefreshProject(projectId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: membersKey(projectId) });
    void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "team"] });
  };
}

export function useAddProjectMembers(projectId: string) {
  const refresh = useRefreshProject(projectId);
  return useMutation({
    mutationFn: (body: { supervisorIds?: string[]; plumberIds?: string[] }) => projectMembersApi.add(projectId, body),
    onSuccess: (result) => {
      refresh();
      toast.success(result.added ? `${result.added} added to the project` : "Already on the project");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't add to the project"),
  });
}

export function useRemoveProjectMember(projectId: string) {
  const refresh = useRefreshProject(projectId);
  return useMutation({
    mutationFn: (memberId: string) => projectMembersApi.remove(projectId, memberId),
    onSuccess: () => {
      refresh();
      toast.success("Removed from the project");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't remove"),
  });
}
