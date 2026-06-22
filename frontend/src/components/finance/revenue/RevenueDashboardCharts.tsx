"use client";

import { DonutChart } from "@/components/beranda/BerandaCharts";
import { cardClassName } from "@/components/ui/Card";
import type { RevenueAnalysisRow } from "@/types/revenue-collect";
import type { RevenueDashboardMonthlyTrend } from "@/types/revenue-dashboard";
import { REVENUE_CATEGORY_CHART_COLORS } from "@/types/revenue-dashboard";
import { formatRevenueTargetAmount } from "@/types/revenue-target";
import { cn } from "@/lib/cn";

function formatCompactRp(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  }
  return formatRevenueTargetAmount(value);
}

function ChartShell({
  title,
  subtitle,
  legend,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cardClassName({
        variant: "default",
        className: cn("!p-3 h-full", className),
      })}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[10px] text-slate-400">{subtitle}</p>}
        </div>
        {legend}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ChartLegend({
  items,
}: {
  items: { color: string; label: string; dashed?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          {item.dashed ? (
            <span
              className="h-0 w-3 border-t-2 border-dashed"
              style={{ borderColor: item.color }}
            />
          ) : (
            <span className="h-2 w-2 rounded-sm" style={{ background: item.color }} />
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function RevenueMonthlyBarChart({ data }: { data: RevenueDashboardMonthlyTrend[] }) {
  if (data.length === 0) {
    return (
      <ChartShell title="Rencana vs Realisasi Bulanan" subtitle="Perbandingan per bulan">
        <p className="py-10 text-center text-[11px] text-slate-400">Belum ada data bulanan</p>
      </ChartShell>
    );
  }

  const max = Math.max(...data.flatMap((d) => [d.rencana, d.realisasi]), 1);
  const w = 520;
  const h = 168;
  const pad = { top: 14, right: 12, bottom: 24, left: 36 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const groupW = chartW / data.length;
  const barW = Math.min(12, groupW * 0.28);
  const gap = 3;

  const yTicks = [0, 0.5, 1].map((f) => ({
    f,
    value: max * f,
    y: pad.top + chartH * (1 - f),
  }));

  return (
    <ChartShell
      title="Rencana vs Realisasi Bulanan"
      subtitle="Grouped bar — rencana & realisasi per bulan"
      legend={
        <ChartLegend
          items={[
            { color: "#94a3b8", label: "Rencana" },
            { color: "#0d9488", label: "Realisasi" },
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Grafik batang bulanan">
        {yTicks.map((tick) => (
          <g key={tick.f}>
            <line
              x1={pad.left}
              y1={tick.y}
              x2={w - pad.right}
              y2={tick.y}
              stroke="#f1f5f9"
            />
            <text
              x={pad.left - 4}
              y={tick.y + 3}
              textAnchor="end"
              className="fill-slate-400 text-[7px]"
            >
              {formatCompactRp(tick.value)}
            </text>
          </g>
        ))}
        {data.map((row, i) => {
          const cx = pad.left + i * groupW + groupW / 2;
          const rencanaH = (row.rencana / max) * chartH;
          const realisasiH = (row.realisasi / max) * chartH;
          const xRencana = cx - barW - gap / 2;
          const xRealisasi = cx + gap / 2;
          const yBase = pad.top + chartH;

          return (
            <g key={row.bulan}>
              <rect
                x={xRencana}
                y={yBase - rencanaH}
                width={barW}
                height={rencanaH}
                rx="2"
                fill="#cbd5e1"
              />
              <rect
                x={xRealisasi}
                y={yBase - realisasiH}
                width={barW}
                height={realisasiH}
                rx="2"
                fill="#0d9488"
                fillOpacity="0.92"
              />
              {realisasiH > 8 && (
                <text
                  x={xRealisasi + barW / 2}
                  y={yBase - realisasiH - 2}
                  textAnchor="middle"
                  className="fill-teal-700 text-[6px] font-medium"
                >
                  {formatCompactRp(row.realisasi)}
                </text>
              )}
              <text
                x={cx}
                y={h - 6}
                textAnchor="middle"
                className="fill-slate-500 text-[8px] font-medium"
              >
                {row.nama_bulan}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartShell>
  );
}

export function RevenueCategoryDonutChart({
  categories,
}: {
  categories: RevenueAnalysisRow[];
}) {
  const total = categories.reduce((s, c) => s + c.realisasi_amount, 0);
  const withData = categories
    .filter((c) => c.realisasi_amount > 0)
    .sort((a, b) => b.realisasi_amount - a.realisasi_amount);

  if (withData.length === 0) {
    return (
      <ChartShell title="Komposisi Realisasi BLU" subtitle="Distribusi per kategori">
        <p className="py-10 text-center text-[11px] text-slate-400">Belum ada realisasi</p>
      </ChartShell>
    );
  }

  const segments = withData.map((row, idx) => ({
    label: row.kode,
    pct: total > 0 ? (row.realisasi_amount / total) * 100 : 0,
    color: REVENUE_CATEGORY_CHART_COLORS[idx % REVENUE_CATEGORY_CHART_COLORS.length],
    kode: row.kode,
    amount: row.realisasi_amount,
  }));

  return (
    <ChartShell
      title="Komposisi Realisasi BLU"
      subtitle="Donut chart per kategori pendapatan"
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <DonutChart
          size={128}
          centerLabel={formatCompactRp(total)}
          centerSub="Total"
          centerClassName="text-[#0d6e63]"
          segments={segments.map((s) => ({
            label: s.label,
            pct: s.pct,
            color: s.color,
          }))}
        />
        <ul className="w-full min-w-0 flex-1 space-y-1.5">
          {segments.map((s) => (
            <li
              key={s.kode}
              className="flex items-center justify-between gap-2 text-[10px]"
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{ background: s.color }}
                />
                <span className="truncate text-slate-600">
                  <span className="font-mono text-slate-400">{s.kode}</span>
                </span>
              </div>
              <div className="shrink-0 text-right tabular-nums">
                <span className="font-semibold text-slate-800">
                  {s.pct.toFixed(1).replace(".", ",")}%
                </span>
                <span className="ml-1 text-slate-400">{formatCompactRp(s.amount)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ChartShell>
  );
}

export function RevenueCategoryBarChart({
  categories,
}: {
  categories: RevenueAnalysisRow[];
}) {
  const rows = categories.filter(
    (c) => c.target_amount > 0 || c.rencana_amount > 0 || c.realisasi_amount > 0
  );

  if (rows.length === 0) {
    return (
      <ChartShell
        title="Perbandingan per Kategori"
        subtitle="Target · Rencana · Realisasi"
      >
        <p className="py-8 text-center text-[11px] text-slate-400">Belum ada data kategori</p>
      </ChartShell>
    );
  }

  const max = Math.max(
    ...rows.flatMap((r) => [r.target_amount, r.rencana_amount, r.realisasi_amount]),
    1
  );
  const w = 560;
  const h = 200;
  const pad = { top: 12, right: 12, bottom: 28, left: 36 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const groupW = chartW / rows.length;
  const barW = Math.min(10, groupW * 0.2);
  const innerGap = 2;

  const series = [
    { key: "target_amount" as const, color: "#64748b", label: "Target" },
    { key: "rencana_amount" as const, color: "#38bdf8", label: "Rencana" },
    { key: "realisasi_amount" as const, color: "#0d9488", label: "Realisasi" },
  ];

  return (
    <ChartShell
      title="Perbandingan per Kategori"
      subtitle="Target · Rencana · Realisasi — 8 kategori BLU"
      legend={
        <ChartLegend
          items={series.map((s) => ({ color: s.color, label: s.label }))}
        />
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Grafik batang kategori">
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1={pad.left}
              y1={pad.top + chartH * (1 - f)}
              x2={w - pad.right}
              y2={pad.top + chartH * (1 - f)}
              stroke="#f1f5f9"
            />
            <text
              x={pad.left - 4}
              y={pad.top + chartH * (1 - f) + 3}
              textAnchor="end"
              className="fill-slate-400 text-[7px]"
            >
              {formatCompactRp(max * f)}
            </text>
          </g>
        ))}
        {rows.map((row, i) => {
          const cx = pad.left + i * groupW + groupW / 2;
          const totalBarsW = series.length * barW + (series.length - 1) * innerGap;
          let x = cx - totalBarsW / 2;
          const yBase = pad.top + chartH;

          return (
            <g key={row.category_id}>
              {series.map((s) => {
                const val = row[s.key];
                const bh = (val / max) * chartH;
                const rect = (
                  <rect
                    key={s.key}
                    x={x}
                    y={yBase - bh}
                    width={barW}
                    height={bh}
                    rx="1.5"
                    fill={s.color}
                    fillOpacity={s.key === "target_amount" ? 0.55 : 0.9}
                  />
                );
                x += barW + innerGap;
                return rect;
              })}
              <text
                x={cx}
                y={h - 8}
                textAnchor="middle"
                className="fill-slate-600 text-[8px] font-semibold"
              >
                {row.kode}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartShell>
  );
}

export function RevenueCapaianDonut({ pct }: { pct: number | null }) {
  const value = pct ?? 0;
  const color =
    value >= 100 ? "#059669" : value >= 75 ? "#0d9488" : value >= 50 ? "#f59e0b" : "#94a3b8";

  return (
    <DonutChart
      size={52}
      centerLabel={pct != null ? `${value.toFixed(0)}%` : "—"}
      centerClassName={cn(
        "text-[11px]",
        value >= 100 ? "text-emerald-700" : value >= 75 ? "text-teal-700" : "text-amber-700"
      )}
      segments={[
        { label: "capaian", pct: Math.min(value, 100), color },
        { label: "sisa", pct: Math.max(0, 100 - value), color: "#f1f5f9" },
      ]}
    />
  );
}
