"use client";

import {
  DEFAULT_PENERIMAAN_FILTERS,
  PENERIMAAN_BULAN_OPTIONS,
  PENERIMAAN_LAYANAN_OPTIONS,
  PENERIMAAN_PEMBAYAR_OPTIONS,
  PENERIMAAN_TAHUN_OPTIONS,
  PENERIMAAN_UNIT_OPTIONS,
  type PenerimaanFilters,
} from "@/constants/penerimaan-data";
import { RotateCcw } from "lucide-react";

type PenerimaanFiltersBarProps = {
  filters: PenerimaanFilters;
  onChange: (filters: PenerimaanFilters) => void;
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
      <span className="text-[0.625rem] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[7.5rem] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PenerimaanFiltersBar({
  filters,
  onChange,
  onReset,
}: PenerimaanFiltersBarProps) {
  const patch = (key: keyof PenerimaanFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  const isFiltered =
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_PENERIMAAN_FILTERS);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          <FilterSelect
            label="Tahun"
            value={filters.tahun}
            options={PENERIMAAN_TAHUN_OPTIONS}
            onChange={(v) => patch("tahun", v)}
          />
          <FilterSelect
            label="Bulan"
            value={filters.bulan}
            options={PENERIMAAN_BULAN_OPTIONS}
            onChange={(v) => patch("bulan", v)}
          />
          <FilterSelect
            label="Unit Layanan"
            value={filters.unitLayanan}
            options={PENERIMAAN_UNIT_OPTIONS}
            onChange={(v) => patch("unitLayanan", v)}
          />
          <FilterSelect
            label="Jenis Pembayar"
            value={filters.jenisPembayar}
            options={PENERIMAAN_PEMBAYAR_OPTIONS}
            onChange={(v) => patch("jenisPembayar", v)}
          />
          <FilterSelect
            label="Jenis Layanan"
            value={filters.jenisLayanan}
            options={PENERIMAAN_LAYANAN_OPTIONS}
            onChange={(v) => patch("jenisLayanan", v)}
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={!isFiltered}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filter
        </button>
      </div>
    </div>
  );
}
