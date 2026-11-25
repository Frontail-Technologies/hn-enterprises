import type ExcelJS from "exceljs";

export type ExportColumn<T> = {
  label: string;
  getValue: (row: T) => string | number | boolean | null | undefined;
};

async function loadExcelJS() {
  const mod = await import("exceljs");
  return (mod.default ?? mod) as typeof ExcelJS;
}

const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" } };
const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F2937" },
};
const BORDER_STYLE: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD1D5DB" } },
  left: { style: "thin", color: { argb: "FFD1D5DB" } },
  bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
  right: { style: "thin", color: { argb: "FFD1D5DB" } },
};

function columnWidth(label: string) {
  return Math.min(Math.max(label.length + 4, 12), 40);
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 20;
  row.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.border = BORDER_STYLE;
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
}

function styleDataRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.border = BORDER_STYLE;
    cell.alignment = { vertical: "middle", wrapText: true };
  });
}

async function downloadWorkbook(filename: string, workbook: ExcelJS.Workbook) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** First sheet of an .xlsx as objects keyed by the header row (cell text, trimmed). */
export async function readExcelRows(file: File): Promise<Record<string, string>[]> {
  const ExcelJSMod = await loadExcelJS();
  const workbook = new ExcelJSMod.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell, column) => {
    headers[column] = cell.text.trim();
  });
  const rows: Record<string, string>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, string> = {};
    headers.forEach((header, column) => {
      if (header) record[header] = row.getCell(column).text.trim();
    });
    if (Object.values(record).some(Boolean)) rows.push(record);
  });
  return rows;
}

/**
 * Download rows as .xlsx. A "Sr. No." column comes first (1, 2, 3...) unless
 * `serial: false` - e.g. for a sheet that is filled in and imported back.
 */
export async function exportRowsToExcel<T>(filename: string, columns: ExportColumn<T>[], rows: T[], options: { serial?: boolean } = {}) {
  const serial = options.serial ?? true;
  const ExcelJSMod = await loadExcelJS();
  const workbook = new ExcelJSMod.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  const headers = [...(serial ? ["Sr. No."] : []), ...columns.map((column) => column.label)];
  sheet.columns = headers.map((label) => ({ header: label, width: label === "Sr. No." ? 8 : columnWidth(label) }));
  styleHeaderRow(sheet.getRow(1));
  rows.forEach((row, index) => {
    const values = columns.map((column) => column.getValue(row) ?? "");
    const excelRow = sheet.addRow(serial ? [index + 1, ...values] : values);
    styleDataRow(excelRow);
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  await downloadWorkbook(filename, workbook);
}

export async function exportColumnTemplate(filename: string, columnLabels: string[]) {
  const ExcelJSMod = await loadExcelJS();
  const workbook = new ExcelJSMod.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  sheet.columns = columnLabels.map((label) => ({ header: label, width: columnWidth(label) }));
  styleHeaderRow(sheet.getRow(1));
  await downloadWorkbook(filename, workbook);
}

export type GridCell = string | number | { value: string | number; bold?: boolean };

export async function exportGridToExcel(filename: string, grid: GridCell[][]) {
  const ExcelJSMod = await loadExcelJS();
  const workbook = new ExcelJSMod.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  grid.forEach((rowCells) => {
    const excelRow = sheet.addRow(rowCells.map((cell) => (typeof cell === "object" ? cell.value : cell)));
    excelRow.eachCell((cell, colNumber) => {
      const source = rowCells[colNumber - 1];
      if (typeof source === "object" && source.bold) cell.font = { bold: true };
      cell.border = BORDER_STYLE;
      cell.alignment = { vertical: "middle", wrapText: true };
    });
  });
  sheet.columns.forEach((column) => {
    column.width = 24;
  });
  await downloadWorkbook(filename, workbook);
}
