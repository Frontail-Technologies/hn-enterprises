"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { SegmentedDigitInput } from "@/components/shared/SegmentedDigitInput";
import type { FieldDefinition } from "../../config/customer-fields";

/**
 * Canonical field-group renderer. Superset of the previous
 * `CustomerForm`-local implementation (adds `requiredFields`/`gridClassName`,
 * the searchable select for `input: "select"`, the meter/segmented-digit
 * input, and readOnly support) - `CustomerDetail`'s byte-similar copy has
 * been removed in favor of importing this one. Kept as a plain
 * value/onChange controlled component (rather than RHF-native) so it works
 * both for `CustomerForm`'s React Hook Form-backed groups and
 * `CustomerDetail`'s plain local-state LMC pipe editor.
 */
export function SectionFields<T extends Record<string, string | boolean>>({
  fields,
  values,
  onChange,
  requiredFields,
  gridClassName = "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
}: {
  fields: FieldDefinition<T>[];
  values: T;
  onChange: (values: T) => void;
  requiredFields?: string[];
  gridClassName?: string;
}) {
  return (
    <div className={gridClassName}>
      {fields.map((field) => (
        <MasterField
          key={String(field.key)}
          field={field}
          value={values[field.key]}
          required={requiredFields?.includes(String(field.key)) ?? false}
          onChange={(value) => onChange({ ...values, [field.key]: value })}
        />
      ))}
    </div>
  );
}

export function MasterField<T extends Record<string, string | boolean>>({
  field,
  value,
  onChange,
  required,
}: {
  field: FieldDefinition<T>;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  required?: boolean;
}) {
  if (field.input === "textarea") {
    return (
      <FormField label={field.label} required={required} className="md:col-span-2 xl:col-span-3">
        <Textarea
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          disabled={field.readOnly}
        />
      </FormField>
    );
  }

  if (field.input === "date") {
    return (
      <FormField label={field.label} required={required}>
        <DatePicker value={String(value ?? "")} onChange={onChange} className="w-full min-w-0" />
      </FormField>
    );
  }

  if (field.input === "meter") {
    return (
      <FormField label={field.label} required={required}>
        <SegmentedDigitInput value={String(value ?? "")} onChange={onChange} digits={field.digits} />
      </FormField>
    );
  }

  if (field.input === "select") {
    return (
      <FormField label={field.label} required={required}>
        <SearchableSelect
          value={String(value || "")}
          options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
          placeholder={`Select ${field.label.toLowerCase()}`}
          onValueChange={(next) => onChange(next ?? "")}
        />
      </FormField>
    );
  }

  if (field.input === "boolean") {
    return (
      <FormField label={field.label} required={required}>
        <Select value={value ? "Yes" : "No"} onValueChange={(next) => onChange(next === "Yes")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    );
  }

  return (
    <TextField
      label={field.label}
      required={required}
      type={field.input === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={onChange}
      disabled={field.readOnly}
    />
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <FormField label={label} required={required}>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
    </FormField>
  );
}
