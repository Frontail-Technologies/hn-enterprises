import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersImportApi } from "../services/users-import.service";

export function useUserImportPreview() {
  return useMutation({
    mutationFn: (file: File) => usersImportApi.preview(file),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to preview import");
    },
  });
}

export function useUserImportConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (validRows: any[]) => usersImportApi.confirm(validRows),
    onSuccess: (result) => {
      toast.success(`Successfully imported ${result.insertedCount} users`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to confirm import");
    },
  });
}
