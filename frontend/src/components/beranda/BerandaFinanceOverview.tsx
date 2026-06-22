"use client";

import Link from "next/link";
import { BarChart3, Loader2, RefreshCw } from "lucide-react";
import {
  DonutChart,
  LineChartDual,
  ProgressBar,
} from "@/components/beranda/BerandaCharts";
import type { BerandaDataBundle } from "@/hooks/useBerandaData";
import { formatReportRupiah } from "@/types/finance-reports";
import { REVENUE_CATEGORY_CHART_COLORS } from "@/types/revenue-dashboard";

type BerandaFinanceOverviewProps = {
  data: BerandaDataBundle;
  loading?: boolean;
  tahun?: number;
};

function compactRupiah(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} M`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} jt`;
  return formatReportRupiah(value);
}

export function BerandaFinanceOverview({ data, loading, tahun }: BerandaFinanceOverviewProps) {
  const { finance, revenue, cashBank } = data;
  const kpis = finance?.kpis;

  const revenueCategories =
    revenue?.categories
      .filter((c) => c.realisasi_amount > 0)
      .slice(0, 6)
      .map((c, i) => ({
        label: c.label,
        pct:
          revenue.summary.total_realisasi > 0
            ? (c.realisasi_amount / revenue.summary.total_realisasi) * 100
            : 0,
        color: REVENUE_CATEGORY_CHART_COLORS[i % REVENUE_CATEGORY_CHART_COLORS.length],
      })) ?? [];

  const cashTrendMonths = cashBank?.trend.map((t) => t.month) ?? [];
  const cashMasuk = cashBank?.trend.map((t) => t.masuk / 1_000_000_000) ?? [];
  const cashKeluar = cashBank?.trend.map((t) => t.keluar / 1_000_000_000) ?? [];
  const cashMax = Math.max(...cashMasuk, ...cashKeluar, 0.1) * 1.15;

  return (
    <div className="rounded-xl border border-sq-border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sq-border px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <BarChart3 className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-sq-dark dark:text-white">
              Ringkasan Eksekutif {tahun ? tahun : ""}
            </h3>
            <p className="text-[10px] text-sq-slate">
              Pendapatan, anggaran, arus kas, dan komposisi layanan
            </p>
          </div>
        </div>
        <Link
          href="/finance/executive-insight"
          className="text-[11px] font-semibold text-sq-blue hover:underline"
        >
          Detail Executive Insight →
        </Link>
      </div>

      {loading && !finance ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-sq-slate">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat ringkasan eksekutif...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-12">
          {/* Budget serapan */}
          <div className="xl:col-span-3">
            <p className="text-[11px] font-medium text-sq-slate">Posisi Anggaran</p>
            {kpis ? (
              <div className="mt-2 space-y-3">
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-sq-slate">Pagu</span>
                    <span className="font-bold">{compactRupiah(kpis.total_pagu)}</span>
                  </div>
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-[10px]">
                      <span>Realisasi {kpis.pct_serap.toFixed(1)}%</span>
                      <span>{compactRupiah(kpis.total_realisasi)}</span>
                    </div>
                    <ProgressBar value={kpis.pct_serap} color="bg-blue-500" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span>Capaian Pendapatan</span>
                    <span>{kpis.capaian_pendapatan_pct.toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={Math.min(kpis.capaian_pendapatan_pct, 100)} color="bg-emerald-500" />
                  <p className="mt-1 text-[10px] text-sq-slate">
                    {compactRupiah(kpis.total_pendapatan)} / {compactRupiah(kpis.target_pendapatan)}
                  </p>
                </div>
                <Link
                  href="/finance/reports"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sq-blue hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  Laporan lengkap
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-xs text-sq-slate">Data anggaran tidak tersedia</p>
            )}
          </div>

          {/* Cash flow trend */}
          <div className="xl:col-span-5">
            <p className="text-[11px] font-medium text-sq-slate">
              Arus Kas Masuk vs Keluar (Miliar Rp)
            </p>
            {cashTrendMonths.length > 0 ? (
              <LineChartDual
                months={cashTrendMonths}
                seriesA={cashMasuk}
                seriesB={cashKeluar}
                labelA="Masuk"
                labelB="Keluar"
                colorA="#14B8A6"
                colorB="#EF4444"
                max={cashMax}
              />
            ) : (
              <p className="mt-4 text-xs text-sq-slate">Data arus kas belum tersedia</p>
            )}
            {cashBank && (
              <p className="mt-1 text-[10px] text-sq-slate">
                Saldo netto periode: {compactRupiah(cashBank.kpis.saldo_netto)} ·{" "}
                {cashBank.kpis.jumlah_transaksi} transaksi
              </p>
            )}
          </div>

          {/* Revenue composition */}
          <div className="xl:col-span-4">
            <p className="text-[11px] font-medium text-sq-slate">Komposisi Pendapatan</p>
            {revenueCategories.length > 0 ? (
              <div className="mt-2 flex gap-3">
                <DonutChart
                  segments={revenueCategories}
                  centerLabel={compactRupiah(revenue?.summary.total_realisasi ?? 0)}
                  centerSub="Realisasi"
                  size={100}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  {revenueCategories.map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-[10px]">
                      <span className="flex min-w-0 items-center gap-1.5 text-sq-slate">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                        <span className="truncate">{s.label}</span>
                      </span>
                      <span className="ml-1 shrink-0 font-semibold">{s.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-sq-slate">Belum ada realisasi pendapatan</p>
            )}
            <Link
              href="/finance/revenue"
              className="mt-2 inline-block text-[11px] font-semibold text-sq-blue hover:underline"
            >
              Detail pendapatan →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
