"use client";

import type { ReactNode } from "react";
import {
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { PdfTableRow } from "../../types/report-template.types";

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 7,
    textAlign: "center",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
    textTransform: "uppercase",
    paddingVertical: 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#222222",
    backgroundColor: "#eeeeee",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    borderWidth: 1,
    borderColor: "#222222",
    padding: 4,
    minHeight: 21,
  },
  label: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
  muted: {
    color: "#444444",
  },
  handwriting: {
    fontSize: 10,
    color: "#1f3270",
  },
  tableHeaderCell: {
    borderWidth: 1,
    borderColor: "#222222",
    padding: 4,
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    backgroundColor: "#eeeeee",
  },
  tableCell: {
    borderWidth: 1,
    borderColor: "#222222",
    padding: 4,
    minHeight: 18,
  },
  signatureCell: {
    borderWidth: 1,
    borderColor: "#222222",
    minHeight: 66,
    padding: 4,
  },
});

export function PdfPage({ children }: { children: ReactNode }) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      {children}
    </Page>
  );
}

export function PdfHeader({
  title,
  subtitle,
  rightLogo = true,
}: {
  title: string;
  subtitle?: string;
  rightLogo?: boolean;
}) {
  return (
    <View style={[pdfStyles.row, { borderWidth: 1, borderColor: "#222222" }]}>
      <View style={[pdfStyles.cell, { width: "15%", borderWidth: 0, alignItems: "center" }]}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- React PDF Image does not support alt. */}
        <Image src="/logo.png" style={{ width: 42, height: 28, objectFit: "contain" }} />
      </View>
      <View style={[pdfStyles.cell, { width: rightLogo ? "70%" : "85%", borderTopWidth: 0, borderBottomWidth: 0 }]}>
        <Text style={pdfStyles.title}>{title}</Text>
        {subtitle ? <Text style={pdfStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightLogo ? (
        <View style={[pdfStyles.cell, { width: "15%", borderWidth: 0, alignItems: "center" }]}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- React PDF Image does not support alt. */}
          <Image src="/logo.png" style={{ width: 42, height: 28, objectFit: "contain" }} />
        </View>
      ) : null}
    </View>
  );
}

export function PdfSectionTitle({ children }: { children: ReactNode }) {
  return <Text style={pdfStyles.sectionTitle}>{children}</Text>;
}

export function PdfKeyValueRow({
  items,
}: {
  items: Array<{ label: string; value: string; wide?: boolean; handwriting?: boolean }>;
}) {
  return (
    <View style={pdfStyles.row}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[
            pdfStyles.cell,
            { flexGrow: item.wide ? 2 : 1, flexBasis: item.wide ? "50%" : "25%" },
          ]}
        >
          <Text>
            <Text style={pdfStyles.label}>{item.label}: </Text>
            <Text style={item.handwriting ? pdfStyles.handwriting : undefined}>{clean(item.value)}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

export function PdfTable({
  headers,
  rows,
  widths,
  compact = false,
}: {
  headers: string[];
  rows: PdfTableRow[];
  widths?: string[];
  compact?: boolean;
}) {
  const columnWidth = `${100 / headers.length}%`;

  return (
    <View>
      <View style={pdfStyles.row}>
        {headers.map((header, index) => (
          <Text
            key={`${header}-${index}`}
            style={[pdfStyles.tableHeaderCell, { width: widths?.[index] ?? columnWidth }]}
          >
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={pdfStyles.row}>
          {headers.map((_, index) => (
            <Text
              key={`${rowIndex}-${index}`}
              style={[
                pdfStyles.tableCell,
                {
                  width: widths?.[index] ?? columnWidth,
                  minHeight: compact ? 15 : 18,
                },
              ]}
            >
              {clean(row[index])}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export function PdfRemarks({ value, minHeight = 52 }: { value?: string; minHeight?: number }) {
  return (
    <View style={[pdfStyles.cell, { minHeight }]}>
      <Text style={pdfStyles.label}>Remarks:</Text>
      <Text style={{ marginTop: 4 }}>{clean(value)}</Text>
    </View>
  );
}

export function PdfSignatureGrid({ labels }: { labels: string[] }) {
  const width = `${100 / labels.length}%`;

  return (
    <View style={pdfStyles.row}>
      {labels.map((label) => (
        <View key={label} style={[pdfStyles.signatureCell, { width }]}>
          <Text style={[pdfStyles.label, { textAlign: "center" }]}>{label}</Text>
          <Text style={{ marginTop: 30 }}>Sign.</Text>
          <Text style={{ marginTop: 8 }}>Name</Text>
          <Text style={{ marginTop: 8 }}>Date</Text>
        </View>
      ))}
    </View>
  );
}

export function PdfSketchBox() {
  return (
    <View style={[pdfStyles.cell, { height: 340, padding: 0 }]}>
      <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
        {Array.from({ length: 20 }).map((_, index) => (
          <View
            key={`h-${index}`}
            style={{
              position: "absolute",
              top: index * 17,
              left: 0,
              right: 0,
              borderTopWidth: 0.25,
              borderColor: "#dddddd",
            }}
          />
        ))}
        {Array.from({ length: 28 }).map((_, index) => (
          <View
            key={`v-${index}`}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: index * 20,
              borderLeftWidth: 0.25,
              borderColor: "#dddddd",
            }}
          />
        ))}
      </View>
      <Text style={{ padding: 8, color: "#555555" }}>Isometric sketch / route drawing area</Text>
    </View>
  );
}

function clean(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
