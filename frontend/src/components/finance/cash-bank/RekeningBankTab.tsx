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
import {
  fetchCashBankRekonMeta,
  fetchRekeningBank,
} from "@/services/cashBankRekonService";
import type { CashBankRekonMeta, RekeningBankRow } from "@/types/cash-bank-rekon";
import { formatBankAmount, sourceLabel } from "@/types/cash-bank-rekon";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type RekeningBankTabProps = {
  title: string;
};

export function RekeningBankTab({ title }: RekeningBankTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [meta, setMeta] = useState<CashBankRekonMeta | null>(null);
  const [rows, setRows] = useState<RekeningBankRow[]>([]);
  const [summary, setSummary] = useState<{
    bulan_label: string;
    jumlah_rekening: number;
    rekening_aktif: number;
    total_masuk: number;
    total_keluar: number;
    total_saldo_akhir: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState("");

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchCashBankRekonMeta(budgetYearId).then(setMeta).catch(() => setMeta(null));
  }, [budgetYearId]);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchRekeningBank(budgetYearId, {
        bulan: bulan ? Number(bulan) : undefined,
      });
      setRows(result.rows);
      setSummary(result.summary);
    } catch {
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan]);

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
    { label: "Rekening Aktif", value: String(summary?.rekening_aktif ?? 0), tone: "muted" as const },
    { label: "Total Masuk", value: formatBankAmount(summary?.total_masuk ?? 0), tone: "plan" as const },
    { label: "Total Keluar", value: formatBankAmount(summary?.total_keluar ?? 0), tone: "actual" as const },
    {
      label: "Saldo Akhir",
      value: formatBankAmount(summary?.total_saldo_akhir ?? 0),
      tone: "default" as const,
    },
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
          <EmptyState title="Tidak ada rekening bank" description="Belum ada data rekening bank." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Bank / Rekening</TH>
                <TH className="w-[8rem]">No. Rekening</TH>
                <TH className="w-[7rem]">COA ACC</TH>
                <TH className="w-[4.5rem]">Sumber</TH>
                <TH className="w-[4rem]">Status</TH>
                <TH className="text-right">Masuk</TH>
                <TH className="text-right">Keluar</TH>
                <TH className="text-right">Saldo Buku</TH>
                <TH className="text-right">Saldo ACC</TH>
                <TH className="w-[4rem] text-right">Rekon</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.account_no} className={!row.is_active ? "opacity-50" : undefined}>
                  <TD>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-slate-800">{row.bank_name}</p>
                      <p className="truncate text-[10px] text-slate-500" title={row.account_name}>
                        {row.account_name}
                      </p>
                    </div>
                  </TD>
                  <TD className="font-mono text-[11px]">{row.rekening_no || "—"}</TD>
                  <TD className="font-mono text-[10px] text-slate-500">{row.acc_coa || "—"}</TD>
                  <TD>
                    <Badge variant="draft">{sourceLabel(row.source)}</Badge>
                  </TD>
                  <TD>
                    <Badge variant={row.is_active ? "success" : "warning"}>
                      {row.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] text-emerald-700">
                    {row.jumlah_transaksi > 0 ? formatBankAmount(row.masuk) : "—"}
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] text-red-600">
                    {row.jumlah_transaksi > 0 ? formatBankAmount(row.keluar) : "—"}
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] font-semibold text-slate-800">
                    {formatBankAmount(row.saldo_akhir)}
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] text-slate-600">
                    {row.saldo_acc !== null ? formatBankAmount(row.saldo_acc) : "—"}
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] text-slate-500">
                    {row.jumlah_transaksi > 0 ? `${row.rekon_pct}%` : "—"}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      {summary && (
        <p className={cn(cardClassName({ variant: "flat", className: "!p-2 text-[10px] text-slate-500" }))}>
          Periode: <strong>{summary.bulan_label}</strong> · {summary.jumlah_rekening} rekening · Sumber:
          SIMARTDB master_kas_bayar + ACC2026 tbbank/vkasbank
        </p>
      )}
    </div>
  );
}
