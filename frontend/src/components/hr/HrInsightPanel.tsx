"use client";

import {
  DonutChart,
  LineChartDual,
} from "@/components/beranda/BerandaCharts";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import type { HrDashboard } from "@/types/hr";
import { formatHrNumber } from "@/types/hr";
import { Database, Loader2 } from "lucide-react";

type HrInsightPanelProps = {
  data: HrDashboard | null;
  loading?: boolean;
  compact?: boolean;
};

function SourceBadge({ label }: { label: string }) {
  return (
    <Badge variant="info" className="text-[10px]">
      <Database className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export function HrInsightPanel({ data, loading, compact }: HrInsightPanelProps) {
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat data Personalia...
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        Gagal memuat insight personalia dari Payroll / HRIS.
      </p>
    );
  }

  const composition = data.composition.map((s) => ({
    label: s.label,
    pct: s.pct,
    color: s.color,
  }));

  const sourceLabel = [
    data.sources.employees === "payroll" ? "Payroll" : null,
    data.sources.attendance === "hris" ? "HRIS" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {sourceLabel && (
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge label={sourceLabel || "SQ+"} />
          {data.latest_payroll_period && (
            <span className="text-[11px] text-slate-500">
              Periode gaji: {data.latest_payroll_period.name}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <div className="shrink-0">
          <DonutChart
            segments={composition.length ? composition : [{ label: "—", pct: 100, color: "#94A3B8" }]}
            centerLabel={formatHrNumber(data.total_employees)}
            centerSub="Pegawai"
            size={compact ? 100 : 120}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          {(data.composition.length ? data.composition : []).map((s) => (
            <div key={s.label} className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="flex items-center gap-1.5 text-sq-slate">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="font-semibold text-sq-dark dark:text-slate-200">
                {s.pct}%{" "}
                <span className="font-normal text-slate-400">({formatHrNumber(s.count)})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {data.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-sq-border bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-800/50"
          >
            <p className="text-[10px] text-sq-slate">{s.label}</p>
            <p className="text-xs font-bold text-sq-dark dark:text-white">{s.value}</p>
            {s.source && (
              <p className="mt-0.5 text-[10px] text-slate-400">Sumber: {s.source}</p>
            )}
          </div>
        ))}
      </div>

      {data.attendance_trend.months.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-medium text-sq-slate">
            Absensi & Kehadiran (6 Bulan Terakhir)
          </p>
          <LineChartDual
            months={data.attendance_trend.months}
            seriesA={data.attendance_trend.kehadiran}
            seriesB={data.attendance_trend.absensi}
            labelA="Kehadiran"
            labelB="Absensi"
            colorA="#8B5CF6"
            colorB="#14B8A6"
            max={100}
          />
        </div>
      )}

      {data.top_units.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-medium text-sq-slate">
            Unit dengan Pegawai Terbanyak
          </p>
          <div className="space-y-1.5">
            {data.top_units.map((u) => (
              <div
                key={u.unit}
                className="flex items-center justify-between rounded-md border border-sq-border px-2.5 py-1.5 text-[11px] dark:border-slate-800"
              >
                <span className="font-medium text-sq-dark dark:text-slate-200">{u.unit}</span>
                <span className="text-sq-slate">
                  {formatHrNumber(u.count)}{" "}
                  <span className="text-[10px]">({u.pct}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HrSourceNote({ data }: { data: HrDashboard | null }) {
  if (!data) return null;

  return (
    <div className={cardClassName({ variant: "default", className: "!p-3 text-xs text-slate-500" })}>
      Data pegawai diambil dari{" "}
      <strong>{data.sources.employees === "payroll" ? "Payroll SIMRS" : "SQ+"}</strong>, kehadiran
      dari <strong>{data.sources.attendance === "hris" ? "HRIS" : "SQ+"}</strong>, dan periode gaji
      dari <strong>{data.sources.payroll === "payroll" ? "Payroll" : "SQ+"}</strong>.
    </div>
  );
}
