"use client";

import { cn } from "@/lib/cn";

import { useMemo } from "react";
import {
  KAS_BANK_FLOW_ROWS,
  KAS_BANK_STATUS_BADGES,
  filterKasBankFlowRows,
  type KasBankFilters,
} from "@/constants/kas-bank-data";
import { cardClassName } from "@/components/ui/Card";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellMdClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

export function KasBankFlowTable({ filters }: { filters: KasBankFilters }) {
  const rows = useMemo(() => filterKasBankFlowRows(KAS_BANK_FLOW_ROWS, filters), [filters]);

  const totals = rows.reduce(
    (acc, r) => ({
      saldoAwal: acc.saldoAwal + r.saldoAwal,
      kasMasuk: acc.kasMasuk + r.kasMasuk,
      kasKeluar: acc.kasKeluar + r.kasKeluar,
      saldoAkhir: acc.saldoAkhir + r.saldoAkhir,
      pending: acc.pending + r.pending,
    }),
    { saldoAwal: 0, kasMasuk: 0, kasKeluar: 0, saldoAkhir: 0, pending: 0 }
  );

  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Daftar Arus Kas & Bank</h3>
        <select className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[0.625rem] text-slate-600">
          <option>Lihat Detail</option>
          <option>Export Excel</option>
          <option>Export PDF</option>
        </select>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full min-w-[52rem] text-[0.6875rem]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellMdClassName} text-left`}>Rekening</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Saldo Awal (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Kas Masuk (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Kas Keluar (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Saldo Akhir (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Rekonsiliasi (%)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Pending (M)</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>Status</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">Tidak ada data sesuai filter.</td>
              </tr>
            ) : (
              rows.map((row) => {
                const badge = KAS_BANK_STATUS_BADGES[row.statusKey];
                return (
                  <tr key={row.rekening}>
                    <td className="px-3 py-2 font-medium text-slate-800">{row.rekening}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.saldoAwal.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-emerald-600">{row.kasMasuk.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-red-500">{row.kasKeluar.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{row.saldoAkhir.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.rekonPct.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right tabular-nums text-amber-600">{row.pending.toFixed(1)}</td>
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
                <td className="px-3 py-2 text-right tabular-nums">{totals.saldoAwal.toFixed(1)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-700">{totals.kasMasuk.toFixed(1)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-red-600">{totals.kasKeluar.toFixed(1)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{totals.saldoAkhir.toFixed(1)}</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right tabular-nums text-amber-700">{totals.pending.toFixed(1)}</td>
                <td className="px-3 py-2" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
