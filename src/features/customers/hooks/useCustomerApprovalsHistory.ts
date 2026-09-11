import { useWorkProgressListQuery } from "@/features/work-progress/hooks/useWorkProgress";
import type { Customer } from "../types/customer.types";

export type CustomerApprovalRow = {
  id: string;
  reference: string;
  module: string;
  submittedBy: string;
  date: string;
  remarks: string;
  status: string;
};

/**
 * Data/query orchestration for the Approvals / Activity History detail
 * section (§12 of the Checkpoint B brief): fetches work-progress updates and
 * normalizes the multi-source approval rows (survey, documents, billing)
 * into one row shape. `CustomerApprovalsHistory` stays presentational and
 * only renders what this hook returns.
 */
export function useCustomerApprovalsHistory(customer: Customer) {
  const { data: workProgressUpdates = [] } = useWorkProgressListQuery({ customerId: customer.id });

  const approvalRows: CustomerApprovalRow[] = [
    customer.survey
      ? {
          id: `${customer.survey.id}-approval`,
          reference: customer.survey.surveyId,
          module: "Survey",
          submittedBy: customer.survey.submittedBy || customer.survey.assignedSurveyor,
          date: customer.survey.submissionDate || customer.survey.surveyDate,
          remarks: customer.survey.approvalComments || customer.survey.notes || "-",
          status: customer.survey.approvalStatus,
        }
      : null,
    ...customer.documents.map((document) => ({
      id: `${document.id}-approval`,
      reference: document.referenceNumber || document.fileName,
      module: document.category,
      submittedBy: document.uploadedBy,
      date: document.uploadedOn,
      remarks: document.remarks || "-",
      status: document.status,
    })),
    {
      id: "billing-approval",
      reference: customer.customerConnection.trBpNo,
      module: "Billing",
      // Billing is not owned by a fixed customer supervisor any more - there
      // is no reliable "who" here without a dedicated actor field, so this
      // stays "-" (Recent Activity is the source of truth for who changed
      // what, not this legacy approvals summary).
      submittedBy: "-",
      date: customer.createdDate,
      remarks: customer.billingCompletion.remark || "-",
      status: customer.billingCompletion.paymentStatus,
    },
  ].filter(Boolean) as CustomerApprovalRow[];

  return { approvalRows, workProgressUpdates };
}
