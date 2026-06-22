"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ProgressBar, TrendText } from "@/components/beranda/BerandaCharts";
import type { BerandaKpi } from "@/lib/berandaInsights";
import { cn } from "@/lib/cn";

type BerandaKpiRowProps = {
  kpis: BerandaKpi[];
  loading?: boolean;
};

export function BerandaKpiRow({ kpis, loading }: BerandaKpiRowProps) {
  if (loading && kpis.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-sq-border bg-white py-8 text-sm text-sq-slate dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat ringkasan KPI...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group flex items-center gap-3 rounded-xl border border-sq-border bg-white p-3.5 shadow-sm transition hover:border-sq-blue/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition group-hover:scale-105",
                kpi.iconBg
              )}
            >
              <Icon className={cn("h-5 w-5", kpi.iconColor)} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-sq-slate">{kpi.label}</p>
              <p className="text-sm font-bold tabular-nums text-sq-dark group-hover:text-sq-blue dark:text-white">
                {kpi.value}
              </p>
              {kpi.subValue && (
                <p className="truncate text-[10px] text-sq-slate">{kpi.subValue}</p>
              )}
              {kpi.progress !== undefined && (
                <div className="mt-1.5">
                  <ProgressBar value={kpi.progress} />
                </div>
              )}
              {kpi.trend && kpi.trendDir && (
                <div className="mt-0.5">
                  <TrendText value={kpi.trend} dir={kpi.trendDir} />
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
