"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useProjectSitesQuery } from "@/features/projects/hooks/useProjects";
import {
  connectionTypeOptions,
  customerStatusOptions,
  paymentStatusOptions,
} from "../../services/customers.service";
import type { CustomerBulkFieldKey } from "../../types/customer-bulk.types";
import type { useBulkFieldOptions } from "../../hooks/useBulkFieldOptions";

// Sentinel used by the nullable-field pickers (Supervisor/Plumber/Site) to
// mean "explicitly clear this field" - distinct from "no selection made yet".
export const BULK_CLEAR_VALUE = "__clear__";
export const BULK_YES_VALUE = "yes";
export const BULK_NO_VALUE = "no";

type BulkFieldOptions = ReturnType<typeof useBulkFieldOptions>;

// The list of fields whose value is a Yes/No toggle over a persisted
// boolean column (all live in billingCompletion). Rendered as an explicit
// two-option select, never a bare checkbox - Bulk Edit already uses a
// checkbox to mean "include this field in the update", so a second
// checkbox on the value itself would be ambiguous (unchecked = No, or
// unchecked = don't touch it?).
const BOOLEAN_FIELDS = new Set<CustomerBulkFieldKey>([
  "jmrDone",
  "jmrSubmittedInPbg",
  "giBillDone",
  "gcBillDone",
  "conversionBillDone",
]);

export function isBulkBooleanField(field: CustomerBulkFieldKey) {
  return BOOLEAN_FIELDS.has(field);
}

interface BulkFieldControlProps {
  field: CustomerBulkFieldKey;
  /** For most fields, the raw value; for boolean fields, BULK_YES_VALUE/BULK_NO_VALUE. */
  value: string;
  onChange: (value: string) => void;
  fieldOptions: BulkFieldOptions;
  /** Only meaningful for `siteId` - scopes the site list and blocks selection until a project is chosen. */
  relatedProjectId?: string;
}

// Renders the correct input for one bulk-editable field. Used by BOTH the
// general BulkEditDialog (one row per checked field) and the compact
// BulkQuickFieldDialog (a single field) so there is exactly one place that
// knows "how do you edit X" for every bulk-editable field.
export function BulkFieldControl({ field, value, onChange, fieldOptions, relatedProjectId }: BulkFieldControlProps) {
  const { projects, plumbers, supervisors, schemes, houseTypes } = fieldOptions;
  // Always called (hooks can't be conditional) - a no-op fetch unless this
  // instance is actually rendering the Site control for a chosen project.
  const { data: sites = [] } = useProjectSitesQuery(field === "siteId" ? relatedProjectId ?? "" : "");

  switch (field) {
    case "supervisorId":
      return (
        <SearchableSelect
          value={value || undefined}
          onValueChange={onChange}
          placeholder="Select supervisor"
          options={[
            { value: BULK_CLEAR_VALUE, label: "— Clear supervisor —" },
            ...supervisors.map((supervisor) => ({ value: supervisor.id, label: supervisor.name })),
          ]}
        />
      );

    case "plumberId":
      return (
        <SearchableSelect
          value={value || undefined}
          onValueChange={onChange}
          placeholder="Select plumber"
          options={[
            { value: BULK_CLEAR_VALUE, label: "— Clear plumber —" },
            ...plumbers.map((plumber) => ({ value: plumber.id, label: plumber.name })),
          ]}
        />
      );

    case "projectId":
      return (
        <SearchableSelect
          value={value || undefined}
          onValueChange={onChange}
          placeholder="Select project"
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
        />
      );

    case "siteId":
      return (
        <SearchableSelect
          value={value || undefined}
          onValueChange={onChange}
          placeholder={relatedProjectId ? "Select site" : "Select a project first"}
          options={[
            { value: BULK_CLEAR_VALUE, label: "— Clear site —" },
            ...sites.map((site) => ({ value: site.id, label: site.name })),
          ]}
          disabled={!relatedProjectId}
        />
      );

    case "scheme":
      return (
        <SearchableSelect
          value={value || undefined}
          onValueChange={onChange}
          placeholder="Select scheme"
          options={schemes.map((item) => ({ value: item.value, label: item.value }))}
        />
      );

    case "connectionType":
      return (
        <CompactSelect
          value={value}
          onChange={onChange}
          placeholder="Select connection type"
          options={connectionTypeOptions}
        />
      );

    case "houseType":
      return (
        <CompactSelect
          value={value}
          onChange={onChange}
          placeholder="Select house type"
          options={houseTypes.map((item) => item.value)}
        />
      );

    case "status":
      return (
        <CompactSelect value={value} onChange={onChange} placeholder="Select stage" options={customerStatusOptions} />
      );

    case "paymentStatus":
      return (
        <CompactSelect
          value={value}
          onChange={onChange}
          placeholder="Select payment status"
          options={paymentStatusOptions}
        />
      );

    case "paymentMode":
      return (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. Cash, UPI, Cheque"
        />
      );

    case "initialAmount":
      return (
        <Input
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. 25000"
        />
      );

    case "jmrDone":
    case "jmrSubmittedInPbg":
    case "giBillDone":
    case "gcBillDone":
    case "conversionBillDone":
      return (
        <Select value={value || undefined} onValueChange={(next) => next && onChange(next)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Yes or No" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BULK_YES_VALUE}>Yes</SelectItem>
            <SelectItem value={BULK_NO_VALUE}>No</SelectItem>
          </SelectContent>
        </Select>
      );

    default:
      return null;
  }
}

function CompactSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
