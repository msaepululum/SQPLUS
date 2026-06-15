import { BERANDA_KPIS } from "@/constants/beranda";
import { ProgressBar, TrendText } from "@/components/beranda/BerandaCharts";
import { cn } from "@/lib/cn";

export function BerandaKpiRow() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {BERANDA_KPIS.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="flex items-center gap-3 rounded-xl border border-sq-border bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                kpi.iconBg
              )}
            >
              <Icon className={cn("h-5 w-5", kpi.iconColor)} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-sq-slate">{kpi.label}</p>
              <p className="text-sm font-bold tabular-nums text-sq-dark dark:text-white">
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
          </div>
        );
      })}
    </div>
  );
}
