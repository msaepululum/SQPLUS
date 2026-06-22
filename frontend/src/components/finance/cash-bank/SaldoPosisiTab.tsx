"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  ToolbarFilter,
  ToolbarKpi,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchCashSaldoMeta, fetchPosisiSaldo } from "@/services/cashSaldoRekapService";
import type {
  CashPosisiSaldoRow,
  CashPosisiSaldoSummary,
  CashSaldoMeta,
} from "@/types/cash-saldo-rekap";
import { formatSaldoAmount } from "@/types/cash-saldo-rekap";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type SaldoPosisiTabProps = {
  title: string;
};

function amountClass(value: number, positive = "text-emerald-700", negative = "text-red-600") {
  if (value > 0) return positive;
  if (value < 0) return negative;
  return "text-slate-600";
}

export function SaldoPosisiTab({ title }: SaldoPosisiTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [meta, setMeta] = useState<CashSaldoMeta | null>(null);
  const [rows, setRows] = useState<CashPosisiSaldoRow[]>([]);
  const [summary, setSummary] = useState<CashPosisiSaldoSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState("");
  const [kasAccount, setKasAccount] = useState("");

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchCashSaldoMeta(budgetYearId).then(setMeta).catch(() => setMeta(null));
  }, [budgetYearId]);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchPosisiSaldo(budgetYearId, {
        bulan: bulan ? Number(bulan) : undefined,
        kas_account_no: kasAccount || undefined,
      });
      setRows(result.rows);
      setSummary(result.summary);
    } catch {
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan, kasAccount]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (yearLoading || (loading && rows.length === 0 && !summary)) {
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
    { label: "Saldo Awal", value: formatSaldoAmount(summary?.saldo_awal ?? 0), tone: "muted" as const },
    { label: "Total Masuk", value: formatSaldoAmount(summary?.total_masuk ?? 0), tone: "plan" as const },
    { label: "Total Keluar", value: formatSaldoAmount(summary?.total_keluar ?? 0), tone: "actual" as const },
    { label: "Saldo Akhir", value: formatSaldoAmount(summary?.saldo_akhir ?? 0), tone: "default" as const },
  ];

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarFilter label="Periode" value={bulan} onChange={setBulan}>
          <option value="">Tahun penuh</option>
          {meta?.bulan_options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </ToolbarFilter>
        <ToolbarFilter label="Rekening" value={kasAccount} onChange={setKasAccount}>
          <option value="">Semua rekening</option>
          {meta?.kas_account_options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </ToolbarFilter>
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
          <EmptyState title="Tidak ada data" description="Belum ada rekening kas/bank untuk periode ini." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-[7rem]">No. Rekening</TH>
                <TH>Nama Rekening</TH>
                <TH className="w-[5rem]">Tipe</TH>
                <TH className="text-right">Saldo Awal</TH>
                <TH className="text-right">Masuk</TH>
                <TH className="text-right">Keluar</TH>
                <TH className="text-right">Saldo Akhir</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.account_no}>
                  <TD className="font-mono text-[11px]">{row.account_no}</TD>
                  <TD className="max-w-[14rem] truncate text-[11px]">{row.account_name}</TD>
                  <TD>
                    <Badge variant={row.account_type === "bank" ? "info" : "draft"}>
                      {row.account_type === "bank" ? "Bank" : "Kas"}
                    </Badge>
                  </TD>
                  <TD className={cn("text-right tabular-nums text-[11px]", amountClass(row.saldo_awal))}>
                    {formatSaldoAmount(row.saldo_awal)}
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] text-emerald-700">
                    {formatSaldoAmount(row.masuk)}
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] text-red-600">
                    {formatSaldoAmount(row.keluar)}
                  </TD>
                  <TD
                    className={cn(
                      "text-right text-[11px] font-semibold tabular-nums",
                      amountClass(row.saldo_akhir)
                    )}
                  >
                    {formatSaldoAmount(row.saldo_akhir)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      {summary && (
        <p className={cn(cardClassName({ variant: "flat", className: "!p-2 text-[10px] text-slate-500" }))}>
          Periode: <strong>{summary.bulan_label}</strong> · Tahun {summary.tahun} ·{" "}
          {summary.jumlah_rekening} rekening · Sumber: SIMARTDB BKU + master_kas_bayar
        </p>
      )}
    </div>
  );
}
