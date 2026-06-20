"use client";

import { DonutChart } from "@/components/beranda/BerandaCharts";
import { cardClassName } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import {
  formatMonitoringAmount,
  formatMonitoringPct,
  monitoringPctClass,
  monitoringPctDonutColor,
  type BudgetMonitoringCharts,
} from "@/types/budget-monitoring-pagu";

function ChartShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cardClassName({ variant: "default", className: `!p-3 ${className ?? ""}` })}>
      <h3 className="text-[11px] font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[10px] text-slate-400">{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function MonthlyTrendChart({ monthly }: { monthly: BudgetMonitoringCharts["monthly"] }) {
  if (monthly.length === 0) {
    return <p className="py-6 text-center text-[11px] text-slate-400">Belum ada data bulanan.</p>;
  }

  const max = Math.max(...monthly.map((m) => Math.max(m.realisasi, m.sisa_pagu)), 1);
  const w = 420;
  const h = 150;
  const pad = { top: 10, right: 10, bottom: 22, left: 8 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const groupW = chartW / monthly.length;
  const barW = Math.min(14, groupW * 0.32);

  const linePts = monthly.map((m, i) => {
    const x = pad.left + i * groupW + groupW / 2;
    const y = pad.top + chartH - (m.serap_pct / 100) * chartH;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  });

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2.5 rounded-sm bg-[#1e40af]" /> Realisasi
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2.5 rounded-sm bg-[#14b8a6]" /> Sisa Pagu
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 bg-amber-500" /> % Serapan
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {monthly.map((m, i) => {
          const x = pad.left + i * groupW + (groupW - barW * 2 - 4) / 2;
          const realH = (m.realisasi / max) * chartH;
          const sisaH = (m.sisa_pagu / max) * chartH;
          return (
            <g key={m.bulan}>
              <rect
                x={x}
                y={pad.top + chartH - realH}
                width={barW}
                height={realH}
                rx="2"
                fill="#1e40af"
                fillOpacity="0.9"
              />
              <rect
                x={x + barW + 4}
                y={pad.top + chartH - sisaH}
                width={barW}
                height={sisaH}
                rx="2"
                fill="#14b8a6"
                fillOpacity="0.75"
              />
              <text
                x={x + barW}
                y={h - 4}
                textAnchor="middle"
                className="fill-slate-400 text-[7px]"
              >
                {m.nama_bulan}
              </text>
            </g>
          );
        })}
        <path d={linePts.join(" ")} fill="none" stroke="#f59e0b" strokeWidth="2" />
      </svg>
    </div>
  );
}

function HorizontalBars({
  items,
  color = "#1e40af",
}: {
  items: { label: string; realisasi: number; pagu: number }[];
  color?: string;
}) {
  if (items.length === 0) {
    return <p className="py-4 text-center text-[10px] text-slate-400">Tidak ada data.</p>;
  }
  const max = Math.max(...items.map((i) => i.realisasi), 1);

  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const pct = (item.realisasi / max) * 100;
        return (
          <div key={item.label} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2">
            <span className="truncate text-[10px] text-slate-600" title={item.label}>
              {item.label}
            </span>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <span className="min-w-[3.5rem] text-right text-[10px] tabular-nums text-slate-500">
              {formatMonitoringAmount(item.realisasi)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function MonitoringPaguCharts({ charts }: { charts: BudgetMonitoringCharts }) {
  return (
    <div className="grid gap-3 xl:grid-cols-12">
      <ChartShell
        title="Tren Realisasi dan Sisa Pagu per Bulan"
        subtitle="Berdasarkan AJU status CLOSE"
        className="xl:col-span-5"
      >
        <MonthlyTrendChart monthly={charts.monthly} />
      </ChartShell>

      <ChartShell title="% Daya Serap Anggaran" className="xl:col-span-3">
        <div className="flex items-center gap-3">
          <DonutChart
            segments={[
              { label: "Realisasi", pct: charts.absorption.pct, color: monitoringPctDonutColor(charts.absorption.pct) },
              { label: "Sisa", pct: Math.max(0, 100 - charts.absorption.pct), color: "#cbd5e1" },
            ]}
            centerLabel={formatMonitoringPct(charts.absorption.pct)}
            centerSub="Realisasi"
            centerClassName={monitoringPctClass(charts.absorption.pct)}
            size={108}
          />
          <div className="space-y-1.5 text-[10px] text-slate-500">
            <p>
              <span className="font-medium text-slate-700">Realisasi</span>
              <br />
              {formatMonitoringAmount(charts.absorption.realisasi)}
            </p>
            <p>
              <span className="font-medium text-slate-700">Sisa Pagu</span>
              <br />
              {formatMonitoringAmount(charts.absorption.sisa_pagu)}
            </p>
            <p className={cn("font-semibold", monitoringPctClass(charts.absorption.pct))}>
              {formatMonitoringPct(charts.absorption.pct)} terserap
            </p>
          </div>
        </div>
      </ChartShell>

      <div className="grid gap-3 xl:col-span-4">
        <ChartShell title="Realisasi per Unit">
          <HorizontalBars items={charts.per_unit} />
        </ChartShell>
        <ChartShell title="Realisasi per Jenis Belanja" className="!pb-2">
          <HorizontalBars items={charts.per_jenis_belanja} color="#0d9488" />
        </ChartShell>
      </div>
    </div>
  );
}
