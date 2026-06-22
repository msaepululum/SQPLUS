"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchProyeksiCashflow } from "@/services/cashSaldoRekapService";
import type { CashProyeksiData } from "@/types/cash-saldo-rekap";
import { formatSaldoAmount } from "@/types/cash-saldo-rekap";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type ProyeksiCashflowTabProps = {
  title: string;
};

function amountClass(value: number) {
  if (value > 0) return "text-emerald-700";
  if (value < 0) return "text-red-600";
  return "text-slate-600";
}

export function ProyeksiCashflowTab({ title }: ProyeksiCashflowTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [data, setData] = useState<CashProyeksiData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchProyeksiCashflow(budgetYearId);
      setData(result);
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

  if (!data) {
    return (
      <EmptyState
        title="Gagal memuat proyeksi"
        description="Tidak dapat menghitung proyeksi arus kas."
        className="mt-3"
      />
    );
  }

  const { assumptions, summary, scenarios, actual_ytd } = data;

  const kpiItems = [
    { label: "Saldo Saat Ini", value: formatSaldoAmount(summary.saldo_saat_ini), tone: "default" as const },
    {
      label: "Est. Masuk Sisa",
      value: formatSaldoAmount(summary.estimasi_masuk_sisa),
      tone: "plan" as const,
    },
    {
      label: "Est. Keluar Sisa",
      value: formatSaldoAmount(summary.estimasi_keluar_sisa),
      tone: "actual" as const,
    },
    {
      label: "Saldo Proyeksi Akhir",
      value: formatSaldoAmount(summary.saldo_proyeksi_akhir),
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

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Rata-rata Masuk/Bulan", value: formatSaldoAmount(assumptions.rata_masuk_bulan) },
          { label: "Rata-rata Keluar/Bulan", value: formatSaldoAmount(assumptions.rata_keluar_bulan) },
          { label: "Bulan Berjalan", value: String(assumptions.bulan_berjalan) },
          { label: "BKU Belum Posting ACC", value: String(assumptions.pending_bku_belum_acc) },
        ].map((item) => (
          <div
            key={item.label}
            className={cardClassName({ variant: "default", className: "!p-2.5" })}
          >
            <p className="text-[10px] font-medium text-slate-500">{item.label}</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <div className={cn(tableGridShellClassName, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-700">Realisasi YTD</h3>
          </div>
          <Table>
            <TBody>
              <TR>
                <TD className="text-[11px] text-slate-600">Total Masuk</TD>
                <TD className="text-right tabular-nums text-[11px] text-emerald-700">
                  {formatSaldoAmount(actual_ytd.masuk)}
                </TD>
              </TR>
              <TR>
                <TD className="text-[11px] text-slate-600">Total Keluar</TD>
                <TD className="text-right tabular-nums text-[11px] text-red-600">
                  {formatSaldoAmount(actual_ytd.keluar)}
                </TD>
              </TR>
              <TR>
                <TD className="text-[11px] font-medium text-slate-700">Pending Masuk (belum ACC)</TD>
                <TD className="text-right tabular-nums text-[11px] text-amber-700">
                  {formatSaldoAmount(summary.pending_masuk)}
                </TD>
              </TR>
              <TR>
                <TD className="text-[11px] font-medium text-slate-700">Pending Keluar (belum ACC)</TD>
                <TD className="text-right tabular-nums text-[11px] text-amber-700">
                  {formatSaldoAmount(summary.pending_keluar)}
                </TD>
              </TR>
            </TBody>
          </Table>
        </div>

        <div className={cn(tableGridShellClassName, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-700">
              Proyeksi Sisa Tahun ({assumptions.bulan_sisa} bulan)
            </h3>
          </div>
          {scenarios.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-400">Tidak ada bulan tersisa</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH className="w-[3.5rem]">Bulan</TH>
                  <TH className="text-right">Est. Masuk</TH>
                  <TH className="text-right">Est. Keluar</TH>
                  <TH className="text-right">Saldo Proyeksi</TH>
                </TR>
              </THead>
              <TBody>
                {scenarios.map((row) => (
                  <TR key={row.bulan}>
                    <TD className="text-[11px] font-medium">{row.bulan_label}</TD>
                    <TD className="text-right tabular-nums text-[11px] text-emerald-700">
                      {formatSaldoAmount(row.estimasi_masuk)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-red-600">
                      {formatSaldoAmount(row.estimasi_keluar)}
                    </TD>
                    <TD
                      className={cn(
                        "text-right tabular-nums text-[11px] font-semibold",
                        amountClass(row.saldo_proyeksi)
                      )}
                    >
                      {formatSaldoAmount(row.saldo_proyeksi)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      </div>

      <p className={cn(cardClassName({ variant: "flat", className: "!p-2 text-[10px] text-slate-500" }))}>
        Proyeksi berdasarkan rata-rata arus kas bulanan dari BKUH + pending BKU belum posting ACC
      </p>
    </div>
  );
}
