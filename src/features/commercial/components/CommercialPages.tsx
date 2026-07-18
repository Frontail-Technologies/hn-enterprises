"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import {
  ArrowClockwiseIcon,
  ArrowsLeftRightIcon,
  CaretRightIcon,
  CalendarBlankIcon,
  CurrencyInrIcon,
  DownloadSimpleIcon,
  EyeIcon,
  FileTextIcon,
  MapPinIcon,
  PackageIcon,
  NotePencilIcon,
  PlusIcon,
  ReceiptIcon,
  UploadSimpleIcon,
  UserIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DatePicker } from "@/components/shared/DatePicker";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { ImageUploadPreview, type ImagePreviewItem } from "@/components/shared/ImageUploadPreview";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const materials = [
  {
    id: "mat-001",
    name: "GI Pipe 20MM",
    category: "Pipe",
    unit: "Meter",
    availableStock: 420,
    issuedStock: 180,
    reorderLevel: 150,
    store: "Main Store",
    status: "Active",
  },
  {
    id: "mat-002",
    name: "Brass Regulator",
    category: "Regulator",
    unit: "Piece",
    availableStock: 28,
    issuedStock: 72,
    reorderLevel: 40,
    store: "Shyam Nagar Block B",
    status: "Low Stock",
  },
  {
    id: "mat-003",
    name: "Meter Clamp Set",
    category: "Fitting",
    unit: "Set",
    availableStock: 0,
    issuedStock: 115,
    reorderLevel: 25,
    store: "Green City Store",
    status: "Out of Stock",
  },
  {
    id: "mat-004",
    name: "MDPE Coupler 32MM",
    category: "Fitting",
    unit: "Piece",
    availableStock: 210,
    issuedStock: 40,
    reorderLevel: 60,
    store: "Main Store",
    status: "Active",
  },
];

const materialTransactions = [
  { id: "tr-1", materialId: "mat-001", type: "Add Stock", projectSite: "Main Store", quantity: "300 m", by: "Store Admin", date: "2025-02-10", remarks: "Vendor receipt attached." },
  { id: "tr-2", materialId: "mat-001", type: "Issue", projectSite: "Shyam Nagar Block B", quantity: "80 m", by: "Amit Rathore", date: "2025-02-14", remarks: "Issued to plumber Group A." },
  { id: "tr-3", materialId: "mat-002", type: "Issue", projectSite: "Green City Phase 1", quantity: "20 pcs", by: "Priya Nair", date: "2025-02-15", remarks: "Linked with GC work order." },
  { id: "tr-4", materialId: "mat-003", type: "Return", projectSite: "Commercial Block", quantity: "5 sets", by: "Neha Verma", date: "2025-02-17", remarks: "Returned after reconciliation." },
];

const plumberIssuedMaterials = [
  { id: "pi-001", issueNo: "ISS-2025-001", plumber: "Group A", projectSite: "Shyam Nagar Block B", material: "GI Pipe 20MM", quantity: "80 m", issuedDate: "2025-02-14", issuedBy: "Amit Rathore", status: "Issued" },
  { id: "pi-002", issueNo: "ISS-2025-002", plumber: "Ramesh Kumar", projectSite: "Green City Phase 1", material: "Brass Regulator", quantity: "20 pcs", issuedDate: "2025-02-15", issuedBy: "Priya Nair", status: "Issued" },
  { id: "pi-003", issueNo: "ISS-2025-003", plumber: "Group C", projectSite: "Sunrise Enclave", material: "MDPE Coupler 32MM", quantity: "35 pcs", issuedDate: "2025-02-17", issuedBy: "Store Admin", status: "Partially Used" },
];

const plumberReturnedMaterials = [
  { id: "pr-001", returnNo: "RET-2025-001", plumber: "Group A", projectSite: "Shyam Nagar Block B", material: "GI Pipe 20MM", quantity: "12 m", returnDate: "2025-02-18", condition: "Reusable", status: "Accepted" },
  { id: "pr-002", returnNo: "RET-2025-002", plumber: "Ramesh Kumar", projectSite: "Green City Phase 1", material: "Meter Clamp Set", quantity: "5 sets", returnDate: "2025-02-17", condition: "Damaged", status: "Review" },
];

const materialConjunctionDetails = [
  { id: "mc-001", referenceNo: "CONJ-2025-001", customer: "Rajesh Kumar", bpTrNo: "BP-100245", plumber: "Group A", materialUsed: "GI Pipe 20MM", usedQty: "18.5 m", balanceQty: "2.0 m", date: "2025-02-18", status: "Matched" },
  { id: "mc-002", referenceNo: "CONJ-2025-002", customer: "Meena Sharma", bpTrNo: "TR-553901", plumber: "Group B", materialUsed: "Brass Regulator", usedQty: "1 pc", balanceQty: "0", date: "2025-02-17", status: "Pending" },
  { id: "mc-003", referenceNo: "CONJ-2025-003", customer: "Green Mart Store", bpTrNo: "BP-220118", plumber: "Commercial Team", materialUsed: "MDPE Coupler 32MM", usedQty: "8 pcs", balanceQty: "3 pcs", date: "2025-02-16", status: "Mismatch" },
];

