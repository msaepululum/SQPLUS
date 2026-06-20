"use client";

import { cn } from "@/lib/cn";

import { useMemo } from "react";
import {
  KAS_BANK_ACCOUNT_SUMMARY,
  KAS_BANK_ACTIONS,
  KAS_BANK_PROJECTION,
  KAS_BANK_REKON_OVERALL,
  KAS_BANK_REKON_STATUS,
  KAS_BANK_STATUS_BADGES,
  filterKasBankAccounts,
  type KasBankFilters,
} from "@/constants/kas-bank-data";
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

export function KasBankAccountSummary({ filters }: { filters: KasBankFilters }) {
  const rows = useMemo(
    () => filterKasBankAccounts(KAS_BANK_ACCOUNT_SUMMARY, filters),
    [filters]
  );

  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Ringkasan Rekening Bank</h3>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full min-w-[28rem] text-[0.6875rem]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellMdClassName} text-left`}>Rekening</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Saldo (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Masuk (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Keluar (M)</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>Status</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {rows.map((row) => {
              const badge = KAS_BANK_STATUS_BADGES[row.statusKey];
              return (
                <tr key={row.rekening}>
                  <td className="px-3 py-2 font-medium text-slate-800">{row.rekening}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">{row.saldo.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-emerald-600">{row.masuk.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-red-500">{row.keluar.toFixed(1)}</td>
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
    </div>
  );
}

export function KasBankRekonStatus({ filters }: { filters: KasBankFilters }) {
  const rows = useMemo(
    () => filterKasBankAccounts(KAS_BANK_REKON_STATUS, filters),
    [filters]
  );

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Status Rekonsiliasi</h3>
      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => {
          const badge = KAS_BANK_STATUS_BADGES[row.statusKey];
          return (
            <li key={row.rekening}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-600">{row.rekening}</span>
                <span className="font-semibold tabular-nums">{row.pct.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${row.pct >= 95 ? "bg-emerald-500" : row.pct >= 90 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              {badge && (
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[0.5625rem] font-semibold ${badge.className}`}>
                  {badge.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-slate-600">Rekonsiliasi Keseluruhan</span>
          <span className="font-bold text-emerald-600">{KAS_BANK_REKON_OVERALL}%</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${KAS_BANK_REKON_OVERALL}%` }} />
        </div>
        <p className="mt-1 text-[0.625rem] text-slate-400">Target: 95%</p>
      </div>
    </div>
  );
}

export function KasBankActions() {
  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Aksi & Pengingat</h3>
      <ul className="mt-3 space-y-2">
        {KAS_BANK_ACTIONS.map((action) => (
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
  );
}

export function KasBankProjection() {
  const { estimasiMasuk, estimasiKeluar, saldoProyeksi } = KAS_BANK_PROJECTION;
  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Proyeksi Cashflow 30 Hari</h3>
      <dl className="mt-3 space-y-2.5 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Estimasi Kas Masuk</dt>
          <dd className="font-semibold text-emerald-600">Rp {estimasiMasuk.toFixed(1)} M</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Estimasi Kas Keluar</dt>
          <dd className="font-semibold text-red-500">Rp {estimasiKeluar.toFixed(1)} M</dd>
        </div>
        <div className="border-t border-slate-100 pt-2">
          <div className="flex justify-between gap-2">
            <dt className="font-medium text-slate-700">Saldo Proyeksi</dt>
            <dd className="text-base font-bold text-blue-600">Rp {saldoProyeksi.toFixed(1)} M</dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
