"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchRekapBulanan } from "@/services/cashSaldoRekapService";
import type { CashRekapBulananRow } from "@/types/cash-saldo-rekap";
import { formatSaldoAmount } from "@/types/cash-saldo-rekap";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type SaldoRekapBulananTabProps = {
  title: string;
};

function amountClass(value: number) {
  if (value > 0) return "text-emerald-700";
  if (value < 0) return "text-red-600";
  return "text-slate-500";
}

export function SaldoRekapBulananTab({ title }: SaldoRekapBulananTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<CashRekapBulananRow[]>([]);
  const [summary, setSummary] = useState<{
    tahun: number;
    total_masuk: number;
    total_keluar: number;
    saldo_akhir_tahun: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchRekapBulanan(budgetYearId);
      setRows(result.rows);
      setSummary(result.summary);
    } catch {
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (yearLoading || (loading && rows.length === 0)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat {title.toLowerCase()}...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description={`${title} dikunci per tahun anggaran.`}
        className="mt-3"
      />
    );
  }

  const kpiItems = [
    { label: "Total Masuk", value: formatSaldoAmount(summary?.total_masuk ?? 0), tone: "plan" as const },
    { label: "Total Keluar", value: formatSaldoAmount(summary?.total_keluar ?? 0), tone: "actual" as const },
    {
      label: "Saldo Akhir Tahun",
      value: formatSaldoAmount(summary?.saldo_akhir_tahun ?? 0),
      tone: "default" as const,
    },
    {
      label: "Transaksi",
      value: String(rows.reduce((s, r) => s + r.jumlah_transaksi, 0)),
      tone: "muted" as const,
    },
  ];

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <div className="flex flex-1 flex-wrap items-end justify-end gap-2">
          <ToolbarKpi items={kpiItems} />
        </div>
      </ToolbarShell>

      <div className={cn(tableGridShellClassName, "overflow-hidden")}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memperbarui...
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="Tidak ada data" description="Belum ada transaksi BKU untuk tahun ini." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-[4rem]">Bulan</TH>
                <TH className="text-right">Saldo Awal</TH>
                <TH className="text-right">Masuk</TH>
                <TH className="text-right">Keluar</TH>
                <TH className="text-right">Neto</TH>
                <TH className="text-right">Saldo Akhir</TH>
                <TH className="w-[5rem] text-right">Transaksi</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => {
                const hasData = row.jumlah_transaksi > 0;
                return (
                  <TR key={row.bulan} className={!hasData ? "opacity-50" : undefined}>
                    <TD className="font-medium text-[11px]">{row.bulan_label}</TD>
                    <TD className="text-right tabular-nums text-[11px] text-slate-600">
                      {formatSaldoAmount(row.saldo_awal)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-emerald-700">
                      {hasData ? formatSaldoAmount(row.masuk) : "—"}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-red-600">
                      {hasData ? formatSaldoAmount(row.keluar) : "—"}
                    </TD>
                    <TD
                      className={cn(
                        "text-right tabular-nums text-[11px] font-medium",
                        hasData ? amountClass(row.neto) : "text-slate-400"
                      )}
                    >
                      {hasData ? formatSaldoAmount(row.neto) : "—"}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] font-semibold text-slate-800">
                      {formatSaldoAmount(row.saldo_akhir)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-slate-500">
                      {row.jumlah_transaksi || "—"}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </div>

      {summary && (
        <p className={cn(cardClassName({ variant: "flat", className: "!p-2 text-[10px] text-slate-500" }))}>
          Rekap bulanan BKUH · Tahun {summary.tahun} · Saldo berjalan kumulatif Jan–Des
        </p>
      )}
    </div>
  );
}
