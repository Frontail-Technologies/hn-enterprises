"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon, NotePencilIcon, PlusIcon, EyeIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DatePicker } from "@/components/shared/DatePicker";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { ImportDialog } from "@/components/shared/ImportDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportRowsToExcel } from "@/lib/export-excel";
import { resolveFileUrl } from "@/lib/upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { paymentTabs } from "../data/payments.data";
import { useCreatePayment, useDeletePayment, usePaymentsQuery, useUpdatePayment } from "../hooks/usePayments";
import { usePaymentsImportPreview, usePaymentsImportConfirm } from "../hooks/usePaymentsImport";
import type { PaymentImportRow } from "../services/payments-import.service";
import type { Payment, PaymentCategory, PaymentFormValues, PaymentMode, PaymentStatus } from "../types/payment.types";
import { formatDate, money, sum } from "../utils/format";
import { ImageProofField } from "./shared/ImageProofField";

import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";

const categories = paymentTabs as PaymentCategory[];
const statuses: PaymentStatus[] = ["Draft", "Submitted", "Approved", "Rejected"];

const importPreviewColumns: ExcelColumn<PaymentImportRow & { id: string }>[] = [
  { key: "category", label: "Category", width: 170, getValue: (r) => r.category },
  { key: "paidTo", label: "Paid To", width: 160, getValue: (r) => r.paidTo },
  { key: "plumberName", label: "Plumber Name", width: 160, getValue: (r) => r.plumberName },
  { key: "amount", label: "Amount", width: 110, getValue: (r) => r.amount },
  { key: "paymentDate", label: "Payment Date", width: 130, getValue: (r) => r.paymentDate },
  { key: "mode", label: "Mode", width: 120, getValue: (r) => r.mode },
  {
    key: "status",
    label: "Status",
    width: 120,
    getValue: (r) => (r.error ? "invalid" : "valid"),
    render: (r) => <StatusBadge status={r.error ? "Rejected" : "Approved"} />,
  },
  { key: "error", label: "Error", width: 260, getValue: (r) => r.error || "-" },
];

