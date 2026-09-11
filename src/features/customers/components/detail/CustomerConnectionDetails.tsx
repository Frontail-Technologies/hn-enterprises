"use client";

import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { SectionCard } from "@/components/shared/SectionCard";
import type { FieldDefinition } from "../../config/customer-fields";
import { itemsFromFields } from "../../utils/field-display";
import { formatDate } from "../../utils/format";
import type { Customer, CustomerConnectionDetails as CustomerConnectionFields } from "../../types/customer.types";

export function CustomerConnectionDetails({
  customer,
  customerConnectionFields,
}: {
  customer: Customer;
  customerConnectionFields: FieldDefinition<CustomerConnectionFields>[];
}) {
  return (
    <SectionCard title="Customer & Connection Details">
      <KeyValueGrid
        items={[
          { label: "Project", value: customer.projectName },
          { label: "Site / Area", value: customer.siteArea },
          { label: "Created", value: formatDate(customer.createdDate) },
          ...itemsFromFields(customerConnectionFields, customer.customerConnection),
        ]}
        columns={3}
      />
    </SectionCard>
  );
}
