"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { fetchRevenueImports, runRevenueImport } from "@/services/revenueCollectService";
import type { RevenueImportBatchRow } from "@/types/revenue-collect";
import { formatRevenueTargetAmount } from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Download, Loader2 } from "lucide-react";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function RevenueImportTarikCrud() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<RevenueImportBatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [periodeFrom, setPeriodeFrom] = useState(firstDayOfMonthIso());
  const [periodeTo, setPeriodeTo] = useState(todayIso());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRevenueImports(budgetYearId);
      setRows(result.rows);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat riwayat import.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const handleImport = async () => {
    if (!budgetYearId) return;
    setImporting(true);
    setMessage(null);
    try {
      const result = await runRevenueImport({
        budget_year_id: budgetYearId,
        periode_from: periodeFrom,
        periode_to: periodeTo,
        source_system: "billing",
      });
      setRows(result.rows);
      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menjalankan import.",
      });
    } finally {
      setImporting(false);
    }
  };

  const totalImported = rows.reduce((s, r) => s + r.total_amount, 0);

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat data import...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Import pendapatan dikunci per tahun anggaran."
        className="mt-3"
      />
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell
        footer={
          <ToolbarKpi
            items={[
              { label: "Batch Import", value: String(rows.length), tone: "muted" },
              {
                label: "Total Diimpor",
                value: `Rp ${formatRevenueTargetAmount(totalImported)}`,
                tone: "plan",
              },
            ]}
          />
        }
      >
        <p className="text-[10px] text-slate-400">
          Tarik realisasi pendapatan · tahun {budgetYear.tahun} — dipetakan ke 8 kategori BLU
        </p>
      </ToolbarShell>

      <div className={cardClassName({ variant: "default", className: "!p-4" })}>
        <h3 className="text-xs font-semibold text-slate-800">Tarik Data Billing</h3>
        <p className="mt-1 text-[10px] text-slate-400">
          Pilih periode tarik data. Realisasi akan dipetakan ke kategori pendapatan BLU (P01–P08).
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-[10px] text-slate-500">
            Dari
            <Input
              type="date"
              value={periodeFrom}
              onChange={(e) => setPeriodeFrom(e.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </label>
          <label className="text-[10px] text-slate-500">
            Sampai
            <Input
              type="date"
              value={periodeTo}
              onChange={(e) => setPeriodeTo(e.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </label>
          <Button
            type="button"
            onClick={() => void handleImport()}
            disabled={importing}
            className="h-9 text-xs"
          >
            {importing ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            {importing ? "Menarik..." : "Tarik Data"}
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          )}
        >
          {message.text}
        </div>
      )}

      <div className={cardClassName({ variant: "default", className: cn("!p-0", tableGridShellClassName) })}>
        <div className="border-b border-slate-100 px-3 py-2">
          <h3 className="text-xs font-semibold text-slate-800">Riwayat Import</h3>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH>Waktu</TH>
              <TH>Periode</TH>
              <TH>Sumber</TH>
              <TH className="text-right">Baris</TH>
              <TH className="text-right">Total (Rp)</TH>
              <TH>Status</TH>
              <TH>Keterangan</TH>
            </TR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TR>
                <TD colSpan={7} className="py-8 text-center text-xs text-slate-400">
                  Belum ada riwayat import
                </TD>
              </TR>
            ) : (
              rows.map((row) => (
                <TR key={row.id}>
                  <TD className="text-[11px] text-slate-600">
                    {row.imported_at
                      ? new Date(row.imported_at).toLocaleString("id-ID")
                      : "—"}
                  </TD>
                  <TD className="text-[11px] tabular-nums">
                    {row.periode_from} — {row.periode_to}
                  </TD>
                  <TD className="text-[11px] capitalize">{row.source_system}</TD>
                  <TD className="text-right tabular-nums text-[11px]">{row.total_rows}</TD>
                  <TD className="text-right tabular-nums text-[11px] font-medium text-[#0d6e63]">
                    {formatRevenueTargetAmount(row.total_amount)}
                  </TD>
                  <TD className="text-[11px] capitalize">{row.status}</TD>
                  <TD className="max-w-[14rem] truncate text-[10px] text-slate-500">
                    {row.message ?? "—"}
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
