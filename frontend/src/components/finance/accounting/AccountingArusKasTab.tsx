"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccountingBulanFilter } from "@/components/finance/accounting/AccountingBulanFilter";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchAccArusKas } from "@/services/accountingService";
import { formatAccAmount } from "@/types/accounting";
import { Loader2 } from "lucide-react";

export function AccountingArusKasTab() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const { bulan } = useAccountingBulanFilter();
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAccArusKas>> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      setData(await fetchAccArusKas(budgetYearId, bulan));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (yearLoading || (loading && !data)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat arus kas...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState title="Pilih tahun anggaran" description="Arus kas dikunci per tahun anggaran." />
    );
  }

  if (!data) {
    return (
      <EmptyState title="Gagal memuat data" description="Tidak dapat mengambil arus kas dari ACC2026." />
    );
  }

  const maxNet = Math.max(...data.monthly.map((m) => Math.abs(m.net)), 1);

  return (
    <div className="mt-2 space-y-3">
      <ToolbarShell>
        <ToolbarKpi
          items={[
            { label: "Total Masuk", value: formatAccAmount(data.summary.total_masuk), tone: "default" },
            { label: "Total Keluar", value: formatAccAmount(data.summary.total_keluar), tone: "default" },
            { label: "Net Arus Kas", value: formatAccAmount(data.summary.net), tone: "default" },
          ]}
        />
      </ToolbarShell>

      <div className={cardClassName({ variant: "default", className: "!p-3" })}>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Trend Bulanan</h3>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
          {data.monthly.map((m) => (
            <div key={m.bulan} className="text-center">
              <div className="mx-auto flex h-16 w-full max-w-[2rem] items-end justify-center rounded bg-slate-100">
                <div
                  className={`w-full rounded ${m.net >= 0 ? "bg-emerald-500" : "bg-red-400"}`}
                  style={{ height: `${Math.max(8, (Math.abs(m.net) / maxNet) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">{m.label.slice(0, 3)}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-slate-800">Per Akun Kas</h3>
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>Kode</TH>
                <TH>Nama Akun</TH>
                <TH className="text-right">Masuk</TH>
                <TH className="text-right">Keluar</TH>
                <TH className="text-right">Net</TH>
              </TR>
            </THead>
            <TBody>
              {data.accounts.map((r) => (
                <TR key={r.account_no}>
                  <TD className="font-mono text-xs">{r.account_no}</TD>
                  <TD>{r.account_name}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(r.masuk)}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(r.keluar)}</TD>
                  <TD className="text-right tabular-nums font-medium">{formatAccAmount(r.net)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">Sumber: {data.source}</p>
    </div>
  );
}
