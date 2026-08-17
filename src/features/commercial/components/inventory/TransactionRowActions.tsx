"use client";

import { useState } from "react";
import { ArrowUUpLeftIcon, EyeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { Textarea } from "@/components/ui/textarea";
import { useReverseMaterialTransaction } from "../../hooks/useMaterials";
import { sourceLabel, formatDate } from "../../utils/format";
import type { MaterialTransaction } from "../../types/material.types";
import { CorrectTransactionDialog } from "./CorrectTransactionDialog";

type Lookups = {
  materialName: string;
  plumberName?: string;
  supervisorName?: string;
  customerName?: string;
  projectName?: string;
};

// View/Correct/Reverse (§7): the ledger is append-only, so this is the only way to
// change a stock-impacting transaction after the fact. Reverse negates the original's
// effect with a linked row; Correct does that and inserts a replacement. Neither ever
// mutates or deletes the original row.
export function TransactionRowActions({ transaction, lookups }: { transaction: MaterialTransaction; lookups: Lookups }) {
  const isLinkRow = transaction.linkType !== "";
  const isSuperseded = transaction.isReversed || transaction.isCorrected;

  return (
    <div className="flex items-center justify-end gap-1">
      {isSuperseded ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {transaction.isCorrected ? "Corrected" : "Reversed"}
        </span>
      ) : isLinkRow ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {transaction.linkType === "correction" ? "Correction" : "Reversal"}
        </span>
      ) : null}
      <ViewTransactionDialog transaction={transaction} lookups={lookups} />
      {!isSuperseded && !isLinkRow ? (
        <>
          <CorrectTransactionDialog transaction={transaction} materialName={lookups.materialName} />
          <ReverseTransactionDialog transaction={transaction} materialName={lookups.materialName} />
        </>
      ) : null}
    </div>
  );
}

function ViewTransactionDialog({ transaction, lookups }: { transaction: MaterialTransaction; lookups: Lookups }) {
  const items = [
    { label: "Material", value: lookups.materialName },
    { label: "Type", value: transaction.type },
    { label: "Quantity", value: transaction.quantity },
    { label: "Source", value: sourceLabel(transaction.source) },
    { label: "Project", value: lookups.projectName || "Central / Unassigned" },
    { label: "Date", value: formatDate(transaction.transactionDate) },
    { label: "Reference No.", value: transaction.referenceNo },
    { label: "Vendor", value: transaction.vendorName },
    { label: "Rate", value: transaction.rate ?? "-" },
    { label: "Bill Amount", value: transaction.billAmount ?? "-" },
    { label: "Plumber / Team", value: lookups.plumberName },
    { label: "Supervisor", value: lookups.supervisorName || transaction.supervisorName },
    { label: "Customer", value: lookups.customerName },
    { label: "Address", value: transaction.address },
    { label: "Report No.", value: transaction.reportNo },
    { label: "Condition", value: transaction.condition },
    { label: "Adjustment Type", value: transaction.adjustmentType },
    { label: "Vehicle No.", value: transaction.vehicleNo },
    { label: "Vehicle Qty", value: transaction.vehicleQty ?? "-" },
    { label: "Remarks", value: transaction.remarks },
    ...(transaction.linkType
      ? [
          { label: "Link Type", value: transaction.linkType === "correction" ? "Correction" : "Reversal" },
          { label: "Correction Reason", value: transaction.correctionReason },
        ]
      : []),
  ];

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="ghost" size="icon-xs" aria-label="View transaction" />}>
        <EyeIcon size={14} />
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>Read-only record - use Correct or Reverse to change its effect.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <KeyValueGrid columns={2} items={items} />
        </div>
        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReverseTransactionDialog({ transaction, materialName }: { transaction: MaterialTransaction; materialName: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const reverseTransaction = useReverseMaterialTransaction();

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setReason("");
      setError("");
    }
    setOpen(nextOpen);
  }

  async function handleConfirm() {
    if (!reason.trim()) {
      setError("A reversal reason is required");
      return;
    }
    setError("");
    try {
      await reverseTransaction.mutateAsync({ id: transaction.id, reason });
      setOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to reverse transaction");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="ghost" size="icon-xs" aria-label="Reverse transaction" />}>
        <ArrowUUpLeftIcon size={14} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reverse this transaction?</DialogTitle>
          <DialogDescription>
            {materialName} - {transaction.quantity} on {formatDate(transaction.transactionDate)}. This posts an opposite ledger
            entry; the original stays on record and cannot be deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Reversal Reason (required)</span>
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-16" placeholder="Why is this being reversed?" />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={reverseTransaction.isPending}>
            {reverseTransaction.isPending ? "Reversing..." : "Reverse"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