type InventoryTab = "stock" | "issued" | "return" | "conjunction";

const inventoryTabs: Array<{ id: InventoryTab; label: string; count: number }> = [
  { id: "stock", label: "Material Stock", count: materials.length },
  { id: "issued", label: "Plumber Issued", count: plumberIssuedMaterials.length },
  { id: "return", label: "Plumber Return", count: plumberReturnedMaterials.length },
  { id: "conjunction", label: "Material Conjunction Details", count: materialConjunctionDetails.length },
];

const bills = [
  { id: "bill-001", billNumber: "BILL-2025-001", projectCustomer: "Shyam Nagar CGD Project", stage: "GC", billDate: "2025-02-10", totalAmount: 850000, paidAmount: 450000, pendingAmount: 400000, dueDate: "2025-02-28", tax: 153000, status: "Submitted" },
  { id: "bill-002", customerId: "cust-002", billNumber: "BILL-2025-002", projectCustomer: "Meena Sharma", stage: "GI", billDate: "2025-02-12", totalAmount: 18500, paidAmount: 18500, pendingAmount: 0, dueDate: "2025-02-20", tax: 3330, status: "Completed" },
  { id: "bill-003", billNumber: "BILL-2025-003", projectCustomer: "Green City Phase 1", stage: "Commissioning", billDate: "2025-01-25", totalAmount: 320000, paidAmount: 100000, pendingAmount: 220000, dueDate: "2025-02-05", tax: 57600, status: "Overdue" },
  { id: "bill-004", customerId: "cust-004", billNumber: "BILL-2025-004", projectCustomer: "Rafiq Khan", stage: "Conversion", billDate: "2025-02-16", totalAmount: 12000, paidAmount: 0, pendingAmount: 12000, dueDate: "2025-03-01", tax: 2160, status: "Draft" },
];

type BillingView = "bills" | "wages";

const billingTabs: Array<{ id: BillingView; label: string }> = [
  { id: "bills", label: "Bill Register" },
  { id: "wages", label: "Wage Register" },
];

const wageRegisterRows = [
  wageRow("wg-1", "ASHIS GAUR", "High Skilled", 2307.69, 26, 1800, 0, "Approved"),
  wageRow("wg-2", "BIPLAB SARKAR", "Skilled", 1153.85, 26, 1800, 0, "Approved"),
  wageRow("wg-3", "HARICHARAN BORO", "Skilled", 1153.85, 26, 1800, 0, "Pending"),
  wageRow("wg-4", "MANIK CARKAR SARKAR", "Unskilled", 692.31, 26, 1800, 135, "Approved"),
  wageRow("wg-5", "SK HASIBUR", "High Skilled", 2307.69, 26, 1800, 0, "Approved"),
  wageRow("wg-6", "SAHNAWYAZ R MALLICK", "High Skilled", 1923.08, 26, 1800, 0, "Pending"),
];

function wageRow(
  id: string,
  name: string,
  category: string,
  wageRate: number,
  daysWorked: number,
  pf: number,
  esic: number,
  status: string,
) {
  const basic = Math.round(wageRate * daysWorked);
  const total = basic;
  const totalDeduction = pf + esic;
  const netPayment = total - totalDeduction;

  return {
    id,
    name,
    category,
    wageRate,
    daysWorked,
    basic,
    total,
    pf,
    esic,
    totalDeduction,
    netPayment,
    status,
  };
}

const paymentHistory = [
  { id: "pay-h-1", billId: "bill-001", date: "2025-02-12", amount: 250000, mode: "NEFT", receivedBy: "Accounts", remarks: "First part payment." },
  { id: "pay-h-2", billId: "bill-001", date: "2025-02-16", amount: 200000, mode: "Cheque", receivedBy: "Accounts", remarks: "Cheque cleared." },
  { id: "pay-h-3", billId: "bill-002", date: "2025-02-13", amount: 18500, mode: "Cash", receivedBy: "Demo Admin", remarks: "Customer paid at office." },
];

const paymentTabs = [
  "Worker Payments",
  "Supervisor Payments",
  "Plumber Payments",
  "Office / Guest House Rent",
  "Material Expenses",
  "Other Expenses",
];

