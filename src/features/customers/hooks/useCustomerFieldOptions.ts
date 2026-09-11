import { useMemo } from "react";
import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";
import type { FieldDefinition } from "../config/customer-fields";
import { paymentStatusOptions, yesNoOptions } from "../config/customer-options";
import type {
  BillingCompletionStatus,
  CommissioningConversionDetails,
  CustomerConnectionDetails,
} from "../types/customer.types";

/**
 * The one hook that resolves runtime master-data options (connection types,
 * house types, schemes, meter types, document categories) for use alongside
 * the static field shape in `config/customer-fields.ts` and `config/lmc-fields.ts`.
 * Consolidates what used to be three separate `useMasterValuesQuery`-calling
 * hooks (`useCustomerConnectionFields`, `useCommissioningConversionFields`,
 * `useCustomerDocumentCategories`) into a single call site.
 */
export function useCustomerFieldOptions() {
  const { data: connectionTypes = [] } = useMasterValuesQuery("Connection Types");
  const { data: houseTypes = [] } = useMasterValuesQuery("House Types");
  const { data: schemes = [] } = useMasterValuesQuery("Schemes");
  const { data: meterTypes = [] } = useMasterValuesQuery("Meter Types");
  const { data: documentCategoryValues = [] } = useMasterValuesQuery("Document Categories");
  const { data: paymentModes = [] } = useMasterValuesQuery("Payment Types");

  const customerConnectionFields = useMemo<FieldDefinition<CustomerConnectionDetails>[]>(
    () => [
      { key: "customerName", label: "Customer Name" },
      { key: "mobileNo", label: "Mobile Number" },
      { key: "trBpNo", label: "BP / TR Number" },
      { key: "fullAddress", label: "Address", input: "textarea" },
      {
        key: "connectionType",
        label: "Connection Type",
        input: "select",
        options: connectionTypes.map((t) => t.value),
      },
      {
        key: "houseType",
        label: "House Type",
        input: "select",
        options: houseTypes.map((t) => t.value),
      },
      {
        key: "scheme",
        label: "Scheme",
        input: "select",
        options: schemes.map((t) => t.value),
      },
      {
        key: "jobCardDone",
        label: "Job Card Done",
        input: "select",
        options: yesNoOptions,
      },
      { key: "reportNoGi", label: "GI Report Number" },
      { key: "reportNoGc", label: "GC Report Number" },
      { key: "reportNoConversion", label: "Conversion Report Number" },
    ],
    [connectionTypes, houseTypes, schemes],
  );

  const commissioningConversionFields = useMemo<FieldDefinition<CommissioningConversionDetails>[]>(
    () => [
      { key: "meterNo", label: "Meter No." },
      { key: "installationDate", label: "Installation Date", input: "date" },
      { key: "commissioningDate", label: "Commissioning Date", input: "date" },
      { key: "conversionDate", label: "Conversion Date", input: "date" },
      { key: "regulatorPressure", label: "Regulator Pressure" },
      { key: "regulatorNo", label: "Regulator No." },
      {
        key: "meterType",
        label: "Meter Type",
        input: "select",
        options: meterTypes.map((t) => t.value),
      },
      { key: "meterReading", label: "Meter Reading", input: "meter", digits: 8 },
      {
        key: "nonConversionRemark",
        label: "Non-Conversion Remark",
        input: "textarea",
      },
      {
        key: "approvalStatus",
        label: "Approval Status",
        input: "select",
        options: ["draft", "submitted", "approved", "rejected"],
      },
      { key: "approvalComments", label: "Approval Comments", input: "textarea" },
    ],
    [meterTypes],
  );

  const documentCategories = useMemo(
    () => documentCategoryValues.map((c) => c.value),
    [documentCategoryValues],
  );

  // Payment Mode uses the same canonical "Payment Types" master values as
  // the commercial Payment dialogs/import - it was previously rendered as
  // free text here, out of step with those.
  const billingCompletionFields = useMemo<FieldDefinition<BillingCompletionStatus>[]>(
    () => [
      { key: "paymentStatus", label: "Payment Status", input: "select", options: paymentStatusOptions },
      { key: "paymentMode", label: "Payment Mode", input: "select", options: paymentModes.map((m) => m.value) },
      { key: "initialAmount", label: "Initial Amount", input: "number" },
      { key: "jmrDone", label: "JMR Done", input: "boolean" },
      { key: "jmrSubmittedInPbg", label: "JMR Submitted in PBG", input: "boolean" },
      { key: "giBillDone", label: "GI Bill Done", input: "boolean" },
      { key: "gcBillDone", label: "GC Bill Done", input: "boolean" },
      { key: "conversionBillDone", label: "Conversion Bill Done", input: "boolean" },
      { key: "remark", label: "Remark", input: "textarea" },
    ],
    [paymentModes],
  );

  return {
    customerConnectionFields,
    commissioningConversionFields,
    billingCompletionFields,
    documentCategories,
  };
}
