"use client";

import type { CashBankDashboardTransaction } from "@/types/cash-bank-dashboard";
import { formatDashboardAmount } from "@/types/cash-bank-dashboard";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import {
  tableBodyStripedClassName,
  tableHeadCellMdClassName,
  tableHeadRowClassName,
  tableShellClassName,
} from "@/components/ui/tableStyles";
import { cn } from "@/lib/cn";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export function KasBankFlowTable({
  transactions,
}: {
  transactions: CashBankDashboardTransaction[];
}) {
  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-800">Transaksi BKU Terbaru</h3>
        <p className="text-[10px] text-slate-400">Buku Kas Umum — SIMARTDB (pembayaran &amp; penerimaan operasional)</p>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full min-w-[48rem] text-[11px]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellMdClassName} text-left`}>Tgl</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>No. BKU</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>No. Jurnal ACC</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>Keterangan</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Nominal</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>Status</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-400">Tidak ada transaksi BKU.</td>
              </tr>
            ) : (
              transactions.map((row) => (
                <tr key={row.no_bku}>
                  <td className="whitespace-nowrap px-2 py-1.5 tabular-nums">{formatDate(row.tanggal)}</td>
                  <td className="px-2 py-1.5 font-mono text-[10px]">{row.no_bku}</td>
                  <td className="px-2 py-1.5 font-mono text-[10px] text-slate-500">
                    {row.no_jurnal || "—"}
                  </td>
                  <td className="max-w-[14rem] truncate px-2 py-1.5" title={row.keterangan}>
                    {row.keterangan || "—"}
                  </td>
                  <td
                    className={cn(
                      "whitespace-nowrap px-2 py-1.5 text-right font-mono font-semibold tabular-nums",
                      row.flow_type === "masuk" ? "text-emerald-700" : "text-amber-700"
                    )}
                  >
                    {formatDashboardAmount(row.amount, true)}
                  </td>
                  <td className="px-2 py-1.5">
                    <Badge variant={row.posted_acc ? "success" : "warning"}>
                      {row.posted_acc ? "Posted ACC" : "Draft BKU"}
                    </Badge>
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
