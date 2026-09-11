import {
  useDownloadInventoryConsumptionLog,
  useDownloadInventoryPbgConsumption,
  useDownloadInventoryPbgIssue,
  useDownloadInventoryPlumberBalance,
  useDownloadInventoryPurchaseRegister,
  useDownloadInventoryStockSheet,
  useDownloadInventoryStoreIssueBook,
  useDownloadInventoryTotalIssue,
} from "@/features/exports/hooks/useExports";
import type { InventoryTab } from "../types/commercial.types";
import type { MaterialSource } from "../types/material.types";

export function useInventoryExports(params: {
  activeTab: InventoryTab;
  projectId?: string;
  source?: MaterialSource;
  plumberId?: string;
  from?: string;
  to?: string;
}) {
  const { activeTab, projectId, source, plumberId, from, to } = params;

  const downloadStockSheet = useDownloadInventoryStockSheet();
  const downloadPurchaseRegister = useDownloadInventoryPurchaseRegister();
  const downloadPbgIssue = useDownloadInventoryPbgIssue();
  const downloadStoreIssueBook = useDownloadInventoryStoreIssueBook();
  const downloadConsumptionLog = useDownloadInventoryConsumptionLog();
  const downloadPbgConsumption = useDownloadInventoryPbgConsumption();
  const downloadTotalIssue = useDownloadInventoryTotalIssue();
  const downloadPlumberBalance = useDownloadInventoryPlumberBalance();

  const isExportPending =
    downloadStockSheet.isPending ||
    downloadPurchaseRegister.isPending ||
    downloadPbgIssue.isPending ||
    downloadStoreIssueBook.isPending ||
    downloadConsumptionLog.isPending ||
    downloadPbgConsumption.isPending ||
    downloadTotalIssue.isPending ||
    downloadPlumberBalance.isPending;

  function handleExport() {
    if (activeTab === "stock") {
      void downloadStockSheet.mutateAsync({ projectId, source });
    } else if (activeTab === "purchase") {
      void downloadPurchaseRegister.mutateAsync({ projectId, from, to });
    } else if (activeTab === "pbgIssue") {
      void downloadPbgIssue.mutateAsync({ projectId, from, to });
    } else if (activeTab === "pbgConsumption") {
      void downloadPbgConsumption.mutateAsync({ projectId, plumberId, from, to });
    } else if (activeTab === "storeIssue") {
      void downloadStoreIssueBook.mutateAsync({ projectId, source, plumberId, from, to });
    } else if (activeTab === "totalIssue") {
      void downloadTotalIssue.mutateAsync({ projectId, source, from, to });
    } else if (activeTab === "plumberBalance") {
      void downloadPlumberBalance.mutateAsync({ projectId, source, plumberId });
    } else if (activeTab === "plumberConsumption") {
      void downloadConsumptionLog.mutateAsync({ projectId, source, plumberId, from, to });
    }
  }

  return { isExportPending, handleExport };
}
