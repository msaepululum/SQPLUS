"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  KasBankCashInDonut,
  KasBankExpenseBar,
  KasBankTrendChart,
} from "@/components/finance/dashboard/kas-bank/KasBankCharts";
import { KasBankFiltersBar } from "@/components/finance/dashboard/kas-bank/KasBankFilters";
import { KasBankFlowTable } from "@/components/finance/dashboard/kas-bank/KasBankFlowTable";
import { KasBankKpis } from "@/components/finance/dashboard/kas-bank/KasBankKpis";
import {
  KasBankAccountSummary,
  KasBankRekonStatus,
  KasBankSourceInfo,
} from "@/components/finance/dashboard/kas-bank/KasBankMiddleSection";
import {
  DEFAULT_KAS_BANK_FILTERS,
  hasActiveKasBankFilters,
  type KasBankFilters,
} from "@/constants/kas-bank-data";
import { fetchCashBankDashboard } from "@/services/cashBankDashboardService";
import type { CashBankDashboardData } from "@/types/cash-bank-dashboard";
import { Loader2 } from "lucide-react";

const BULAN_TO_NUM: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, Mei: 5, Jun: 6,
  Jul: 7, Agu: 8, Sep: 9, Okt: 10, Nov: 11, Des: 12,
};

export function KasBankDashboard() {
  const [filters, setFilters] = useState<KasBankFilters>(DEFAULT_KAS_BANK_FILTERS);
  const [data, setData] = useState<CashBankDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBulan = useMemo(() => {
    if (filters.bulan === "all") return undefined;
    return BULAN_TO_NUM[filters.bulan];
  }, [filters.bulan]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCashBankDashboard(Number(filters.tahun), apiBulan);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dashboard kas.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters.tahun, apiBulan]);

  useEffect(() => {
    void load();
  }, [load]);

  const trendData = useMemo(() => {
    if (!data) return [];
    const months = parseInt(filters.periodeTren, 10) || 12;
    return data.trend.slice(-months);
  }, [data, filters.periodeTren]);

  return (
    <div className="space-y-2.5">
      <KasBankFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_KAS_BANK_FILTERS)}
      />

      {data && <KasBankSourceInfo data={data} />}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {hasActiveKasBankFilters(filters) && (
        <p className="rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-1.5 text-[11px] text-teal-800">
          Filter aktif — data BKU (SIMARTDB) &amp; ACC2026 sesuai pilihan.
        </p>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat dashboard dari SIMARTDB &amp; ACC2026...
        </div>
      ) : data ? (
        <>
          <KasBankKpis kpis={data.kpis} loading={loading} />

          <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-3">
            <KasBankTrendChart trend={trendData} periodeLabel={filters.periodeTren} />
            <KasBankCashInDonut composition={data.masuk_composition} total={data.kpis.total_masuk} />
            <KasBankExpenseBar composition={data.keluar_composition} />
          </div>

          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            <KasBankAccountSummary accounts={data.accounts} />
            <KasBankRekonStatus kpis={data.kpis} />
          </div>

          <KasBankFlowTable transactions={data.recent_transactions} />
        </>
      ) : null}
    </div>
  );
}
