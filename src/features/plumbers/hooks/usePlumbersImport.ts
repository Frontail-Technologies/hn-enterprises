import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { plumbersImportApi, type PlumberImportRow } from "../services/plumbers-import.service";

export function usePlumbersImportPreview() {
  return useMutation({
    mutationFn: (file: File) => plumbersImportApi.preview(file),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to preview import");
    },
  });
}

export function usePlumbersImportConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (validRows: PlumberImportRow[]) => plumbersImportApi.confirm(validRows),
    onSuccess: (result) => {
      toast.success(`Successfully imported ${result.insertedCount} plumbers`);
      queryClient.invalidateQueries({ queryKey: ["plumbers"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to confirm import");
    },
  });
}
