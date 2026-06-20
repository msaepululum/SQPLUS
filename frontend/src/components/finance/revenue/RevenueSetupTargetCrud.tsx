"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  fetchRevenueTargets,
  saveRevenueTargetsBulk,
} from "@/services/revenueTargetService";
import {
  formatRevenueTargetAmount,
  formatRevenueTargetInput,
  parseRevenueTargetInput,
  type RevenueTargetRow,
  type RevenueTargetSummary,
} from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2, Save } from "lucide-react";

type TargetDraft = Record<string, string>;

function getTargetValue(row: RevenueTargetRow, draft: TargetDraft): number {
  if (row.category_id in draft) {
    return parseRevenueTargetInput(draft[row.category_id]);
  }
  return row.menjadi_amount;
}

export function RevenueSetupTargetCrud() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<RevenueTargetRow[]>([]);
  const [summary, setSummary] = useState<RevenueTargetSummary | null>(null);
  const [draft, setDraft] = useState<TargetDraft>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRevenueTargets(budgetYearId);
      setRows(result.rows);
      setSummary(result.summary);
      setDraft({});
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat target pendapatan.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const draftTotal = useMemo(() => {
    return rows.reduce((sum, row) => sum + getTargetValue(row, draft), 0);
  }, [rows, draft]);

  const hasChanges = Object.keys(draft).length > 0;

  const kpiItems = useMemo(() => {
    const total = hasChanges ? draftTotal : (summary?.total_target ?? 0);
    return [
      {
        label: "Total Target",
        value: `Rp ${formatRevenueTargetAmount(total)}`,
        tone: "plan" as const,
      },
      {
        label: "Kategori",
        value: String(summary?.jumlah_kategori ?? 8),
        tone: "muted" as const,
      },
    ];
  }, [summary, draftTotal, hasChanges]);

  const handleSave = async () => {
    if (!budgetYearId) return;
    setSaving(true);
    setMessage(null);
    try {
      const items = rows.map((row) => ({
        category_id: row.category_id,
        menjadi_amount: getTargetValue(row, draft),
      }));
      const result = await saveRevenueTargetsBulk(budgetYearId, items);
      setRows(result.rows);
      setSummary(result.summary);
      setDraft({});
      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan target.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat target pendapatan...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Target pendapatan dikunci per tahun anggaran. Pilih tahun di bar atas."
        className="mt-3"
      />
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell footer={<ToolbarKpi items={kpiItems} />}>
        <p className="text-[10px] text-slate-400">
          Target tahun {budgetYear.tahun}
          {budgetYear.nama ? ` · ${budgetYear.nama}` : ""} — 8 kategori BLU
        </p>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || rows.length === 0}
          className="ml-auto h-8 text-xs"
        >
          {saving ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-3.5 w-3.5" />
          )}
          {saving ? "Menyimpan..." : "Simpan Target"}
        </Button>
      </ToolbarShell>

      {message && (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          {message.text}
        </div>
      )}

      <div
        className={cardClassName({
          variant: "default",
          className: cn("!p-0", tableGridShellClassName),
        })}
      >
        <div className="border-b border-slate-100 px-3 py-2">
          <h3 className="text-xs font-semibold text-slate-800">Target per Kategori Pendapatan</h3>
          <p className="text-[10px] text-slate-400">
            Masukkan nilai target (Rp) — total otomatis dijumlahkan
          </p>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH className="w-12">Kode</TH>
              <TH>Kategori Pendapatan</TH>
              <TH className="w-36 text-right">Semula (Rp)</TH>
              <TH className="w-36 text-right">Menjadi (Rp)</TH>
              <TH className="w-32 text-right">Pergeseran (Rp)</TH>
              <TH className="w-24 text-right">Perubahan</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => {
              const display =
                row.category_id in draft
                  ? draft[row.category_id]
                  : formatRevenueTargetInput(row.menjadi_amount);
              const locked = Boolean(row.corrected_at);
              return (
                <TR key={row.category_id}>
                  <TD className="font-mono text-[10px] text-slate-500">{row.kode}</TD>
                  <TD className="text-[11px] font-medium text-slate-700">{row.label}</TD>
                  <TD className="text-right tabular-nums text-[11px] text-slate-600">
                    {formatRevenueTargetAmount(row.semula_amount)}
                  </TD>
                  <TD className="text-right">
                    <Input
                      value={display}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [row.category_id]: e.target.value.replace(/[^\d]/g, ""),
                        }))
                      }
                      placeholder="0"
                      disabled={locked || saving}
                      className="ml-auto h-8 w-full max-w-[10rem] text-right text-xs tabular-nums"
                    />
                    {locked && (
                      <p className="mt-1 text-[10px] text-slate-400">Sudah dikoreksi (1x)</p>
                    )}
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] text-slate-700">
                    {formatRevenueTargetAmount(row.pergeseran_amount)}
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] text-slate-600">
                    {row.perubahan_pct == null ? "—" : `${row.perubahan_pct.toFixed(2).replace(".", ",")}%`}
                  </TD>
                </TR>
              );
            })}
            <TR className="bg-slate-50/80 font-semibold">
              <TD colSpan={2} className="text-[11px]">
                Total Target
              </TD>
              <TD className="text-right text-[11px] tabular-nums text-slate-300">—</TD>
              <TD className="text-right text-[11px] tabular-nums text-[#0d6e63]">
                {formatRevenueTargetAmount(hasChanges ? draftTotal : (summary?.total_target ?? 0))}
              </TD>
              <TD className="text-right text-[11px] tabular-nums text-slate-300">—</TD>
              <TD className="text-right text-[11px] tabular-nums text-slate-300">—</TD>
            </TR>
          </TBody>
        </Table>
      </div>
    </div>
  );
}
