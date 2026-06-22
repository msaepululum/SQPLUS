"use client";

import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { cn } from "@/lib/cn";
import { BarChart3, ChevronRight, Lightbulb } from "lucide-react";

export function InsightChartCard({
  title,
  subtitle,
  children,
  onDetail,
  detailLabel = "Lihat Detail",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onDetail?: () => void;
  detailLabel?: string;
}) {
  return (
    <div className={cardClassName({ variant: "default", className: "!p-3.5" })}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[0.5625rem] text-slate-400">{subtitle}</p>}
        </div>
        {onDetail && (
          <Button
            type="button"
            variant="ghost"
            className="h-7 shrink-0 gap-1 px-2 text-[0.6875rem] text-[#0d6e63]"
            onClick={onDetail}
          >
            {detailLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

export function InsightKpiGrid({
  items,
}: {
  items: { label: string; value: string; trend?: string; positive?: boolean }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className={cardClassName({ variant: "default", className: "!p-3" })}>
          <p className="text-[0.625rem] font-medium text-slate-500">{item.label}</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{item.value}</p>
          {item.trend && (
            <p
              className={cn(
                "mt-0.5 text-[0.5625rem] font-semibold",
                item.positive !== false ? "text-emerald-600" : "text-amber-600"
              )}
            >
              {item.trend}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function InsightAlerts({ items }: { items: string[] }) {
  return (
    <div className={cardClassName({ variant: "default", className: "!p-3" })}>
      <div className="mb-2 flex items-center gap-1.5">
        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
        <h3 className="text-xs font-semibold text-slate-800">Insight Utama</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((text) => (
          <li key={text} className="flex items-start gap-2 text-[0.6875rem] leading-relaxed text-slate-600">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#0d6e63]" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DetailTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className={tableGridShellClassName}>
      <Table embedded>
        <THead>
          <TR>
            {headers.map((h) => (
              <TH key={h}>{h}</TH>
            ))}
          </TR>
        </THead>
        <TBody>
          {rows.map((row, i) => (
            <TR key={i}>
              {row.map((cell, j) => (
                <TD key={j}>{cell}</TD>
              ))}
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

export function HorizontalBarChart({
  items,
  max,
  unit = "M",
}: {
  items: { label: string; value: number; color?: string }[];
  max?: number;
  unit?: string;
}) {
  const maxVal = max ?? Math.max(...items.map((i) => i.value)) * 1.1;
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-0.5 flex justify-between text-[0.625rem]">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-semibold text-slate-800">
              {item.value} {unit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / maxVal) * 100}%`,
                background: item.color ?? "#0d9488",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AbsorptionHeatmap({
  rows,
  months,
}: {
  rows: { unit: string; months: number[] }[];
  months: string[];
}) {
  const color = (pct: number) => {
    if (pct >= 70) return "bg-emerald-500";
    if (pct >= 60) return "bg-teal-400";
    if (pct >= 50) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <div className="overflow-x-auto sq-scroll">
      <table className="w-full min-w-[320px] text-[0.5625rem]">
        <thead>
          <tr>
            <th className="pb-1.5 pr-2 text-left font-medium text-slate-500">Unit</th>
            {months.map((m) => (
              <th key={m} className="px-0.5 pb-1.5 text-center font-medium text-slate-500">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.unit}>
              <td className="py-1 pr-2 text-slate-600">{row.unit}</td>
              {row.months.map((pct, i) => (
                <td key={i} className="p-0.5">
                  <div
                    className={cn(
                      "flex h-6 items-center justify-center rounded text-[0.5rem] font-semibold text-white",
                      color(pct)
                    )}
                    title={`${pct}%`}
                  >
                    {pct}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <BarChart3 className="h-4 w-4 text-[#0d6e63]" />
      <span className="text-xs font-medium text-slate-500">{title}</span>
    </div>
  );
}
