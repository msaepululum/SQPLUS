"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchHutangPerAkun } from "@/services/hutangPiutangService";
import type { HutangJenisId, HutangTahunPeriodeId } from "@/constants/hutang-categories";
import type { HpAccountRow } from "@/types/hutang-piutang";
import { formatHpAmount } from "@/types/hutang-piutang";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type HutangPerAkunTabProps = {
  jenis?: HutangJenisId | "";
  periode?: HutangTahunPeriodeId | "";
};

export function HutangPerAkunTab({ jenis, periode }: HutangPerAkunTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<HpAccountRow[]>([]);
  const [summary, setSummary] = useState<{ total_saldo?: number; jumlah_akun?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchHutangPerAkun(budgetYearId, {
        jenis: jenis || undefined,
        periode: periode || undefined,
      });
      setRows(result.rows);
      setSummary(result.summary);
    } catch {
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, jenis, periode]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat rekapitulasi per akun...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return <EmptyState title="Pilih tahun anggaran" description="Rekap hutang per akun." />;
  }

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <div className="flex flex-1 flex-wrap items-end justify-end gap-2">
          <ToolbarKpi
            items={[
              { label: "Jumlah Akun", value: String(summary?.jumlah_akun ?? 0), tone: "muted" },
              {
                label: "Total Saldo",
                value: formatHpAmount(Number(summary?.total_saldo ?? 0)),
                tone: "actual",
              },
            ]}
          />
        </div>
      </ToolbarShell>

      <div className={cn(tableGridShellClassName, "overflow-hidden")}>
        {rows.length === 0 ? (
          <EmptyState title="Tidak ada data" description="Belum ada saldo hutang per akun." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-[9rem]">Kode Akun</TH>
                <TH>Nama Akun</TH>
                <TH className="w-[5rem] text-right">Jumlah</TH>
                <TH className="text-right">Saldo Hutang</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.account_no}>
                  <TD className="font-mono text-[11px]">{row.account_no}</TD>
                  <TD className="text-[11px]">{row.account_name}</TD>
                  <TD className="text-right tabular-nums text-[11px] text-slate-500">{row.jumlah}</TD>
                  <TD className="text-right tabular-nums text-[11px] font-semibold text-red-700">
                    {formatHpAmount(row.saldo)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <p className={cn(cardClassName({ variant: "flat", className: "!p-2 text-[10px] text-slate-500" }))}>
        Rekap saldo kewajiban per COA — ACC2026
      </p>
    </div>
  );
}
