"use client";

import { cn } from "@/lib/cn";

import { useMemo } from "react";
import {
  LAPORAN_BELANJA_JENIS,
  LAPORAN_HUTANG_PIUTANG,
  LAPORAN_PENDAPATAN_SUMBER,
  LAPORAN_STATUS_BADGES,
  filterPendapatanSumber,
  type LaporanKeuanganFilters,
} from "@/constants/laporan-keuangan-data";
import { cardClassName } from "@/components/ui/Card";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellMdClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

export function LaporanPendapatanTable({ filters }: { filters: LaporanKeuanganFilters }) {
  const rows = useMemo(
    () => filterPendapatanSumber(LAPORAN_PENDAPATAN_SUMBER, filters),
    [filters]
  );

  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Pendapatan per Sumber</h3>
      </div>
      <table className="w-full text-[0.6875rem]">
        <thead>
          <tr className={tableHeadRowClassName}>
            <th className={`${tableHeadCellMdClassName} text-left`}>Sumber</th>
            <th className={`${tableHeadCellMdClassName} text-right`}>Nilai (Rp M)</th>
            <th className={`${tableHeadCellMdClassName} text-right`}>%</th>
          </tr>
        </thead>
        <tbody className={tableBodyStripedClassName}>
          {rows.map((row) => (
            <tr key={row.sumber}>
              <td className="px-3 py-2 font-medium text-slate-800">{row.sumber}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.nilai.toFixed(2)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.pct.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LaporanBelanjaTable() {
  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Belanja per Jenis</h3>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full min-w-[24rem] text-[0.6875rem]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellMdClassName} text-left`}>Jenis</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Realisasi (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Pagu (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Sisa (M)</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {LAPORAN_BELANJA_JENIS.map((row) => (
              <tr key={row.jenis}>
                <td className="px-3 py-2 font-medium text-slate-800">{row.jenis}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.realisasi.toFixed(1)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-500">{row.pagu.toFixed(1)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-600">{row.sisa.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LaporanHutangPiutangTable() {
  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Hutang & Piutang</h3>
      </div>
      <table className="w-full text-[0.6875rem]">
        <thead>
          <tr className={tableHeadRowClassName}>
            <th className={`${tableHeadCellMdClassName} text-left`}>Kategori</th>
            <th className={`${tableHeadCellMdClassName} text-right`}>Nilai (Rp M)</th>
            <th className={`${tableHeadCellMdClassName} text-left`}>Status</th>
          </tr>
        </thead>
        <tbody className={tableBodyStripedClassName}>
          {LAPORAN_HUTANG_PIUTANG.map((row) => {
            const badge = LAPORAN_STATUS_BADGES[row.statusKey];
            return (
              <tr key={row.kategori}>
                <td className="px-3 py-2 font-medium text-slate-800">{row.kategori}</td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold">{row.nilai.toFixed(1)}</td>
                <td className="px-3 py-2">
                  {badge && (
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[0.5625rem] font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