const payments = [
  { id: "exp-001", category: "Worker Payments", paidTo: "Group A", projectSite: "Shyam Nagar Block B", amount: 28000, date: "2025-02-15", mode: "UPI", status: "Approved", attachment: "receipt-group-a.jpg" },
  { id: "exp-002", category: "Supervisor Payments", paidTo: "Amit Rathore", projectSite: "Shyam Nagar CGD", amount: 18000, date: "2025-02-16", mode: "Bank Transfer", status: "Submitted", attachment: "salary-slip.pdf" },
  { id: "exp-003", category: "Plumber Payments", paidTo: "Ramesh Kumar", projectSite: "Green City Phase 1", amount: 12500, date: "2025-02-12", mode: "Cash", status: "Draft", attachment: "-" },
  { id: "exp-004", category: "Office / Guest House Rent", paidTo: "Jaipur Guest House", projectSite: "Jaipur Office", amount: 42000, date: "2025-02-05", mode: "Cheque", status: "Approved", attachment: "rent-receipt.pdf" },
  { id: "exp-005", category: "Material Expenses", paidTo: "Sharma Pipe Traders", projectSite: "Main Store", amount: 76000, date: "2025-02-11", mode: "NEFT", status: "Approved", attachment: "material-bill.jpg" },
  { id: "exp-006", category: "Other Expenses", paidTo: "Courier Service", projectSite: "Office", amount: 1250, date: "2025-02-18", mode: "UPI", status: "Rejected", attachment: "courier.jpg" },
];

export function InventoryPage() {
  const [filters, setFilters] = useState({ search: "", category: "all", status: "all" });
  const [activeTab, setActiveTab] = useState<InventoryTab>("stock");
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return materials.filter((row) =>
      (!search || row.name.toLowerCase().includes(search) || row.store.toLowerCase().includes(search)) &&
      (filters.category === "all" || row.category === filters.category) &&
      (filters.status === "all" || row.status === filters.status)
    );
  }, [filters]);
  const columns: ColumnDef<(typeof materials)[number]>[] = [
    { key: "name", header: "Material Name", render: (row) => <Link className="font-semibold text-foreground hover:text-primary" href={`/inventory/${row.id}`}>{row.name}</Link> },
    { key: "category", header: "Category" },
    { key: "unit", header: "Unit" },
    { key: "availableStock", header: "Available Stock", render: (row) => <b>{row.availableStock}</b> },
    { key: "issuedStock", header: "Issued Stock" },
    { key: "reorderLevel", header: "Reorder Level" },
    { key: "store", header: "Store / Site" },
    { key: "status", header: "Status", render: (row) => <StockStatus row={row} /> },
    { key: "actions", header: "Actions", className: "w-36", render: (row) => <InventoryActions material={row.name} /> },
  ];
  const issuedColumns: ColumnDef<(typeof plumberIssuedMaterials)[number]>[] = [
    { key: "issueNo", header: "Issue No.", render: (row) => <span className="font-semibold text-foreground">{row.issueNo}</span> },
    { key: "plumber", header: "Plumber / Team" },
    { key: "projectSite", header: "Project / Site" },
    { key: "material", header: "Material" },
    { key: "quantity", header: "Issued Qty" },
    { key: "issuedDate", header: "Issued Date", render: (row) => formatDate(row.issuedDate) },
    { key: "issuedBy", header: "Issued By" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "actions", header: "Actions", className: "w-20", render: () => <MaterialDrawer action="Issue Material" icon={<NotePencilIcon size={15} />} iconOnly /> },
  ];
  const returnColumns: ColumnDef<(typeof plumberReturnedMaterials)[number]>[] = [
    { key: "returnNo", header: "Return No.", render: (row) => <span className="font-semibold text-foreground">{row.returnNo}</span> },
    { key: "plumber", header: "Plumber / Team" },
    { key: "projectSite", header: "Project / Site" },
    { key: "material", header: "Material" },
    { key: "quantity", header: "Return Qty" },
    { key: "returnDate", header: "Return Date", render: (row) => formatDate(row.returnDate) },
    { key: "condition", header: "Condition" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "actions", header: "Actions", className: "w-20", render: () => <MaterialDrawer action="Return Material" icon={<NotePencilIcon size={15} />} iconOnly /> },
  ];
  const conjunctionColumns: ColumnDef<(typeof materialConjunctionDetails)[number]>[] = [
    { key: "referenceNo", header: "Reference No.", render: (row) => <span className="font-semibold text-foreground">{row.referenceNo}</span> },
    { key: "customer", header: "Customer" },
    { key: "bpTrNo", header: "BP / TR No." },
    { key: "plumber", header: "Plumber / Team" },
    { key: "materialUsed", header: "Material Used" },
    { key: "usedQty", header: "Used Qty" },
    { key: "balanceQty", header: "Balance Qty" },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "actions", header: "Actions", className: "w-20", render: () => <ActionButton label="View" icon={<EyeIcon size={15} />} /> },
  ];

  return (
    <div className="space-y-5">
      <Header
        title="Inventory & Material"
        subtitle="Track stock, material issues, receipts and plumber reconciliation."
        actions={<MaterialDrawer action="Add Stock" />}
      />
      <InventoryTabNav activeTab={activeTab} onChange={setActiveTab} />
      <TableSection>
        {activeTab === "stock" ? (
          <>
            <FilterSheetButton
              searchKey="search"
              searchPlaceholder="Search material or store..."
              title="Inventory Filters"
              values={filters}
              filters={[
                { key: "category", placeholder: "All Categories", options: uniqOptions(materials.map((row) => row.category)) },
                { key: "status", placeholder: "All Statuses", options: uniqOptions(materials.map((row) => row.status)) },
              ]}
              onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
              onReset={() => setFilters({ search: "", category: "all", status: "all" })}
            />
            <PaginatedDataTable data={data} columns={columns} />
          </>
        ) : null}
        {activeTab === "issued" ? <PaginatedDataTable data={plumberIssuedMaterials} columns={issuedColumns} /> : null}
        {activeTab === "return" ? <PaginatedDataTable data={plumberReturnedMaterials} columns={returnColumns} /> : null}
        {activeTab === "conjunction" ? <PaginatedDataTable data={materialConjunctionDetails} columns={conjunctionColumns} /> : null}
      </TableSection>
    </div>
  );
}

