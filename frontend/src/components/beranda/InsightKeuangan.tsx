import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  LineChartDual,
  ProgressBar,
  SectionLink,
  TrendText,
} from "@/components/beranda/BerandaCharts";
import {
  BELANJA_ROWS,
  FINANCE_MINI,
  REVENUE_TREND,
} from "@/constants/beranda";

export function InsightKeuangan() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-sq-border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-sq-border px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <BarChart3 className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3 className="text-sm font-semibold text-sq-dark dark:text-white">
            Insight Keuangan
          </h3>
        </div>
        <SectionLink href="/finance">Lihat Detail</SectionLink>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="mb-2 text-[11px] font-medium text-sq-slate">
            Tren Pendapatan & Belanja
          </p>
          <LineChartDual
            months={REVENUE_TREND.months}
            seriesA={REVENUE_TREND.revenue}
            seriesB={REVENUE_TREND.expense}
            labelA="Pendapatan (Rp)"
            labelB="Belanja (Rp)"
            colorA="#22C55E"
            colorB="#3B82F6"
            max={60}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {FINANCE_MINI.map((m) => (
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

        <div>
          <p className="mb-2 text-[11px] font-medium text-sq-slate">
            Realisasi per Jenis Belanja
          </p>
          <div className="space-y-2">
            {BELANJA_ROWS.map((row) => (
              <div key={row.label}>
                <div className="mb-0.5 flex justify-between text-[10px]">
                  <span className="text-sq-slate">{row.label}</span>
                  <span className="font-semibold text-sq-dark dark:text-slate-200">
                    {row.pct}%
                  </span>
                </div>
                <ProgressBar value={row.pct} color="bg-blue-500" />
                <p className="mt-0.5 text-[10px] text-sq-slate">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/80 px-3 py-2.5 dark:border-emerald-900/30 dark:bg-emerald-500/10">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
          <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
            Realisasi anggaran dalam kondisi sehat dan on track. Proyeksi akhir
            tahun: On Track (97,1%).
          </p>
        </div>
      </div>
    </div>
  );
}
