import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customFieldsApi, holidaysApi, masterValuesApi } from "../services/masters.service";
import type {
  CustomFieldFormValues,
  HolidayFormValues,
  MasterValueCategory,
  MasterValueFormValues,
  MasterValueStatus,
} from "../types/masters.types";

const masterValuesKey = (category: MasterValueCategory) => ["masters", "values", category] as const;
const customFieldsKey = ["masters", "custom-fields"] as const;
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

export function useCustomFieldsQuery(status?: MasterValueStatus) {
  return useQuery({
    queryKey: [...customFieldsKey, status ?? "all"],
    queryFn: () => customFieldsApi.list(status),
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CustomFieldFormValues) => customFieldsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customFieldsKey });
      toast.success("Custom field created successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to create custom field"),
  });
}

export function useUpdateCustomField(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CustomFieldFormValues) => customFieldsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customFieldsKey });
      toast.success("Custom field updated successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update custom field"),
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
