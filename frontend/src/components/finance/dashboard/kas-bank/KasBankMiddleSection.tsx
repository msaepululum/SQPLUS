"use client";

import type { CashBankDashboardAccount, CashBankDashboardData, CashBankDashboardKpis } from "@/types/cash-bank-dashboard";
import { formatDashboardAmount } from "@/types/cash-bank-dashboard";
import { cardClassName } from "@/components/ui/Card";
import {
  tableBodyStripedClassName,
  tableHeadCellMdClassName,
  tableHeadRowClassName,
  tableShellClassName,
} from "@/components/ui/tableStyles";

export function KasBankSourceInfo({ data }: { data: CashBankDashboardData }) {
  return (
    <p className="text-[10px] text-slate-400">
      Sumber operasional: <strong className="text-slate-500">{data.sources.operational}</strong>
      {" · "}
      Akuntansi: <strong className="text-slate-500">{data.sources.accounting}</strong>
      {" · "}
      Tahun {data.filters.tahun}
      {data.filters.bulan ? ` · Bulan ${data.filters.bulan}` : ""}
    </p>
  );
}

export function KasBankAccountSummary({ accounts }: { accounts: CashBankDashboardAccount[] }) {
  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-800">Saldo per Rekening Kas/Bank (BKUD)</h3>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full min-w-[24rem] text-[11px]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellMdClassName} text-left`}>Rekening</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Masuk</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Keluar</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Saldo</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-400">Belum ada data rekening.</td>
              </tr>
            ) : (
              accounts.map((row) => (
                <tr key={row.account_no}>
                  <td className="px-2 py-1.5">
                    <div className="max-w-[10rem] truncate font-medium text-slate-800" title={row.account_name}>
                      {row.account_name}
                    </div>
                    <div className="font-mono text-[9px] text-slate-400">{row.account_no}</div>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-emerald-600">
                    {formatDashboardAmount(row.masuk, true)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-red-500">
                    {formatDashboardAmount(row.keluar, true)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold">
                    {formatDashboardAmount(row.saldo, true)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function KasBankRekonStatus({ kpis }: { kpis: CashBankDashboardKpis }) {
  const pct = kpis.rekon_acc_pct;

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Rekonsiliasi BKU → ACC2026</h3>
      <p className="mt-1 text-[11px] text-slate-500">
        Persentase transaksi BKU yang sudah terhubung ke jurnal akuntansi (<code className="text-[10px]">cnojurnal</code>).
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-slate-600">BKU terposting ke ACC</span>
            <span className="font-semibold tabular-nums">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${pct >= 95 ? "bg-emerald-500" : pct >= 85 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
            <dt className="text-slate-500">Sudah posting</dt>
            <dd className="font-semibold text-emerald-700">{kpis.posted_ke_acc}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
            <dt className="text-slate-500">Belum posting</dt>
            <dd className="font-semibold text-amber-700">{kpis.belum_posting_acc}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
            <dt className="text-slate-500">Jurnal ACC</dt>
            <dd className="font-semibold text-slate-800">{kpis.acc_jurnal_count}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-2.5 py-2">
            <dt className="text-slate-500">Total BKU</dt>
            <dd className="font-semibold text-slate-800">{kpis.jumlah_transaksi}</dd>
          </div>
        </dl>
        <p className="text-[10px] text-slate-400">Target rekonsiliasi: ≥ 95%</p>
      </div>
    </div>
  );
}
