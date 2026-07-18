"use client";

import { Document, Text, View } from "@react-pdf/renderer";
import type { ReportTemplateData, ReportTemplateId } from "../../types/report-template.types";
import {
  PdfHeader,
  PdfKeyValueRow,
  PdfPage,
  PdfRemarks,
  PdfSectionTitle,
  PdfSignatureGrid,
  PdfSketchBox,
  PdfTable,
  pdfStyles,
} from "./PdfPrimitives";

export function ReportPdfDocument({
  templateId,
  data,
}: {
  templateId: ReportTemplateId;
  data: ReportTemplateData;
}) {
  if (templateId === "png-connection-job-card") {
    return <PngJobCard data={data} />;
  }

  if (templateId === "testing-report-mdpe-line") {
    return <TestingReport data={data} />;
  }

  if (templateId === "pressure-observation-chart") {
    return <PressureObservationChart data={data} />;
  }

  if (templateId === "gc-report") {
    return <GcReport data={data} />;
  }

  return <JmrCustomerConsent data={data} />;
}

function JmrCustomerConsent({ data }: { data: ReportTemplateData }) {
  return (
    <Document title="JMR Sheet / Customer Consent Form">
      <PdfPage>
        <PdfHeader title={data.companyName} subtitle={data.subtitle} rightLogo={false} />
        <PdfSectionTitle>JMR Sheet / Customer Consent Form</PdfSectionTitle>
        <PdfKeyValueRow
          items={[
            { label: "Contractor Name", value: data.contractor },
            { label: "Report No", value: data.reportNo },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "Charge Area", value: data.chargeArea },
            { label: "Date of Visit RFC", value: data.date },
            { label: "BP No", value: data.bpNo, handwriting: true },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "Customer Name", value: data.customerName, handwriting: true },
            { label: "Phone No", value: data.phoneNo, handwriting: true },
          ]}
        />
        <PdfKeyValueRow items={[{ label: "Customer Address", value: data.customerAddress, wide: true, handwriting: true }]} />
        <PdfKeyValueRow
          items={[
            { label: "Meter No", value: data.meterNo },
            { label: "Meter Make", value: data.meterMake },
            { label: "Meter Type", value: data.meterType },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "Regulator No", value: data.regulatorNo },
            { label: "Regulator Make", value: data.regulatorMake },
            { label: "Regulator Pressure", value: data.regulatorPressure },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "Riser Testing Pressure", value: data.riserTestingPressure },
            { label: "Riser Testing Time", value: data.riserTestingTime },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "Meter Testing Pressure", value: data.meterTestingPressure },
            { label: "Meter Testing Time", value: data.meterTestingTime },
          ]}
        />
        <PdfSectionTitle>GI Measurement Details</PdfSectionTitle>
        <PdfTable
          headers={["Description", "Size", "Quantity", "Unit"]}
          rows={data.giRows}
          widths={["58%", "17%", "13%", "12%"]}
          compact
        />
        <PdfRemarks value={data.remarks} minHeight={64} />
        <PdfSectionTitle>Joint Meter Reading</PdfSectionTitle>
        <PdfKeyValueRow
          items={[
            { label: "Customer Name", value: data.customerName, handwriting: true },
            { label: "Conversion Date", value: data.conversionDate, handwriting: true },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "Customer Address", value: data.customerAddress, handwriting: true },
            { label: "Meter Reading", value: data.meterReading, handwriting: true },
          ]}
        />
        <PdfRemarks value="If No. Reason For Non-Conversion" minHeight={52} />
        <PdfSignatureGrid labels={["Customer Representative", "Consultant", "PBGPL", "Contractor"]} />
      </PdfPage>
    </Document>
  );
}

function PngJobCard({ data }: { data: ReportTemplateData }) {
  return (
    <Document title="PNG Connection Job Card">
      <PdfPage>
        <PdfHeader title="PNG Connection Job Card" />
        <PdfKeyValueRow
          items={[
            { label: "Client", value: data.client },
            { label: "Report No", value: data.reportNo },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "Consultant", value: data.consultant },
            { label: "Meter No", value: data.meterNo },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "BP No", value: data.bpNo, handwriting: true },
            { label: "Connection Type", value: data.connectionType },
            { label: "Installation Date", value: data.date },
          ]}
        />
        <PdfKeyValueRow items={[{ label: "Customer Name", value: data.customerName, handwriting: true }]} />
        <PdfKeyValueRow items={[{ label: "Address", value: data.customerAddress, wide: true, handwriting: true }]} />
        <PdfKeyValueRow
          items={[
            { label: "Contractor", value: data.contractor },
            { label: "Testing Date", value: data.date },
            { label: "Commissioning Date", value: data.conversionDate },
          ]}
        />
        <PdfSketchBox />
        <View style={pdfStyles.row}>
          <View style={{ width: "58%" }}>
            <PdfSectionTitle>Material Details</PdfSectionTitle>
            <PdfTable
              headers={["S.No.", "Description", "Size", "Unit", "Quantity"]}
              rows={data.materialRows}
              widths={["10%", "36%", "18%", "14%", "22%"]}
              compact
            />
          </View>
          <View style={{ width: "42%" }}>
            <PdfSectionTitle>Testing Details</PdfSectionTitle>
            <PdfTable
              headers={["Item", "Value"]}
              rows={[
                ["Gauge Calibration No", "BOUMMER/PG-01"],
                ["Calibration Validity", "15.12.2025 to 14.12.2026"],
                ["Holding Time", data.riserTestingTime],
                ["Pressure", data.riserTestingPressure],
                ["Remark", data.remarks],
              ]}
              widths={["48%", "52%"]}
              compact
            />
            <PdfSectionTitle>Pressure Observation Chart</PdfSectionTitle>
            <PdfTable
              headers={["Time", "Pressure"]}
              rows={data.pressureRows.slice(0, 4).map((row) => [row[2], row[3]])}
              widths={["50%", "50%"]}
              compact
            />
          </View>
        </View>
        <PdfSignatureGrid labels={["Contractor", "MECON", "PBG"]} />
      </PdfPage>
    </Document>
  );
}

