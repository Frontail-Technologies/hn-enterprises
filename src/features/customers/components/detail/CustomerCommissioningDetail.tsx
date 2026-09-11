"use client";

import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { SectionCard } from "@/components/shared/SectionCard";
import type { FieldDefinition } from "../../config/customer-fields";
import { itemsFromFields } from "../../utils/field-display";
import { SectionStatusBadge } from "./SectionCompletionActions";
import type {
  CommissioningConversionDetails,
  CustomerSectionCompletion,
} from "../../types/customer.types";

export function CustomerCommissioningDetail({
  commissioningConversion,
  commissioningConversionFields,
  completion,
}: {
  commissioningConversion: CommissioningConversionDetails;
  commissioningConversionFields: FieldDefinition<CommissioningConversionDetails>[];
  completion?: CustomerSectionCompletion;
}) {
  return (
    <SectionCard title="Commissioning & Conversion" action={<SectionStatusBadge result={completion?.commissioning} />}>
      <KeyValueGrid
        items={itemsFromFields(commissioningConversionFields, commissioningConversion)}
        columns={2}
      />
    </SectionCard>
  );
}
