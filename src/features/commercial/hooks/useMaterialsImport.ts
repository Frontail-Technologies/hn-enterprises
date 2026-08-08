import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialsImportApi, type MaterialImportRow } from "../services/materials-import.service";

export function useMaterialsImportPreview() {
  return useMutation({
    mutationFn: (file: File) => materialsImportApi.preview(file),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to preview import");
    },
  });
}

export function useMaterialsImportConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (validRows: MaterialImportRow[]) => materialsImportApi.confirm(validRows),
    onSuccess: (result) => {
      toast.success(`Successfully imported ${result.insertedCount} materials`);
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to confirm import");
    },
  });
}
