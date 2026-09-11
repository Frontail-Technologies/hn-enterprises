import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi, type CreateUserFormValues, type UpdateUserFormValues } from "../services/users.service";

const usersKey = ["users", "full"] as const;
const userKey = (id: string) => ["users", id] as const;

export function useUsersQuery(search?: string) {
  return useQuery({
    queryKey: [...usersKey, search ?? ""],
    queryFn: () => usersApi.listFull(search),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateUserFormValues) => usersApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey });
      toast.success("User created successfully");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to create user"),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: UpdateUserFormValues) => usersApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to update user"),
  });
}

export function useResetUserPassword(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => usersApi.resetPassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey });
      toast.success("Password reset successfully");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to reset password"),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: (_data, id) => {
      // Drops the delete-impact cache (and anything else nested under this
      // user's id) rather than leaving a stale entry for an id that no
      // longer exists.
      queryClient.removeQueries({ queryKey: userKey(id) });
      // Broad "users" prefix - covers the full list (usersKey) AND the
      // supervisor roster used elsewhere (e.g. attendance, team assignment
      // pickers), which live under their own sibling key and would
      // otherwise keep showing the deleted user.
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Hard delete clears the user's active project-site assignments
      // server-side (see usersDeletionService.clearActiveSiteAssignments) -
      // refresh project/site/team views so they don't keep showing the old
      // supervisor.
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // A staff-linked user's staff profile is cascade-deleted with them
      // (remove-staff-block brief) - refresh Staff Resources too.
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete user"),
  });
}

export function useUserDeleteImpactQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...userKey(id), "delete-impact"],
    queryFn: () => usersApi.getDeleteImpact(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 0,
  });
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => usersApi.bulkDelete(ids),
    onSuccess: (result, ids) => {
      // Same cache cleanup as useDeleteUser - see its comments.
      for (const id of ids) queryClient.removeQueries({ queryKey: userKey(id) });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      const suffix = result.skippedSelf ? " (your own account was skipped)" : "";
      toast.success(`${result.count} user${result.count === 1 ? "" : "s"} deleted${suffix}`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete users"),
  });
}
