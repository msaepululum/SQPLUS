"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import type { RevenueCategoryId } from "@/constants/revenue-categories";
import { fetchRevenueAnalysis } from "@/services/revenueCollectService";
import { revenuePctClass, type RevenueAnalysisRow } from "@/types/revenue-collect";
import { REVENUE_MONTH_NAMES } from "@/types/revenue-plan";
import { formatRevenueTargetAmount } from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2 } from "lucide-react";

type RevenueAnalisisPerKategoriCrudProps = {
  activeCategory?: RevenueCategoryId | "";
};

function KpiChip({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "plan" | "muted";
}) {
  const toneClass = {
    default: "text-slate-700",
    plan: "text-[#0d6e63]",
    muted: "text-slate-500",
  };

  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap text-[10px]">
      <span className="text-slate-400">{label}</span>
      <span className={cn("font-semibold tabular-nums", toneClass[tone])}>{value}</span>
    </span>
  );
}

export function RevenueAnalisisPerKategoriCrud({
  activeCategory = "",
}: RevenueAnalisisPerKategoriCrudProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<RevenueAnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState("");
  const [summary, setSummary] = useState<{
    total_target: number;
    total_rencana: number;
    total_realisasi: number;
    capaian_rencana_pct: number | null;
    capaian_target_pct: number | null;
  } | null>(null);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRevenueAnalysis(
        budgetYearId,
        bulan ? Number(bulan) : undefined
      );
      setRows(result.rows);
      setSummary(result.summary);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const displayRows = useMemo(() => {
    if (!activeCategory) return rows;
    return rows.filter((r) => r.category_id === activeCategory);
  }, [rows, activeCategory]);

  const periodeLabel = bulan
    ? REVENUE_MONTH_NAMES[Number(bulan)]
    : "YTD";

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat analisis...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Analisis pendapatan dikunci per tahun anggaran."
        className="mt-2"
      />
    );
  }

  return (
    <div className="mt-2">
      <div
        className={cardClassName({
          variant: "default",
          className: cn("!p-0", tableGridShellClassName),
        })}
      >
        <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-800">Per Kategori BLU</h3>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-slate-600">
              {budgetYear.tahun} · {periodeLabel}
            </span>
            <ToolbarFilter
              label="Periode"
              value={bulan}
              onChange={setBulan}
              className="sm:ml-1"
            >
              <option value="">Tahunan (YTD)</option>
              {REVENUE_MONTH_NAMES.slice(1).map((nama, idx) => (
                <option key={nama} value={String(idx + 1)}>
                  {nama}
                </option>
              ))}
            </ToolbarFilter>
          </div>

          {summary && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2 sm:border-0 sm:pt-0">
              <KpiChip
                label="Target"
                value={formatRevenueTargetAmount(summary.total_target)}
                tone="muted"
              />
              <KpiChip
                label="Rencana"
                value={formatRevenueTargetAmount(summary.total_rencana)}
                tone="muted"
              />
              <KpiChip
                label="Realisasi"
                value={formatRevenueTargetAmount(summary.total_realisasi)}
                tone="plan"
              />
              <KpiChip
                label="Capaian"
                value={
                  summary.capaian_rencana_pct != null
                    ? `${summary.capaian_rencana_pct.toFixed(1).replace(".", ",")}%`
                    : "—"
                }
              />
            </div>
          )}
        </div>

        <Table embedded>
          <THead>
            <TR>
              <TH className="w-11">Kode</TH>
              <TH>Kategori</TH>
              <TH className="text-right">Target</TH>
              <TH className="text-right">Rencana</TH>
              <TH className="text-right">Realisasi</TH>
              <TH className="text-right">Selisih</TH>
              <TH className="w-20 text-right">% Rencana</TH>
              <TH className="w-20 text-right">% Target</TH>
            </TR>
          </THead>
          <TBody>
            {displayRows.map((row) => (
              <TR key={row.category_id}>
                <TD className="font-mono text-[10px] text-slate-500">{row.kode}</TD>
                <TD className="max-w-[10rem] truncate text-[11px] font-medium text-slate-700">
                  {row.label}
                </TD>
                <TD className="text-right tabular-nums text-[11px] text-slate-600">
                  {formatRevenueTargetAmount(row.target_amount)}
                </TD>
                <TD className="text-right tabular-nums text-[11px] text-slate-600">
                  {formatRevenueTargetAmount(row.rencana_amount)}
                </TD>
                <TD className="text-right tabular-nums text-[11px] font-medium text-[#0d6e63]">
                  {formatRevenueTargetAmount(row.realisasi_amount)}
                </TD>
                <TD
                  className={cn(
                    "text-right tabular-nums text-[11px]",
                    row.selisih_rencana >= 0 ? "text-emerald-700" : "text-amber-700"
                  )}
                >
                  {formatRevenueTargetAmount(row.selisih_rencana)}
                </TD>
                <TD
                  className={cn(
                    "text-right tabular-nums text-[11px]",
                    revenuePctClass(row.capaian_rencana_pct)
                  )}
                >
                  {row.capaian_rencana_pct != null
                    ? `${row.capaian_rencana_pct.toFixed(1).replace(".", ",")}%`
                    : "—"}
                </TD>
                <TD
                  className={cn(
                    "text-right tabular-nums text-[11px]",
                    revenuePctClass(row.capaian_target_pct)
                  )}
                >
                  {row.capaian_target_pct != null
                    ? `${row.capaian_target_pct.toFixed(1).replace(".", ",")}%`
                    : "—"}
                </TD>
              </TR>
            ))}
            {summary && (
              <TR className="bg-slate-50/80 font-semibold">
                <TD colSpan={2} className="text-[11px]">
                  Total
                </TD>
                <TD className="text-right tabular-nums text-[11px]">
                  {formatRevenueTargetAmount(summary.total_target)}
                </TD>
                <TD className="text-right tabular-nums text-[11px]">
                  {formatRevenueTargetAmount(summary.total_rencana)}
                </TD>
                <TD className="text-right tabular-nums text-[11px] text-[#0d6e63]">
                  {formatRevenueTargetAmount(summary.total_realisasi)}
                </TD>
                <TD className="text-right tabular-nums text-[11px]">
                  {formatRevenueTargetAmount(summary.total_realisasi - summary.total_rencana)}
                </TD>
                <TD
                  className={cn(
                    "text-right tabular-nums text-[11px]",
                    revenuePctClass(summary.capaian_rencana_pct)
                  )}
                >
                  {summary.capaian_rencana_pct != null
                    ? `${summary.capaian_rencana_pct.toFixed(1).replace(".", ",")}%`
                    : "—"}
                </TD>
                <TD
                  className={cn(
                    "text-right tabular-nums text-[11px]",
                    revenuePctClass(summary.capaian_target_pct)
                  )}
                >
                  {summary.capaian_target_pct != null
                    ? `${summary.capaian_target_pct.toFixed(1).replace(".", ",")}%`
                    : "—"}
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
