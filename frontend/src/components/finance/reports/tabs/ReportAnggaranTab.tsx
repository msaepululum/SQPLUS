"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { ReportDataShell } from "@/components/finance/reports/shared/ReportDataShell";
import { ReportExportBar } from "@/components/finance/reports/shared/ReportExportBar";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { fetchBudgetMonitoringPagu } from "@/services/budgetMonitoringPaguService";
import {
  formatMonitoringAmount,
  formatMonitoringPct,
  monitoringPctClass,
  monitoringStatusVariant,
  MONITORING_PERIODE_OPTIONS,
  type BudgetMonitoringKpi,
  type BudgetMonitoringRow,
} from "@/types/budget-monitoring-pagu";
import {
  exportReportToExcel,
  formatReportAmount,
  formatReportPct,
  type ReportExportColumn,
} from "@/utils/reportExport";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Banknote, PieChart, Target, TrendingUp, Wallet } from "lucide-react";

export type ReportAnggaranVariant = "pagu-anggaran" | "realisasi-anggaran" | "daya-serap";

const VARIANT_CONFIG: Record<
  ReportAnggaranVariant,
  { title: string; view: "monitoring" | "per_akun" | "per_unit"; sortBy?: "serap_pct" | "realisasi" }
> = {
  "pagu-anggaran": { title: "Laporan Pagu Anggaran", view: "monitoring" },
  "realisasi-anggaran": { title: "Laporan Realisasi Anggaran", view: "per_unit", sortBy: "realisasi" },
  "daya-serap": { title: "Laporan Daya Serap Anggaran", view: "monitoring", sortBy: "serap_pct" },
};

const KPI_ITEMS: { key: keyof BudgetMonitoringKpi; label: string; icon: typeof Wallet }[] = [
  { key: "total_pagu", label: "Total Pagu", icon: Wallet },
  { key: "total_realisasi", label: "Total Realisasi", icon: TrendingUp },
  { key: "sisa_pagu", label: "Sisa Pagu", icon: Banknote },
  { key: "pct_realisasi", label: "% Realisasi", icon: PieChart },
  { key: "sisa_efektif", label: "Sisa Efektif", icon: Target },
];

const EXPORT_COLUMNS: ReportExportColumn[] = [
  { key: "kode", label: "Kode" },
  { key: "nama", label: "Uraian" },
  { key: "nama_satuan_ptk", label: "Unit PTK" },
  { key: "pagu", label: "Pagu", align: "right", format: (v) => formatReportAmount(Number(v)) },
  { key: "realisasi", label: "Realisasi", align: "right", format: (v) => formatReportAmount(Number(v)) },
  { key: "sisa_pagu", label: "Sisa Pagu", align: "right", format: (v) => formatReportAmount(Number(v)) },
  { key: "serap_pct", label: "Daya Serap", align: "right", format: (v) => formatReportPct(Number(v)) },
  { key: "status_label", label: "Status" },
];

export function ReportAnggaranTab({ variant }: { variant: ReportAnggaranVariant }) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const cfg = VARIANT_CONFIG[variant];
  const [bulanTo, setBulanTo] = useState("12");
  const [rows, setRows] = useState<BudgetMonitoringRow[]>([]);
  const [kpi, setKpi] = useState<BudgetMonitoringKpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBudgetMonitoringPagu({
        budget_year_id: budgetYearId,
        view: cfg.view,
        bulan_from: 1,
        bulan_to: Number(bulanTo) || 12,
      });
      let data = result.rows;
      if (cfg.sortBy === "serap_pct") {
        data = [...data].sort((a, b) => b.serap_pct - a.serap_pct);
      } else if (cfg.sortBy === "realisasi") {
        data = [...data].sort((a, b) => b.realisasi - a.realisasi);
      }
      setRows(data);
      setKpi(result.kpi);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulanTo, cfg.view, cfg.sortBy]);

  useEffect(() => {
    if (!yearLoading && budgetYearId) void load();
  }, [yearLoading, budgetYearId, load]);

  const exportPayload = useMemo(() => {
    if (!budgetYear) return null;
    return {
      title: cfg.title,
      subtitle: `Tahun ${budgetYear.tahun} · s.d. bulan ke-${bulanTo}`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: EXPORT_COLUMNS,
      rows: rows as unknown as Record<string, unknown>[],
      footerRows: kpi
        ? [
            {
              kode: "",
              nama: "TOTAL",
              nama_satuan_ptk: "",
              pagu: kpi.total_pagu,
              realisasi: kpi.total_realisasi,
              sisa_pagu: kpi.sisa_pagu,
              serap_pct: kpi.pct_realisasi,
              status_label: "",
            },
          ]
        : undefined,
    };
  }, [rows, kpi, budgetYear, cfg.title, bulanTo]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <ToolbarFilter label="Periode s.d." value={bulanTo} onChange={setBulanTo}>
          {MONITORING_PERIODE_OPTIONS.map((o) => (
            <option key={o.value} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </ToolbarFilter>
        <ReportExportBar payload={exportPayload} filename={`laporan-${variant}-${budgetYear?.tahun ?? "data"}`} />
      </div>

      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        {kpi && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {KPI_ITEMS.map((item) => {
              const Icon = item.icon;
              const val = kpi[item.key];
              return (
                <div key={item.key} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
                  <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-[#1e40af] text-white">
                    <Icon className="h-3 w-3" />
                  </div>
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs font-bold tabular-nums",
                      item.key === "pct_realisasi" ? monitoringPctClass(val) : "text-slate-900"
                    )}
                  >
                    {item.key === "pct_realisasi"
                      ? formatMonitoringPct(val)
                      : `Rp ${formatMonitoringAmount(val)}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>Kode</TH>
                <TH>Uraian</TH>
                <TH>Unit PTK</TH>
                <TH className="text-right">Pagu</TH>
                <TH className="text-right">Realisasi</TH>
                <TH className="text-right">Sisa</TH>
                <TH className="text-right">Serap</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.key}>
                  <TD className="font-mono text-xs">{row.kode}</TD>
                  <TD className="max-w-[200px] truncate text-xs">{row.nama}</TD>
                  <TD className="text-xs text-slate-600">{row.nama_satuan_ptk}</TD>
                  <TD className="text-right tabular-nums text-xs">
                    Rp {formatMonitoringAmount(row.pagu)}
                  </TD>
                  <TD className="text-right tabular-nums text-xs">
                    Rp {formatMonitoringAmount(row.realisasi)}
                  </TD>
                  <TD className="text-right tabular-nums text-xs">
                    Rp {formatMonitoringAmount(row.sisa_pagu)}
                  </TD>
                  <TD className={cn("text-right tabular-nums text-xs", monitoringPctClass(row.serap_pct))}>
                    {formatMonitoringPct(row.serap_pct)}
                  </TD>
                  <TD>
                    <Badge variant={monitoringStatusVariant(row.status)} className="text-[10px]">
                      {row.status_label}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </ReportDataShell>
    </div>
  );
}
