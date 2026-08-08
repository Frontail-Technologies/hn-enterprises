import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { masterValuesImportApi } from "../services/masters-import.service";
import type { MasterValueCategory } from "../types/masters.types";

export function useMasterValuesImportPreview() {
  return useMutation({
    mutationFn: ({ file, category }: { file: File; category: MasterValueCategory }) =>
      masterValuesImportApi.preview(file, category),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to preview import");
    },
  });
}

export function useMasterValuesImportConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ validRows, category }: { validRows: any[]; category: MasterValueCategory }) =>
      masterValuesImportApi.confirm(validRows, category),
    onSuccess: (result) => {
      toast.success(`Successfully imported ${result.insertedCount} values`);
      queryClient.invalidateQueries({ queryKey: ["master-values"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to confirm import");
    },
  });
}
