"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import {
  ToolbarFilter,
  ToolbarKpi,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import type { ProcurementListMeta } from "@/types/procurement";

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

type ProcurementListShellProps = {
  title: string;
  description: string;
  source?: string;
  loading: boolean;
  error: string | null;
  meta: ProcurementListMeta | null;
  summary: Record<string, string | number | null>;
  search: string;
  onSearchChange: (value: string) => void;
  bulan: string;
  onBulanChange: (value: string) => void;
  bulanOptions: { value: number; label: string }[];
  showBulan?: boolean;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  children: React.ReactNode;
  extraFilters?: React.ReactNode;
};

export function ProcurementListShell({
  title,
  description,
  source,
  loading,
  error,
  meta,
  summary,
  search,
  onSearchChange,
  bulan,
  onBulanChange,
  bulanOptions,
  showBulan = true,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  children,
  extraFilters,
}: ProcurementListShellProps) {
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;
  const from = meta?.from ?? 0;
  const to = meta?.to ?? 0;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200/80 bg-slate-50/40 px-3 py-2.5">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        {source ? (
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#0d6e63]">
            Sumber: {source}
          </p>
        ) : null}
      </div>

      <ToolbarShell>
        <ToolbarSearch value={search} onChange={onSearchChange} placeholder="Cari nomor, supplier, uraian..." />
        {showBulan ? (
          <ToolbarFilter label="Bulan">
            <Select value={bulan} onChange={(e) => onBulanChange(e.target.value)}>
              <option value="">Semua bulan</option>
              {bulanOptions.map((opt) => (
                <option key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </ToolbarFilter>
        ) : null}
        {extraFilters}
        <ToolbarKpi
          items={[
            { label: "Jumlah", value: String(summary.jumlah_po ?? summary.jumlah_penerimaan ?? summary.jumlah_nego ?? summary.jumlah_vendor ?? summary.total_pengajuan ?? total) },
            {
              label: "Total Nilai",
              value:
                summary.total_nilai !== undefined
                  ? `Rp ${Number(summary.total_nilai).toLocaleString("id-ID")}`
                  : "—",
              tone: "plan",
            },
          ]}
        />
      </ToolbarShell>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm">Memuat data...</span>
        </div>
      ) : total === 0 ? (
        <EmptyState title="Tidak ada data" description="Ubah filter atau periode pencarian." className="mt-0" />
      ) : (
        children
      )}

      {total > 0 ? (
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Menampilkan {from}–{to} dari {total}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(perPage)}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="!w-auto text-xs"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}/hal
                </option>
              ))}
            </Select>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded border border-slate-200 p-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs tabular-nums text-slate-600">
              {page} / {lastPage}
            </span>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
              className="rounded border border-slate-200 p-1.5 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
