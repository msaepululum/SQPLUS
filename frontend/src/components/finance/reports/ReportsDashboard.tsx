"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  BudgetYearToolbarFilter,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { cardClassName } from "@/components/ui/Card";
import { REPORTS_SUB_NAV } from "@/constants/reports-navigation";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { fetchFinanceReportDashboard } from "@/services/financeReportService";
import { formatReportRupiah } from "@/types/finance-reports";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  Banknote,
  BarChart3,
  FileText,
  Loader2,
  PieChart,
  TrendingUp,
  Wallet,
} from "lucide-react";

function ReportsDashboardInner() {
  const { t } = useTranslation();
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchFinanceReportDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = REPORTS_SUB_NAV.filter((item) => item.href !== "/finance/reports");

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFinanceReportDashboard(budgetYearId);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat dashboard laporan");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    if (!yearLoading && budgetYearId) void load();
  }, [yearLoading, budgetYearId, load]);

  const kpis = data?.kpis;

  return (
    <PageFrame
      title="Dashboard Laporan"
      description="Pusat laporan keuangan dan operasional — data real-time dari anggaran, pendapatan, kas, dan hutang/piutang"
    >
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <BudgetYearScopeBar compact />
        <BudgetYearToolbarFilter />
      </div>

      {loading || yearLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <Card variant="dashed" className="py-8 text-center text-sm text-red-600">
          {error}
        </Card>
      ) : (
        <>
          {kpis && (
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {[
                { label: "Total Pagu", value: formatReportRupiah(kpis.total_pagu), icon: Wallet, bg: "bg-blue-600" },
                { label: "Realisasi Belanja", value: formatReportRupiah(kpis.total_realisasi), icon: TrendingUp, bg: "bg-emerald-600" },
                { label: "Daya Serap", value: `${kpis.pct_serap.toFixed(1).replace(".", ",")}%`, icon: PieChart, bg: "bg-sky-600" },
                { label: "Pendapatan", value: formatReportRupiah(kpis.total_pendapatan), icon: BarChart3, bg: "bg-teal-600" },
                { label: "Saldo Kas & Bank", value: formatReportRupiah(kpis.saldo_kas_bank), icon: Banknote, bg: "bg-violet-600" },
                { label: "Hutang / Piutang", value: `${formatReportRupiah(kpis.total_hutang)} / ${formatReportRupiah(kpis.total_piutang)}`, icon: FileText, bg: "bg-amber-500" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
                    <div className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-md text-white ${item.bg}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-[10px] font-medium text-slate-500">{item.label}</p>
                    <p className="mt-0.5 text-xs font-bold tabular-nums text-slate-900">{item.value}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(data?.categories ?? categories.map((c) => ({
              slug: c.href.split("/").pop() ?? "",
              label: t(c.labelKey),
              href: c.href,
              count: 0,
              highlight: 0,
              highlight_label: "",
              highlight_unit: "",
            }))).map((item) => (
              <Link key={item.href} href={item.href}>
                <Card variant="default" className="h-full transition-shadow hover:shadow-md">
                  <CardTitle className="text-sm">{item.label}</CardTitle>
                  <CardDescription className="mt-1.5 text-xs">
                    {item.count} jenis laporan tersedia
                  </CardDescription>
                  {item.highlight_label && (
                    <p className="mt-2 text-xs text-slate-600">
                      <span className="font-semibold text-[#1e40af]">
                        {item.highlight_unit === "Rp"
                          ? formatReportRupiah(item.highlight)
                          : item.highlight_unit === "%"
                            ? `${item.highlight}%`
                            : item.highlight}
                      </span>{" "}
                      {item.highlight_label}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>

          {budgetYear && (
            <Card variant="dashed" className="mt-3 px-4 py-3">
              <p className="text-xs text-slate-500">
                Data laporan tahun <span className="font-semibold text-slate-700">{budgetYear.tahun}</span>
                {data?.updated_at && (
                  <> · diperbarui {new Date(data.updated_at).toLocaleString("id-ID")}</>
                )}
              </p>
            </Card>
          )}
        </>
      )}
    </PageFrame>
  );
}

export function ReportsDashboard() {
  return (
    <BudgetYearScopeProvider>
      <ReportsDashboardInner />
    </BudgetYearScopeProvider>
  );
}
