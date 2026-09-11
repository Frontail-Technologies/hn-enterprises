import { apiRequest, apiRequestPaginated, type PaginationMeta } from "@/lib/api-client";
import type { DeleteImpactResult } from "@/components/shared/delete-impact.types";
import type { ColumnPreferenceEntry, ResolvedCustomerColumn } from "../config/customer-columns";
import {
  buildCustomerFormData,
  buildCustomerWithPipeRecordsFormData,
  buildDocumentFormData,
  buildLmcPipeRecordFormData,
} from "../mappers/customer-form.mapper";
import {
  mapCustomer,
  mapDocument,
  mapNote,
  mapPipeRecord,
  STATUS_TO_BACKEND,
  type BackendCustomer,
  type BackendCustomerDocument,
  type BackendCustomerNote,
  type BackendLmcPipeRecord,
} from "../mappers/customer.mapper";
import type {
  CompletionSectionKey,
  Customer,
  CustomerDocument,
  CustomerFormValues,
  CustomerNote,
  CustomerStatus,
  LmcPipeSizeRecord,
} from "../types/customer.types";

export const customersApi = {
  async list(
    params: {
      search?: string;
      projectId?: string;
      siteId?: string;
      status?: CustomerStatus;
      statKey?: string;
      city?: string;
    } = {},
  ): Promise<Customer[]> {
    const query = new URLSearchParams({ limit: "-1" });
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.siteId) query.set("siteId", params.siteId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    if (params.statKey) query.set("statKey", params.statKey);
    if (params.city) query.set("city", params.city);
    const rows = await apiRequest<BackendCustomer[]>(`/customers?${query.toString()}`);
    return rows.map((row) => mapCustomer(row));
  },

  /**
   * Real server pagination - unlike list() above, this never forces limit=-1.
   * Used by CustomersList (page/limit/sort) and the remote customer search
   * selectors (small limit, search-only).
   */
  async listPaginated(
    params: {
      search?: string;
      projectId?: string;
      siteId?: string;
      status?: CustomerStatus;
      statKey?: string;
      city?: string;
      page?: number;
      limit?: number;
      sortBy?: "customerName" | "trBpNumber" | "mobileNumber" | "createdAt";
      sortOrder?: "asc" | "desc";
      /** Whitelisted-column Excel filters, e.g. {city: ["Pune","Mumbai"]}. Unsupported keys are silently ignored server-side. */
      columnFilters?: Record<string, string[]>;
    } = {},
  ): Promise<{ data: Customer[]; pagination?: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.siteId) query.set("siteId", params.siteId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    if (params.statKey) query.set("statKey", params.statKey);
    if (params.city) query.set("city", params.city);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.columnFilters && Object.keys(params.columnFilters).length) {
      query.set("columnFilters", JSON.stringify(params.columnFilters));
    }
    const { data, pagination } = await apiRequestPaginated<BackendCustomer[]>(`/customers?${query.toString()}`);
    return { data: (data ?? []).map((row) => mapCustomer(row)), pagination };
  },

  /**
   * Distinct values for one whitelisted Excel-filter-dropdown column, scoped
   * by the same search/project/statKey/city filters as listPaginated() plus
   * every OTHER currently active column filter. Powers CustomersList's
   * per-column filter dropdowns so they represent the full scoped dataset,
   * not just the current page.
   */
  async filterOptions(params: {
    column: string;
    search?: string;
    projectId?: string;
    siteId?: string;
    status?: CustomerStatus;
    statKey?: string;
    city?: string;
    columnFilters?: Record<string, string[]>;
  }): Promise<string[]> {
    const query = new URLSearchParams({ column: params.column });
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.siteId) query.set("siteId", params.siteId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    if (params.statKey) query.set("statKey", params.statKey);
    if (params.city) query.set("city", params.city);
    if (params.columnFilters && Object.keys(params.columnFilters).length) {
      query.set("columnFilters", JSON.stringify(params.columnFilters));
    }
    return apiRequest<string[]>(`/customers/filter-options?${query.toString()}`);
  },

  /**
   * All customer IDs matching the current scope (search/project/statKey/city
   * + every active column filter) - powers "Select all matching" without
   * downloading full Customer objects. `truncated` is true when the real
   * matching set is bigger than the (capped) `ids` returned.
   */
  async listMatchingIds(params: {
    search?: string;
    projectId?: string;
    siteId?: string;
    status?: CustomerStatus;
    statKey?: string;
    city?: string;
    columnFilters?: Record<string, string[]>;
  }): Promise<{ ids: string[]; total: number; truncated: boolean }> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.siteId) query.set("siteId", params.siteId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    if (params.statKey) query.set("statKey", params.statKey);
    if (params.city) query.set("city", params.city);
    if (params.columnFilters && Object.keys(params.columnFilters).length) {
      query.set("columnFilters", JSON.stringify(params.columnFilters));
    }
    return apiRequest<{ ids: string[]; total: number; truncated: boolean }>(`/customers/ids?${query.toString()}`);
  },

  /**
   * Fetches full rows for a specific set of customer IDs, ignoring search/page -
   * used by "Export Selected" so a cross-page selection exports every selected
   * customer, not just whichever ones happen to be on the currently loaded page.
   */
  async getByIds(ids: string[]): Promise<Customer[]> {
    if (!ids.length) return [];
    const query = new URLSearchParams({ ids: ids.join(","), limit: String(ids.length) });
    const { data } = await apiRequestPaginated<BackendCustomer[]>(`/customers?${query.toString()}`);
    return (data ?? []).map((row) => mapCustomer(row));
  },

  async get(id: string): Promise<Customer> {
    const raw = await apiRequest<BackendCustomer>(`/customers/${id}`);
    return mapCustomer(raw);
  },

  async create(values: CustomerFormValues): Promise<Customer> {
    const raw = await apiRequest<BackendCustomer>("/customers", {
      method: "POST",
      body: buildCustomerFormData(values),
    });
    return mapCustomer(raw);
  },

  async update(id: string, values: CustomerFormValues): Promise<Customer> {
    const raw = await apiRequest<BackendCustomer>(`/customers/${id}`, {
      method: "PATCH",
      body: buildCustomerFormData(values),
    });
    return mapCustomer(raw);
  },

  /**
   * Atomic customer + LMC pipe-records save. Backed by
   * `POST /customers/with-pipe-records` (create) and
   * `PATCH /customers/:id/with-pipe-records` (edit), both of which write the
   * customer row and all pipe records inside a single backend db.transaction.
   * `pipeRecords` carries metadata only - see
   * `mapPipeRecordToBackendInput`'s docstring for why new evidence files are
   * not sent through this call.
   */
  async saveWithPipeRecords(
    mode: "create" | "edit",
    id: string | undefined,
    values: CustomerFormValues,
    pipeRecords: LmcPipeSizeRecord[],
  ): Promise<Customer> {
    const formData = buildCustomerWithPipeRecordsFormData(values, pipeRecords);
    const raw =
      mode === "create"
        ? await apiRequest<BackendCustomer>("/customers/with-pipe-records", {
            method: "POST",
            body: formData,
          })
        : await apiRequest<BackendCustomer>(`/customers/${id}/with-pipe-records`, {
            method: "PATCH",
            body: formData,
          });
    return mapCustomer(raw);
  },

  async setSectionCompletion(
    id: string,
    sectionKey: CompletionSectionKey,
    completed: boolean,
  ): Promise<Customer> {
    const raw = await apiRequest<BackendCustomer>(`/customers/${id}/sections/${sectionKey}/completion`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    });
    return mapCustomer(raw);
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/customers/${id}`, { method: "DELETE" });
  },

  async getDeleteImpact(id: string): Promise<DeleteImpactResult> {
    return apiRequest<DeleteImpactResult>(`/customers/${id}/delete-impact`);
  },

  async getColumns(): Promise<ResolvedCustomerColumn[]> {
    return apiRequest<ResolvedCustomerColumn[]>("/customers/columns");
  },

  async saveColumns(columns: ColumnPreferenceEntry[]): Promise<ResolvedCustomerColumn[]> {
    return apiRequest<ResolvedCustomerColumn[]>("/customers/columns", {
      method: "PUT",
      body: JSON.stringify({ columns }),
    });
  },

  async resetColumns(): Promise<ResolvedCustomerColumn[]> {
    return apiRequest<ResolvedCustomerColumn[]>("/customers/columns", { method: "DELETE" });
  },

  async upsertLmcPipeRecord(customerId: string, record: LmcPipeSizeRecord): Promise<LmcPipeSizeRecord> {
    const raw = await apiRequest<BackendLmcPipeRecord>(`/customers/${customerId}/lmc-pipes`, {
      method: "PUT",
      body: buildLmcPipeRecordFormData(record),
    });
    return mapPipeRecord(raw);
  },

  async listDocuments(customerId: string): Promise<CustomerDocument[]> {
    const rows = await apiRequest<BackendCustomerDocument[]>(`/customers/${customerId}/documents`);
    return rows.map(mapDocument);
  },

  async createDocument(customerId: string, doc: CustomerDocument): Promise<CustomerDocument> {
    const raw = await apiRequest<BackendCustomerDocument>(`/customers/${customerId}/documents`, {
      method: "POST",
      body: buildDocumentFormData(doc),
    });
    return mapDocument(raw);
  },

  async deleteDocument(customerId: string, documentId: string): Promise<void> {
    await apiRequest<null>(`/customers/${customerId}/documents/${documentId}`, {
      method: "DELETE",
    });
  },

  async listNotes(customerId: string): Promise<CustomerNote[]> {
    const rows = await apiRequest<BackendCustomerNote[]>(`/customers/${customerId}/notes`);
    return rows.map(mapNote);
  },

  async createNote(customerId: string, note: string): Promise<CustomerNote> {
    const raw = await apiRequest<BackendCustomerNote>(`/customers/${customerId}/notes`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
    return mapNote(raw);
  },
};
