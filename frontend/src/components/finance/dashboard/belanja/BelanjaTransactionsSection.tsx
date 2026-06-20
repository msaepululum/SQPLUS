"use client";

import { cn } from "@/lib/cn";

import { useMemo } from "react";
import {
  BELANJA_INSIGHTS,
  BELANJA_TOP_PENDING,
  BELANJA_TRANSACTIONS,
  filterBelanjaTransactions,
  type BelanjaFilters,
} from "@/constants/belanja-data";
import { cardClassName } from "@/components/ui/Card";
import { Lightbulb } from "lucide-react";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellCompactLgClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

type BelanjaTransactionsSectionProps = {
  filters: BelanjaFilters;
};

export function BelanjaTransactionsSection({ filters }: BelanjaTransactionsSectionProps) {
  const transactions = useMemo(
    () => filterBelanjaTransactions(BELANJA_TRANSACTIONS, filters),
    [filters]
  );

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
      <div className="xl:col-span-7">
        <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">Daftar Belanja / Pengeluaran Terbaru</h3>
          </div>
          <div className={tableShellClassName}>
            <table className="w-full min-w-[44rem] text-[0.6875rem]">
              <thead>
                <tr className={tableHeadRowClassName}>
                  <th className={`${tableHeadCellCompactLgClassName} text-left`}>No Dokumen</th>
                  <th className={`${tableHeadCellCompactLgClassName} text-left`}>Unit</th>
                  <th className={`${tableHeadCellCompactLgClassName} text-left`}>Kategori</th>
                  <th className={`${tableHeadCellCompactLgClassName} text-left`}>Sumber Dana</th>
                  <th className={`${tableHeadCellCompactLgClassName} text-right`}>Nominal</th>
                  <th className={`${tableHeadCellCompactLgClassName} text-left`}>Status</th>
                  <th className={`${tableHeadCellCompactLgClassName} text-left`}>Tanggal</th>
                  <th className={`${tableHeadCellCompactLgClassName} text-left`}>PIC</th>
                </tr>
              </thead>
              <tbody className={tableBodyStripedClassName}>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                      Tidak ada data sesuai filter.
                    </td>
                  </tr>
                ) : (
                  transactions.map((row) => (
                    <tr key={row.noDokumen}>
                      <td className="px-2 py-2 font-mono text-slate-700">{row.noDokumen}</td>
                      <td className="px-2 py-2 text-slate-600">{row.unit}</td>
                      <td className="px-2 py-2 text-slate-600">{row.kategori}</td>
                      <td className="px-2 py-2 text-slate-600">{row.sumberDana}</td>
                      <td className="px-2 py-2 text-right font-semibold text-slate-800">{row.nominal}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[0.625rem] font-medium ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-slate-500">{row.tanggal}</td>
                      <td className="px-2 py-2 text-slate-600">{row.pic}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="xl:col-span-2 space-y-3">
        <div className={cardClassName({ variant: "default" })}>
          <h3 className="text-sm font-semibold text-slate-800">Top Menunggu Pembayaran</h3>
          <ul className="mt-3 space-y-2.5">
            {BELANJA_TOP_PENDING.map((item, i) => (
              <li key={item.noDokumen} className="text-xs">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-slate-600">{item.noDokumen}</p>
                    <p className="text-slate-500">{item.unit}</p>
                    <p className="font-semibold text-slate-800">{item.nominal}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="xl:col-span-3">
        <div className={cardClassName({ variant: "default" })}>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800">Insight Belanja</h3>
          </div>
          <ul className="mt-3 space-y-2.5">
            {BELANJA_INSIGHTS.map((text) => (
              <li key={text} className="flex gap-2 text-xs leading-relaxed text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