export function InventoryDetailPage({ id }: { id: string }) {
  const material = getMaterial(id);
  const transactions = materialTransactions.filter((item) => item.materialId === material.id);
  const columns: ColumnDef<(typeof materialTransactions)[number]>[] = [
    { key: "type", header: "Type", render: (row) => <b>{row.type}</b> },
    { key: "projectSite", header: "Project / Site" },
    { key: "quantity", header: "Quantity" },
    { key: "by", header: "Updated By" },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "remarks", header: "Remarks" },
  ];

  return (
    <div className="space-y-5">
      <CommercialBreadcrumb
        items={[
          { label: "Inventory & Material", href: "/inventory" },
          { label: material.name },
        ]}
      />
      <Header
        title={material.name}
        subtitle={`${material.category} stock at ${material.store}`}
        actions={<InventoryActions material={material.name} labels />}
      />
      <DetailSummaryCard
        title="Material Overview"
        status={<StockStatus row={material} />}
        leftItems={[
          { icon: <PackageIcon size={15} />, label: "Category", value: material.category },
          { icon: <PackageIcon size={15} />, label: "Unit", value: material.unit },
          { icon: <PackageIcon size={15} />, label: "Available Stock", value: `${material.availableStock} ${material.unit}` },
          { icon: <PackageIcon size={15} />, label: "Issued Stock", value: `${material.issuedStock} ${material.unit}` },
          { icon: <WarningIcon size={15} />, label: "Reorder Level", value: `${material.reorderLevel} ${material.unit}` },
        ]}
        rightTitle="Reconciliation"
        rightItems={[
          { icon: <MapPinIcon size={15} />, label: "Store / Site", value: material.store },
          { icon: <FileTextIcon size={15} />, label: "Linked Project", value: "Shyam Nagar CGD Project" },
          { icon: <UserIcon size={15} />, label: "Plumber Record", value: "Group A reconciliation pending" },
          { icon: <ReceiptIcon size={15} />, label: "Latest Receipt", value: "purchase-receipt-021.jpg" },
        ]}
      />
      <Panel title="Transaction History">
        <DataTable data={transactions} columns={columns} />
      </Panel>
    </div>
  );
}

export function BillingPage() {
  const [activeView, setActiveView] = useState<BillingView>("bills");
  const totals = {
    billed: sum(bills.map((bill) => bill.totalAmount)),
    received: sum(bills.map((bill) => bill.paidAmount)),
    pending: sum(bills.map((bill) => bill.pendingAmount)),
    overdue: sum(bills.filter((bill) => bill.status === "Overdue").map((bill) => bill.pendingAmount)),
  };
  const wageTotals = {
    gross: sum(wageRegisterRows.map((row) => row.total)),
    deductions: sum(wageRegisterRows.map((row) => row.totalDeduction)),
    net: sum(wageRegisterRows.map((row) => row.netPayment)),
    pending: wageRegisterRows.filter((row) => row.status === "Pending").length,
  };
  const [filters, setFilters] = useState({ search: "", stage: "all", status: "all" });
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return bills.filter((row) =>
      (!search || row.billNumber.toLowerCase().includes(search) || row.projectCustomer.toLowerCase().includes(search)) &&
      (filters.stage === "all" || row.stage === filters.stage) &&
      (filters.status === "all" || row.status === filters.status)
    );
  }, [filters]);
  const columns: ColumnDef<(typeof bills)[number]>[] = [
    { key: "billNumber", header: "Bill Number", render: (row) => <Link href={getBillHref(row)} className="font-semibold text-foreground hover:text-primary">{row.billNumber}</Link> },
    { key: "projectCustomer", header: "Project / Customer" },
    { key: "stage", header: "Billing Stage" },
    { key: "billDate", header: "Bill Date", render: (row) => formatDate(row.billDate) },
    { key: "totalAmount", header: "Total Amount", render: (row) => money(row.totalAmount) },
    { key: "paidAmount", header: "Paid Amount", render: (row) => money(row.paidAmount) },
    { key: "pendingAmount", header: "Pending Amount", render: (row) => <b>{money(row.pendingAmount)}</b> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "actions", header: "Actions", className: "w-32", render: (row) => <BillingActions bill={row.billNumber} /> },
  ];

  return (
    <div className="space-y-5">
      <Header title="Billing" subtitle="Track bills, invoices and received payments." actions={<BillDrawer action="Create Bill" />} />
      <UnderlineTabs items={billingTabs} active={activeView} onChange={(id) => setActiveView(id as BillingView)} />
      {activeView === "bills" ? (
        <>
          <StatCardRow>
            <SummaryValue label="Total Billed" value={money(totals.billed)} />
            <SummaryValue label="Received" value={money(totals.received)} icon={<ReceiptIcon size={17} />} />
            <SummaryValue label="Pending" value={money(totals.pending)} icon={<FileTextIcon size={17} />} />
            <SummaryValue label="Overdue" value={money(totals.overdue)} icon={<WarningIcon size={17} />} warn />
          </StatCardRow>
          <TableSection>
            <FilterSheetButton
              searchKey="search"
              searchPlaceholder="Search bill or customer..."
              title="Billing Filters"
              values={filters}
              filters={[
                { key: "stage", placeholder: "All Stages", options: uniqOptions(bills.map((row) => row.stage)) },
                { key: "status", placeholder: "All Statuses", options: uniqOptions(bills.map((row) => row.status)) },
              ]}
              onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
              onReset={() => setFilters({ search: "", stage: "all", status: "all" })}
            />
            <PaginatedDataTable data={data} columns={columns} />
          </TableSection>
        </>
      ) : (
        <>
          <StatCardRow>
            <SummaryValue label="Gross Wages" value={money(wageTotals.gross)} />
            <SummaryValue label="Deductions" value={money(wageTotals.deductions)} icon={<FileTextIcon size={17} />} />
            <SummaryValue label="Net Payable" value={money(wageTotals.net)} icon={<ReceiptIcon size={17} />} />
            <SummaryValue label="Pending Payments" value={String(wageTotals.pending)} icon={<WarningIcon size={17} />} warn />
          </StatCardRow>
          <WageRegister />
        </>
      )}
    </div>
  );
}

