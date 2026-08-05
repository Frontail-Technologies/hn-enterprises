import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi, type CreateUserFormValues, type UpdateUserFormValues } from "../services/users.service";

const usersKey = ["users", "full"] as const;

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
    onError: () => toast.error("Failed to create user"),
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
    onError: () => toast.error("Failed to update user"),
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
    onError: () => toast.error("Failed to reset password"),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete user"),
  });
}
