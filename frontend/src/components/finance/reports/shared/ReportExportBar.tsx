"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import {
  exportReportToExcel,
  exportReportToPdf,
  type ReportExportPayload,
} from "@/utils/reportExport";
import { cn } from "@/lib/cn";

type ReportExportBarProps = {
  payload: ReportExportPayload | null;
  filename: string;
  className?: string;
};

export function ReportExportBar({ payload, filename, className }: ReportExportBarProps) {
  if (!payload || payload.rows.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => exportReportToExcel(payload, filename)}
        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Excel
      </button>
      <button
        type="button"
        onClick={() => exportReportToPdf(payload)}
        className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-800 transition-colors hover:bg-rose-100"
      >
        <FileText className="h-3.5 w-3.5" />
        PDF
      </button>
    </div>
  );
}
