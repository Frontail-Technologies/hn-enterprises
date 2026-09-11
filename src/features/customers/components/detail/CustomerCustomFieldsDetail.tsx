"use client";

import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { SectionCard } from "@/components/shared/SectionCard";
import { formatDynamicFieldValue } from "../../mappers/customer.mapper";
import type { CustomField } from "@/features/dynamic-fields/types";

/**
 * Canonical read-only custom-field renderer (§13 of the Checkpoint B
 * brief). Formatting is delegated to `formatDynamicFieldValue` in
 * `mappers/customer.mapper.ts` - this component only lays the fields out.
 */
export function CustomerCustomFieldsDetail({
  group,
  fields,
  values,
}: {
  group: string;
  fields: CustomField[];
  values: Record<string, string | boolean> | undefined;
}) {
  return (
    <SectionCard title={group}>
      <KeyValueGrid
        items={fields.map((field) => ({
          label: field.label,
          value: formatDynamicFieldValue(values?.[field.key], field.valueType),
        }))}
        columns={3}
      />
    </SectionCard>
  );
}
