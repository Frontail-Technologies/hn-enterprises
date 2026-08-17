const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";

export class ExportError extends Error {}

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  return query.toString();
}

function filenameFromContentDisposition(header: string | null, fallback: string) {
  const match = header ? /filename="?([^";]+)"?/i.exec(header) : null;
  return match?.[1] ?? fallback;
}

async function downloadXlsx(path: string, fallbackFilename: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: "include" });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ExportError(payload?.message || "Unable to generate the export");
  }

  const blob = await response.blob();
  const filename = filenameFromContentDisposition(response.headers.get("Content-Disposition"), fallbackFilename);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportsApi = {
  attendanceRegister(params: { month: number; year: number; projectId?: string }) {
    const query = buildQuery({
      month: String(params.month),
      year: String(params.year),
      projectId: params.projectId,
    });
    return downloadXlsx(`/exports/attendance?${query}`, "attendance-register.xlsx");
  },

  wageRegister(params: { month: number; year: number }) {
    const query = buildQuery({ month: String(params.month), year: String(params.year) });
    return downloadXlsx(`/exports/wages?${query}`, "wage-register.xlsx");
  },

  customerRegister(params: {
    projectId?: string;
    siteId?: string;
    status?: string;
    city?: string;
    search?: string;
    statKey?: string;
  } = {}) {
    const query = buildQuery({
      projectId: params.projectId,
      siteId: params.siteId,
      status: params.status,
      city: params.city,
      search: params.search,
      statKey: params.statKey,
    });
    return downloadXlsx(`/exports/customers${query ? `?${query}` : ""}`, "customer-register.xlsx");
  },

  inventoryStockSheet(params: { projectId?: string; source?: string } = {}) {
    const query = buildQuery({ projectId: params.projectId, source: params.source });
    return downloadXlsx(`/exports/inventory/stock${query ? `?${query}` : ""}`, "Stock-Sheet.xlsx");
  },

  inventoryPurchaseRegister(params: { projectId?: string; from?: string; to?: string } = {}) {
    const query = buildQuery({ projectId: params.projectId, from: params.from, to: params.to });
    return downloadXlsx(`/exports/inventory/purchases${query ? `?${query}` : ""}`, "Purchase-Register.xlsx");
  },

  inventoryPbgIssue(params: { projectId?: string; from?: string; to?: string } = {}) {
    const query = buildQuery({ projectId: params.projectId, from: params.from, to: params.to });
    return downloadXlsx(`/exports/inventory/pbg-issues${query ? `?${query}` : ""}`, "PBG-Issue.xlsx");
  },

  inventoryStoreIssueBook(params: { projectId?: string; source?: string; plumberId?: string; from?: string; to?: string } = {}) {
    const query = buildQuery({
      projectId: params.projectId,
      source: params.source,
      plumberId: params.plumberId,
      from: params.from,
      to: params.to,
    });
    return downloadXlsx(`/exports/inventory/store-issues${query ? `?${query}` : ""}`, "Store-Issue-Book.xlsx");
  },

  inventoryConsumptionLog(params: { projectId?: string; source?: string; plumberId?: string; from?: string; to?: string } = {}) {
    const query = buildQuery({
      projectId: params.projectId,
      source: params.source,
      plumberId: params.plumberId,
      from: params.from,
      to: params.to,
    });
    return downloadXlsx(`/exports/inventory/consumption${query ? `?${query}` : ""}`, "Plumber-Consumption.xlsx");
  },

  inventoryPbgConsumption(params: { projectId?: string; plumberId?: string; materialId?: string; from?: string; to?: string } = {}) {
    const query = buildQuery({
      projectId: params.projectId,
      plumberId: params.plumberId,
      materialId: params.materialId,
      from: params.from,
      to: params.to,
    });
    return downloadXlsx(`/exports/inventory/pbg-consumption${query ? `?${query}` : ""}`, "PBG-Consumption.xlsx");
  },

  inventoryTotalIssue(params: { projectId?: string; source?: string; from?: string; to?: string } = {}) {
    const query = buildQuery({ projectId: params.projectId, source: params.source, from: params.from, to: params.to });
    return downloadXlsx(`/exports/inventory/total-issue${query ? `?${query}` : ""}`, "Total-Issue.xlsx");
  },

  // No from/to param accepted here on purpose - see materials.service.ts's
  // plumberBalances and §5 of the Inventory exports task: a date range can't be
  // applied to a running balance without inventing opening-balance logic.
  inventoryPlumberBalance(params: { projectId?: string; source?: string; plumberId?: string; materialId?: string } = {}) {
    const query = buildQuery({
      projectId: params.projectId,
      source: params.source,
      plumberId: params.plumberId,
      materialId: params.materialId,
    });
    return downloadXlsx(`/exports/inventory/plumber-balance${query ? `?${query}` : ""}`, "Plumber-Balance.xlsx");
  },

  dprPlanningSummary(params: { date: string; projectId?: string; supervisorId?: string }) {
    const query = buildQuery({ date: params.date, projectId: params.projectId, supervisorId: params.supervisorId });
    return downloadXlsx(`/exports/dpr-planning?${query}`, "DPR-Planning.xlsx");
  },

  users(params: { role?: string; status?: string; search?: string } = {}) {
    const query = buildQuery({ role: params.role, status: params.status, search: params.search });
    return downloadXlsx(`/exports/users${query ? `?${query}` : ""}`, "Users-Roles.xlsx");
  },

  masterValues(params: { category: string; search?: string }) {
    const query = buildQuery({ category: params.category, search: params.search });
    return downloadXlsx(`/exports/masters/values?${query}`, "master-values.xlsx");
  },

  holidays(params: { search?: string } = {}) {
    const query = buildQuery({ search: params.search });
    return downloadXlsx(`/exports/masters/holidays${query ? `?${query}` : ""}`, "Holidays.xlsx");
  },
};