function TestingReport({ data }: { data: ReportTemplateData }) {
  return (
    <Document title="Testing Report MDPE Line">
      <PdfPage>
        <PdfHeader title="Testing Report MDPE Line" />
        <PdfSectionTitle>Project: City Gas Distribution Project</PdfSectionTitle>
        <PdfKeyValueRow items={[{ label: "Client", value: data.client }]} />
        <PdfKeyValueRow items={[{ label: "Consultants", value: data.consultant }]} />
        <PdfKeyValueRow items={[{ label: "Contractor", value: data.contractor }]} />
        <PdfKeyValueRow
          items={[
            { label: "Area", value: data.chargeArea },
            { label: "Date", value: data.date },
          ]}
        />
        <PdfKeyValueRow items={[{ label: "Location", value: data.location, wide: true }]} />
        <PdfSectionTitle>Pneumatic Testing Report: Check List</PdfSectionTitle>
        <PdfTable
          headers={["S.No.", "Checklist", "Status"]}
          rows={data.checklistRows.map((row, index) => [index + 1, row[0], row[1]])}
          widths={["8%", "68%", "24%"]}
          compact
        />
        <PdfSectionTitle>Sizes of MDPE Pipe</PdfSectionTitle>
        <PdfTable
          headers={["S.No.", "Size", "Total Length", "Testing Status", "Purging Status"]}
          rows={data.pipeSummaryRows}
          widths={["8%", "18%", "20%", "27%", "27%"]}
          compact
        />
        <PdfTable
          headers={["Testing Medium", "Testing Pressure", "Pressure Gauge Make / No", "Gauge Calibration Validity", "Holding Time", "Result"]}
          rows={[["Air / Nitrogen", data.riserTestingPressure, "GL GURU / B23001004", "07.11.2026", data.riserTestingTime, "OK"]]}
          compact
        />
        <PdfRemarks value={data.remarks} minHeight={76} />
        <PdfSignatureGrid labels={["Pradip Kumar Gogoi", "MECON", "PBG"]} />
      </PdfPage>
    </Document>
  );
}

function PressureObservationChart({ data }: { data: ReportTemplateData }) {
  return (
    <Document title="Pressure Observation Chart">
      <PdfPage>
        <PdfHeader title="Testing Report MDPE Line" />
        <PdfSectionTitle>Pressure Observation Chart</PdfSectionTitle>
        <PdfTable
          headers={["Sl. No.", "Date", "Time", "Reading (kg/cm2)"]}
          rows={data.pressureRows}
          widths={["12%", "28%", "30%", "30%"]}
          compact
        />
        <PdfRemarks value={data.remarks} minHeight={84} />
        <PdfSignatureGrid labels={["Pradip Kumar Gogoi", "MECON", "PBG"]} />
      </PdfPage>
    </Document>
  );
}

function GcReport({ data }: { data: ReportTemplateData }) {
  return (
    <Document title="GC Report Template">
      <PdfPage>
        <PdfHeader title="GC Report Template" />
        <PdfKeyValueRow
          items={[
            { label: "Project", value: data.projectName },
            { label: "Report No", value: data.reportNo },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "Customer", value: data.customerName },
            { label: "BP/TR No", value: data.bpNo },
            { label: "Phone", value: data.phoneNo },
          ]}
        />
        <PdfKeyValueRow items={[{ label: "Site / Address", value: data.customerAddress, wide: true }]} />
        <PdfSectionTitle>GC Checklist</PdfSectionTitle>
        <PdfTable
          headers={["S.No.", "Checklist Item", "Type", "Status", "Remarks"]}
          rows={data.gcChecklistRows}
          widths={["8%", "36%", "14%", "18%", "24%"]}
          compact
        />
        <PdfSectionTitle>Uploaded Evidence</PdfSectionTitle>
        <PdfTable
          headers={["S.No.", "Evidence", "Type", "File", "Status"]}
          rows={data.gcEvidenceRows}
          widths={["8%", "28%", "14%", "34%", "16%"]}
          compact
        />
        <View style={[pdfStyles.cell, { minHeight: 130 }]}>
          <Text style={pdfStyles.label}>Photo / Document Preview Area</Text>
          <Text style={{ marginTop: 8, color: "#555555" }}>
            Attached GC evidence thumbnails and signed document references are listed above.
          </Text>
        </View>
        <PdfRemarks value={data.remarks} minHeight={72} />
        <PdfSignatureGrid labels={["Submitted By", "Reviewer", "Client / Consultant"]} />
      </PdfPage>
    </Document>
  );
}
