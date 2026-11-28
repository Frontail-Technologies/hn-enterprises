"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { useReleaseBillAmount } from "../../hooks/useBills";
import { money } from "../../utils/format";

/** Record that the client paid out (part of) the bank guarantee or the held amount. */
export function ReleaseAmountDialog({ billId, kind, held }: { billId: string; kind: "bg" | "hold"; held: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [mode, setMode] = useState("NEFT");
  const [remarks, setRemarks] = useState("");
  const release = useReleaseBillAmount(billId);
  const label = kind === "bg" ? "Bank guarantee" : "Hold amount";
  const value = Number(amount);
  const valid = value > 0 && value <= held + 0.001 && Boolean(paymentDate) && Boolean(mode.trim());

  function handleOpenChange(next: boolean) {
    if (next) {
      setAmount(String(held));
      setRemarks("");
    }
    setOpen(next);
  }

  async function save() {
    if (!valid) return;
    await release.mutateAsync({ kind, amount: value, paymentDate, mode: mode.trim(), remarks: remarks.trim() || undefined });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" size="sm" variant="outline" disabled={held <= 0} />}>Release</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Release {label.toLowerCase()}</DialogTitle>
          <DialogDescription>
            {money(held)} still held. The released amount is added to Received.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Amount" required>
            <Input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </FormField>
          <FormField label="Date" required>
            <DatePicker value={paymentDate} onChange={setPaymentDate} />
          </FormField>
          <FormField label="Mode" required>
            <Input value={mode} onChange={(event) => setMode(event.target.value)} placeholder="NEFT / Cheque" />
          </FormField>
          <FormField label="Remarks">
            <Input value={remarks} onChange={(event) => setRemarks(event.target.value)} />
          </FormField>
        </div>
        {value > held + 0.001 ? <p className="text-xs text-destructive">Cannot be more than {money(held)}.</p> : null}
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" disabled={!valid || release.isPending} onClick={() => void save()}>
            {release.isPending ? "Saving..." : "Record release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
