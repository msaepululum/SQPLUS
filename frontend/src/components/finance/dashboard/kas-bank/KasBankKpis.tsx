import { KAS_BANK_KPIS, KAS_BANK_STATUS_BADGES } from "@/constants/kas-bank-data";
import { cardClassName } from "@/components/ui/Card";

export function KasBankKpis() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 2xl:grid-cols-6">
      {KAS_BANK_KPIS.map((kpi) => {
        const badge = kpi.statusKey ? KAS_BANK_STATUS_BADGES[kpi.statusKey] : null;
        return (
          <div key={kpi.label} className={cardClassName({ variant: "default", className: "!p-3" })}>
            <div className="flex items-start justify-between gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${kpi.iconBg}`}>
                {kpi.icon}
              </div>
              {badge && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.5625rem] font-semibold ${badge.className}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <p className="mt-2 text-[0.625rem] font-medium leading-tight text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-sm font-bold leading-tight text-slate-900">{kpi.value}</p>
            <p className={`mt-1 text-[0.5625rem] font-semibold ${kpi.trendPositive ? "text-emerald-600" : "text-amber-600"}`}>
              {kpi.trend}
            </p>
          </div>
        );
      })}
    </div>
  );
}
