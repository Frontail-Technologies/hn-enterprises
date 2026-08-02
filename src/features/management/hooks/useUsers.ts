import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: UpdateUserFormValues) => usersApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey });
    },
  });
}

export function useResetUserPassword(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => usersApi.resetPassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey });
    },
  });
}
