import { cn } from "@/lib/cn";
import type { TrendDir } from "@/constants/beranda";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export function TrendText({
  value,
  dir = "up",
  prefix,
}: {
  value: string;
  dir?: TrendDir;
  prefix?: string;
}) {
  const Icon = dir === "up" ? ArrowUp : dir === "down" ? ArrowDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium",
        dir === "up" && "text-emerald-600",
        dir === "down" && "text-red-500",
        dir === "neutral" && "text-slate-400"
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {prefix}
      {value}
    </span>
  );
}

export function DonutChart({
  segments,
  centerLabel,
  centerSub,
  centerClassName,
  size = 120,
}: {
  segments: { label: string; pct: number; color: string }[];
  centerLabel: string;
  centerSub?: string;
  centerClassName?: string;
  size?: number;
}) {
  const r = 42;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {segments.map((s) => {
          const dash = (s.pct / 100) * circ;
          const el = (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn("text-sm font-bold", centerClassName ?? "text-slate-900")}>{centerLabel}</span>
        {centerSub && (
          <span className="text-[10px] text-slate-500">{centerSub}</span>
        )}
      </div>
    </div>
  );
}

export function LineChartDual({
  months,
  seriesA,
  seriesB,
  colorA = "#22C55E",
  colorB = "#3B82F6",
  labelA,
  labelB,
  max,
}: {
  months: string[];
  seriesA: number[];
  seriesB: number[];
  colorA?: string;
  colorB?: string;
  labelA: string;
  labelB: string;
  max?: number;
}) {
  const w = 280;
  const h = 130;
  const pad = { top: 8, right: 8, bottom: 22, left: 28 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const maxVal = max ?? Math.max(...seriesA, ...seriesB) * 1.1;
  const toX = (i: number) => pad.left + (i / (months.length - 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / maxVal) * chartH;
  const line = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm" style={{ background: colorA }} />
          {labelA}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm" style={{ background: colorB }} />
          {labelB}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={pad.left}
            y1={pad.top + chartH * (1 - f)}
            x2={w - pad.right}
            y2={pad.top + chartH * (1 - f)}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        <path d={line(seriesA)} fill="none" stroke={colorA} strokeWidth="2" strokeLinecap="round" />
        <path d={line(seriesB)} fill="none" stroke={colorB} strokeWidth="2" strokeLinecap="round" />
        {months.map((m, i) => (
          <text
            key={m}
            x={toX(i)}
            y={h - 4}
            textAnchor="middle"
            className="fill-slate-400 text-[7px]"
          >
            {m.replace(" 2025", "").replace(" 2024", "")}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function BarChartVertical({
  months,
  values,
  color = "#14B8A6",
  max,
}: {
  months: string[];
  values: number[];
  color?: string;
  max?: number;
}) {
  const w = 260;
  const h = 110;
  const pad = { top: 8, right: 8, bottom: 20, left: 8 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const maxVal = max ?? Math.max(...values) * 1.1;
  const barW = chartW / values.length - 6;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {values.map((v, i) => {
        const bh = (v / maxVal) * chartH;
        const x = pad.left + i * (chartW / values.length) + 3;
        const y = pad.top + chartH - bh;
        return (
          <g key={`bar-${i}`}>
            <rect x={x} y={y} width={barW} height={bh} rx="3" fill={color} fillOpacity="0.85" />
            <text x={x + barW / 2} y={h - 4} textAnchor="middle" className="fill-slate-400 text-[7px]">
              {months[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ProgressBar({
  value,
  color = "bg-blue-500",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full", color)}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

import Link from "next/link";

export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[11px] font-semibold text-sq-blue hover:underline">
      {children}
    </Link>
  );
}

export function InsightCardShell({
  icon,
  iconBg,
  title,
  href,
  linkLabel = "Lihat Detail",
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  href: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-sq-border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-sq-border px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", iconBg)}>
            {icon}
          </span>
          <h3 className="text-sm font-semibold text-sq-dark dark:text-white">{title}</h3>
        </div>
        <SectionLink href={href}>{linkLabel}</SectionLink>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">{children}</div>
    </div>
  );
}

export function HorizontalMetricBars({
  rows,
}: {
  rows: { label: string; value: string; pct: number; color?: string }[];
}) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-0.5 flex justify-between text-[10px]">
            <span className="text-sq-slate">{row.label}</span>
            <span className="font-semibold text-sq-dark dark:text-slate-200">{row.pct}%</span>
          </div>
          <ProgressBar value={row.pct} color={row.color ?? "bg-blue-500"} />
          <p className="mt-0.5 text-[10px] text-sq-slate">{row.value}</p>
        </div>
      ))}
    </div>
  );
}
