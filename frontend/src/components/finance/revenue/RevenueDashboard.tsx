"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  BudgetYearToolbarFilter,
  useBudgetYearScope,
} from "@/components/finance/budget/BudgetYearScope";
import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import {
  RevenueCapaianDonut,
  RevenueCategoryBarChart,
  RevenueCategoryDonutChart,
  RevenueMonthlyBarChart,
} from "@/components/finance/revenue/RevenueDashboardCharts";
import { RevenueCategoryFilter } from "@/components/finance/revenue/RevenueCategoryFilter";
import { PageFrame } from "@/components/layout/PageFrame";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { RevenueCategoryId } from "@/constants/revenue-categories";
import { fetchRevenueDashboard } from "@/services/revenueCollectService";
import { revenuePctClass } from "@/types/revenue-collect";
import type { RevenueDashboardData } from "@/types/revenue-dashboard";
import { REVENUE_MONTH_NAMES } from "@/types/revenue-plan";
import { formatRevenueTargetAmount } from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2, RefreshCw, Target, TrendingUp, Wallet } from "lucide-react";

function formatPct(value: number | null): string {
  if (value == null) return "—";
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function KpiTile({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  accent,
  donut,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Wallet;
  iconBg: string;
  accent?: string;
  donut?: React.ReactNode;
}) {
  return (
    <div
      className={cardClassName({
        variant: "default",
        className: cn("!p-2.5", accent),
      })}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-md text-white", iconBg)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        {donut}
      </div>
      <p className="mt-1.5 text-[10px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-slate-400">{sub}</p>}
    </div>
  );
}

function RevenueDashboardInner() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [bulan, setBulan] = useState("");
  const [category, setCategory] = useState<RevenueCategoryId | "">("");
  const [data, setData] = useState<RevenueDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRevenueDashboard(budgetYearId, {
        bulan: bulan ? Number(bulan) : undefined,
        category_id: category || undefined,
      });
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan, category]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const periodeLabel = useMemo(() => {
    if (!budgetYear) return "";
    if (bulan) return `${REVENUE_MONTH_NAMES[Number(bulan)]} ${budgetYear.tahun}`;
    return `YTD ${budgetYear.tahun}`;
  }, [budgetYear, bulan]);

  const resetFilters = () => {
    setBulan("");
    setCategory("");
  };

  const hasFilters = Boolean(bulan || category);

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat dashboard...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Dashboard pendapatan membutuhkan tahun anggaran aktif."
        className="mt-2"
      />
    );
  }

  const summary = data?.summary;
  const categories = data?.categories ?? [];
  const monthlyTrend = data?.monthly_trend ?? [];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-slate-200/80 bg-gradient-to-r from-slate-50/80 to-white px-2.5 py-2 shadow-sm">
        <BudgetYearToolbarFilter />
        <ToolbarFilter label="Periode" value={bulan} onChange={setBulan}>
          <option value="">Tahunan (YTD)</option>
          {REVENUE_MONTH_NAMES.slice(1).map((nama, idx) => (
            <option key={nama} value={String(idx + 1)}>
              {nama}
            </option>
          ))}
        </ToolbarFilter>
        <RevenueCategoryFilter value={category} onChange={setCategory} />
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="mb-0.5 text-[10px] font-medium text-sky-600 hover:underline"
          >
            Reset
          </button>
        )}
        <button
          type="button"
          onClick={() => void loadData()}
          className="mb-0.5 ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <KpiTile
            label="Target"
            value={`Rp ${formatRevenueTargetAmount(summary.total_target)}`}
            icon={Target}
            iconBg="bg-slate-500"
          />
          <KpiTile
            label="Rencana"
            value={`Rp ${formatRevenueTargetAmount(summary.total_rencana)}`}
            icon={Wallet}
            iconBg="bg-sky-600"
          />
          <KpiTile
            label="Realisasi"
            value={`Rp ${formatRevenueTargetAmount(summary.total_realisasi)}`}
            sub={periodeLabel}
            icon={TrendingUp}
            iconBg="bg-[#0d6e63]"
            accent="ring-1 ring-teal-100/80"
          />
          <KpiTile
            label="Capaian Rencana"
            value={formatPct(summary.capaian_rencana_pct)}
            icon={TrendingUp}
            iconBg="bg-violet-600"
            donut={<RevenueCapaianDonut pct={summary.capaian_rencana_pct} />}
          />
          <KpiTile
            label="Selisih"
            value={`Rp ${formatRevenueTargetAmount(summary.total_selisih_rencana)}`}
            icon={Wallet}
            iconBg="bg-amber-500"
          />
        </div>
      )}

      <div className="grid gap-2 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RevenueMonthlyBarChart data={monthlyTrend} />
        </div>
        <div className="lg:col-span-5">
          <RevenueCategoryDonutChart categories={categories} />
        </div>
        <div className="lg:col-span-12">
          <RevenueCategoryBarChart categories={categories} />
        </div>
      </div>

      <div className={cardClassName({ variant: "default", className: cn("!p-0", tableGridShellClassName) })}>
        <div className="border-b border-slate-100 px-3 py-1.5">
          <h3 className="text-xs font-semibold text-slate-800">Detail per Kategori BLU</h3>
          <p className="text-[10px] text-slate-400">Tabel ringkasan — {periodeLabel}</p>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH className="w-11">Kode</TH>
              <TH>Kategori</TH>
              <TH className="text-right">Target</TH>
              <TH className="text-right">Rencana</TH>
              <TH className="text-right">Realisasi</TH>
              <TH className="w-16 text-right">% Rencana</TH>
              <TH className="w-16 text-right">% Target</TH>
            </TR>
          </THead>
          <TBody>
            {categories.map((row) => (
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
                    revenuePctClass(row.capaian_rencana_pct)
                  )}
                >
                  {formatPct(row.capaian_rencana_pct)}
                </TD>
                <TD
                  className={cn(
                    "text-right tabular-nums text-[11px]",
                    revenuePctClass(row.capaian_target_pct)
                  )}
                >
                  {formatPct(row.capaian_target_pct)}
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
                <TD
                  className={cn(
                    "text-right tabular-nums text-[11px]",
                    revenuePctClass(summary.capaian_rencana_pct)
                  )}
                >
                  {formatPct(summary.capaian_rencana_pct)}
                </TD>
                <TD
                  className={cn(
                    "text-right tabular-nums text-[11px]",
                    revenuePctClass(summary.capaian_target_pct)
                  )}
                >
                  {formatPct(summary.capaian_target_pct)}
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>

      {data?.updated_at && (
        <p className="text-center text-[10px] text-slate-400">
          Data realisasi terakhir diperbarui:{" "}
          {new Date(data.updated_at).toLocaleString("id-ID")}
        </p>
      )}
    </div>
  );
}

export function RevenueDashboard() {
  return (
    <BudgetYearScopeProvider>
      <PageFrame
        title="Dashboard Pendapatan"
        description="Ringkasan target, rencana, dan realisasi per 8 kategori pendapatan BLU."
      >
        <BudgetYearScopedContent>
          <RevenueDashboardInner />
        </BudgetYearScopedContent>
      </PageFrame>
    </BudgetYearScopeProvider>
  );
}
