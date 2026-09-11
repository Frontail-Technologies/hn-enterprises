"use client";

import { Controller, useFormContext, type FieldPath, type FieldPathValue } from "react-hook-form";
import { SectionCard } from "@/components/shared/SectionCard";
import { SectionFields } from "../shared-fields/SectionFields";
import type { FieldDefinition } from "../../config/customer-fields";
import type { CustomerFormValues } from "../../types/customer.types";

/**
 * Generic form-section wrapper (§2 of the Checkpoint B brief). GI
 * Measurements, Isolation & Regulators, Fittings & Accessories, MDPE
 * Fittings, Billing & Remarks, Civil Work, and the dynamic custom-field
 * groups are all the exact same shape - a `SectionCard` around one RHF
 * `Controller` feeding the shared `SectionFields` renderer - so rather than
 * creating six-plus near-identical one-off files, this single reusable
 * component parameterizes the difference (title/name/fields) and reads
 * form state through `useFormContext` instead of prop-drilled `control`.
 *
 * `pick`/`merge` cover the one case (Civil Work) where the section only
 * edits a subset of a larger field (`lmcPipelineWork`).
 */
export function CustomerFieldGroupSection<
  TName extends FieldPath<CustomerFormValues>,
  TValue extends Record<string, string | boolean>,
>({
  title,
  name,
  fields,
  requiredFields,
  pick,
  merge,
}: {
  title: string;
  name: TName;
  fields: FieldDefinition<TValue>[];
  requiredFields?: string[];
  pick?: (value: FieldPathValue<CustomerFormValues, TName>) => TValue;
  merge?: (value: FieldPathValue<CustomerFormValues, TName>, next: TValue) => FieldPathValue<CustomerFormValues, TName>;
}) {
  const { control } = useFormContext<CustomerFormValues>();

  return (
    <SectionCard title={title}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <SectionFields
            fields={fields}
            values={pick ? pick(field.value) : (field.value as unknown as TValue)}
            requiredFields={requiredFields}
            onChange={(next) => field.onChange(merge ? merge(field.value, next) : next)}
          />
        )}
      />
    </SectionCard>
  );
}
