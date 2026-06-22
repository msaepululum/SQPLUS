"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  useBudgetYearScope,
} from "@/components/finance/budget/BudgetYearScope";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchHpDashboard } from "@/services/hutangPiutangService";
import type { HpDashboardData } from "@/types/hutang-piutang";
import { formatHpAmount, hutangJenisLabel } from "@/types/hutang-piutang";
import { Loader2 } from "lucide-react";

function HutangPiutangDashboardInner() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [data, setData] = useState<HpDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      setData(await fetchHpDashboard(budgetYearId));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (yearLoading || (loading && !data)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat dashboard hutang & piutang...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Dashboard hutang & piutang dikunci per tahun anggaran."
      />
    );
  }

  if (!data) {
    return <EmptyState title="Gagal memuat data" description="Tidak dapat mengambil data dari ACC2026." />;
  }

  const kpis = [
    { label: "Total Hutang", value: formatHpAmount(data.kpis.total_hutang), icon: "📤", bg: "bg-red-500" },
    { label: "Total Piutang", value: formatHpAmount(data.kpis.total_piutang), icon: "📥", bg: "bg-emerald-600" },
    { label: "Net Posisi", value: formatHpAmount(data.kpis.net_posisi), icon: "⚖️", bg: "bg-blue-600" },
    { label: "Hutang Vendor", value: formatHpAmount(data.kpis.hutang_vendor), icon: "🏢", bg: "bg-orange-500" },
    { label: "Piutang BPJS", value: formatHpAmount(data.kpis.piutang_bpjs), icon: "🏥", bg: "bg-teal-600" },
    { label: "Piutang Tunai", value: formatHpAmount(data.kpis.piutang_tunai), icon: "💵", bg: "bg-violet-600" },
  ];

  const maxTrend = Math.max(...data.trend.flatMap((t) => [t.hutang, t.piutang]), 1);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <BudgetYearScopeBar compact />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <p className="mt-1.5 text-[10px] font-medium text-slate-500">{kpi.label}</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <h3 className="mb-2 text-xs font-semibold text-slate-700">Trend Bulanan {data.filters.tahun}</h3>
          <div className="space-y-1">
            {data.trend.filter((t) => t.hutang !== 0 || t.piutang !== 0).map((t) => (
              <div key={t.bulan} className="flex items-center gap-2 text-[10px]">
                <span className="w-6 shrink-0 text-slate-500">{t.month}</span>
                <div className="flex flex-1 gap-1">
                  <div
                    className="h-2 rounded bg-red-300"
                    style={{ width: `${Math.max(2, (t.hutang / maxTrend) * 40)}%` }}
                    title={`Hutang: ${formatHpAmount(t.hutang)}`}
                  />
                  <div
                    className="h-2 rounded bg-emerald-400"
                    style={{ width: `${Math.max(2, (t.piutang / maxTrend) * 40)}%` }}
                    title={`Piutang: ${formatHpAmount(t.piutang)}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            <span className="mr-2 inline-block h-2 w-3 rounded bg-red-300" /> Hutang
            <span className="ml-3 mr-2 inline-block h-2 w-3 rounded bg-emerald-400" /> Piutang
          </p>
        </div>

        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <h3 className="mb-2 text-xs font-semibold text-slate-700">Umur Piutang (Outstanding)</h3>
          <div className="space-y-1.5">
            {data.aging.map((b) => (
              <div key={b.key} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">{b.label}</span>
                <span className="font-semibold tabular-nums text-amber-700">{formatHpAmount(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <h3 className="mb-2 text-xs font-semibold text-slate-700">Komposisi Hutang</h3>
          {data.hutang_composition.map((c) => (
            <div key={c.jenis} className="flex justify-between py-1 text-[11px]">
              <span>{hutangJenisLabel(c.jenis)}</span>
              <span className="font-medium text-red-700">{formatHpAmount(c.saldo)}</span>
            </div>
          ))}
        </div>
        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <h3 className="mb-2 text-xs font-semibold text-slate-700">Komposisi Piutang</h3>
          {data.piutang_composition.map((c) => (
            <div key={c.jenis} className="flex justify-between py-1 text-[11px]">
              <span>{hutangJenisLabel(c.jenis)}</span>
              <span className="font-medium text-emerald-700">{formatHpAmount(c.saldo)}</span>
            </div>
          ))}
        </div>
      </div>

      <p className={cardClassName({ variant: "flat", className: "!p-2 text-[10px] text-slate-500" })}>
        Sumber data real: ACC2026 JURNAL_H/E — Hutang COA 2.1.01.03/04 · Piutang COA 1.1.02.01
      </p>
    </div>
  );
}

export function HutangPiutangDashboard() {
  return (
    <BudgetYearScopeProvider>
      <BudgetYearScopedContent>
        <HutangPiutangDashboardInner />
      </BudgetYearScopedContent>
    </BudgetYearScopeProvider>
  );
}
