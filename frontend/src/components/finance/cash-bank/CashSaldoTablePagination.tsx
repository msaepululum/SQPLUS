"use client";

import { Button } from "@/components/ui/Button";
import { CASH_SALDO_PER_PAGE_OPTIONS } from "@/types/cash-saldo-rekap";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CashSaldoTablePaginationProps = {
  page: number;
  lastPage: number;
  perPage: number;
  totalRows: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

export function CashSaldoTablePagination({
  page,
  lastPage,
  perPage,
  totalRows,
  itemLabel = "baris",
  onPageChange,
  onPerPageChange,
}: CashSaldoTablePaginationProps) {
  const from = totalRows === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, totalRows);

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] text-slate-500">
        {totalRows > 0
          ? `Menampilkan ${from}–${to} dari ${totalRows} ${itemLabel}`
          : "Tidak ada data"}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
          >
            {CASH_SALDO_PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / halaman
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="h-7 w-7 p-0"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[4.5rem] text-center text-[11px] tabular-nums text-slate-600">
            {page} / {lastPage}
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onPageChange(Math.min(lastPage, page + 1))}
            disabled={page >= lastPage}
            className="h-7 w-7 p-0"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
