"use client";

import { useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TrashIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";
import { ScrollableTabsList } from "@/components/shared/ScrollableTabsList";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useDynamicFieldsQuery } from "@/features/dynamic-fields/hooks/useDynamicFields";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  customFieldsToFieldDefinitions,
  fittingAccessoryFields,
  giMeasurementFields,
  isolationValveFields,
  mdpeFittingFields,
} from "../config/customer-fields";
import { lmcPipelineFields } from "../config/lmc-fields";
import { defaultCustomerFormValues } from "../model/customer.defaults";
import { pickCivilFields } from "../model/lmc-pipeline.rules";
import { useCustomerFieldOptions } from "../hooks/useCustomerFieldOptions";
import { buildCustomerFormSchema } from "../schemas/customer-form.schema";
import { useCustomerQuery, useCustomerDeleteImpactQuery } from "../queries/useCustomersQuery";
import { useDeleteCustomer, useSaveCustomerWithPipeRecords, useUpdateCustomer } from "../queries/useCustomerMutations";
import { useCreateCustomerDocument } from "../queries/useCustomerDocuments";
import { customersApi } from "../api/customers.api";
import { CustomerBasicSection } from "./form/CustomerBasicSection";
import { CustomerFieldGroupSection } from "./form/CustomerFieldGroupSection";
import { CustomerSurveySection } from "./form/CustomerSurveySection";
import { LmcPipelineForm } from "./lmc/LmcPipelineForm";
import { CustomerEvidencePanel, CustomerReportsPanel } from "./CustomerEvidenceReports";
import { CustomerComplaintsPanel } from "./CustomerComplaintsPanel";
import { CustomerNotesPanel } from "./CustomerNotesPanel";
import { CustomerProgressMilestones } from "./detail/CustomerProgressMilestones";
import { PageLoading } from "@/components/shared/PageLoading";
import { SectionCard } from "@/components/shared/SectionCard";
import { DeleteImpactDialog } from "@/components/shared/DeleteImpactDialog";
import type { CustomerCompletionAudit, CustomerFormValues, CustomerSectionCompletion } from "../types/customer.types";

interface CustomerFormProps {
  mode: "create" | "edit";
  customerId?: string;
}

export function CustomerForm({ mode, customerId }: CustomerFormProps) {
  const isEdit = mode === "edit";
  const { data: customer, isLoading } = useCustomerQuery(customerId ?? "");
  const searchParams = useSearchParams();
  const defaultProjectId = searchParams.get("projectId") ?? undefined;

  if (isEdit && isLoading) {
    return <PageLoading />;
  }

  return (
    <CustomerFormFields
      key={customer?.id ?? "create"}
      mode={mode}
      customerId={customerId}
      initialValues={customer ?? defaultCustomerFormValues}
      defaultProjectId={isEdit ? undefined : defaultProjectId}
      completion={isEdit ? customer?.sectionCompletion : undefined}
      audit={isEdit ? customer?.completionAudit : undefined}
    />
  );
}

/**
 * The form body: RHF/FormProvider setup, tab/section composition, save
 * orchestration, and the delete/cancel/submit action bar (§1 of the
 * Checkpoint B brief). Section implementations live in `components/form/*`
 * and `components/lmc/LmcPipelineForm`; they read/write form state through
 * `useFormContext` off the `FormProvider` below instead of being handed
 * `control`/`setValue`/callback props individually.
 */
