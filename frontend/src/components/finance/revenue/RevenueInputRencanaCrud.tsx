"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import type { RevenueCategoryId } from "@/constants/revenue-categories";
import { fetchRevenuePlans, saveRevenuePlansBulk } from "@/services/revenuePlanService";
import type { RevenuePlanRow, RevenuePlanSummary } from "@/types/revenue-plan";
import {
  formatRevenueTargetAmount,
  formatRevenueTargetInput,
  parseRevenueTargetInput,
} from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2, Save } from "lucide-react";

type PlanDraft = Record<string, string>;

type RevenueInputRencanaCrudProps = {
  activeCategory?: RevenueCategoryId | "";
};

function getRencanaValue(row: RevenuePlanRow, draft: PlanDraft): number {
  if (row.category_id in draft) {
    return parseRevenueTargetInput(draft[row.category_id]);
  }
  return row.rencana_amount;
}

export function RevenueInputRencanaCrud({ activeCategory = "" }: RevenueInputRencanaCrudProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<RevenuePlanRow[]>([]);
  const [summary, setSummary] = useState<RevenuePlanSummary | null>(null);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<PlanDraft>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setReady(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRevenuePlans(budgetYearId);
      setRows(result.rows);
      setSummary(result.summary);
      setReady(result.ready);
      setDraft({});
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat rencana pendapatan.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const displayRows = useMemo(() => {
    if (!activeCategory) return rows;
    return rows.filter((row) => row.category_id === activeCategory);
  }, [rows, activeCategory]);

  const hasChanges = Object.keys(draft).length > 0;

  const draftTotals = useMemo(() => {
    let target = 0;
    let rencana = 0;
    for (const row of displayRows) {
      target += row.target_amount;
      rencana += getRencanaValue(row, draft);
    }
    return { target, rencana, selisih: rencana - target };
  }, [displayRows, draft]);

  const kpiItems = useMemo(() => {
    const target = hasChanges ? draftTotals.target : (summary?.total_target ?? 0);
    const rencana = hasChanges ? draftTotals.rencana : (summary?.total_rencana ?? 0);
    const selisih = rencana - target;
    return [
      { label: "Total Target", value: `Rp ${formatRevenueTargetAmount(target)}`, tone: "muted" as const },
      { label: "Total Rencana", value: `Rp ${formatRevenueTargetAmount(rencana)}`, tone: "plan" as const },
      {
        label: "Selisih",
        value: `Rp ${formatRevenueTargetAmount(selisih)}`,
        tone: selisih === 0 ? ("muted" as const) : ("default" as const),
      },
    ];
  }, [summary, draftTotals, hasChanges]);

  const handleSave = async () => {
    if (!budgetYearId) return;
    setSaving(true);
    setMessage(null);
    try {
      const items = rows.map((row) => ({
        category_id: row.category_id,
        rencana_amount: getRencanaValue(row, draft),
      }));
      const result = await saveRevenuePlansBulk(budgetYearId, items);
      setRows(result.rows);
      setSummary(result.summary);
      setReady(result.ready);
      setDraft({});
      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan rencana.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat rencana pendapatan...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Rencana pendapatan dikunci per tahun anggaran. Pilih tahun di bar atas."
        className="mt-3"
      />
    );
  }

  if (!ready) {
    return (
      <EmptyState
        title="Setup target belum lengkap"
        description="Lengkapi Setup Target pendapatan terlebih dahulu sebelum mengisi rencana per kategori."
        className="mt-3"
      />
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell footer={<ToolbarKpi items={kpiItems} />}>
        <p className="text-[10px] text-slate-400">
          Rencana tahun {budgetYear.tahun}
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
          {saving ? "Menyimpan..." : "Simpan Rencana"}
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
          <h3 className="text-xs font-semibold text-slate-800">Rencana per Kategori Pendapatan</h3>
          <p className="text-[10px] text-slate-400">
            Target dari Setup Target (menjadi) sebagai acuan — isi rencana operasional per kategori
          </p>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH className="w-12">Kode</TH>
              <TH>Kategori Pendapatan</TH>
              <TH className="w-48 text-right">Target (Rp)</TH>
              <TH className="w-48 text-right">Rencana (Rp)</TH>
              <TH className="w-40 text-right">Selisih (Rp)</TH>
            </TR>
          </THead>
          <TBody>
            {displayRows.map((row) => {
              const rencana = getRencanaValue(row, draft);
              const selisih = rencana - row.target_amount;
              const display =
                row.category_id in draft
                  ? formatRevenueTargetInput(parseRevenueTargetInput(draft[row.category_id]))
                  : formatRevenueTargetInput(row.rencana_amount);

              return (
                <TR key={row.category_id}>
                  <TD className="font-mono text-[10px] text-slate-500">{row.kode}</TD>
                  <TD className="text-[11px] font-medium text-slate-700">{row.label}</TD>
                  <TD className="text-right tabular-nums text-[11px] text-slate-600">
                    {formatRevenueTargetAmount(row.target_amount)}
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
                      disabled={saving}
                      className="ml-auto h-9 w-full max-w-[14rem] text-right text-sm tabular-nums"
                    />
                  </TD>
                  <TD
                    className={cn(
                      "text-right tabular-nums text-[11px]",
                      selisih === 0
                        ? "text-slate-400"
                        : selisih > 0
                          ? "font-medium text-emerald-700"
                          : "font-medium text-amber-700"
                    )}
                  >
                    {formatRevenueTargetAmount(selisih)}
                  </TD>
                </TR>
              );
            })}
            <TR className="bg-slate-50/80 font-semibold">
              <TD colSpan={2} className="text-[11px]">
                Total
              </TD>
              <TD className="text-right text-[11px] tabular-nums text-slate-700">
                {formatRevenueTargetAmount(
                  hasChanges ? draftTotals.target : (summary?.total_target ?? 0)
                )}
              </TD>
              <TD className="text-right text-[11px] tabular-nums text-[#0d6e63]">
                {formatRevenueTargetAmount(
                  hasChanges ? draftTotals.rencana : (summary?.total_rencana ?? 0)
                )}
              </TD>
              <TD className="text-right text-[11px] tabular-nums text-slate-700">
                {formatRevenueTargetAmount(
                  hasChanges ? draftTotals.selisih : (summary?.total_selisih ?? 0)
                )}
              </TD>
            </TR>
          </TBody>
        </Table>
      </div>
    </div>
  );
}
