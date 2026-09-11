export const customersKey = ["customers"] as const;
export const customerKey = (id: string) => ["customers", id] as const;
export const documentsKey = (customerId: string) => ["customers", customerId, "documents"] as const;
export const notesKey = (customerId: string) => ["customers", customerId, "notes"] as const;
export const customerColumnsKey = ["customers", "columns"] as const;
// Both nested under the "customers" prefix, so the existing customersKey-prefix
// invalidation used on create/update/delete/import/bulk mutations already covers them.
export const customersListKey = (params: unknown) => ["customers", "list", params] as const;
export const customersSearchKey = (params: unknown) => ["customers", "search", params] as const;
