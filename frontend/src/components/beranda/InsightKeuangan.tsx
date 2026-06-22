"use client";

import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Wallet,
} from "lucide-react";
import {
  HorizontalMetricBars,
  InsightCardShell,
  LineChartDual,
  SectionLink,
  TrendText,
} from "@/components/beranda/BerandaCharts";
import type { BerandaDataBundle } from "@/hooks/useBerandaData";
import { formatReportRupiah } from "@/types/finance-reports";
import { formatDashboardAmount } from "@/types/cash-bank-dashboard";

type InsightKeuanganProps = {
  data: BerandaDataBundle;
  loading?: boolean;
};

function compactRupiah(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  return formatReportRupiah(value);
}

export function InsightKeuangan({ data, loading }: InsightKeuanganProps) {
  const { finance, revenue, cashBank } = data;
  const kpis = finance?.kpis;

  const trendMonths =
    revenue?.monthly_trend.map((m) => m.nama_bulan) ??
    cashBank?.trend.map((t) => t.month) ??
    [];

  const revenueSeries =
    revenue?.monthly_trend.map((m) => m.realisasi / 1_000_000_000) ?? [];

  const expenseSeries =
    cashBank?.trend.map((t) => t.keluar / 1_000_000_000) ??
    revenue?.monthly_trend.map((m) => m.rencana / 1_000_000_000) ??
    [];

  const chartMax = Math.max(...revenueSeries, ...expenseSeries, 1) * 1.15;

  const miniStats = [
    kpis && {
      label: "Target Pendapatan",
      value: compactRupiah(kpis.target_pendapatan),
      trend: `${kpis.capaian_pendapatan_pct.toFixed(1)}%`,
      dir: kpis.capaian_pendapatan_pct >= 90 ? ("up" as const) : ("down" as const),
    },
    kpis && {
      label: "Total Pagu",
      value: compactRupiah(kpis.total_pagu),
      trend: `${kpis.pct_serap.toFixed(1)}% serap`,
      dir: kpis.pct_serap <= 90 ? ("up" as const) : ("down" as const),
    },
    cashBank && {
      label: "Kas Masuk",
      value: formatDashboardAmount(cashBank.kpis.total_masuk, true),
      trend: `${cashBank.kpis.jumlah_transaksi} trx`,
      dir: "up" as const,
    },
    cashBank && {
      label: "Kas Keluar",
      value: formatDashboardAmount(cashBank.kpis.total_keluar, true),
      trend: `Net ${formatDashboardAmount(cashBank.kpis.saldo_netto, true)}`,
      dir: cashBank.kpis.saldo_netto >= 0 ? ("up" as const) : ("down" as const),
    },
  ].filter(Boolean) as { label: string; value: string; trend: string; dir: "up" | "down" }[];

  const belanjaRows = kpis
    ? [
        {
          label: "Realisasi Belanja",
          value: compactRupiah(kpis.total_realisasi),
          pct: Math.min(kpis.pct_serap, 100),
          color: "bg-blue-500",
        },
        {
          label: "Sisa Pagu",
          value: compactRupiah(Math.max(kpis.total_pagu - kpis.total_realisasi, 0)),
          pct: Math.min(
            kpis.total_pagu > 0
              ? ((kpis.total_pagu - kpis.total_realisasi) / kpis.total_pagu) * 100
              : 0,
            100
          ),
          color: "bg-emerald-500",
        },
      ]
    : [];

  return (
    <InsightCardShell
      icon={<BarChart3 className="h-4 w-4 text-emerald-600" strokeWidth={2} />}
      iconBg="bg-emerald-50"
      title="Insight Keuangan"
      href="/finance"
    >
      {loading && !finance ? (
        <div className="flex flex-1 items-center justify-center gap-2 py-8 text-sm text-sq-slate">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat data keuangan...
        </div>
      ) : (
        <>
          {trendMonths.length > 0 && revenueSeries.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium text-sq-slate">
                Tren Pendapatan & Arus Kas Keluar (Miliar Rp)
              </p>
              <LineChartDual
                months={trendMonths}
                seriesA={revenueSeries}
                seriesB={expenseSeries}
                labelA="Pendapatan"
                labelB="Keluar / Rencana"
                colorA="#22C55E"
                colorB="#3B82F6"
                max={chartMax}
              />
            </div>
          )}

          {miniStats.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {miniStats.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-sq-border bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <p className="text-[10px] text-sq-slate">{m.label}</p>
                  <p className="text-xs font-bold text-sq-dark dark:text-white">{m.value}</p>
                  <TrendText value={m.trend} dir={m.dir} />
                </div>
              ))}
            </div>
          )}

          {belanjaRows.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium text-sq-slate">Serapan Anggaran</p>
              <HorizontalMetricBars rows={belanjaRows} />
            </div>
          )}

          {finance?.categories && finance.categories.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium text-sq-slate">Laporan Keuangan</p>
              <div className="grid grid-cols-2 gap-1.5">
                {finance.categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={cat.href}
                    className="rounded-lg border border-sq-border px-2 py-1.5 transition hover:border-sq-blue/40 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-blue-500/10"
                  >
                    <p className="text-[10px] text-sq-slate">{cat.label}</p>
                    <p className="text-xs font-bold text-sq-dark dark:text-white">
                      {cat.highlight}
                      {cat.highlight_unit === "%" ? "%" : cat.highlight_unit === "Rp" ? "" : ` ${cat.highlight_unit}`}
                    </p>
                    <p className="text-[10px] text-sq-slate">{cat.highlight_label}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {kpis && (
            <div className="mt-auto flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/80 px-3 py-2.5 dark:border-emerald-900/30 dark:bg-emerald-500/10">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
              <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                {kpis.pct_serap <= 95
                  ? `Realisasi anggaran ${kpis.pct_serap.toFixed(1)}% — kondisi terkendali.`
                  : `Serapan anggaran ${kpis.pct_serap.toFixed(1)}% — perhatikan sisa pagu.`}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-center">
            <SectionLink href="/finance/revenue">
              Pendapatan <ChevronRight className="inline h-3 w-3" />
            </SectionLink>
            <SectionLink href="/finance/cash-bank">
              Kas & Bank <ChevronRight className="inline h-3 w-3" />
            </SectionLink>
            <SectionLink href="/finance/reports">
              <Wallet className="mr-0.5 inline h-3 w-3" />
              Laporan <ChevronRight className="inline h-3 w-3" />
            </SectionLink>
          </div>
        </>
      )}
    </InsightCardShell>
  );
}
