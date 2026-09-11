"use client";

import { useSearchParams } from "next/navigation";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { SectionCard } from "@/components/shared/SectionCard";
import { PageLoading } from "@/components/shared/PageLoading";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDynamicFieldsQuery } from "@/features/dynamic-fields/hooks/useDynamicFields";
import {
  fittingAccessoryFields,
  giMeasurementFields,
  isolationValveFields,
  mdpeFittingFields,
} from "../config/customer-fields";
import { useCustomerFieldOptions } from "../hooks/useCustomerFieldOptions";
import { groupVisibleDynamicFields } from "../mappers/customer.mapper";
import { useCustomerQuery } from "../queries/useCustomersQuery";
import { buildCustomerSectionLinks, groupAnchorId } from "../utils/section-links";
import { itemsFromFields } from "../utils/field-display";
import { CustomerApprovalsHistory } from "./detail/CustomerApprovalsHistory";
import { CustomerCommissioningDetail } from "./detail/CustomerCommissioningDetail";
import { CustomerConnectionDetails } from "./detail/CustomerConnectionDetails";
import { CustomerCustomFieldsDetail } from "./detail/CustomerCustomFieldsDetail";
import { CustomerDetailHeader, CustomerSectionNav } from "./detail/CustomerDetailHeader";
import { CustomerProgressMilestones } from "./detail/CustomerProgressMilestones";
import { CustomerSurveyDetail } from "./detail/CustomerSurveyDetail";
import { SectionCompletionActions } from "./detail/SectionCompletionActions";
import { LmcPipelineDetail } from "./lmc/LmcPipelineDetail";
import { CustomerEvidencePanel, CustomerReportsPanel } from "./CustomerEvidenceReports";
import { CustomerComplaintsPanel } from "./CustomerComplaintsPanel";
import { CustomerNotesPanel } from "./CustomerNotesPanel";

/**
 * CustomerDetail orchestrator (§8 of the Checkpoint B brief): customer query
 * loading, page-level state (the `pipe` deep-link param), section-nav
 * composition, and assembling the focused detail sections below. Each
 * section's own rendering/data-normalization logic lives in
 * `components/detail/*`, `components/lmc/*`, or the standalone
 * Complaints/Evidence/Reports panels - not here.
 */
export function CustomerDetail({ customerId }: { customerId: string }) {
  const { data: customer, isLoading, isError } = useCustomerQuery(customerId);
  const searchParams = useSearchParams();
  const initialPipeId = searchParams.get("pipe");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const { data: dynamicFields = [] } = useDynamicFieldsQuery("Active");
  const { customerConnectionFields, commissioningConversionFields, billingCompletionFields } =
    useCustomerFieldOptions();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !customer) {
    return <p className="p-4 text-sm text-destructive">Unable to load this customer.</p>;
  }

  const completion = customer.sectionCompletion;
  const audit = customer.completionAudit;

  const visibleFieldGroups = groupVisibleDynamicFields(dynamicFields, isAdmin);
  const sectionLinks = buildCustomerSectionLinks(Object.keys(visibleFieldGroups));

  return (
    <div className="space-y-4">
      <CustomerDetailHeader customer={customer} />

      <CustomerSectionNav items={sectionLinks} />

      <div className="space-y-4">
        <section id="customer-details" className="scroll-mt-16">
          <CustomerConnectionDetails customer={customer} customerConnectionFields={customerConnectionFields} />
        </section>

        <section id="survey" className="scroll-mt-16">
          <CustomerSurveyDetail survey={customer.survey} completion={completion?.survey} />
        </section>

        <section id="gi" className="scroll-mt-16">
          <SectionCard
            title="GI Installation Measurements"
            action={<SectionCompletionActions customerId={customer.id} sectionKey="giMeasurements" sectionLabel="GI Measurements" result={completion?.giMeasurements} />}
          >
            <KeyValueGridFor fields={giMeasurementFields} values={customer.giMeasurements} />
          </SectionCard>
        </section>

        <section id="isolation" className="scroll-mt-16">
          <div className="space-y-4">
            <SectionCard
              title="Isolation Valves & Regulators"
              action={<SectionCompletionActions customerId={customer.id} sectionKey="valvesRegulators" sectionLabel="Isolation & Regulators" result={completion?.valvesRegulators} />}
            >
              <KeyValueGridFor fields={isolationValveFields} values={customer.valvesRegulators} />
            </SectionCard>
            <SectionCard
              title="Fittings & Accessories"
              action={<SectionCompletionActions customerId={customer.id} sectionKey="fittingsAccessories" sectionLabel="Fittings & Accessories" result={completion?.fittingsAccessories} />}
            >
              <KeyValueGridFor fields={fittingAccessoryFields} values={customer.fittingsAccessories} />
            </SectionCard>
          </div>
        </section>

        <section id="lmc" className="scroll-mt-16">
          <LmcPipelineDetail
            key={customer.id}
            customerId={customer.id}
            values={customer.lmcPipelineWork}
            initialPipeId={initialPipeId}
          />
        </section>

        <section id="mdpe" className="scroll-mt-16">
          <SectionCard
            title="MDPE Fittings"
            action={<SectionCompletionActions customerId={customer.id} sectionKey="mdpeFittings" sectionLabel="MDPE Fittings" result={completion?.mdpeFittings} />}
          >
            <KeyValueGridFor fields={mdpeFittingFields} values={customer.mdpeFittings} />
          </SectionCard>
        </section>

        <section id="commissioning" className="scroll-mt-16">
          <CustomerCommissioningDetail
            commissioningConversion={customer.commissioningConversion}
            commissioningConversionFields={commissioningConversionFields}
            completion={completion}
          />
        </section>

        <section id="progress-milestones" className="scroll-mt-16">
          <SectionCard title="Progress Milestones">
            <CustomerProgressMilestones customerId={customer.id} completion={completion} audit={audit} />
          </SectionCard>
        </section>

        <section id="billing" className="scroll-mt-16">
          <SectionCard title="Billing & Completion Status">
            <KeyValueGridFor fields={billingCompletionFields} values={customer.billingCompletion} columns={2} />
          </SectionCard>
        </section>

        <section id="notes" className="scroll-mt-16">
          <CustomerNotesPanel customerId={customer.id} />
        </section>

        <section id="documents" className="scroll-mt-16">
          <CustomerEvidencePanel
            survey={customer.survey}
            lmcPipelineWork={customer.lmcPipelineWork}
            documents={customer.documents}
            customerId={customer.id}
          />
        </section>

        <section id="reports" className="scroll-mt-16">
          <CustomerReportsPanel customerId={customer.id} customer={customer} />
        </section>

        <section id="complaints" className="scroll-mt-16">
          <CustomerComplaintsPanel customerId={customer.id} />
        </section>

        {Object.entries(visibleFieldGroups).map(([group, fields]) => (
          <section key={group} id={groupAnchorId(group)} className="scroll-mt-16">
            <CustomerCustomFieldsDetail group={group} fields={fields} values={customer.customFields} />
          </section>
        ))}

        <section id="approvals" className="scroll-mt-16">
          <CustomerApprovalsHistory customer={customer} />
        </section>
      </div>
    </div>
  );
}

function KeyValueGridFor<T extends Record<string, string | boolean>>({
  fields,
  values,
  columns = 3,
}: {
  fields: { key: keyof T; label: string; input?: string }[];
  values: T;
  columns?: 1 | 2 | 3;
}) {
  return <KeyValueGrid items={itemsFromFields(fields, values)} columns={columns} />;
}
