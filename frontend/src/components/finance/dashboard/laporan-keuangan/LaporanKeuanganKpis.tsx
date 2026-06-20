import { LAPORAN_KEUANGAN_KPIS } from "@/constants/laporan-keuangan-data";
import { cardClassName } from "@/components/ui/Card";

export function LaporanKeuanganKpis() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {LAPORAN_KEUANGAN_KPIS.map((kpi) => (
        <div key={kpi.label} className={cardClassName({ variant: "default", className: "!p-3" })}>
          <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-sm ${kpi.iconBg}`}>
            {kpi.icon}
          </div>
          <p className="text-[0.625rem] font-medium leading-tight text-slate-500">{kpi.label}</p>
          <p className="mt-1 text-sm font-bold leading-tight text-slate-900">{kpi.value}</p>
          <p className={`mt-1 text-[0.5625rem] font-semibold ${kpi.trendPositive ? "text-emerald-600" : "text-amber-600"}`}>
            {kpi.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
