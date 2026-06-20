"use client";

import { Loader2 } from "lucide-react";
import {
  formatRiwayatDate,
  type BudgetRiwayatEvent,
} from "@/types/budget-riwayat-perubahan";

export function BudgetHistoryTimeline({
  rows,
  loading,
}: {
  rows: BudgetRiwayatEvent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Memuat riwayat...
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="py-2 text-xs text-slate-400">Belum ada riwayat untuk dokumen ini.</p>;
  }

  return (
    <div className="relative space-y-0 pl-3">
      <div className="absolute bottom-1 left-[5px] top-1 w-px bg-slate-200" />
      {rows.map((row, idx) => (
        <div key={`${row.action}-${row.occurred_at}-${idx}`} className="relative pb-2.5 pl-4">
          <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-sky-400 ring-1 ring-sky-200" />
          <div className="rounded-md border border-slate-100 bg-white px-2.5 py-1.5 text-[11px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-700">{row.action_label}</span>
              <span className="tabular-nums text-slate-400">
                {formatRiwayatDate(row.occurred_at)}
              </span>
            </div>
            {row.actor && (
              <p className="mt-0.5 text-[10px] text-slate-500">Oleh: {row.actor}</p>
            )}
            {row.note && (
              <p className="mt-0.5 line-clamp-2 text-[10px] italic text-slate-400">{row.note}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