export function BillingDetailPage({ id }: { id: string }) {
  const bill = getBill(id);
  const paymentsForBill = paymentHistory.filter((item) => item.billId === bill.id);
  const columns: ColumnDef<(typeof paymentHistory)[number]>[] = [
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "amount", header: "Amount", render: (row) => <b>{money(row.amount)}</b> },
    { key: "mode", header: "Mode" },
    { key: "receivedBy", header: "Received By" },
    { key: "remarks", header: "Remarks" },
  ];

  return (
    <div className="space-y-5">
      <CommercialBreadcrumb
        items={[
          { label: "Billing", href: "/billing" },
          { label: bill.billNumber },
        ]}
      />
      <Header title={bill.billNumber} subtitle={`${bill.stage} billing for ${bill.projectCustomer}`} actions={<BillingActions bill={bill.billNumber} labels />} />
      <DetailSummaryCard
        title="Bill Overview"
        status={<StatusBadge status={bill.status} />}
        leftItems={[
          { icon: <FileTextIcon size={15} />, label: "Bill Number", value: bill.billNumber },
          { icon: <CalendarBlankIcon size={15} />, label: "Bill Date", value: formatDate(bill.billDate) },
          { icon: <CalendarBlankIcon size={15} />, label: "Due Date", value: formatDate(bill.dueDate) },
          { icon: <CurrencyInrIcon size={15} />, label: "Amount", value: money(bill.totalAmount) },
          { icon: <CurrencyInrIcon size={15} />, label: "Tax", value: money(bill.tax) },
        ]}
        rightTitle="Collection"
        rightItems={[
          { icon: <UserIcon size={15} />, label: "Project / Customer", value: bill.projectCustomer },
          { icon: <FileTextIcon size={15} />, label: "Billing Stage", value: bill.stage },
          { icon: <CurrencyInrIcon size={15} />, label: "Paid Amount", value: money(bill.paidAmount) },
          { icon: <CurrencyInrIcon size={15} />, label: "Pending Amount", value: money(bill.pendingAmount) },
          { icon: <ReceiptIcon size={15} />, label: "Invoice / PDF", value: `${bill.billNumber}.pdf` },
        ]}
      />
      <Panel
        title="Payment History"
        actions={
          <Button type="button" variant="outline" size="sm">
            <DownloadSimpleIcon size={14} />
            Download Invoice
          </Button>
        }
      >
        <DataTable data={paymentsForBill} columns={columns} />
      </Panel>
    </div>
  );
}

type BreadcrumbItem = {
  label: string;
  href?: string;
};

function CommercialBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Commercial breadcrumb" className="flex items-center gap-1 text-xs">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index > 0 ? (
              <CaretRightIcon
                aria-hidden="true"
                size={13}
                weight="bold"
                className="shrink-0 text-muted-foreground/70"
              />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="max-w-44 truncate font-medium text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="max-w-64 truncate font-semibold text-foreground">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function PaymentsExpensesPage() {
  const [active, setActive] = useState(paymentTabs[0]);
  const monthlyTotal = sum(payments.filter((row) => row.status === "Approved").map((row) => row.amount));
  const data = payments.filter((row) => row.category === active);
  const columns: ColumnDef<(typeof payments)[number]>[] = [
    { key: "id", header: "Entry ID", render: (row) => <b>{row.id.toUpperCase()}</b> },
    { key: "category", header: "Category" },
    { key: "paidTo", header: "Paid To" },
    { key: "projectSite", header: "Project / Site" },
    { key: "amount", header: "Amount", render: (row) => money(row.amount) },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "mode", header: "Payment Mode" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "attachment", header: "Attachment", render: (row) => row.attachment === "-" ? "-" : <span className="font-medium text-primary">{row.attachment}</span> },
    { key: "actions", header: "Actions", className: "w-24", render: () => <PaymentActions /> },
  ];

  return (
    <div className="space-y-5">
      <Header title="Payments & Expenses" subtitle="Manage field payments, rent, material expenses and approvals." actions={<PaymentDrawer />} />
      <StatCardRow>
        <SummaryValue label="Approved This Month" value={money(monthlyTotal)} icon={<ReceiptIcon size={17} />} />
        <SummaryValue label="Submitted" value={String(payments.filter((row) => row.status === "Submitted").length)} icon={<FileTextIcon size={17} />} />
        <SummaryValue label="Draft / Rejected" value={String(payments.filter((row) => row.status === "Draft" || row.status === "Rejected").length)} icon={<WarningIcon size={17} />} warn />
      </StatCardRow>
      <PaymentTabNav active={active} onChange={setActive} />
      <TableSection>
        <PaginatedDataTable data={data} columns={columns} />
      </TableSection>
    </div>
  );
}

function InventoryActions({ material, labels = false }: { material: string; labels?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <ActionLink href={`/inventory/${getMaterialByName(material).id}`} label="View" icon={<EyeIcon size={15} />} labels={labels} />
      <MaterialDrawer action="Add Stock" icon={<PlusIcon size={15} />} iconOnly={!labels} />
      <MaterialDrawer action="Issue Material" icon={<UploadSimpleIcon size={15} />} iconOnly={!labels} />
      <MaterialDrawer action="Return Material" icon={<ArrowClockwiseIcon size={15} />} iconOnly={!labels} />
      <MaterialDrawer action="Transfer Material" icon={<ArrowsLeftRightIcon size={15} />} iconOnly={!labels} />
    </div>
  );
}

function BillingActions({ bill, labels = false }: { bill: string; labels?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <ActionLink href={getBillHref(getBillByNumber(bill))} label="View" icon={<EyeIcon size={15} />} labels={labels} />
      <BillDrawer action="Edit Draft" icon={<NotePencilIcon size={15} />} iconOnly={!labels} />
      <ActionButton label="Download Invoice" icon={<DownloadSimpleIcon size={15} />} labels={labels} />
      <BillDrawer action="Record Payment" icon={<ReceiptIcon size={15} />} iconOnly={!labels} />
    </div>
  );
}

function PaymentActions() {
  return (
    <div className="flex items-center gap-1">
      <ActionButton label="View" icon={<EyeIcon size={15} />} />
      <PaymentDrawer mode="edit" iconOnly />
    </div>
  );
}

function MaterialDrawer({ action, icon, iconOnly = false }: { action: string; icon?: ReactNode; iconOnly?: boolean }) {
  return (
    <CommercialDrawer title={action} description="Maintain stock movement with receipt/photo reference." triggerLabel={action} icon={icon} iconOnly={iconOnly}>
      <Field label="Material" select options={materials.map((row) => row.name)} />
      <Field label="Project / Site" />
      <Field label="Quantity" />
      <Field label="Transaction Date" date />
      <ImageProofField
        label="Bill / Receipt Photo"
        description="Upload material bill, store receipt or handover proof image."
      />
      <Field label="Remarks" textarea />
    </CommercialDrawer>
  );
}

function BillDrawer({ action, icon, iconOnly = false }: { action: string; icon?: ReactNode; iconOnly?: boolean }) {
  return (
    <CommercialDrawer title={action} description="Create bill records and payment entries." triggerLabel={action} icon={icon} iconOnly={iconOnly}>
      <Field label="Project / Customer" />
      <Field label="Billing Stage" select options={["GI", "GC", "Commissioning", "Conversion", "Other"]} />
      <Field label="Total Amount" />
      <Field label="Tax" />
      <Field label="Due Date" date />
      <Field label="Invoice / PDF" />
      <Field label="Remarks" textarea />
    </CommercialDrawer>
  );
}

