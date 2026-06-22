"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchAccPerubahanEkuitas } from "@/services/accountingService";
import { formatAccAmount } from "@/types/accounting";
import { Loader2 } from "lucide-react";

export function AccountingEkuitasTab() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAccPerubahanEkuitas>> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      setData(await fetchAccPerubahanEkuitas(budgetYearId));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (yearLoading || (loading && !data)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat perubahan ekuitas...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState title="Pilih tahun anggaran" description="Laporan ekuitas dikunci per tahun anggaran." />
    );
  }

  if (!data) {
    return (
      <EmptyState title="Gagal memuat data" description="Tidak dapat mengambil data ekuitas dari ACC2026." />
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarKpi
          items={[
            {
              label: "Total Saldo Ekuitas",
              value: formatAccAmount(data.summary.total_saldo ?? 0),
              tone: "default",
            },
            {
              label: "Mutasi Debet",
              value: formatAccAmount(data.summary.total_mutasi_debet ?? 0),
              tone: "default",
            },
            {
              label: "Mutasi Kredit",
              value: formatAccAmount(data.summary.total_mutasi_kredit ?? 0),
              tone: "default",
            },
          ]}
        />
      </ToolbarShell>

      <div className={tableGridShellClassName}>
        <Table>
          <THead>
            <TR>
              <TH>Kode</TH>
              <TH>Nama Akun</TH>
              <TH className="text-right">Saldo Awal</TH>
              <TH className="text-right">Mutasi Debet</TH>
              <TH className="text-right">Mutasi Kredit</TH>
              <TH className="text-right">Saldo Akhir</TH>
            </TR>
          </THead>
          <TBody>
            {data.rows.length === 0 ? (
              <TR>
                <TD colSpan={6} className="py-8 text-center text-sm text-slate-400">
                  Tidak ada akun ekuitas
                </TD>
              </TR>
            ) : (
              data.rows.map((row) => (
                <TR key={row.account_no}>
                  <TD className="font-mono text-xs">{row.account_no}</TD>
                  <TD>{row.account_name}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(row.saldo_awal)}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(row.mutasi_debet)}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(row.mutasi_kredit)}</TD>
                  <TD className="text-right tabular-nums font-medium">
                    {formatAccAmount(row.saldo_akhir)}
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
      <p className="text-[11px] text-slate-400">Sumber: {data.source}</p>
    </div>
  );
}
