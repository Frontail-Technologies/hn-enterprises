import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    },
  });
}

export function useUpdateMasterValue(category: MasterValueCategory, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MasterValueFormValues) => masterValuesApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterValuesKey(category) });
    },
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
    },
  });
}

export function useUpdateCustomField(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CustomFieldFormValues) => customFieldsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customFieldsKey });
    },
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
    },
  });
}

export function useUpdateHoliday(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: HolidayFormValues) => holidaysApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidaysKey });
    },
  });
}