export function PaymentsExpensesPage() {
  const [active, setActive] = useState<PaymentCategory>(categories[0]);
  const { data: payments = [], isLoading: paymentsLoading } = usePaymentsQuery();
  const { data: plumbers = [] } = usePlumbersQuery();
  const importPreview = usePaymentsImportPreview();
  const importConfirm = usePaymentsImportConfirm();
  const { data: customers = [] } = useCustomersQuery();

  const plumberNameById = useMemo(() => new Map(plumbers.map((p) => [p.id, p.name])), [plumbers]);
  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.customerConnection.customerName])),
    [customers],
  );

  const monthlyTotal = sum(payments.filter((row) => row.status === "Approved").map((row) => row.amount));
  const data = payments.filter((row) => row.category === active);
  const submittedCount = payments.filter((row) => row.status === "Submitted").length;
  const draftOrRejectedCount = payments.filter((row) => row.status === "Draft" || row.status === "Rejected").length;

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<PaymentCategory, number>> = {};
    for (const row of payments) {
      counts[row.category] = (counts[row.category] ?? 0) + 1;
    }
    return counts;
  }, [payments]);

  const columns: ExcelColumn<Payment>[] = [
    {
      key: "id",
      label: "Entry ID",
      width: 130,
      sticky: true,
      getValue: (row) => row.id.slice(0, 8).toUpperCase(),
      render: (row) => <span className="font-semibold text-foreground">{row.id.slice(0, 8).toUpperCase()}</span>,
    },
    { key: "category", label: "Category", width: 190, getValue: (row) => row.category },
    {
      key: "paidTo",
      label: "Paid To",
      width: 180,
      getValue: (row) => row.paidTo || plumberNameById.get(row.plumberId) || "-",
    },
    { key: "address", label: "Address", width: 190, getValue: (row) => row.address || "-" },
    { key: "customer", label: "Customer", width: 170, getValue: (row) => customerNameById.get(row.customerId) || "-" },
    { key: "amount", label: "Amount", width: 130, getValue: (row) => money(row.amount) },
    { key: "date", label: "Date", width: 130, getValue: (row) => formatDate(row.paymentDate) },
    { key: "mode", label: "Payment Mode", width: 150, getValue: (row) => row.mode },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "evidence",
      label: "Attachment",
      width: 140,
      getValue: (row) => row.evidence.length,
      render: (row) => (row.evidence.length ? <span className="font-medium text-primary">{row.evidence.length} file(s)</span> : "-"),
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      getValue: () => "Actions",
      render: (row) => <PaymentActions payment={row} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments & Expenses"
        subtitle="Manage field payments, rent, material expenses and approvals."
        actions={
          <>
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "default" })}
              onClick={() =>
                void exportRowsToExcel(
                  `${active.toLowerCase().replace(/\s+/g, "-")}.xlsx`,
                  columns.filter((column) => column.key !== "actions"),
                  data,
                )
              }
            >
              <DownloadSimpleIcon size={15} />
              Export Excel
            </button>
            <ImportDialog
              trigger={
                <Button type="button" variant="outline">
                  <UploadSimpleIcon size={15} />
                  Import
                </Button>
              }
              title="Import Payments"
              description="Upload an Excel file to bulk import payment/expense records."
              templateFileName="payments_template.xlsx"
              templateHeaders={[
                "Category",
                "Paid To",
                "Plumber Name",
                "Amount",
                "Payment Date",
                "Mode",
                "Purpose",
                "Remarks",
                "Address",
              ]}
              previewColumns={importPreviewColumns}
              isPreviewPending={importPreview.isPending}
              isConfirmPending={importConfirm.isPending}
              entityLabelPlural="Payments"
              onPreview={(file) => importPreview.mutateAsync(file)}
              onConfirm={(validRows) => importConfirm.mutateAsync(validRows)}
            />
            <PaymentDrawer defaultCategory={active} />
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span>
          Approved this month: <span className="font-semibold text-foreground">{money(monthlyTotal)}</span>
        </span>
        <span>
          Submitted: <span className="font-semibold text-foreground">{submittedCount}</span>
        </span>
        <span>
          Draft / Rejected: <span className="font-semibold text-destructive">{draftOrRejectedCount}</span>
        </span>
      </div>
      <PaymentTabNav active={active} onChange={setActive} counts={categoryCounts} />
      <ExcelDataGrid columns={columns} rows={data} emptyTitle="No expenses found" isLoading={paymentsLoading} />
    </div>
  );
}

function PaymentActions({ payment }: { payment: Payment }) {
  const href = resolveFileUrl(payment.evidence[0]?.fileUrl);
  const deletePayment = useDeletePayment();
  return (
    <div className="flex items-center gap-1">
      <ActionButton label="View" icon={<EyeIcon size={15} />} href={href} disabled={!href} />
      <PaymentDrawer payment={payment} iconOnly />
      <DeleteConfirmDialog
        itemName={payment.paidTo || payment.purpose || "this entry"}
        onConfirm={() => deletePayment.mutate(payment.id)}
      />
    </div>
  );
}

function emptyValues(defaultCategory: PaymentCategory, defaultProjectId = ""): PaymentFormValues {
  return {
    category: defaultCategory,
    plumberId: "",
    paidTo: "",
    siteId: "",
    address: "",
    customerId: "",
    projectId: defaultProjectId,
    amount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    mode: "Cash",
    status: "Draft",
    purpose: "",
    remarks: "",
    evidence: [],
  };
}

function valuesFromPayment(payment: Payment): PaymentFormValues {
  return {
    category: payment.category,
    plumberId: payment.plumberId,
    paidTo: payment.paidTo,
    siteId: payment.siteId,
    address: payment.address,
    customerId: payment.customerId,
    projectId: payment.projectId,
    amount: String(payment.amount),
    paymentDate: payment.paymentDate,
    mode: payment.mode,
    status: payment.status,
    purpose: payment.purpose,
    remarks: payment.remarks,
    evidence: payment.evidence,
  };
}

