import type { ReportTemplateData, ReportTemplateId } from "./types/report-template.types";

// GENERATED from components/pdf/ReportPdfDocument.tsx — the labelled fields each
// template prints, with that template's own default wording. Regenerate if the
// PDF layouts change.

export type TemplateFieldKey = keyof typeof FIELD_INFO;

/** Section and data source of each relabel-able field (source is informational, not editable). */
export const FIELD_INFO = {
  "client": {
    "section": "Header",
    "source": "project client"
  },
  "consultant": {
    "section": "Header",
    "source": "project consultant"
  },
  "contractor": {
    "section": "Header",
    "source": "project contractor"
  },
  "customerName": {
    "section": "Customer",
    "source": "customer.customerConnection.customerName"
  },
  "bpNo": {
    "section": "Customer",
    "source": "customer.customerConnection.trBpNo"
  },
  "phoneNo": {
    "section": "Customer",
    "source": "customer.customerConnection.mobileNo"
  },
  "customerAddress": {
    "section": "Customer",
    "source": "customer.customerConnection.fullAddress"
  },
  "meterNo": {
    "section": "Meter",
    "source": "customer.commissioningConversion.meterNo"
  },
  "meterType": {
    "section": "Meter",
    "source": "customer.commissioningConversion.meterType"
  },
  "regulatorNo": {
    "section": "Regulator",
    "source": "customer.commissioningConversion.regulatorNo"
  },
  "regulatorPressure": {
    "section": "Regulator",
    "source": "customer.commissioningConversion.regulatorPressure"
  },
  "riserTestingPressure": {
    "section": "Testing",
    "source": "no data source yet (prints blank)"
  },
  "riserTestingTime": {
    "section": "Testing",
    "source": "no data source yet (prints blank)"
  },
  "meterReading": {
    "section": "JMR",
    "source": "customer.commissioningConversion.meterReading"
  }
} as const;

/** Per template: the labelled fields it prints, in print order, with default wording. */
export const TEMPLATE_FIELDS: Record<ReportTemplateId, { key: TemplateFieldKey; defaultLabel: string }[]> = {
  "png-connection-job-card": [
    {
      "key": "client",
      "defaultLabel": "Client"
    },
    {
      "key": "consultant",
      "defaultLabel": "Consultant"
    },
    {
      "key": "meterNo",
      "defaultLabel": "Meter No"
    },
    {
      "key": "bpNo",
      "defaultLabel": "BP No"
    },
    {
      "key": "customerName",
      "defaultLabel": "Customer Name"
    },
    {
      "key": "customerAddress",
      "defaultLabel": "Address"
    },
    {
      "key": "contractor",
      "defaultLabel": "Contractor"
    }
  ],
  "testing-report-mdpe-line": [
    {
      "key": "client",
      "defaultLabel": "Client"
    },
    {
      "key": "consultant",
      "defaultLabel": "Consultants"
    },
    {
      "key": "contractor",
      "defaultLabel": "Contractor"
    }
  ],
  "pressure-observation-chart": [],
  "gc-report": [
    {
      "key": "customerName",
      "defaultLabel": "Customer"
    },
    {
      "key": "bpNo",
      "defaultLabel": "BP/TR No"
    },
    {
      "key": "phoneNo",
      "defaultLabel": "Phone"
    },
    {
      "key": "customerAddress",
      "defaultLabel": "Site / Address"
    }
  ],
  "pre-commissioning-report": [
    {
      "key": "client",
      "defaultLabel": "Client"
    },
    {
      "key": "consultant",
      "defaultLabel": "Consultant"
    },
    {
      "key": "contractor",
      "defaultLabel": "Contractor"
    }
  ],
  "conversion-report": [
    {
      "key": "bpNo",
      "defaultLabel": "BP / TR No"
    },
    {
      "key": "customerName",
      "defaultLabel": "Customer Name"
    },
    {
      "key": "phoneNo",
      "defaultLabel": "Mobile No"
    },
    {
      "key": "customerAddress",
      "defaultLabel": "Address"
    },
    {
      "key": "meterNo",
      "defaultLabel": "Meter Number"
    },
    {
      "key": "meterType",
      "defaultLabel": "Meter Type"
    },
    {
      "key": "meterReading",
      "defaultLabel": "Meter Reading"
    },
    {
      "key": "regulatorNo",
      "defaultLabel": "Regulator Number"
    },
    {
      "key": "regulatorPressure",
      "defaultLabel": "Regulator Pressure"
    },
    {
      "key": "riserTestingPressure",
      "defaultLabel": "Riser Testing Pressure"
    },
    {
      "key": "riserTestingTime",
      "defaultLabel": "Riser Testing Time"
    }
  ],
  "jmr-customer-consent": [
    {
      "key": "contractor",
      "defaultLabel": "Contractor Name"
    },
    {
      "key": "bpNo",
      "defaultLabel": "BP No"
    },
    {
      "key": "customerName",
      "defaultLabel": "Customer Name"
    },
    {
      "key": "phoneNo",
      "defaultLabel": "Phone No"
    },
    {
      "key": "customerAddress",
      "defaultLabel": "Customer Address"
    },
    {
      "key": "meterNo",
      "defaultLabel": "Meter No"
    },
    {
      "key": "meterType",
      "defaultLabel": "Meter Type"
    },
    {
      "key": "regulatorNo",
      "defaultLabel": "Regulator No"
    },
    {
      "key": "regulatorPressure",
      "defaultLabel": "Regulator Pressure"
    },
    {
      "key": "riserTestingPressure",
      "defaultLabel": "Riser Testing Pressure"
    },
    {
      "key": "riserTestingTime",
      "defaultLabel": "Riser Testing Time"
    },
    {
      "key": "meterReading",
      "defaultLabel": "Meter Reading"
    }
  ]
};

/** Label printed on the form: the admin's saved label for this field, else the template's own wording. */
export function fieldLabel(data: Pick<ReportTemplateData, "fieldLabels">, key: TemplateFieldKey, fallback: string) {
  return data.fieldLabels?.[key]?.trim() || fallback;
}
