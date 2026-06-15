import { ChevronRight, Users } from "lucide-react";
import {
  DonutChart,
  LineChartDual,
  SectionLink,
  TrendText,
} from "@/components/beranda/BerandaCharts";
import {
  ATTENDANCE_TREND,
  EMPLOYEE_COMPOSITION,
  HR_STATS,
  HR_UNITS,
} from "@/constants/beranda";

export function InsightPersonalia() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-sq-border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-sq-border px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Users className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3 className="text-sm font-semibold text-sq-dark dark:text-white">
            Insight Personalia
          </h3>
        </div>
        <SectionLink href="/hr">Lihat Detail</SectionLink>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex gap-3">
          <div className="shrink-0">
            <DonutChart
              segments={EMPLOYEE_COMPOSITION}
              centerLabel="1.245"
              centerSub="Pegawai"
              size={100}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {EMPLOYEE_COMPOSITION.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-sq-slate">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.label}
                </span>
                <span className="font-semibold text-sq-dark dark:text-slate-200">
                  {s.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {HR_STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-sq-border bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <p className="text-[10px] text-sq-slate">{s.label}</p>
              <p className="text-xs font-bold text-sq-dark dark:text-white">{s.value}</p>
              <TrendText value={s.trend} dir={s.dir} />
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-sq-slate">
            Absensi & Kehadiran (6 Bulan Terakhir)
          </p>
          <LineChartDual
            months={ATTENDANCE_TREND.months}
            seriesA={ATTENDANCE_TREND.kehadiran}
            seriesB={ATTENDANCE_TREND.absensi}
            labelA="Kehadiran"
            labelB="Absensi"
            colorA="#8B5CF6"
            colorB="#14B8A6"
            max={100}
          />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-sq-slate">
            Unit dengan Pegawai Terbanyak
          </p>
          <div className="space-y-1.5">
            {HR_UNITS.map((u) => (
              <div
                key={u.unit}
                className="flex items-center justify-between rounded-md border border-sq-border px-2.5 py-1.5 text-[11px] dark:border-slate-800"
              >
                <span className="font-medium text-sq-dark dark:text-slate-200">
                  {u.unit}
                </span>
                <span className="text-sq-slate">
                  {u.count}{" "}
                  <span className="text-[10px]">({u.pct}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto text-center">
          <SectionLink href="/hr/employees">
            Lihat Semua Unit <ChevronRight className="inline h-3 w-3" />
          </SectionLink>
        </div>
      </div>
    </div>
  );
}
