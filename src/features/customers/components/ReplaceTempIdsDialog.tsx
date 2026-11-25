"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DownloadSimpleIcon, IdentificationCardIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { exportRowsToExcel, readExcelRows } from "@/lib/export-excel";
import { customersApi, type TempIdReplacementResult } from "../api/customers.api";
import { customersKey } from "../queries/customer.query-keys";

const TEMP_COLUMN = "Temp ID";
const NUMBER_COLUMN = "BR/TR No.";

const STATUS_LABEL: Record<TempIdReplacementResult["status"], { label: string; ok: boolean }> = {
  ready: { label: "Ready", ok: true },
  updated: { label: "Updated", ok: true },
  not_found: { label: "Not found", ok: false },
  not_temp: { label: "Not a TEMP ID", ok: false },
  missing: { label: "Missing value", ok: false },
  duplicate_in_file: { label: "Repeated in file", ok: false },
  number_in_use: { label: "Number already used", ok: false },
};

/** Find a column by loose header match ("Temp ID", "TEMP-ID", "BR/TR No.", "TR / BP No."...). */
function pick(row: Record<string, string>, test: (header: string) => boolean) {
  const key = Object.keys(row).find((header) => test(header.toLowerCase().replace(/[^a-z]/g, "")));
  return key ? row[key] : "";
}

/**
 * Replace import-assigned TEMP-... IDs with real BR/TR numbers: download the
 * list of customers still on a TEMP ID, fill in the numbers, upload it, check
 * every row, then apply.
 */
export function ReplaceTempIdsDialog({ triggerClassName }: { triggerClassName?: string }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"" | "download" | "check" | "apply">("");
  const [rows, setRows] = useState<{ tempId: string; trBpNumber: string }[]>([]);
  const [results, setResults] = useState<TempIdReplacementResult[]>([]);

  const ready = results.filter((row) => row.status === "ready").length;
  const problems = results.filter((row) => !STATUS_LABEL[row.status].ok).length;

  function reset() {
    setRows([]);
    setResults([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function downloadSheet() {
    setBusy("download");
    try {
      const { data } = await customersApi.listPaginated({ tempIds: true, page: 1, limit: 10000 });
      if (!data.length) {
        toast.info("No customers are on a temporary ID");
        return;
      }
      await exportRowsToExcel(
        "customers-temp-ids.xlsx",
        [
          { label: TEMP_COLUMN, getValue: (customer) => customer.customerConnection.trBpNo },
          { label: "Customer Name", getValue: (customer) => customer.customerConnection.customerName },
          { label: "Mobile", getValue: (customer) => customer.customerConnection.mobileNo },
          { label: "Project", getValue: (customer) => customer.projectName },
          { label: "Address", getValue: (customer) => customer.customerConnection.fullAddress },
          { label: NUMBER_COLUMN, getValue: () => "" },
        ],
        data,
        // Filled in and imported back: keep the columns exactly as the import expects.
        { serial: false }
      );
    } catch (error) {
      toast.error("Couldn't download the list", { description: error instanceof Error ? error.message : undefined });
    } finally {
      setBusy("");
    }
  }

  async function check(file: File) {
    setBusy("check");
    try {
      const sheet = await readExcelRows(file);
      const parsed = sheet
        .map((row) => ({
          tempId: pick(row, (header) => header.startsWith("temp")),
          trBpNumber: pick(row, (header) => /^(brtr|trbp|bptr|br|tr|bp)(no|number)?$/.test(header)),
        }))
        .filter((row) => row.tempId || row.trBpNumber);
      if (!parsed.length) throw new Error(`No rows found. The sheet needs "${TEMP_COLUMN}" and "${NUMBER_COLUMN}" columns.`);
      setRows(parsed);
      const result = await customersApi.replaceTempIds(parsed, false);
      setResults(result.results);
    } catch (error) {
      reset();
      toast.error("Couldn't read the sheet", { description: error instanceof Error ? error.message : undefined });
    } finally {
      setBusy("");
    }
  }

  async function apply() {
    setBusy("apply");
    try {
      const result = await customersApi.replaceTempIds(rows, true);
      setResults(result.results);
      void queryClient.invalidateQueries({ queryKey: customersKey });
      toast.success(`${result.summary.updated} customers now have their real BR/TR number`);
      if (!result.summary.problems) {
        setOpen(false);
        reset();
      }
    } catch (error) {
      toast.error("Couldn't save the numbers", { description: error instanceof Error ? error.message : undefined });
    } finally {
      setBusy("");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button type="button" variant="outline" size="compact" className={triggerClassName} />}>
        <IdentificationCardIcon size={14} />
        Replace TEMP IDs
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Replace temporary IDs</DialogTitle>
          <DialogDescription>
            Customers imported without a BR/TR number got a temporary ID (TEMP-…). Download the list, fill in the{" "}
            <b>{NUMBER_COLUMN}</b> column, and upload it back. Every row is checked before anything is saved.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={downloadSheet} disabled={Boolean(busy)}>
            <DownloadSimpleIcon size={15} />
            {busy === "download" ? "Preparing…" : "1. Download TEMP ID list"}
          </Button>
          <Button type="button" onClick={() => fileRef.current?.click()} disabled={Boolean(busy)}>
            <UploadSimpleIcon size={15} />
            {busy === "check" ? "Checking…" : "2. Upload filled sheet"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void check(file);
            }}
          />
        </div>

        {results.length ? (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-muted-foreground">
              {ready} ready{problems ? ` · ${problems} need attention (they won't be changed)` : ""}
            </p>
            <div className="max-h-72 overflow-auto rounded-lg border border-border">
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 bg-surface-muted text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Temp ID</th>
                    <th className="px-3 py-2 font-semibold">BR/TR No.</th>
                    <th className="px-3 py-2 font-semibold">Customer</th>
                    <th className="px-3 py-2 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={`${row.tempId}-${index}`} className="border-t border-border" title={row.message}>
                      <td className="px-3 py-1.5 font-mono text-xs">{row.tempId || "—"}</td>
                      <td className="px-3 py-1.5">{row.trBpNumber || "—"}</td>
                      <td className="px-3 py-1.5">{row.customerName || "—"}</td>
                      <td className="px-3 py-1.5">
                        <Badge variant={STATUS_LABEL[row.status].ok ? "secondary" : "destructive"}>{STATUS_LABEL[row.status].label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button type="button" onClick={apply} disabled={!ready || Boolean(busy)}>
            {busy === "apply" ? "Saving…" : `3. Apply ${ready || ""} change${ready === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
