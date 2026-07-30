"use client";

import { useState } from "react";
import { ArrowLeftIcon, NotePencilIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  inventoryStockSheetRows,
  materialPurchaseRegister,
  pbgConsumptionMaterials,
  pbgIssueMaterials,
  plumberBalanceRows,
  plumberConsumptionRows,
  storeIssueBookRows,
  totalIssueRows,
} from "../data/materials.data";
import type { InventoryTab } from "../types/commercial.types";
import { formatDate } from "../utils/format";
import {
  getMaterialCustomerConsumption,
  getMaterialPlumberBalances,
} from "../utils/inventory.utils";
import { InventoryTabNav } from "./inventory/InventoryTabNav";
import { MaterialDrawer } from "./inventory/MaterialDrawer";

type StockRow = (typeof inventoryStockSheetRows)[number];
type PlumberMaterialRow = {
  id: string;
  plumber: string;
  material: string;
  unit: string;
  totalIssued: number;
  consumed: number;
  returned: number;
  balance: number;
  site: string;
  supervisor: string;
  status: string;
};
type CustomerConsumptionRow = ReturnType<typeof getMaterialCustomerConsumption>[number];

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>("stock");
  const [selectedMaterial, setSelectedMaterial] = useState<StockRow | null>(null);
  const [selectedPlumber, setSelectedPlumber] = useState<PlumberMaterialRow | null>(null);

  const inventoryActionLabelByTab: Record<InventoryTab, string> = {
    stock: "Add Stock",
    purchase: "Add Purchase",
    pbgIssue: "Add PBG Issue",
    pbgConsumption: "Add PBG Consumption",
    storeIssue: "Issue Material",
    totalIssue: "Issue Material",
    plumberBalance: "Adjust Balance",
    plumberConsumption: "Add Consumption",
  };

  function handleTabChange(tab: InventoryTab) {
    setActiveTab(tab);
    setSelectedMaterial(null);
    setSelectedPlumber(null);
  }

  const plumberRows = selectedMaterial
    ? getMaterialPlumberDrillRows(selectedMaterial.materialId, selectedMaterial.itemName)
    : [];
  const customerRows =
    selectedMaterial && selectedPlumber
      ? getMaterialCustomerConsumption(selectedMaterial.materialId).filter(
          (row) => row.plumber === selectedPlumber.plumber,
        )
      : [];

  function handleStockBack() {
    if (selectedPlumber) {
      setSelectedPlumber(null);
      return;
    }
    setSelectedMaterial(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory & Material"
        subtitle="Workbook-style stock, purchase, issue and plumber consumption registers."
        actions={<MaterialDrawer action={inventoryActionLabelByTab[activeTab]} />}
      />
      <InventoryTabNav activeTab={activeTab} onChange={handleTabChange} />
      {activeTab === "stock" ? (
        <div className="space-y-2">
          {selectedMaterial ? (
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1"
                  onClick={handleStockBack}
                >
                  <ArrowLeftIcon size={14} />
                  Back
                </Button>
                <span className="font-medium text-muted-foreground">Inventory</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-semibold text-foreground">{selectedMaterial.itemName}</span>
                {selectedPlumber ? (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-semibold text-primary">{selectedPlumber.plumber}</span>
                  </>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPlumber
                  ? "Customer-wise material usage"
                  : "Plumber-wise issue, consumption and balance"}
              </p>
            </div>
          ) : null}
          {selectedPlumber ? (
            <ExcelDataGrid
              columns={customerConsumptionColumns}
              rows={customerRows}
              emptyTitle="No customer consumption found for this plumber"
            />
          ) : selectedMaterial ? (
            <ExcelDataGrid
              columns={plumberDrillColumns}
              rows={plumberRows}
              emptyTitle="No plumber ledger found for this material"
              onRowClick={(row) => setSelectedPlumber(row)}
            />
          ) : (
            <ExcelDataGrid
              columns={stockColumns}
              rows={inventoryStockSheetRows}
              emptyTitle="No stock records found"
              onRowClick={(row) => setSelectedMaterial(row)}
            />
          )}
        </div>
      ) : null}
      {activeTab === "purchase" ? (
        <ExcelDataGrid
          columns={purchaseColumns}
          rows={materialPurchaseRegister}
          emptyTitle="No purchase records found"
        />
      ) : null}
      {activeTab === "pbgIssue" ? (
        <ExcelDataGrid
          columns={pbgIssueColumns}
          rows={pbgIssueMaterials}
          emptyTitle="No PBG issue records found"
        />
      ) : null}
      {activeTab === "pbgConsumption" ? (
        <ExcelDataGrid
          columns={pbgConsumptionColumns}
          rows={pbgConsumptionMaterials}
          emptyTitle="No PBG consumption records found"
        />
      ) : null}
      {activeTab === "storeIssue" ? (
        <ExcelDataGrid
          columns={storeIssueColumns}
          rows={storeIssueBookRows}
          emptyTitle="No store issue records found"
        />
      ) : null}
      {activeTab === "totalIssue" ? (
        <ExcelDataGrid
          columns={totalIssueColumns}
          rows={totalIssueRows}
          emptyTitle="No total issue records found"
        />
      ) : null}
      {activeTab === "plumberBalance" ? (
        <ExcelDataGrid
          columns={plumberBalanceColumns}
          rows={plumberBalanceRows}
          emptyTitle="No plumber balance records found"
        />
      ) : null}
      {activeTab === "plumberConsumption" ? (
        <ExcelDataGrid
          columns={plumberConsumptionColumns}
          rows={plumberConsumptionRows}
          emptyTitle="No plumber consumption records found"
        />
      ) : null}
    </div>
  );
}

const stockColumns: ExcelColumn<(typeof inventoryStockSheetRows)[number]>[] = [
  { key: "srNo", label: "Sr No.", width: 80, sticky: true, getValue: (row) => row.srNo },
  {
    key: "itemName",
    label: "Item Name",
    width: 230,
    sticky: true,
    getValue: (row) => row.itemName,
    render: (row) => <span className="font-semibold text-foreground">{row.itemName}</span>,
  },
  { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
  { key: "plumber", label: "Plumber", width: 150, getValue: (row) => row.plumber },
  { key: "balanceMaterial", label: "Balance Material", width: 150, getValue: (row) => row.balanceMaterial },
  { key: "consumption", label: "Consumption", width: 130, getValue: (row) => row.consumption },
  { key: "totalIssue", label: "Total Issue", width: 130, getValue: (row) => row.totalIssue },
  { key: "returnQty", label: "Return", width: 110, getValue: (row) => row.returnQty },
  { key: "rate", label: "Rate", width: 120, getValue: (row) => row.rate },
  { key: "debitAmount", label: "Debit Amount", width: 150, getValue: (row) => row.debitAmount },
  { key: "store", label: "Store / Site", width: 180, getValue: (row) => row.store },
  {
    key: "status",
    label: "Status",
    width: 140,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "action",
    label: "Action",
    width: 140,
    getValue: () => "View Plumbers",
    render: () => <span className="font-semibold text-primary">View Plumbers</span>,
  },
];

const plumberDrillColumns: ExcelColumn<PlumberMaterialRow>[] = [
  {
    key: "plumber",
    label: "Plumber / Labour",
    width: 190,
    sticky: true,
    getValue: (row) => row.plumber,
    render: (row) => <span className="font-semibold text-foreground">{row.plumber}</span>,
  },
  { key: "material", label: "Material", width: 220, sticky: true, getValue: (row) => row.material },
  { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
  { key: "totalIssued", label: "Total Issued", width: 140, getValue: (row) => row.totalIssued },
  { key: "consumed", label: "Consumed", width: 130, getValue: (row) => row.consumed },
  { key: "returned", label: "Returned", width: 130, getValue: (row) => row.returned },
  { key: "balance", label: "Balance", width: 130, getValue: (row) => row.balance },
  { key: "site", label: "Site", width: 190, getValue: (row) => row.site },
  { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor },
  {
    key: "status",
    label: "Status",
    width: 150,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "action",
    label: "Action",
    width: 150,
    getValue: () => "View Customers",
    render: () => <span className="font-semibold text-primary">View Customers</span>,
  },
];

const customerConsumptionColumns: ExcelColumn<CustomerConsumptionRow>[] = [
  {
    key: "bpNo",
    label: "BP / TR No.",
    width: 140,
    sticky: true,
    getValue: (row) => row.bpNo,
    render: (row) => <span className="font-semibold text-foreground">{row.bpNo}</span>,
  },
  {
    key: "customerName",
    label: "Customer",
    width: 190,
    sticky: true,
    getValue: (row) => row.customerName,
    render: (row) => <span className="font-semibold text-foreground">{row.customerName}</span>,
  },
  { key: "usedQty", label: "Used Qty", width: 120, getValue: (row) => row.usedQty },
  { key: "plumber", label: "Plumber", width: 140, getValue: (row) => row.plumber },
  { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor },
  { key: "address", label: "Address", width: 300, getValue: (row) => row.address },
  { key: "siteRemark", label: "Site Remark", width: 160, getValue: (row) => row.siteRemark },
  { key: "installationDate", label: "Installation Date", width: 150, getValue: (row) => formatDate(row.installationDate) },
  { key: "testingDate", label: "Testing Date", width: 140, getValue: (row) => formatDate(row.testingDate) },
  { key: "reportNo", label: "Report No.", width: 140, getValue: (row) => row.reportNo },
  { key: "plumberBillNo", label: "Plumber Bill No.", width: 160, getValue: (row) => row.plumberBillNo },
  { key: "bgGasBillNo", label: "BG Gas Bill No.", width: 160, getValue: (row) => row.bgGasBillNo },
];

function getMaterialPlumberDrillRows(materialId: string, materialName: string): PlumberMaterialRow[] {
  const balanceRows = getMaterialPlumberBalances(materialId);
  const consumptionRows = getMaterialCustomerConsumption(materialId);
  const grouped = new Map<string, PlumberMaterialRow>();

  balanceRows.forEach((row) => {
    grouped.set(row.plumber, {
      id: `plumber-${materialId}-${slug(row.plumber)}`,
      plumber: row.plumber,
      material: row.material,
      unit: row.unit,
      totalIssued: Number(row.totalIssued) || 0,
      consumed: Number(row.consumed) || 0,
      returned: Number(row.returned) || 0,
      balance: Number(row.balance) || 0,
      site: row.site,
      supervisor: row.supervisor,
      status: row.status,
    });
  });

  consumptionRows.forEach((row) => {
    const existing = grouped.get(row.plumber);
    const usedQty = Number(row.usedQty) || 0;

    if (existing) {
      existing.consumed = Math.max(existing.consumed, usedQty);
      if (!existing.site || existing.site === "-") existing.site = row.siteRemark;
      if (!existing.supervisor || existing.supervisor === "-") existing.supervisor = row.supervisor;
      return;
    }

    grouped.set(row.plumber, {
      id: `plumber-${materialId}-${slug(row.plumber)}`,
      plumber: row.plumber,
      material: materialName,
      unit: "-",
      totalIssued: usedQty,
      consumed: usedQty,
      returned: 0,
      balance: 0,
      site: row.siteRemark,
      supervisor: row.supervisor,
      status: "Consumed",
    });
  });

  return Array.from(grouped.values()).sort((a, b) => a.plumber.localeCompare(b.plumber));
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const purchaseColumns: ExcelColumn<(typeof materialPurchaseRegister)[number]>[] = [
  { key: "srNo", label: "Sr No.", width: 80, sticky: true, getValue: (row) => row.srNo },
  {
    key: "item",
    label: "Item",
    width: 240,
    sticky: true,
    getValue: (row) => row.item,
    render: (row) => <span className="font-semibold text-foreground">{row.item}</span>,
  },
  { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
  { key: "balance", label: "Balance", width: 120, getValue: (row) => row.balance },
  { key: "totalIssue", label: "Total Issue", width: 130, getValue: (row) => row.totalIssue },
  { key: "totalPurchaseQty", label: "Total Purchase Qty", width: 170, getValue: (row) => row.totalPurchaseQty },
  { key: "totalAmount", label: "Total Amount", width: 150, getValue: (row) => row.totalAmount },
  { key: "vendor", label: "Vendor", width: 170, getValue: (row) => row.vendor },
  { key: "lastPurchaseDate", label: "Last Purchase Date", width: 160, getValue: (row) => formatDate(row.lastPurchaseDate) },
  { key: "invoice441Qty", label: "TSPL/25-26/441 Qty", width: 170, getValue: (row) => row.invoice441Qty },
  { key: "invoice441Rate", label: "TSPL/25-26/441 Rate", width: 180, getValue: (row) => row.invoice441Rate },
  { key: "invoice442Qty", label: "TSPL/25-26/442 Qty", width: 170, getValue: (row) => row.invoice442Qty },
  { key: "invoice442Rate", label: "TSPL/25-26/442 Rate", width: 180, getValue: (row) => row.invoice442Rate },
  {
    key: "actions",
    label: "Actions",
    width: 90,
    getValue: () => "Actions",
    render: () => <MaterialDrawer action="Add Purchase" icon={<NotePencilIcon size={15} />} iconOnly />,
  },
];

const pbgIssueColumns: ExcelColumn<(typeof pbgIssueMaterials)[number]>[] = [
  { key: "srNo", label: "Sr No.", width: 80, sticky: true, getValue: (row) => row.srNo },
  { key: "description", label: "Description", width: 230, sticky: true, getValue: (row) => row.description },
  { key: "materialCode", label: "Material Code No.", width: 160, getValue: (row) => row.materialCode },
  { key: "tenderPendingScope", label: "Total Pending Scope In Tender", width: 230, getValue: (row) => row.tenderPendingScope },
  { key: "tenderScope", label: "Total Scope In Tender", width: 180, getValue: (row) => row.tenderScope },
  { key: "balance", label: "Balance", width: 120, getValue: (row) => row.balance },
  { key: "bgConsumption", label: "BG Gas Consumption", width: 180, getValue: (row) => row.bgConsumption },
  { key: "bgTotalIssueStore", label: "BG Total Issue Store", width: 180, getValue: (row) => row.bgTotalIssueStore },
  { key: "vehicleNo", label: "Vehicle No.", width: 150, getValue: (row) => row.vehicleNo },
  { key: "vehicleQty", label: "Vehicle Qty", width: 130, getValue: (row) => row.vehicleQty },
  { key: "vendorName", label: "Vendor Name", width: 190, getValue: (row) => row.vendorName },
  { key: "sivNo", label: "SIV No.", width: 130, getValue: (row) => row.sivNo },
  { key: "person", label: "Person", width: 130, getValue: (row) => row.person },
  { key: "issueDate", label: "Date", width: 130, getValue: (row) => formatDate(row.issueDate) },
];

const pbgConsumptionColumns: ExcelColumn<(typeof pbgConsumptionMaterials)[number]>[] = [
  { key: "srNo", label: "Sr No.", width: 80, sticky: true, getValue: (row) => row.srNo },
  { key: "description", label: "Description", width: 240, sticky: true, getValue: (row) => row.description },
  { key: "materialCode", label: "Material Code No.", width: 160, getValue: (row) => row.materialCode },
  { key: "totalConsumption", label: "Total Consumption", width: 170, getValue: (row) => row.totalConsumption },
  { key: "raBillNo", label: "RA Bill No.", width: 150, getValue: (row) => row.raBillNo },
  { key: "date", label: "Date", width: 130, getValue: (row) => formatDate(row.date) },
  { key: "vendorName", label: "Vendor Name", width: 190, getValue: (row) => row.vendorName },
];

const storeIssueColumns: ExcelColumn<(typeof storeIssueBookRows)[number]>[] = [
  { key: "srNo", label: "Sr No.", width: 80, sticky: true, getValue: (row) => row.srNo },
  { key: "itemName", label: "Item Name", width: 240, sticky: true, getValue: (row) => row.itemName },
  { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
  { key: "balanceMaterial", label: "Balance Material", width: 150, getValue: (row) => row.balanceMaterial },
  { key: "consumption", label: "Consumption", width: 130, getValue: (row) => row.consumption },
  { key: "totalIssue", label: "Total Issue", width: 130, getValue: (row) => row.totalIssue },
  { key: "slipNo", label: "Slip No.", width: 120, getValue: (row) => row.slipNo },
  { key: "issueDate", label: "Date", width: 130, getValue: (row) => formatDate(row.issueDate) },
  { key: "ati", label: "ATI", width: 110, getValue: (row) => row.ati },
  { key: "babar", label: "Babar", width: 110, getValue: (row) => row.babar },
  { key: "abdul", label: "Abdul", width: 110, getValue: (row) => row.abdul },
  { key: "firoj", label: "Firoj", width: 110, getValue: (row) => row.firoj },
  { key: "jabed", label: "Jabed", width: 110, getValue: (row) => row.jabed },
  { key: "returnQty", label: "Return", width: 110, getValue: (row) => row.returnQty },
  {
    key: "actions",
    label: "Actions",
    width: 90,
    getValue: () => "Actions",
    render: () => <MaterialDrawer action="Issue Material" icon={<NotePencilIcon size={15} />} iconOnly />,
  },
];

const totalIssueColumns: ExcelColumn<(typeof totalIssueRows)[number]>[] = [
  { key: "srNo", label: "Sr No.", width: 80, sticky: true, getValue: (row) => row.srNo },
  { key: "itemName", label: "Item Name", width: 240, sticky: true, getValue: (row) => row.itemName },
  { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
  { key: "balanceMaterial", label: "Balance Material", width: 150, getValue: (row) => row.balanceMaterial },
  { key: "consumption", label: "Consumption", width: 130, getValue: (row) => row.consumption },
  { key: "totalIssue", label: "Total Issue", width: 130, getValue: (row) => row.totalIssue },
  { key: "babar", label: "Babar", width: 110, getValue: (row) => row.babar },
  { key: "atibul", label: "Atibul", width: 110, getValue: (row) => row.atibul },
  { key: "ati", label: "Ati", width: 110, getValue: (row) => row.ati },
  { key: "abdul", label: "Abdul", width: 110, getValue: (row) => row.abdul },
  { key: "firoj", label: "Firoj", width: 110, getValue: (row) => row.firoj },
  { key: "jabed", label: "Jabed", width: 110, getValue: (row) => row.jabed },
];

const plumberBalanceColumns: ExcelColumn<(typeof plumberBalanceRows)[number]>[] = [
  { key: "plumber", label: "Plumber / Team", width: 170, sticky: true, getValue: (row) => row.plumber },
  { key: "material", label: "Material", width: 210, sticky: true, getValue: (row) => row.material },
  { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
  { key: "totalIssued", label: "Total Issued", width: 140, getValue: (row) => row.totalIssued },
  { key: "consumed", label: "Consumed", width: 130, getValue: (row) => row.consumed },
  { key: "returned", label: "Returned", width: 130, getValue: (row) => row.returned },
  { key: "balance", label: "Balance With Plumber", width: 190, getValue: (row) => row.balance },
  { key: "site", label: "Site", width: 190, getValue: (row) => row.site },
  { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor },
  { key: "lastSlipNo", label: "Last Slip No.", width: 140, getValue: (row) => row.lastSlipNo },
  {
    key: "status",
    label: "Status",
    width: 150,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
];

const plumberConsumptionColumns: ExcelColumn<(typeof plumberConsumptionRows)[number]>[] = [
  { key: "bpNo", label: "BP No.", width: 130, sticky: true, getValue: (row) => row.bpNo },
  { key: "customerName", label: "Customer Name", width: 180, sticky: true, getValue: (row) => row.customerName },
  { key: "address", label: "Address", width: 260, getValue: (row) => row.address },
  { key: "remark", label: "Remark", width: 150, getValue: (row) => row.remark },
  { key: "installationDate", label: "Installation Date", width: 150, getValue: (row) => formatDate(row.installationDate) },
  { key: "meterNo", label: "Meter No.", width: 140, getValue: (row) => row.meterNo },
  { key: "testingDate", label: "Testing Date", width: 140, getValue: (row) => formatDate(row.testingDate) },
  { key: "supervisor", label: "Supervisor", width: 150, getValue: (row) => row.supervisor },
  { key: "plumber", label: "Plumber", width: 130, getValue: (row) => row.plumber },
  { key: "plumberBillNo", label: "Plumber Bill No.", width: 150, getValue: (row) => row.plumberBillNo },
  { key: "bgGasBillNo", label: "BG Gas Bill No.", width: 150, getValue: (row) => row.bgGasBillNo },
  { key: "reportNo", label: "Report No.", width: 140, getValue: (row) => row.reportNo },
  { key: "giPipe12", label: "1/2'' GI Pipe", width: 130, getValue: (row) => row.giPipe12 },
  { key: "giTee12", label: "1/2'' GI Tee", width: 130, getValue: (row) => row.giTee12 },
  { key: "giClamp12", label: "1/2'' GI Clamp", width: 140, getValue: (row) => row.giClamp12 },
  { key: "giElbow12", label: "1/2'' GI Elbow", width: 140, getValue: (row) => row.giElbow12 },
  { key: "giCoupling12", label: "1/2'' GI Coupling", width: 160, getValue: (row) => row.giCoupling12 },
  { key: "giPlug12", label: "1/2'' GI Plug", width: 130, getValue: (row) => row.giPlug12 },
  { key: "giNipple2", label: "GI Nipple 1/2''x2''", width: 170, getValue: (row) => row.giNipple2 },
  { key: "ballValve12", label: "1/2'' Ball Valve", width: 150, getValue: (row) => row.ballValve12 },
  { key: "reducerTee", label: "Reducer Tee", width: 130, getValue: (row) => row.reducerTee },
  { key: "mdpe20", label: "20MM MDPE Pipe", width: 150, getValue: (row) => row.mdpe20 },
  { key: "mdpe32", label: "32MM MDPE Pipe", width: 150, getValue: (row) => row.mdpe32 },
  { key: "mdpe63", label: "63MM MDPE Pipe", width: 150, getValue: (row) => row.mdpe63 },
  { key: "mdpe90", label: "90MM MDPE Pipe", width: 150, getValue: (row) => row.mdpe90 },
  { key: "meterAdapter", label: "Meter Adapter", width: 140, getValue: (row) => row.meterAdapter },
  { key: "regulator", label: "Regulator", width: 120, getValue: (row) => row.regulator },
];