function PaymentDrawer({ mode = "add", iconOnly = false }: { mode?: "add" | "edit"; iconOnly?: boolean }) {
  const existingImages: ImagePreviewItem[] = mode === "edit"
    ? [
        {
          id: "receipt-proof-1",
          label: "Payment receipt",
          fileName: "receipt-group-a.jpg",
          uploadedOn: "2025-02-15",
        },
      ]
    : [];

  return (
    <CommercialDrawer
      title={mode === "edit" ? "Edit Payment / Expense" : "Add Payment / Expense"}
      description="Record payment, receipt and approval information."
      triggerLabel={mode === "edit" ? "Edit" : "Add Payment / Expense"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : <PlusIcon size={15} />}
      iconOnly={iconOnly}
    >
      <Field label="Category" select options={paymentTabs} />
      <Field label="Payee" />
      <Field label="Project / Site" />
      <Field label="Amount" />
      <Field label="Date" date />
      <Field label="Payment Mode" select options={["Cash", "UPI", "Bank Transfer", "NEFT", "Cheque"]} />
      <ImageProofField
        label="Receipt / Photo"
        description="Upload payment proof, expense bill or receipt image."
        images={existingImages}
      />
      <Field label="Status" select options={["Draft", "Submitted", "Approved", "Rejected"]} />
      <Field label="Remarks" textarea />
    </CommercialDrawer>
  );
}

function ImageProofField({
  label,
  description,
  images = [],
}: {
  label: string;
  description: string;
  images?: ImagePreviewItem[];
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ImageUploadPreview images={images} />
    </div>
  );
}

function CommercialDrawer({
  title,
  description,
  triggerLabel,
  icon,
  iconOnly = false,
  children,
}: {
  title: string;
  description: string;
  triggerLabel: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  children: ReactNode;
}) {
  return (
    <Sheet>
      {iconOnly ? (
        <ActionTooltip label={triggerLabel}>
          <SheetTrigger render={<button type="button" className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label={triggerLabel} />}>
            {icon ?? <PlusIcon size={15} />}
          </SheetTrigger>
        </ActionTooltip>
      ) : (
        <SheetTrigger render={<Button type="button" />}>
          {icon ?? <PlusIcon size={15} />}
          {triggerLabel}
        </SheetTrigger>
      )}
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4">{children}</div>
        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button">Save</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function TableSection({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-border/70 bg-card p-3">
      {children}
    </section>
  );
}

