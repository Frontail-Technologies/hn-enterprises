import {
  inventoryStockSheetRows,
  materialPurchaseRegister,
  materials,
  materialTransactions,
  plumberBalanceRows,
  plumberConsumptionRows,
  pbgIssueMaterials,
  storeIssueBookRows,
} from "../data/materials.data";

export function getMaterial(id: string) {
  return materials.find((item) => item.id === id) ?? materials[0];
}

export function getMaterialByName(name: string) {
  return materials.find((item) => item.name === name) ?? materials[0];
}

const materialAliases: Record<string, string[]> = {
  "mat-001": ["GI Pipe 20MM", "1/2'' GI Pipe", "20MM MDPE Pipe"],
  "mat-002": ["Brass Regulator", "Regulator", "REGULATOR 6BAR -100 MBAR"],
  "mat-003": ["Meter Clamp Set", "1/2'' GI Clamp", "Meter Clamp"],
  "mat-004": ["MDPE Coupler 32MM", "32MM MDPE Pipe", "Coupler 32MM"],
};

const consumptionFieldByMaterial: Record<string, keyof (typeof plumberConsumptionRows)[number]> = {
  "mat-001": "giPipe12",
  "mat-002": "regulator",
  "mat-003": "giClamp12",
  "mat-004": "mdpe32",
};

export function getMaterialMatchNames(materialId: string) {
  const material = getMaterial(materialId);
  return new Set([material.name, ...(materialAliases[materialId] ?? [])].map(normalizeName));
}

export function isSameMaterial(materialId: string, value: string) {
  return getMaterialMatchNames(materialId).has(normalizeName(value));
}

export function getMaterialStockRow(materialId: string) {
  return inventoryStockSheetRows.find((row) => isSameMaterial(materialId, row.itemName));
}

export function getMaterialPurchases(materialId: string) {
  return materialPurchaseRegister.filter((row) => isSameMaterial(materialId, row.item));
}

export function getMaterialPbgIssues(materialId: string) {
  return pbgIssueMaterials.filter((row) => isSameMaterial(materialId, row.description));
}

export function getMaterialStoreIssues(materialId: string) {
  return storeIssueBookRows.filter((row) => isSameMaterial(materialId, row.itemName));
}

export function getMaterialPlumberBalances(materialId: string) {
  return plumberBalanceRows.filter((row) => isSameMaterial(materialId, row.material));
}

export function getMaterialCustomerConsumption(materialId: string) {
  const field = consumptionFieldByMaterial[materialId];
  if (!field) return [];

  return plumberConsumptionRows
    .map((row) => ({
      id: `${row.id}-${materialId}`,
      bpNo: row.bpNo,
      customerName: row.customerName,
      address: row.address,
      siteRemark: row.remark,
      installationDate: row.installationDate,
      testingDate: row.testingDate,
      supervisor: row.supervisor,
      plumber: row.plumber,
      plumberBillNo: row.plumberBillNo,
      bgGasBillNo: row.bgGasBillNo,
      reportNo: row.reportNo,
      usedQty: row[field] as string | number,
    }))
    .filter((row) => Number(row.usedQty) > 0);
}

export function getMaterialTransactions(materialId: string) {
  const material = getMaterial(materialId);
  return materialTransactions.filter(
    (item) => item.materialId === material.id || isSameMaterial(materialId, item.quantity),
  );
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replaceAll("’", "'")
    .replaceAll("″", "''")
    .replace(/\s+/g, " ")
    .trim();
}
