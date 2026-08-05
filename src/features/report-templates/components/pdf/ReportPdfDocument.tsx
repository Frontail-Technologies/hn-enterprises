"use client";

import { Document, Text, View, Image } from "@react-pdf/renderer";
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

  if (templateId === "pre-commissioning-report") {
    return <PreCommissioningReport data={data} />;
  }

  if (templateId === "conversion-report") {
    return <ConversionReport data={data} />;
  }

  return <JmrCustomerConsent data={data} />;
}

function JmrCustomerConsent({ data }: { data: ReportTemplateData }) {
  return (
    <Document title="JMR Sheet / Customer Consent Form">
      <PdfPage>
        <PdfHeader title={data.companyName} subtitle={data.subtitle} />
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

function ConversionReport({ data }: { data: ReportTemplateData }) {
  return (
    <Document title="Conversion Report">
      <PdfPage>
        <PdfHeader title="NG Conversion Report" />
        <PdfSectionTitle>Customer / Connection Details</PdfSectionTitle>
        <PdfKeyValueRow
          items={[
            { label: "BP / TR No", value: data.bpNo, handwriting: true },
            { label: "Customer Name", value: data.customerName, handwriting: true },
            { label: "Mobile No", value: data.phoneNo },
          ]}
        />
        <PdfKeyValueRow items={[{ label: "Address", value: data.customerAddress, wide: true, handwriting: true }]} />
        <PdfKeyValueRow
          items={[
            { label: "Connection Type", value: data.connectionType },
            { label: "Conversion Date", value: data.conversionDate, handwriting: true },
            { label: "Report No", value: data.reportNo },
          ]}
        />

        <PdfSectionTitle>Meter Details</PdfSectionTitle>
        <PdfKeyValueRow
          items={[
            { label: "Meter Number", value: data.meterNo, handwriting: true },
            { label: "Meter Type", value: data.meterType },
            { label: "Meter Reading", value: data.meterReading, handwriting: true },
          ]}
        />
        <PdfKeyValueRow
          items={[
            { label: "Meter Make", value: data.meterMake },
            { label: "Meter Testing Pressure", value: data.meterTestingPressure },
            { label: "Meter Testing Time", value: data.meterTestingTime },
          ]}
        />

        <PdfSectionTitle>Regulator Details</PdfSectionTitle>
        <PdfKeyValueRow
          items={[
            { label: "Regulator Number", value: data.regulatorNo, handwriting: true },
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

        <PdfSectionTitle>Conversion Checklist</PdfSectionTitle>
        <PdfTable
          headers={["S.No.", "Item", "Status / Value"]}
          rows={[
            [1, "Customer available for conversion", "Yes / No"],
            [2, "Meter installed and sealed", data.meterNo ? "Yes" : "No"],
            [3, "Regulator installed / replaced", data.regulatorNo ? "Yes" : "No"],
            [4, "Burner / appliance conversion completed", "Yes / No / NA"],
            [5, "Final leak test completed", "Yes / No"],
            [6, "Customer safety briefing completed", "Yes / No"],
          ]}
          widths={["10%", "58%", "32%"]}
          compact
        />
        <PdfRemarks value={data.remarks} minHeight={92} />
        <PdfSignatureGrid labels={["Customer Representative", "Contractor", "Consultant", "PBGPL"]} />
      </PdfPage>
    </Document>
  );
}
function TestingReport({ data }: { data: ReportTemplateData }) {
  const pipeLengths = getTestingPipeLengthMap(data);
  const checklistRows = [
    ["1.", "Flushing : Pipe cleaned from water & debris", ":", "Yes / No / NA"],
    ["2.", "GI Sleeves / Half round concrete sleeve properly installed", ":", "Yes / No / NA"],
    ["3.", "Isolation Valve plugged", ":", "Yes / No / NA"],
    ["4.", "All Regulator pieces properly clamped", ":", "Yes / No / NA"],
    ["5.", "Isolation Valve in open condition with open end plugged", ":", "Yes / No / NA"],
    ["6.", "Videography / Photography (Real Time showing Test Pressure)", ":", "Yes / No / NA"],
    ["7.", "Backfilling of soil done after completion of Pressure Testing", ":", "Yes / No / NA"],
    ["8.", "Isometric Sketch showing complete length of pipeline section including branch line of Pipeline Section under Testing", ":", "Yes / No / NA"],
  ];

  return (
    <Document title="Testing Report MDPE Line">
      <PdfPage>
        <View style={[pdfStyles.row, { borderWidth: 1, borderColor: "#222222" }]}>
          <View style={[pdfStyles.cell, { width: "16%", minHeight: 42, alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ fontSize: 6, textAlign: "center" }}>HN Enterprises</Text>
          </View>
          <View style={[pdfStyles.cell, { width: "68%", minHeight: 42, alignItems: "center", justifyContent: "center" }]}>
            <Text style={[pdfStyles.title, { fontSize: 11 }]}>Testing Report MDPE Line</Text>
          </View>
          <View style={[pdfStyles.cell, { width: "16%", minHeight: 42, alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: "#3f7f3f" }}>PBG</Text>
          </View>
        </View>

        <Text style={[pdfStyles.sectionTitle, { borderTopWidth: 0 }]}>Project :- City Gas Distribution Project</Text>
        <PaperInfoRow label="Client" value={data.client} />
        <PaperInfoRow label="Consultants" value={data.consultant} />
        <PaperInfoRow label="Contractor" value={data.contractor} />
        <View style={pdfStyles.row}>
          <View style={[pdfStyles.cell, { width: "55%" }]}>
            <Text><Text style={pdfStyles.label}>Area : </Text>{data.chargeArea}</Text>
          </View>
          <View style={[pdfStyles.cell, { width: "45%" }]}>
            <Text><Text style={pdfStyles.label}>Date : </Text>{data.date}</Text>
          </View>
        </View>
        <PaperInfoRow label="Location" value={data.location} />

        <View style={[pdfStyles.cell, { borderTopWidth: 0, paddingVertical: 5, alignItems: "center" }]}>
          <Text style={[pdfStyles.label, { textDecoration: "underline", fontSize: 9 }]}>Pneumatic Testing Report:</Text>
          <Text style={[pdfStyles.label, { textDecoration: "underline", fontSize: 8 }]}>Check List:-</Text>
        </View>

        <PdfTable
          headers={["", "Checklist", "", "Status"]}
          rows={checklistRows}
          widths={["6%", "58%", "5%", "31%"]}
          compact
        />

        <View style={pdfStyles.row}>
          <Text style={[pdfStyles.tableCell, { width: "6%", textAlign: "center" }]}>1</Text>
          <Text style={[pdfStyles.tableCell, { width: "38%" }]}>Sizes of MDPE Pipe</Text>
          <Text style={[pdfStyles.tableCell, { width: "5%", textAlign: "center" }]}>:</Text>
          {testingPipeSizeHeaders.map((size) => (
            <Text key={size} style={[pdfStyles.tableCell, { width: "12.75%", textAlign: "center", fontWeight: 700 }]}>{size}</Text>
          ))}
        </View>
        <View style={pdfStyles.row}>
          <Text style={[pdfStyles.tableCell, { width: "6%", textAlign: "center" }]}>2</Text>
          <Text style={[pdfStyles.tableCell, { width: "38%" }]}>Total Length of the pipe (as per Isometric sketch)</Text>
          <Text style={[pdfStyles.tableCell, { width: "5%", textAlign: "center" }]}>:</Text>
          {testingPipeSizeHeaders.map((size) => (
            <Text key={size} style={[pdfStyles.tableCell, { width: "12.75%", textAlign: "center" }]}>{pipeLengths[size]}</Text>
          ))}
        </View>

        <TestingDetailRow serial="3" label="Testing Medium" value="AIR/NITROGEN" />
        <TestingDetailRow serial="4" label="Testing Pressure" value="6.2 Kg/Cm2" />
        <TestingDetailRow serial="5" label="Pressure Gauge Make/ No" value="GL GURU/B23001004" />
        <TestingDetailRow serial="6" label="Gauge calibration validity" value="07.11.2026" />
        <TestingDetailRow serial="7" label="Holding Time" value="24HR" />
        <TestingDetailRow serial="8" label="Holding Date" value={data.date} />
        <TestingDetailRow serial="9" label="Result" value="OK" />

        <PdfRemarks value={data.remarks} minHeight={58} />
        <PdfSignatureGrid labels={["Pradip Kumar Gogoi", "MECON", "PBG"]} />
      </PdfPage>
    </Document>
  );
}

function PaperInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={pdfStyles.row}>
      <Text style={[pdfStyles.cell, { width: "18%" }]}>{label}:</Text>
      <Text style={[pdfStyles.cell, { width: "82%" }]}>{value || "-"}</Text>
    </View>
  );
}

function TestingDetailRow({ serial, label, value }: { serial: string; label: string; value: string }) {
  return (
    <View style={pdfStyles.row}>
      <Text style={[pdfStyles.tableCell, { width: "6%", textAlign: "center" }]}>{serial}</Text>
      <Text style={[pdfStyles.tableCell, { width: "38%" }]}>{label}</Text>
      <Text style={[pdfStyles.tableCell, { width: "5%", textAlign: "center" }]}>:</Text>
      <Text style={[pdfStyles.tableCell, { width: "51%", textAlign: "center", fontWeight: 700 }]}>{value || "-"}</Text>
    </View>
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

function PreCommissioningReport({ data }: { data: ReportTemplateData }) {
  const pipeLengths = getPipeLengthMap(data);
  const totalLength = Object.values(pipeLengths).reduce((sum, value) => sum + parseNumber(value), 0);
  const checklistRows = [
    ["a)", "Isolation valve plugged", "Yes / No / NA"],
    ["b)", "Any Exposed Pipe", "Yes / No"],
    ["c)", "RCC/Plate/Pole Markers installation", "Yes / No"],
    ["d)", "Charging Tools available", "Yes / No"],
    ["e)", "As-built Drawing", "Yes / No"],
    ["f)", "Certificates confirming nitrogen available", "Yes / No"],
    ["g)", "Fire Extinguisher / Gas Detector", "Yes / No"],
    ["h)", "Sleeves / half round filled with sand", "Yes / No/NA"],
    ["i)", "Valve Chamber construction done", "Yes / No/NA"],
    ["j)", "Safety equipment / First Aid available", "Yes / No"],
    ["k)", "Emergency Nos. provided to the society", "Yes / No / NA"],
  ];

  return (
    <Document title="Pre-Commissioning Report">
      <PdfPage>
        <View style={[pdfStyles.row, { alignItems: "flex-start", marginBottom: 14 }]}>
          <View style={{ width: "18%" }} />
          <View style={{ width: "64%" }}>
            <Text style={[pdfStyles.title, { textDecoration: "underline", fontSize: 12 }]}>Pre-Commissioning Report</Text>
          </View>
          <View style={{ width: "18%" }}>
            <Text style={[pdfStyles.title, { fontSize: 11, textAlign: "right" }]}>1st Phase</Text>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <PlainInfoLine label="Project" value="City Gas Distribution Project at Kamrup & Kamrup Metropolitan GA" />
          <PlainInfoLine label="Client" value={data.client} />
          <PlainInfoLine label="Consultant" value={data.consultant} />
          <PlainInfoLine label="Contractor" value={data.contractor} />
          <PlainInfoLine label="Location" value={data.location} underline />
        </View>

        <View style={pdfStyles.row}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "7%", textAlign: "center" }]}>S. No</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "33%", textAlign: "center" }]}>Description</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "60%", textAlign: "center" }]}>Details</Text>
        </View>

        <View style={pdfStyles.row}>
          <Text style={[pdfStyles.tableCell, { width: "7%", minHeight: 62, textAlign: "center", paddingTop: 24 }]}>1.</Text>
          <Text style={[pdfStyles.tableCell, { width: "33%", minHeight: 62, fontWeight: 700, paddingTop: 24 }]}>N2 Purging Detail</Text>
          <View style={{ width: "60%" }}>
            <DetailSplitRow label="Purging Date: -" value={data.date} />
            <DetailSplitRow label="Number of nitrogen cylinder consumed: -" value="23.5 NOS" />
          </View>
        </View>

        <View style={pdfStyles.row}>
          <Text style={[pdfStyles.tableCell, { width: "7%", minHeight: 100, textAlign: "center", paddingTop: 42 }]}>2.</Text>
          <Text style={[pdfStyles.tableCell, { width: "33%", minHeight: 100, fontWeight: 700, paddingTop: 31 }]}>Length of PE Pipe Pneumatically Tested and flushed as well as cleaned (m)</Text>
          <View style={{ width: "60%" }}>
            <DetailSplitRow label="Date of Pneumatic testing: -" value={data.date} />
            <View style={pdfStyles.row}>
              <Text style={[pdfStyles.tableCell, { width: "20%", fontWeight: 700 }]}>Type/size</Text>
              {pipeSizeHeaders.map((size) => (
                <Text key={size} style={[pdfStyles.tableCell, { width: "16%", textAlign: "center", fontWeight: 700 }]}>{size}</Text>
              ))}
            </View>
            <View style={pdfStyles.row}>
              <Text style={[pdfStyles.tableCell, { width: "20%", fontWeight: 700 }]}>Length of Pipe</Text>
              {pipeSizeHeaders.map((size) => (
                <Text key={size} style={[pdfStyles.tableCell, { width: "16%", textAlign: "center" }]}>{pipeLengths[size]}</Text>
              ))}
            </View>
            <View style={pdfStyles.row}>
              <Text style={[pdfStyles.tableCell, { width: "36%", fontWeight: 700 }]}>Total Length</Text>
              <Text style={[pdfStyles.tableCell, { width: "64%", textAlign: "center", fontSize: 12, fontWeight: 700 }]}>{formatNumber(totalLength)} MTR</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.row}>
          <Text style={[pdfStyles.tableCell, { width: "7%", textAlign: "center" }]}>3.</Text>
          <Text style={[pdfStyles.tableCell, { width: "53%", fontWeight: 700 }]}>No of PE Isolation Valve Chamber (in Nos.): -</Text>
          {pipeSizeHeaders.map((size, index) => (
            <Text key={size} style={[pdfStyles.tableCell, { width: "8%", textAlign: "center" }]}>{["01", "05", "06", "00", "00"][index]}</Text>
          ))}
        </View>

        <View style={pdfStyles.row}>
          <Text style={[pdfStyles.tableCell, { width: "7%", textAlign: "center" }]}>4.</Text>
          <Text style={[pdfStyles.tableCell, { width: "93%", fontWeight: 700 }]}>Check List: -</Text>
        </View>
        <PdfTable
          headers={["", "Description", "Status"]}
          rows={checklistRows}
          widths={["7%", "53%", "40%"]}
          compact
        />

        <View style={[pdfStyles.row, { marginTop: 26, alignItems: "flex-end" }]}>
          {[
            data.contractor.toUpperCase(),
            "MECON",
            "PBGPL",
          ].map((label) => (
            <View key={label} style={{ width: "33.33%", minHeight: 72, alignItems: "center", justifyContent: "flex-end" }}>
              <Text style={{ marginBottom: 8, fontSize: 20, color: "#1f3270" }}>________</Text>
              <Text style={[pdfStyles.label, { textAlign: "center" }]}>{label}</Text>
            </View>
          ))}
        </View>
      </PdfPage>
    </Document>
  );
}

