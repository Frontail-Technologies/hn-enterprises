import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { exportsApi } from "../services/exports.service";

export function useDownloadAttendanceRegister() {
  return useMutation({
    mutationFn: exportsApi.attendanceRegister,
    onError: (error: Error) => toast.error(error.message || "Failed to generate attendance register"),
  });
}

export function useDownloadWageRegister() {
  return useMutation({
    mutationFn: exportsApi.wageRegister,
    onError: (error: Error) => toast.error(error.message || "Failed to generate wage register"),
  });
}

export function useDownloadCustomerRegister() {
  return useMutation({
    mutationFn: exportsApi.customerRegister,
    onError: (error: Error) => toast.error(error.message || "Failed to generate customer register"),
  });
}

export function useDownloadInventoryStockSheet() {
  return useMutation({
    mutationFn: exportsApi.inventoryStockSheet,
    onError: (error: Error) => toast.error(error.message || "Failed to generate stock sheet"),
  });
}

export function useDownloadInventoryPurchaseRegister() {
  return useMutation({
    mutationFn: exportsApi.inventoryPurchaseRegister,
    onError: (error: Error) => toast.error(error.message || "Failed to generate purchase register"),
  });
}

export function useDownloadInventoryPbgIssue() {
  return useMutation({
    mutationFn: exportsApi.inventoryPbgIssue,
    onError: (error: Error) => toast.error(error.message || "Failed to generate PBG issue register"),
  });
}

export function useDownloadInventoryStoreIssueBook() {
  return useMutation({
    mutationFn: exportsApi.inventoryStoreIssueBook,
    onError: (error: Error) => toast.error(error.message || "Failed to generate store issue book"),
  });
}

export function useDownloadInventoryConsumptionLog() {
  return useMutation({
    mutationFn: exportsApi.inventoryConsumptionLog,
    onError: (error: Error) => toast.error(error.message || "Failed to generate consumption log"),
  });
}

export function useDownloadInventoryPbgConsumption() {
  return useMutation({
    mutationFn: exportsApi.inventoryPbgConsumption,
    onError: (error: Error) => toast.error(error.message || "Failed to generate PBG consumption register"),
  });
}

export function useDownloadInventoryTotalIssue() {
  return useMutation({
    mutationFn: exportsApi.inventoryTotalIssue,
    onError: (error: Error) => toast.error(error.message || "Failed to generate total issue register"),
  });
}

export function useDownloadInventoryPlumberBalance() {
  return useMutation({
    mutationFn: exportsApi.inventoryPlumberBalance,
    onError: (error: Error) => toast.error(error.message || "Failed to generate plumber balance register"),
  });
}

export function useDownloadDprPlanningSummary() {
  return useMutation({
    mutationFn: exportsApi.dprPlanningSummary,
    onError: (error: Error) => toast.error(error.message || "Failed to generate DPR/Planning summary"),
  });
}

export function useDownloadUserRegister() {
  return useMutation({
    mutationFn: exportsApi.users,
    onError: (error: Error) => toast.error(error.message || "Failed to generate user register"),
  });
}

export function useDownloadMasterValues() {
  return useMutation({
    mutationFn: exportsApi.masterValues,
    onError: (error: Error) => toast.error(error.message || "Failed to generate master values register"),
  });
}

export function useDownloadHolidays() {
  return useMutation({
    mutationFn: exportsApi.holidays,
    onError: (error: Error) => toast.error(error.message || "Failed to generate holidays register"),
  });
}