export function PaymentDrawer({
  payment,
  defaultCategory,
  defaultProjectId,
  defaultProjectName,
  iconOnly = false,
}: {
  payment?: Payment;
  defaultCategory?: PaymentCategory;
  /** Locks the new expense to a project when opened from inside Project Details (§24). */
  defaultProjectId?: string;
  /** Human-readable name shown for the locked project - never shows the raw id. */
  defaultProjectName?: string;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<PaymentFormValues>(
    payment ? valuesFromPayment(payment) : emptyValues(defaultCategory ?? categories[0], defaultProjectId),
  );
  const [saveError, setSaveError] = useState("");
  const { data: paymentModes = [] } = useMasterValuesQuery("Payment Types");
  const { data: plumbers = [] } = usePlumbersQuery();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment(payment?.id ?? "");
  const isSaving = createPayment.isPending || updatePayment.isPending;
  const isPlumberCategory = values.category === "Plumber Payments";
  const label = payment ? "Edit" : "Add Payment / Expense";

  function set<K extends keyof PaymentFormValues>(key: K, value: PaymentFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(
        payment ? valuesFromPayment(payment) : emptyValues(defaultCategory ?? categories[0], defaultProjectId),
      );
      setSaveError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!values.amount || Number(values.amount) <= 0) {
      setSaveError("Enter a valid amount");
      return;
    }
    setSaveError("");
    try {
      if (payment) {
        await updatePayment.mutateAsync(values);
      } else {
        await createPayment.mutateAsync(values);
      }
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save payment");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {iconOnly ? (
        <ActionTooltip label={label}>
          <SheetTrigger
            render={
              <button
                type="button"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label={label}
              />
            }
          >
            <NotePencilIcon size={15} />
          </SheetTrigger>
        </ActionTooltip>
      ) : (
        <SheetTrigger render={<Button type="button" />}>
          <PlusIcon size={15} />
          {label}
        </SheetTrigger>
      )}
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{payment ? "Edit Payment / Expense" : "Add Payment / Expense"}</SheetTitle>
          <SheetDescription>Record payment, receipt and approval information.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {defaultProjectId && defaultProjectName ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Project</span>
              <span className="font-semibold text-foreground">{defaultProjectName}</span>
            </div>
          ) : null}
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Category</span>
            <Select
              value={values.category}
              onValueChange={(category) => {
                if (category) set("category", category as PaymentCategory);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Purpose / What Bought</span>
            <Input value={values.purpose} onChange={(event) => set("purpose", event.target.value)} placeholder="E.g. Pipe clamp purchase" />
          </label>

          {isPlumberCategory ? (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Plumber / Team</span>
              <Select value={values.plumberId || undefined} onValueChange={(plumberId) => set("plumberId", plumberId ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select plumber / team" />
                </SelectTrigger>
                <SelectContent>
                  {plumbers.map((plumber) => (
                    <SelectItem key={plumber.id} value={plumber.id}>
                      {plumber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          ) : (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Payee</span>
              <Input value={values.paidTo} onChange={(event) => set("paidTo", event.target.value)} placeholder="Person or vendor name" />
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Address</span>
            <Input value={values.address} onChange={(event) => set("address", event.target.value)} placeholder="Site / work address (optional)" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Amount</span>
              <Input type="number" value={values.amount} onChange={(event) => set("amount", event.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Date</span>
              <DatePicker value={values.paymentDate} onChange={(value) => set("paymentDate", value)} />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Payment Mode</span>
            <SearchableSelect
              value={values.mode}
              onValueChange={(mode) => set("mode", mode)}
              options={paymentModes.map((mode) => ({ value: mode.value, label: mode.value }))}
              placeholder="Select payment mode"
            />
          </label>

          <ImageProofField
            label="Receipt / Photo"
            description="Upload payment proof, expense bill or receipt image."
            images={values.evidence}
            onChange={(evidence) => set("evidence", evidence)}
            module="expenses"
          />

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <Select value={values.status} onValueChange={(status) => { if (status) set("status", status as PaymentStatus); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Remarks</span>
            <Textarea value={values.remarks} onChange={(event) => set("remarks", event.target.value)} className="min-h-20" />
          </label>

          {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PaymentTabNav({
  active,
  onChange,
  counts,
}: {
  active: PaymentCategory;
  onChange: (tab: PaymentCategory) => void;
  counts: Partial<Record<PaymentCategory, number>>;
}) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto border-b border-border/70">
      {categories.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "inline-flex h-10 w-fit shrink-0 cursor-pointer items-center gap-2 border-b-2 px-0.5 text-sm font-medium transition-colors",
            active === tab
              ? "border-b-primary text-primary font-semibold"
              : "border-b-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>{tab}</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              active === tab ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            {counts[tab] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
