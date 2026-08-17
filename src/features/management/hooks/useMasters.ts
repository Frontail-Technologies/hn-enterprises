import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { holidaysApi, masterValuesApi } from "../services/masters.service";
import type {
  HolidayFormValues,
  MasterValueCategory,
  MasterValueFormValues,
} from "../types/masters.types";

const masterValuesKey = (category: MasterValueCategory) => ["masters", "values", category] as const;
const masterValueKey = (id: string) => ["masters", "values", "detail", id] as const;
const holidaysKey = ["masters", "holidays"] as const;

export function useMasterValuesQuery(category: MasterValueCategory, search?: string) {
  return useQuery({
    queryKey: [...masterValuesKey(category), search ?? ""],
    queryFn: () => masterValuesApi.list(category, search),
  });
}

export function useCreateMasterValue(category: MasterValueCategory) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MasterValueFormValues) => masterValuesApi.create(category, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterValuesKey(category) });
      toast.success("Master value created successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to create master value"),
  });
}

export function useUpdateMasterValue(category: MasterValueCategory, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MasterValueFormValues) => masterValuesApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterValuesKey(category) });
      toast.success("Master value updated successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update master value"),
  });
}

export function useDeleteMasterValue(category: MasterValueCategory) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => masterValuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterValuesKey(category) });
      toast.success("Master value deleted successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to delete master value"),
  });
}

// Only fetched while the delete dialog is open - matches the Projects delete-impact pattern.
export function useMasterValueDeleteImpactQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...masterValueKey(id), "delete-impact"],
    queryFn: () => masterValuesApi.getDeleteImpact(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 0,
  });
}

export function useBulkDeleteMasterValues(category: MasterValueCategory) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => masterValuesApi.bulkDelete(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: masterValuesKey(category) });
      toast.success(`${result.count} value${result.count === 1 ? "" : "s"} deleted`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete master values"),
  });
}

export function useHolidaysQuery(search?: string) {
  return useQuery({
    queryKey: [...holidaysKey, search ?? ""],
    queryFn: () => holidaysApi.list(search),
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: HolidayFormValues) => holidaysApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidaysKey });
      toast.success("Holiday created successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to create holiday"),
  });
}

export function useUpdateHoliday(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: HolidayFormValues) => holidaysApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidaysKey });
      toast.success("Holiday updated successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update holiday"),
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => holidaysApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidaysKey });
      toast.success("Holiday deleted successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to delete holiday"),
  });
}

export function useBulkDeleteHolidays() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => holidaysApi.bulkDelete(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: holidaysKey });
      toast.success(`${result.count} holiday${result.count === 1 ? "" : "s"} deleted`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete holidays"),
  });
}
