"use client";

import {
  DEFAULT_LAPORAN_KEUANGAN_FILTERS,
  LAPORAN_PERIODE_OPTIONS,
  LAPORAN_SUMBER_DANA_OPTIONS,
  LAPORAN_UNIT_OPTIONS,
  type LaporanKeuanganFilters,
} from "@/constants/laporan-keuangan-data";
import { RotateCcw } from "lucide-react";

type LaporanKeuanganFiltersBarProps = {
  filters: LaporanKeuanganFilters;
  onChange: (filters: LaporanKeuanganFilters) => void;
  onReset: () => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex shrink-0 flex-col gap-0.5">
      <span className="text-[0.625rem] font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[8rem] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

export function LaporanKeuanganFiltersBar({
  filters,
  onChange,
  onReset,
}: LaporanKeuanganFiltersBarProps) {
  const patch = (key: keyof LaporanKeuanganFilters, value: string) =>
    onChange({ ...filters, [key]: value });
  const isFiltered =
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_LAPORAN_KEUANGAN_FILTERS);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          <FilterSelect label="Periode" value={filters.periode} options={LAPORAN_PERIODE_OPTIONS} onChange={(v) => patch("periode", v)} />
          <FilterSelect label="Unit" value={filters.unit} options={LAPORAN_UNIT_OPTIONS} onChange={(v) => patch("unit", v)} />
          <FilterSelect label="Sumber Dana" value={filters.sumberDana} options={LAPORAN_SUMBER_DANA_OPTIONS} onChange={(v) => patch("sumberDana", v)} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
            Export PDF
          </button>
          <button type="button" className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
            Export Excel
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={!isFiltered}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
