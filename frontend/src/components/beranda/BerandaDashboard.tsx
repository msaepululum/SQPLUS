"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  useBudgetYearScope,
} from "@/components/finance/budget/BudgetYearScope";
import { BerandaFinanceOverview } from "@/components/beranda/BerandaFinanceOverview";
import { BerandaKpiRow } from "@/components/beranda/BerandaKpiRow";
import { BerandaModuleGrid } from "@/components/beranda/BerandaModuleGrid";
import { InsightAsset } from "@/components/beranda/InsightAsset";
import { InsightKeuangan } from "@/components/beranda/InsightKeuangan";
import { InsightPersonalia } from "@/components/beranda/InsightPersonalia";
import { InsightProcurement } from "@/components/beranda/InsightProcurement";
import { SorotanPimpinan } from "@/components/beranda/SorotanPimpinan";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { useBerandaData } from "@/hooks/useBerandaData";
import { buildBerandaHighlights, buildBerandaKpis } from "@/lib/berandaInsights";

function BerandaDashboardInner() {
  const { t } = useTranslation();
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const tahun = budgetYear?.tahun ?? null;
  const { data, loading, error, reload } = useBerandaData(budgetYearId, tahun);

  const kpis = useMemo(
    () =>
      buildBerandaKpis({
        finance: data.finance,
        hr: data.hr,
        supplyChain: data.supplyChain,
        procurement: data.procurement,
      }),
    [data]
  );

  const highlights = useMemo(
    () =>
      buildBerandaHighlights({
        finance: data.finance,
        revenue: data.revenue,
        hr: data.hr,
        procurement: data.procurement,
        supplyChain: data.supplyChain,
        cashBank: data.cashBank,
      }),
    [data]
  );

  return (
    <PageFrame
      title={t("beranda.title")}
      description={t("beranda.description")}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <BudgetYearScopeBar compact />
          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sq-border px-2.5 py-1.5 text-[11px] font-semibold text-sq-slate transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      }
    >
      <div className="mt-3 space-y-4">
        {error && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {error} Beberapa panel mungkin menampilkan data terbatas.
          </p>
        )}

        <BerandaKpiRow kpis={kpis} loading={loading} />

        <BerandaFinanceOverview data={data} loading={loading} tahun={tahun ?? undefined} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <InsightKeuangan data={data} loading={loading} />
          <InsightPersonalia data={data.hr} loading={loading} />
          <InsightProcurement
            data={data.procurement}
            loading={loading}
            tahun={tahun ?? undefined}
          />
          <InsightAsset data={data.supplyChain} loading={loading} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SorotanPimpinan highlights={highlights} loading={loading} />
          <BerandaModuleGrid />
        </div>
      </div>
    </PageFrame>
  );
}

export function BerandaDashboard() {
  return (
    <BudgetYearScopeProvider>
      <BudgetYearScopedContent>
        <BerandaDashboardInner />
      </BudgetYearScopedContent>
    </BudgetYearScopeProvider>
  );
}
