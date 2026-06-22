"use client";

import { CARD_SHADOW } from "@/components/ui/Card";
import { tableBodyStripedClassName, tableShellClassName } from "@/components/ui/tableStyles";
import { cn } from "@/lib/cn";
import type { AiToolOutput } from "@/types/ai.types";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const TOOL_LABELS: Record<string, string> = {
  "data.list_sources": "Sumber Data",
  "data.describe_source": "Deskripsi Data",
  "data.get_data": "Data Live",
  "finance.dashboard_summary": "Dashboard Keuangan",
  "finance.revenue_summary": "Ringkasan Pendapatan",
  "finance.expense_realization": "Realisasi Belanja",
  "finance.cashflow_summary": "Arus Kas",
  "hr.employee_summary": "Ringkasan SDM",
  "procurement.request_summary": "Ringkasan PR",
  "supply_chain.stock_critical": "Stok Kritis",
  "approval.my_pending_approvals": "Approval Pending",
  "report.executive_summary": "Ringkasan Eksekutif",
};

const COLUMN_LABELS: Record<string, string> = {
  key: "Kunci",
  label: "Label",
  description: "Deskripsi",
  kode: "Kode",
  nama: "Nama",
  pagu: "Pagu",
  realisasi: "Realisasi",
  serap_pct: "% Serap",
  status: "Status",
  masuk: "Masuk",
  keluar: "Keluar",
  bulan: "Bulan",
  akun: "Akun",
  id: "ID",
  tahun: "Tahun",
  pegawai: "Pegawai",
  mulai: "Mulai",
  selesai: "Selesai",
  pengaju: "Pengaju",
  tanggal: "Tanggal",
  unit: "Unit",
  jabatan: "Jabatan",
  amount: "Nilai",
  share: "Porsi",
  coa: "COA",
  pct: "% Pagu",
  code: "Kode Item",
  name: "Nama Item",
  stock: "Stok",
  min: "Stok Min.",
  doc: "Dokumen",
  type: "Jenis",
  dept: "Departemen",
  count: "Jumlah",
  open: "Terbuka",
  approved: "Disetujui",
  area: "Area",
  note: "Catatan",
};

type AiResultCardProps = {
  toolName: string;
  output: AiToolOutput;
  className?: string;
  defaultExpanded?: boolean;
};

export function AiResultCard({
  toolName,
  output,
  className,
  defaultExpanded = false,
}: AiResultCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (output.error) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800",
          className
        )}
      >
        {output.message ?? "Data tidak tersedia."}
      </div>
    );
  }

  const title = TOOL_LABELS[toolName] ?? toolName;
  const hasDetails =
    (output.metrics && output.metrics.length > 0) ||
    (output.items && output.items.length > 0);

  if (!hasDetails) {
    return null;
  }

  const itemColumns =
    output.items && output.items.length > 0
      ? Object.keys(output.items[0])
      : [];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-sq-border bg-white dark:border-slate-700 dark:bg-slate-800",
        CARD_SHADOW,
        className
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-sq-bg/60 dark:hover:bg-slate-900/40"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sq-teal">
            Data Pendukung
          </p>
          <p className="text-sm font-medium text-sq-dark dark:text-slate-100">{title}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-sq-slate transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-sq-border px-4 pb-4 pt-3 dark:border-slate-700">
          {output.metrics && output.metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {output.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl bg-sq-bg px-3 py-2 dark:bg-slate-900"
                >
                  <p className="text-[11px] text-sq-slate">{m.label}</p>
                  <p className="text-sm font-semibold text-sq-navy dark:text-slate-100">
                    {m.value}
                  </p>
                  {m.change && (
                    <p className="text-[10px] text-sq-teal">{m.change}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {output.items && output.items.length > 0 && (
            <div className={tableShellClassName}>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sq-border dark:border-slate-700">
                    {itemColumns.map((key) => (
                      <th
                        key={key}
                        className="pb-2 pr-3 font-semibold text-sq-slate"
                      >
                        {COLUMN_LABELS[key] ?? key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={tableBodyStripedClassName}>
                  {output.items.map((item, idx) => (
                    <tr key={idx}>
                      {itemColumns.map((key) => (
                        <td
                          key={key}
                          className="py-1.5 pr-3 font-medium text-sq-dark dark:text-slate-200"
                        >
                          {String(item[key] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
