"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/FormField";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { SectionCard } from "@/components/shared/SectionCard";
import { customerStatusOptions } from "../../config/customer-options";
import { SectionFields } from "../shared-fields/SectionFields";
import type { FieldDefinition } from "../../config/customer-fields";
import type { CustomerConnectionDetails, CustomerFormValues } from "../../types/customer.types";

type SelectOption = { value: string; label: string };
type NamedRecord = { id: string; name: string };

/**
 * Customer & Connection Details tab (§2 of the Checkpoint B brief). Keeps
 * its bespoke logic (project selection default-fill, dependent plumber
 * name sync, connection-level field errors) separate from the generic
 * `CustomerFieldGroupSection`, since it genuinely differs from the plain
 * "SectionCard + one Controller" shape the other tabs share.
 *
 * Customers are not owned by a fixed supervisor (see permission.service.ts's
 * canModifyCustomer on the backend) - there is deliberately no supervisor
 * field here. "Current supervisor" is resolved from project/team assignment
 * where needed, never stored on the customer record.
 */
export function CustomerBasicSection({
  isEdit,
  defaultProjectId,
  currentProjectName,
  projectOptions,
  plumbers,
  customerConnectionFields,
}: {
  isEdit: boolean;
  defaultProjectId?: string;
  currentProjectName: string;
  projectOptions: SelectOption[];
  plumbers: NamedRecord[];
  customerConnectionFields: FieldDefinition<CustomerConnectionDetails>[];
}) {
  const { control, setValue, formState } = useFormContext<CustomerFormValues>();

  return (
    <SectionCard title="Customer & Connection Details">
      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Project">
          {defaultProjectId && !isEdit ? (
            <div className="flex h-9 items-center rounded-lg border border-border bg-muted/30 px-3 text-sm font-medium text-foreground">
              {currentProjectName || "-"}
            </div>
          ) : (
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || undefined}
                  onValueChange={(projectId) => {
                    const project = projectOptions.find((item) => item.value === projectId);
                    field.onChange(projectId ?? "");
                    setValue("projectName", project?.label ?? "");
                  }}
                  placeholder="Select project"
                  options={projectOptions}
                  className="w-full"
                />
              )}
            />
          )}
        </FormField>
        <FormField label="Assigned Plumber">
          <Controller
            control={control}
            name="customerConnection.plumberId"
            render={({ field }) => (
              <SearchableSelect
                value={field.value || undefined}
                onValueChange={(plumberId) => {
                  const plumber = plumbers.find((item) => item.id === plumberId);
                  field.onChange(plumberId ?? "");
                  setValue("customerConnection.plumberName", plumber?.name ?? "");
                }}
                placeholder="Select plumber"
                options={plumbers.map((plumber) => ({ value: plumber.id, label: plumber.name }))}
                className="w-full"
              />
            )}
          />
        </FormField>
        <FormField label="Customer Status">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(status) => field.onChange((status ?? "Draft") as CustomerFormValues["status"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customerStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>
      <Controller
        control={control}
        name="customerConnection"
        render={({ field }) => (
          <SectionFields
            fields={customerConnectionFields}
            values={field.value}
            onChange={field.onChange}
          />
        )}
      />
      {formState.errors.customerConnection?.customerName ? (
        <p className="mt-2 text-sm text-destructive">
          {formState.errors.customerConnection.customerName.message as string}
        </p>
      ) : null}
      {formState.errors.customerConnection?.plumberId ? (
        <p className="mt-2 text-sm text-destructive">
          {formState.errors.customerConnection.plumberId.message as string}
        </p>
      ) : null}
    </SectionCard>
  );
}
