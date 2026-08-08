import { UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ImportDialog } from "@/components/shared/ImportDialog";
import { type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useMasterValuesImportPreview, useMasterValuesImportConfirm } from "../hooks/useMasterImport";
import type { MasterImportPreviewRow } from "../services/masters-import.service";
import type { MasterValueCategory } from "../types/masters.types";

type PreviewRow = MasterImportPreviewRow & { id: string };

const previewColumns: ExcelColumn<PreviewRow>[] = [
  { key: "value", label: "Value", width: 250, getValue: (r) => r.value },
  { key: "description", label: "Description", width: 350, getValue: (r) => r.description },
  {
    key: "status",
    label: "Status",
    width: 120,
    getValue: (r) => (r.error ? "invalid" : "valid"),
    render: (r) => <StatusBadge status={r.error ? "Rejected" : "Approved"} />,
  },
  { key: "error", label: "Error", width: 300, getValue: (r) => r.error || "-" },
];

export function MasterValueImportDrawer({ category }: { category: MasterValueCategory }) {
  const previewMutation = useMasterValuesImportPreview();
  const confirmMutation = useMasterValuesImportConfirm();

  return (
    <ImportDialog
      trigger={
        <Button variant="outline">
          <UploadSimpleIcon className="mr-2" /> Import Values
        </Button>
      }
      title={`Import ${category}`}
      description={
        <>
          Upload an Excel file to bulk import values for <b>{category}</b>.
        </>
      }
      templateFileName={`${category.replace(/\s+/g, "_")}_template.xlsx`}
      templateHeaders={["Value", "Description"]}
      previewColumns={previewColumns}
      isPreviewPending={previewMutation.isPending}
      isConfirmPending={confirmMutation.isPending}
      entityLabelPlural="Values"
      onPreview={(file) => previewMutation.mutateAsync({ file, category })}
      onConfirm={(validRows) => confirmMutation.mutateAsync({ validRows, category })}
    />
  );
}
