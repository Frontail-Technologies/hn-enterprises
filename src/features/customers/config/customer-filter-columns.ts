/**
 * Master-sheet columns whose Excel filter dropdown is server-backed (mirrors
 * the backend's CUSTOMER_FILTER_COLUMNS whitelist in
 * backend/src/modules/customers/customer-filter-columns.ts exactly - keep
 * both lists in sync). Every other master-sheet column's dropdown keeps the
 * default local/page-scoped behavior: most of the ~100+ columns are derived
 * from nested JSONB sections or computed client-side, and reimplementing all
 * of that in SQL is a much larger, riskier change than this regression-closure
 * batch - see the backend file's docstring for the full reasoning.
 */
export const SERVER_FILTERABLE_MASTER_KEYS = [
  "customerName",
  "trBpNo",
  "mobileNo",
  "fullAddress",
  "city",
  "connectionType",
  "houseType",
  "scheme",
  "plumberName",
  "reportNoGi",
  "reportNoGc",
  "reportNoConversion",
  "paymentStatus",
  "paymentMode",
] as const;

export type ServerFilterableMasterKey = (typeof SERVER_FILTERABLE_MASTER_KEYS)[number];

export function isServerFilterableMasterKey(key: string): key is ServerFilterableMasterKey {
  return (SERVER_FILTERABLE_MASTER_KEYS as readonly string[]).includes(key);
}
