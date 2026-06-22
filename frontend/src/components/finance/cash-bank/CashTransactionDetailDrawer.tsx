"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { CashTransactionDetail } from "@/types/cash-transaction";
import {
  formatCashAmount,
  formatCashDate,
  flowTypeLabel,
  sourceLabel,
} from "@/types/cash-transaction";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { cn } from "@/lib/cn";
import { Loader2, X } from "lucide-react";

type CashTransactionDetailDrawerProps = {
  detail: CashTransactionDetail | null;
  loading?: boolean;
  onClose: () => void;
};

export function CashTransactionDetailDrawer({
  detail,
  loading,
  onClose,
}: CashTransactionDetailDrawerProps) {
  if (!detail && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]"
        aria-label="Tutup detail"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Detail Jurnal
            </p>
            <h3 className="truncate text-base font-semibold text-slate-900">
              {detail?.no_jurnal ?? "Memuat..."}
            </h3>
            {detail && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge variant={detail.flow_type === "masuk" ? "success" : "warning"}>
                  {flowTypeLabel(detail.flow_type)}
                </Badge>
                <Badge variant="info">{detail.journal_type_label}</Badge>
                <Badge variant={detail.source === "acc2026" ? "draft" : "info"}>
                  {sourceLabel(detail.source)}
                </Badge>
              </div>
            )}
          </div>
          <Button type="button" variant="ghost" className="h-8 w-8 px-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat detail jurnal...
          </div>
        ) : detail ? (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Tanggal</dt>
                <dd className="font-medium text-slate-800">{formatCashDate(detail.tanggal)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Nominal</dt>
                <dd
                  className={cn(
                    "font-semibold",
                    detail.flow_type === "masuk" ? "text-emerald-700" : "text-amber-700"
                  )}
                >
                  {formatCashAmount(detail.amount)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Keterangan</dt>
                <dd className="text-slate-800">{detail.keterangan || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">No. Bukti</dt>
                <dd className="text-slate-800">{detail.no_bukti || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Referensi</dt>
                <dd className="text-slate-800">{detail.referensi || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Rekening Kas/Bank</dt>
                <dd className="text-slate-800">
                  {detail.kas_account_name || detail.kas_account_no || "—"}
                  {detail.kas_account_no && (
                    <span className="mt-0.5 block font-mono text-xs text-slate-500">
                      {detail.kas_account_no}
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <h4 className="mb-2 text-sm font-semibold text-slate-800">
                Baris Jurnal (Double-Entry)
              </h4>
              <div className={tableGridShellClassName}>
                <Table>
                  <THead>
                    <TR>
                      <TH>Akun</TH>
                      <TH className="text-right">Debet</TH>
                      <TH className="text-right">Kredit</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {detail.lines.map((line, idx) => (
                      <TR key={`${line.account_no}-${idx}`}>
                        <TD>
                          <div className="font-medium text-slate-800">{line.account_name || "—"}</div>
                          <div className="font-mono text-[11px] text-slate-500">{line.account_no}</div>
                          {line.keterangan && (
                            <div className="mt-0.5 text-[11px] text-slate-400">{line.keterangan}</div>
                          )}
                        </TD>
                        <TD className="text-right font-mono text-sm">
                          {line.debet > 0 ? formatCashAmount(line.debet) : "—"}
                        </TD>
                        <TD className="text-right font-mono text-sm">
                          {line.kredit > 0 ? formatCashAmount(line.kredit) : "—"}
                        </TD>
                      </TR>
                    ))}
                    <TR className="bg-slate-50/80 font-semibold">
                      <TD>Total</TD>
                      <TD className="text-right font-mono">{formatCashAmount(detail.totals.debet)}</TD>
                      <TD className="text-right font-mono">{formatCashAmount(detail.totals.kredit)}</TD>
                    </TR>
                  </TBody>
                </Table>
              </div>
              {detail.totals.debet === detail.totals.kredit ? (
                <p className="mt-2 text-xs text-emerald-600">✓ Jurnal seimbang (debet = kredit)</p>
              ) : (
                <p className="mt-2 text-xs text-red-600">⚠ Jurnal tidak seimbang</p>
              )}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
