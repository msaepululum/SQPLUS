"use client";

import {
  DEFAULT_KAS_BANK_FILTERS,
  KAS_BANK_BULAN_OPTIONS,
  KAS_BANK_JENIS_ARUS_OPTIONS,
  KAS_BANK_PERIODE_TREN_OPTIONS,
  KAS_BANK_REKENING_OPTIONS,
  KAS_BANK_STATUS_REKON_OPTIONS,
  KAS_BANK_TAHUN_OPTIONS,
  KAS_BANK_UNIT_OPTIONS,
  type KasBankFilters,
} from "@/constants/kas-bank-data";
import { RotateCcw } from "lucide-react";

type KasBankFiltersBarProps = {
  filters: KasBankFilters;
  onChange: (filters: KasBankFilters) => void;
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
        className="min-w-[7.5rem] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

export function KasBankFiltersBar({ filters, onChange, onReset }: KasBankFiltersBarProps) {
  const patch = (key: keyof KasBankFilters, value: string) =>
    onChange({ ...filters, [key]: value });
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_KAS_BANK_FILTERS);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          <FilterSelect label="Tahun" value={filters.tahun} options={KAS_BANK_TAHUN_OPTIONS} onChange={(v) => patch("tahun", v)} />
          <FilterSelect label="Bulan" value={filters.bulan} options={KAS_BANK_BULAN_OPTIONS} onChange={(v) => patch("bulan", v)} />
          <FilterSelect label="Rekening" value={filters.rekening} options={KAS_BANK_REKENING_OPTIONS} onChange={(v) => patch("rekening", v)} />
          <FilterSelect label="Unit" value={filters.unit} options={KAS_BANK_UNIT_OPTIONS} onChange={(v) => patch("unit", v)} />
          <FilterSelect label="Jenis Arus" value={filters.jenisArus} options={KAS_BANK_JENIS_ARUS_OPTIONS} onChange={(v) => patch("jenisArus", v)} />
          <FilterSelect label="Status Rekonsiliasi" value={filters.statusRekon} options={KAS_BANK_STATUS_REKON_OPTIONS} onChange={(v) => patch("statusRekon", v)} />
          <FilterSelect label="Periode Tren" value={filters.periodeTren} options={KAS_BANK_PERIODE_TREN_OPTIONS} onChange={(v) => patch("periodeTren", v)} />
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
