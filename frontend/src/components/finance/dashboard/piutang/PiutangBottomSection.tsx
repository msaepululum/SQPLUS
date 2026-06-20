"use client";

import { cn } from "@/lib/cn";

import { useMemo } from "react";
import {
  PIUTANG_ACTIONS,
  PIUTANG_STATUS_BADGES,
  PIUTANG_SUMMARY_ROWS,
  PIUTANG_TOP_PAYORS,
  PIUTANG_TOP_UNITS,
  filterPiutangSummary,
  type PiutangFilters,
} from "@/constants/piutang-data";
import { cardClassName } from "@/components/ui/Card";
import { ChevronRight } from "lucide-react";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellMdClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

const PRIORITY_STYLES = {
  tinggi: "bg-red-100 text-red-800",
  sedang: "bg-amber-100 text-amber-800",
  rendah: "bg-slate-100 text-slate-600",
};

type PiutangBottomSectionProps = {
  filters: PiutangFilters;
};

export function PiutangSummaryTable({ filters }: PiutangBottomSectionProps) {
  const rows = useMemo(() => filterPiutangSummary(PIUTANG_SUMMARY_ROWS, filters), [filters]);

  const totals = rows.reduce(
    (acc, r) => ({
      outstanding: acc.outstanding + r.outstanding,
      tertagih: acc.tertagih + r.tertagih,
      belumTertagih: acc.belumTertagih + r.belumTertagih,
      jatuhTempo: acc.jatuhTempo + r.jatuhTempo,
    }),
    { outstanding: 0, tertagih: 0, belumTertagih: 0, jatuhTempo: 0 }
  );

  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Daftar Ringkasan Piutang</h3>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full min-w-[48rem] text-[0.6875rem]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellMdClassName} text-left`}>Jenis Piutang</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Outstanding (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Sudah Tertagih (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Belum Tertagih (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Jatuh Tempo (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Rata-rata Umur (hari)</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>Status</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">Tidak ada data sesuai filter.</td>
              </tr>
            ) : (
              rows.map((row) => {
                const badge = PIUTANG_STATUS_BADGES[row.statusKey];
                return (
                  <tr key={row.jenis}>
                    <td className="px-3 py-2">
                      <span className="mr-1.5">{row.icon}</span>
                      <span className="font-medium text-slate-800">{row.jenis}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{row.outstanding.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-emerald-600">{row.tertagih.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-600">{row.belumTertagih.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-red-500">{row.jatuhTempo.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.avgUmur}</td>
                    <td className="px-3 py-2">
                      {badge && (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[0.5625rem] font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-sky-200 bg-sky-50 font-semibold">
                <td className="px-3 py-2 text-slate-800">Total</td>
                <td className="px-3 py-2 text-right tabular-nums">{totals.outstanding.toFixed(1)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-700">{totals.tertagih.toFixed(1)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{totals.belumTertagih.toFixed(1)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-red-600">{totals.jatuhTempo.toFixed(1)}</td>
                <td className="px-3 py-2" colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export function PiutangSidebar() {
  return (
    <div className="space-y-3">
      <div className={cardClassName({ variant: "default" })}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Top 5 Penanggung / Pembayar</h3>
          <button type="button" className="text-[0.625rem] font-medium text-violet-600 hover:underline">Lihat Semua</button>
        </div>
        <ul className="mt-3 space-y-2.5">
          {PIUTANG_TOP_PAYORS.map((p, i) => (
            <li key={p.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">{i + 1}</span>
                <span className="text-slate-700">{p.name}</span>
              </div>
              <span className="font-semibold text-slate-900">{p.amount}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={cardClassName({ variant: "default" })}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Unit dengan Piutang Tertinggi</h3>
          <button type="button" className="text-[0.625rem] font-medium text-violet-600 hover:underline">Lihat Semua</button>
        </div>
        <ul className="mt-3 space-y-2.5">
          {PIUTANG_TOP_UNITS.map((u, i) => (
            <li key={u.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">{i + 1}</span>
                <span className="text-slate-700">{u.name}</span>
              </div>
              <span className="font-semibold text-slate-900">{u.amount}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={cardClassName({ variant: "default" })}>
        <h3 className="text-sm font-semibold text-slate-800">Aksi & Pengingat</h3>
        <ul className="mt-3 space-y-2">
          {PIUTANG_ACTIONS.map((action) => (
            <li key={action.text}>
              <button
                type="button"
                className="flex w-full items-start gap-2 rounded-lg border border-slate-100 px-2.5 py-2 text-left transition hover:bg-slate-50"
              >
                <span className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[0.5625rem] font-semibold capitalize ${PRIORITY_STYLES[action.priority]}`}>
                  {action.priority}
                </span>
                <span className="flex-1 text-xs leading-snug text-slate-600">{action.text}</span>
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
