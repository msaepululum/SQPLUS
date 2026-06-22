import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export type ReportExportColumn = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  format?: (value: unknown, row: Record<string, unknown>) => string;
};

export type ReportExportPayload = {
  title: string;
  subtitle?: string;
  generatedAt?: string;
  columns: ReportExportColumn[];
  rows: Record<string, unknown>[];
  footerRows?: Record<string, unknown>[];
};

function cellValue(col: ReportExportColumn, row: Record<string, unknown>): string {
  const raw = row[col.key];
  if (col.format) return col.format(raw, row);
  if (raw == null) return "";
  return String(raw);
}

function tableRows(payload: ReportExportPayload): string[][] {
  const data = payload.rows.map((row) =>
    payload.columns.map((col) => cellValue(col, row))
  );
  if (payload.footerRows?.length) {
    data.push(
      ...payload.footerRows.map((row) =>
        payload.columns.map((col) => cellValue(col, row))
      )
    );
  }
  return data;
}

export function exportReportToExcel(payload: ReportExportPayload, filename: string): void {
  const generatedAt =
    payload.generatedAt ??
    new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });

  const meta: string[][] = [[payload.title]];
  if (payload.subtitle) meta.push([payload.subtitle]);
  meta.push([`Dicetak: ${generatedAt}`], []);

  const sheetData = [
    ...meta,
    payload.columns.map((c) => c.label),
    ...tableRows(payload),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportReportToPdf(payload: ReportExportPayload): void {
  const generatedAt =
    payload.generatedAt ??
    new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(14);
  doc.text(payload.title, 14, 16);
  let y = 22;
  doc.setFontSize(9);
  doc.setTextColor(100);
  if (payload.subtitle) {
    doc.text(payload.subtitle, 14, y);
    y += 5;
  }
  doc.text(`Dicetak: ${generatedAt}`, 14, y);
  doc.setTextColor(0);

  const head = [payload.columns.map((c) => c.label)];
  const body = tableRows(payload);
  const columnStyles: Record<number, { halign: "left" | "right" | "center" }> = {};
  payload.columns.forEach((col, i) => {
    if (col.align) columnStyles[i] = { halign: col.align };
  });

  autoTable(doc, {
    startY: y + 4,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    columnStyles,
    didParseCell: (data) => {
      if (
        payload.footerRows?.length &&
        data.section === "body" &&
        data.row.index >= payload.rows.length
      ) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [248, 250, 252];
      }
    },
  });

  const safeName = payload.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  doc.save(`${safeName || "laporan"}.pdf`);
}

export function formatReportAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatReportPct(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toFixed(1).replace(".", ",")}%`;
}