function CustomerFormFields({
  mode,
  customerId,
  initialValues,
  defaultProjectId,
  completion,
  audit,
}: {
  mode: "create" | "edit";
  customerId?: string;
  initialValues: CustomerFormValues;
  defaultProjectId?: string;
  completion?: CustomerSectionCompletion;
  audit?: CustomerCompletionAudit;
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const { customerConnectionFields, commissioningConversionFields, billingCompletionFields } =
    useCustomerFieldOptions();
  const schema = useMemo(() => buildCustomerFormSchema(mode), [mode]);
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });
  const { control, handleSubmit, setValue } = form;
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { data: projects = [] } = useProjectsQuery();

  const watchedProjectId = useWatch({ control, name: "projectId" });
  const [appliedDefaultProjectId, setAppliedDefaultProjectId] = useState<string | undefined>(undefined);
  if (defaultProjectId && defaultProjectId !== appliedDefaultProjectId && projects.length > 0 && !watchedProjectId) {
    const project = projects.find((item) => item.id === defaultProjectId);
    if (project) {
      setAppliedDefaultProjectId(defaultProjectId);
      setValue("projectId", project.id);
      setValue("projectName", project.name);
    }
  }
  const { data: plumbers = [] } = usePlumbersQuery();
  const saveCustomer = useSaveCustomerWithPipeRecords(mode, customerId);
  const archiveCustomer = useUpdateCustomer(customerId ?? "");
  const deleteCustomer = useDeleteCustomer();
  const createDocument = useCreateCustomerDocument(customerId ?? "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteImpact = useCustomerDeleteImpactQuery(customerId ?? "", { enabled: deleteDialogOpen });
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const { data: customFields = [] } = useDynamicFieldsQuery("Active");

  const customFieldGroups = useMemo(() => {
    const visible = customFields.filter((f) => {
      if (isAdmin) return true;
      if (f.supervisorAccess === "Admin Only") return false;
      return true;
    });
    const groups: Record<string, typeof visible> = {};
    for (const field of visible) {
      if (!groups[field.group]) groups[field.group] = [];
      groups[field.group].push(field);
    }
    for (const group of Object.values(groups)) {
      group.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    return groups;
  }, [customFields, isAdmin]);

  const projectOptions = projects.map((project) => ({ value: project.id, label: project.name }));

  const onSubmit = handleSubmit(async (values) => {
    setUploadError("");

    try {
      /**
       * Save orchestration (§9): one atomic customer+pipe-records call
       * (replacing the old create/update-then-loop-upsert 3-call sequence),
       * then a document-upload loop (file upload lifecycle genuinely stays
       * separate), then navigate. This is a 2-phase flow, down from 3.
       */
      const editedPipeRecords = values.lmcPipelineWork.pipeRecords.filter(
        (record) =>
          record.lengthMetres || record.layingDate || record.testingDate || record.purgingDate ||
          record.jointFittingDetails || (record.remarks && record.remarks !== "-") ||
          record.layingStatus !== "Not Started" || record.testingStatus !== "Not Started" || record.purgingStatus !== "Not Started",
      );

      const saved = await saveCustomer.mutateAsync({ values, pipeRecords: editedPipeRecords });

      const recordsWithNewEvidence = editedPipeRecords.filter((record) =>
        record.evidence.some((item) => item.file),
      );
      for (const record of recordsWithNewEvidence) {
        await customersApi.upsertLmcPipeRecord(saved.id, record);
      }

      const newDocuments = values.documents.filter((doc) => doc.id.startsWith("cust-evidence-"));
      for (const doc of newDocuments) {
        await createDocument.mutateAsync(doc);
      }

      router.push(`/customers/${saved.id}`);
    } catch (error) {
      console.error("[CustomerForm] save failed", { customerId, error });
      setUploadError(error instanceof Error ? error.message : "Unable to save customer");
    }
  });

  // useWatch (not the form's `watch()` function) so the value is derived via
  // subscription rather than a non-memoizable function reference - defaultValues
  // is always the full CustomerFormValues shape, so the deep-partial inference
  // here is a typing artifact only.
  const values = useWatch({ control }) as CustomerFormValues;

  useBreadcrumbLabel(customerId, values.customerConnection?.customerName);

  return (
    <div>
      <FormProvider {...form}>
        <form
          className="pb-28"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
        >
          <Tabs defaultValue="customer" className="flex flex-col gap-3">
            <ScrollableTabsList>
              <FormTab value="customer">Customer Details</FormTab>
              <FormTab value="survey">Survey</FormTab>
              <FormTab value="gi">GI Measurements</FormTab>
              <FormTab value="isolation">Isolation & Regulators</FormTab>
              <FormTab value="fittings">Fittings & Accessories</FormTab>
              <FormTab value="lmc">LMC Pipeline</FormTab>
              <FormTab value="civil">Civil Work</FormTab>
              <FormTab value="mdpe">MDPE Fittings</FormTab>
              <FormTab value="commissioning">Meter & Commissioning</FormTab>
              {isEdit && customerId && <FormTab value="milestones">Progress Milestones</FormTab>}
              <FormTab value="billing">Billing & Remarks</FormTab>
              {isEdit && customerId && <FormTab value="notes">Notes</FormTab>}
              <FormTab value="images">Images / Evidence</FormTab>
              <FormTab value="reports">Reports</FormTab>
              {Object.keys(customFieldGroups).sort().map((group) => (
                <FormTab key={`tab-custom-${group}`} value={`custom-${group}`}>{group}</FormTab>
              ))}
              {isEdit && <FormTab value="complaints">Complaints</FormTab>}
            </ScrollableTabsList>

            <TabsContent value="customer">
              <CustomerBasicSection
                isEdit={isEdit}
                defaultProjectId={defaultProjectId}
                currentProjectName={values.projectName}
                projectOptions={projectOptions}
                plumbers={plumbers}
                customerConnectionFields={customerConnectionFields}
              />
            </TabsContent>

            <TabsContent value="survey">
              <CustomerSurveySection customerId={customerId} requiredFields={completion?.survey.requiredFields} />
            </TabsContent>

            <TabsContent value="gi">
              <CustomerFieldGroupSection title="GI Installation Measurements" name="giMeasurements" fields={giMeasurementFields} />
            </TabsContent>

            <TabsContent value="isolation">
              <CustomerFieldGroupSection title="Isolation Valves & Regulators" name="valvesRegulators" fields={isolationValveFields} />
            </TabsContent>

            <TabsContent value="fittings">
              <CustomerFieldGroupSection title="Fittings & Accessories" name="fittingsAccessories" fields={fittingAccessoryFields} />
            </TabsContent>

            <TabsContent value="lmc">
              <Controller
                control={control}
                name="lmcPipelineWork"
                render={({ field }) => (
                  <LmcPipelineForm values={field.value} onChange={field.onChange} customerId={customerId} />
                )}
              />
            </TabsContent>

            <TabsContent value="civil">
              <CustomerFieldGroupSection
                title="Civil / Surface Work"
                name="lmcPipelineWork"
                fields={lmcPipelineFields}
                pick={pickCivilFields}
                merge={(value, next) => ({ ...value, ...next })}
              />
            </TabsContent>

            <TabsContent value="mdpe">
              <CustomerFieldGroupSection title="MDPE Fittings" name="mdpeFittings" fields={mdpeFittingFields} />
            </TabsContent>

            <TabsContent value="commissioning">
              <CustomerFieldGroupSection
                title="Commissioning & Conversion"
                name="commissioningConversion"
                fields={commissioningConversionFields}
                requiredFields={completion?.commissioning.requiredFields}
              />
            </TabsContent>

            {isEdit && customerId && (
              <TabsContent value="milestones">
                <SectionCard title="Progress Milestones">
                  <CustomerProgressMilestones customerId={customerId} completion={completion} audit={audit} />
                </SectionCard>
              </TabsContent>
            )}

            <TabsContent value="billing">
              <CustomerFieldGroupSection title="Billing & Completion Status" name="billingCompletion" fields={billingCompletionFields} />
            </TabsContent>

            {isEdit && customerId && (
              <TabsContent value="notes">
                <CustomerNotesPanel customerId={customerId} />
              </TabsContent>
            )}

            <TabsContent value="images">
              <Controller
                control={control}
                name="documents"
                render={({ field }) => (
                  <CustomerEvidencePanel
                    survey={values.survey}
                    lmcPipelineWork={values.lmcPipelineWork}
                    documents={field.value}
                    editable
                    onDocumentsChange={field.onChange}
                    customerId={customerId}
                  />
                )}
              />
            </TabsContent>

            <TabsContent value="reports">
              <CustomerReportsPanel customerId={customerId} customer={customerId ? { ...values, id: customerId, createdDate: "", updatedDate: "" } : undefined} />
            </TabsContent>

            {Object.entries(customFieldGroups).map(([group, fields]) => (
              <TabsContent key={`content-custom-${group}`} value={`custom-${group}`}>
                <CustomerFieldGroupSection
                  title={group}
                  name="customFields"
                  fields={customFieldsToFieldDefinitions(fields, { isAdmin })}
                  pick={(value) => (value ?? {}) as Record<string, string | boolean>}
                />
              </TabsContent>
            ))}

            {isEdit && customerId && (
              <TabsContent value="complaints">
                <CustomerComplaintsPanel customerId={customerId} />
              </TabsContent>
            )}
          </Tabs>

          {uploadError ? <p className="mt-3 text-sm text-destructive">{uploadError}</p> : null}
          {saveCustomer.isError ? (
            <p className="mt-3 text-sm text-destructive">
              {saveCustomer.error instanceof Error ? saveCustomer.error.message : "Unable to save customer"}
            </p>
          ) : null}

          <div className="fixed inset-x-3 bottom-3 z-50 flex justify-end gap-2 rounded-lg border border-border bg-card/95 p-2 backdrop-blur sm:inset-x-auto sm:right-5">
            {isEdit && customerId && (
              <DeleteImpactDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  >
                    <TrashIcon size={14} />
                    Delete
                  </Button>
                }
                entityTypeLabel="Customer"
                impact={deleteImpact.data}
                isLoading={deleteImpact.isLoading}
                isError={deleteImpact.isError}
                onRetry={() => void deleteImpact.refetch()}
                isConfirming={deleteCustomer.isPending}
                onConfirm={async () => {
                  await deleteCustomer.mutateAsync(customerId);
                  setDeleteDialogOpen(false);
                  router.push("/customers");
                }}
                isArchiving={archiveCustomer.isPending}
                onArchive={async () => {
                  await archiveCustomer.mutateAsync({ ...values, status: "Archived" });
                  setDeleteDialogOpen(false);
                  router.push(`/customers/${customerId}`);
                }}
              />
            )}
            <Link
              href={isEdit && customerId ? `/customers/${customerId}` : "/customers"}
              className={buttonVariants({ variant: "outline", size: "default" })}
            >
              Cancel
            </Link>
            <Button type="submit" disabled={saveCustomer.isPending}>
              {saveCustomer.isPending ? "Saving..." : isEdit ? "Save Changes" : "Save Customer"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function FormTab({ value, children }: { value: string; children: ReactNode }) {
  return <TabsTrigger value={value}>{children}</TabsTrigger>;
}