function WageRegister() {
  return (
    <section className="rounded-lg border border-border/70 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Wage Register</p>
          <p className="text-xs text-muted-foreground">
            Payroll-style register with attendance days, deductions and net payment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="may-2026">
            <SelectTrigger className="h-8 w-[150px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="may-2026">May 2026</SelectItem>
              <SelectItem value="apr-2026">April 2026</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm">
            <DownloadSimpleIcon size={14} />
            Export Wage Sheet
          </Button>
        </div>
      </div>
      <div className="overflow-y-auto">
        <div className="flex min-w-0">
          <div className="shrink-0 border-r border-border/70">
            <table className="w-max border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <RegisterHeaderCell className="w-16 min-w-16">Sl No.</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-52 min-w-52">Name</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-36 min-w-36">Category</RegisterHeaderCell>
                </tr>
              </thead>
              <tbody>
                {wageRegisterRows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-muted/25">
                    <RegisterBodyCell className="text-center font-medium">{index + 1}</RegisterBodyCell>
                    <RegisterBodyCell className="font-medium text-foreground">{row.name}</RegisterBodyCell>
                    <RegisterBodyCell>{row.category}</RegisterBodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto">
            <table className="min-w-max border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <RegisterHeaderCell className="w-32 min-w-32 text-right">Rate of Wage</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-center">Days Worked</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-right">Basic</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-right">Total</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-28 min-w-28 text-right">PF</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-28 min-w-28 text-right">ESIC</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-36 min-w-36 text-right">Total Deduction</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-36 min-w-36 text-right">Net Payment</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-center">Status</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-28 min-w-28 text-center">Signature</RegisterHeaderCell>
                </tr>
              </thead>
              <tbody>
                {wageRegisterRows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/25">
                    <RegisterBodyCell className="text-right">{money(row.wageRate)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-center font-medium">{row.daysWorked}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.basic)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.total)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.pf)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.esic)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.totalDeduction)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right font-semibold">{money(row.netPayment)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-center">
                      <StatusBadge status={row.status} />
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-center text-muted-foreground">-</RegisterBodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegisterHeaderCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 h-11 border-b border-r border-border/70 bg-secondary/90 px-2 py-2 text-left align-middle text-xs font-semibold text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function RegisterBodyCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("h-10 border-b border-r border-border/55 bg-card px-2 py-2 text-sm text-foreground", className)}>
      {children}
    </td>
  );
}

function UnderlineTabs({
  items,
  active,
  onChange,
}: {
  items: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto border-b border-border/70">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "h-10 w-fit shrink-0 border-b-2 px-0.5 text-sm font-medium transition-colors",
            active === item.id
              ? "border-b-primary text-primary font-semibold"
              : "border-b-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function InventoryTabNav({
  activeTab,
  onChange,
}: {
  activeTab: InventoryTab;
  onChange: (tab: InventoryTab) => void;
}) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto border-b border-border/70">
      {inventoryTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "inline-flex h-10 w-fit shrink-0 items-center gap-2 border-b-2 px-0.5 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "border-b-primary text-primary font-semibold"
              : "border-b-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>{tab.label}</span>
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
            activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
          )}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

function PaymentTabNav({
  active,
  onChange,
}: {
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto border-b border-border/70">
      {paymentTabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "inline-flex h-10 shrink-0 items-center border-b-2 px-0.5 text-sm font-medium transition-colors",
            active === tab
              ? "border-b-primary text-primary font-semibold"
              : "border-b-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function Header({ title, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

function Panel({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {actions}
      </div>
      {children}
    </section>
  );
}

type SummaryItem = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

function DetailSummaryCard({
  title,
  status,
  leftItems,
  rightTitle,
  rightItems,
}: {
  title: string;
  status: ReactNode;
  leftItems: SummaryItem[];
  rightTitle: string;
  rightItems: SummaryItem[];
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card p-3">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {status}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <KeyValueList items={leftItems} />
        <div className="border-border/70 xl:border-l xl:pl-5">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{rightTitle}</p>
          <KeyValueList items={rightItems} compact />
        </div>
      </div>
    </section>
  );
}

function KeyValueList({
  items,
  compact = false,
}: {
  items: SummaryItem[];
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "grid items-center gap-3 sm:grid-cols-[11rem_minmax(0,1fr)]",
            compact && "sm:grid-cols-[8rem_minmax(0,1fr)]",
          )}
        >
          <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="text-primary">{item.icon}</span>
            {item.label}
          </span>
          <span className="min-w-0 font-semibold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryValue({ label, value, icon, warn }: { label: string; value: string; icon?: ReactNode; warn?: boolean }) {
  return (
    <div className="flex h-24 w-full flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-4 text-muted-foreground">{label}</p>
        <span className={cn("rounded-lg bg-primary/10 p-1.5 text-primary", warn && "bg-destructive/10 text-destructive")}>
          {icon ?? <CurrencyInrIcon size={17} />}
        </span>
      </div>
      <p className={cn("text-xl font-semibold leading-tight text-foreground", warn && "text-primary")}>{value}</p>
    </div>
  );
}

function StatCardRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function StockStatus({ row }: { row: { availableStock: number; reorderLevel: number; status: string } }) {
  const status = row.availableStock <= 0 ? "Out of Stock" : row.availableStock <= row.reorderLevel ? "Low Stock" : row.status;
  return <StatusBadge status={status} />;
}

function PaginatedDataTable<T extends { id: string }>({ data, columns, pageSize = 6 }: { data: T[]; columns: ColumnDef<T>[]; pageSize?: number }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = data.slice(startIndex, startIndex + pageSize);
  const startItem = data.length ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + pagedData.length, data.length);

  return (
    <div className="space-y-3">
      <Pagination compact page={currentPage} pageCount={pageCount} totalItems={data.length} startItem={startItem} endItem={endItem} onPageChange={setPage} />
      <DataTable data={pagedData} columns={columns} serialNumberStart={startIndex + 1} stickyHeader stickyLastColumn />
    </div>
  );
}

function Field({
  label,
  select,
  textarea,
  date,
  options = [],
}: {
  label: string;
  select?: boolean;
  textarea?: boolean;
  date?: boolean;
  options?: string[];
}) {
  const [dateValue, setDateValue] = useState("");

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {select ? (
        <Select defaultValue={options[0]}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
        </Select>
      ) : textarea ? (
        <Textarea className="min-h-24" />
      ) : date ? (
        <DatePicker value={dateValue} onChange={setDateValue} placeholder="Select date" />
      ) : (
        <Input />
      )}
    </label>
  );
}

function ActionButton({ label, icon, labels = false }: { label: string; icon: ReactNode; labels?: boolean }) {
  return (
    <ActionTooltip label={label}>
      <button type="button" className={buttonVariants({ variant: "ghost", size: labels ? "sm" : "icon-sm" })} aria-label={label}>
        {icon}
        {labels ? label : null}
      </button>
    </ActionTooltip>
  );
}

function ActionLink({ href, label, icon, labels = false }: { href: string; label: string; icon: ReactNode; labels?: boolean }) {
  return (
    <ActionTooltip label={label}>
      <Link href={href} className={buttonVariants({ variant: "ghost", size: labels ? "sm" : "icon-sm" })} aria-label={label}>
        {icon}
        {labels ? label : null}
      </Link>
    </ActionTooltip>
  );
}

function getMaterial(id: string) {
  return materials.find((item) => item.id === id) ?? materials[0];
}

function getMaterialByName(name: string) {
  return materials.find((item) => item.name === name) ?? materials[0];
}

function getBill(id: string) {
  return bills.find((item) => item.id === id) ?? bills[0];
}

function getBillByNumber(billNumber: string) {
  return bills.find((item) => item.billNumber === billNumber) ?? bills[0];
}

function getBillHref(bill: (typeof bills)[number]) {
  return "customerId" in bill && bill.customerId
    ? `/customers/${bill.customerId}?tab=billing`
    : `/billing/${bill.id}`;
}

function uniqOptions(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ label: value, value }));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}
