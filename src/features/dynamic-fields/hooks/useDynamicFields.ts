import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dynamicFieldsApi } from "../services/dynamic-fields.service";
import { dynamicFieldsImportApi } from "../services/dynamic-fields-import.service";
import type { CustomFieldFormValues, CustomFieldImportRow, ReorderCustomFieldItem } from "../types";
import type { MasterValueStatus } from "@/features/management/types/masters.types";

const dynamicFieldsKey = ["dynamic-fields"] as const;

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useDynamicFieldsQuery(status?: MasterValueStatus) {
  return useQuery({
    queryKey: [...dynamicFieldsKey, status ?? "all"],
    queryFn: () => dynamicFieldsApi.list(status),
  });
}

export function useDynamicFieldGroupsQuery() {
  return useQuery({
    queryKey: [...dynamicFieldsKey, "groups"],
    queryFn: () => dynamicFieldsApi.getGroups(),
  });
}

export function useCreateDynamicField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, sortOrder }: { values: CustomFieldFormValues; sortOrder: number }) =>
      dynamicFieldsApi.create(values, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dynamicFieldsKey });
      toast.success("Field created successfully");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to create field")),
  });
}

export function useUpdateDynamicField(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CustomFieldFormValues) => dynamicFieldsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dynamicFieldsKey });
      toast.success("Field updated successfully");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to update field")),
  });
}

export function useSetDynamicFieldStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MasterValueStatus }) => dynamicFieldsApi.setStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: dynamicFieldsKey });
      toast.success(variables.status === "Active" ? "Field activated" : "Field deactivated");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to update field status")),
  });
}

export function useDeleteDynamicField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dynamicFieldsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dynamicFieldsKey });
      toast.success("Field permanently deleted");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to delete field")),
  });
}

export function useReorderDynamicFields() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderCustomFieldItem[]) => dynamicFieldsApi.reorder(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dynamicFieldsKey });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to save the new order"));
      queryClient.invalidateQueries({ queryKey: dynamicFieldsKey });
    },
  });
}

export function useDynamicFieldsImportPreview() {
  return useMutation({
    mutationFn: (file: File) => dynamicFieldsImportApi.preview(file),
    onError: (error) => toast.error(errorMessage(error, "Failed to read import file")),
  });
}

export function useDynamicFieldsImportConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: CustomFieldImportRow[]) => dynamicFieldsImportApi.confirm(rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dynamicFieldsKey });
    },
    onError: (error) => toast.error(errorMessage(error, "Import failed")),
  });
}