const testingPipeSizeHeaders = ["32MM", "63MM", "90MM", "125MM"];

function getTestingPipeLengthMap(data: ReportTemplateData) {
  const map: Record<string, string> = {
    "32MM": "0.00",
    "63MM": "0.00",
    "90MM": "0.00",
    "125MM": "0.00",
  };

  data.pipeSummaryRows.forEach((row) => {
    const size = String(row[1] ?? "").replace(/\s+/g, "").toUpperCase();
    if (size in map) map[size] = String(row[2] || "0.00");
  });

  return map;
}
const pipeSizeHeaders = ["125MM", "90MM", "63MM", "32MM", "20MM"];

function PlainInfoLine({ label, value, underline = false }: { label: string; value: string; underline?: boolean }) {
  return (
    <View style={[pdfStyles.row, { minHeight: 17 }]}>
      <Text style={[pdfStyles.label, { width: "17%", fontSize: 10 }]}>{label}</Text>
      <Text style={{ width: "83%", fontSize: 10, textDecoration: underline ? "underline" : undefined }}>{value || "-"}</Text>
    </View>
  );
}

function DetailSplitRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={pdfStyles.row}>
      <Text style={[pdfStyles.tableCell, { width: "45%", fontWeight: 700 }]}>{label}</Text>
      <Text style={[pdfStyles.tableCell, { width: "55%", textAlign: "center", fontWeight: 700 }]}>{value || "-"}</Text>
    </View>
  );
}

function getPipeLengthMap(data: ReportTemplateData) {
  const map: Record<string, string> = {
    "125MM": "0.00",
    "90MM": "0.00",
    "63MM": "0.00",
    "32MM": "0.00",
    "20MM": "0.00",
  };

  data.pipeSummaryRows.forEach((row) => {
    const size = String(row[1] ?? "").replace(/\s+/g, "").toUpperCase();
    if (size in map) map[size] = String(row[2] || "0.00");
  });

  return map;
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
          {data.gcEvidenceImages && data.gcEvidenceImages.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {data.gcEvidenceImages.map((src, index) => (
                <Image key={index} src={src} style={{ width: 140, height: 140, objectFit: "contain" }} />
              ))}
            </View>
          ) : (
            <Text style={{ marginTop: 8, color: "#555555" }}>
              Attached GC evidence thumbnails and signed document references are listed above.
            </Text>
          )}
        </View>
        <PdfRemarks value={data.remarks} minHeight={72} />
        <PdfSignatureGrid labels={["Submitted By", "Reviewer", "Client / Consultant"]} />
      </PdfPage>
    </Document>
  );
}
