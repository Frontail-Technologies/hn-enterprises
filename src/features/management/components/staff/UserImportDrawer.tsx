import { useState, useRef } from "react";
import { DownloadSimpleIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExcelDataGrid } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportColumnTemplate } from "@/lib/export-excel";
import { useUserImportPreview, useUserImportConfirm } from "../../hooks/useUserImport";
import type { UserImportPreviewResult, UserImportPreviewRow } from "../../services/users-import.service";

const previewColumns = [
  { key: "name", label: "Name", width: 200, getValue: (r: any) => r.name },
  { key: "username", label: "Username", width: 150, getValue: (r: any) => r.username },
  { key: "email", label: "Email", width: 200, getValue: (r: any) => r.email },
  { key: "mobile", label: "Mobile", width: 150, getValue: (r: any) => r.mobile },
  { key: "role", label: "Role", width: 150, getValue: (r: any) => r.role },
  {
    key: "status",
    label: "Status",
    width: 120,
    getValue: (r: any) => (r.error ? "invalid" : "valid"),
    render: (r: any) => <StatusBadge status={r.error ? "Rejected" : "Approved"} />,
  },
  { key: "error", label: "Error", width: 300, getValue: (r: any) => r.error || "-" },
];

export function UserImportDrawer() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<UserImportPreviewResult | null>(null);

  const previewMutation = useUserImportPreview();
  const confirmMutation = useUserImportConfirm();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await previewMutation.mutateAsync(file);
    setPreview(res);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleConfirm = async () => {
    if (!preview?.validRows.length) return;
    await confirmMutation.mutateAsync(preview.validRows);
    setOpen(false);
    setPreview(null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline">
            <UploadSimpleIcon className="mr-2" /> Import Users
          </Button>
        }
      />
      <SheetContent side="right" className="w-[800px] sm:max-w-full flex flex-col p-0">
        <SheetHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex-1">
            <SheetTitle>Import Users</SheetTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Upload an Excel file to bulk import users.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                exportColumnTemplate("users_import_template.xlsx", [
                  "Name",
                  "Username",
                  "Email",
                  "Mobile",
                  "Role",
                  "Password",
                ]);
              }}
            >
              <DownloadSimpleIcon className="mr-2" /> Download Template
            </Button>
            <Button onClick={() => inputRef.current?.click()} disabled={previewMutation.isPending}>
              {previewMutation.isPending ? "Uploading..." : "Select File"}
            </Button>
            <input type="file" ref={inputRef} className="hidden" accept=".xlsx,.csv" onChange={handleFileChange} />
          </div>
        </SheetHeader>
        
        {preview ? (
          <div className="flex-1 flex flex-col min-h-0 bg-muted/30">
            <div className="p-4 flex gap-4 bg-background border-b">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Valid Rows</span>
                <span className="text-xl font-semibold text-emerald-600">{preview.validRows.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Invalid Rows</span>
                <span className="text-xl font-semibold text-rose-600">{preview.invalidRows.length}</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <ExcelDataGrid
                columns={previewColumns}
                rows={[...preview.validRows, ...preview.invalidRows].map((row, i) => ({ ...row, id: String(i) }))}
                getRowClassName={(row: any) => (row.error ? "bg-rose-50/50 hover:bg-rose-50" : undefined)}
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-2 bg-background">
              <Button variant="outline" onClick={() => setPreview(null)}>Cancel</Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!preview.validRows.length || confirmMutation.isPending}
              >
                {confirmMutation.isPending ? "Importing..." : `Import ${preview.validRows.length} Users`}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
            <UploadSimpleIcon size={48} className="text-muted-foreground/50" />
            <p>Select an Excel file to preview and import.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
