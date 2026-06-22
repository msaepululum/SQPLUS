"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  TableLegend,
  ToolbarKpi,
  ToolbarSegmented,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import type { RevenueCategoryId } from "@/constants/revenue-categories";
import {
  fetchRevenueMonthlyPlans,
  saveRevenueMonthlyPlansBulk,
} from "@/services/revenuePlanService";
import {
  REVENUE_MONTH_NAMES,
  REVENUE_MONTHS,
  type RevenueMonthlyPlanRow,
  type RevenueMonthlyPlanSummary,
} from "@/types/revenue-plan";
import {
  formatRevenueTargetAmount,
  formatRevenueTargetInput,
  parseRevenueTargetInput,
} from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridHeaderClassName, tableGridShellClassName } from "@/components/ui/tableStyles";
import { LayoutGrid, List, Loader2, Save } from "lucide-react";

type ViewMode = "rekap" | "detail";
type MonthlyDraft = Record<string, string>;

type RevenueDistribusiBulananCrudProps = {
  activeCategory?: RevenueCategoryId | "";
};

function draftKey(categoryId: string, bulan: number) {
  return `${categoryId}__${bulan}`;
}

function getMonthAmount(
  row: RevenueMonthlyPlanRow,
  bulan: number,
  draft: MonthlyDraft
): number {
  const key = draftKey(row.category_id, bulan);
  if (key in draft) return parseRevenueTargetInput(draft[key]);
  const month = row.months.find((m) => m.bulan === bulan);
  return month?.rencana ?? 0;
}

function getMonthDisplay(
  row: RevenueMonthlyPlanRow,
  bulan: number,
  draft: MonthlyDraft
): string {
  const key = draftKey(row.category_id, bulan);
  if (key in draft) {
    return formatRevenueTargetInput(parseRevenueTargetInput(draft[key]));
  }
  const month = row.months.find((m) => m.bulan === bulan);
  return formatRevenueTargetInput(month?.rencana ?? 0);
}

function buildRecapRows(rows: RevenueMonthlyPlanRow[], draft: MonthlyDraft) {
  return REVENUE_MONTHS.map((bulan) => {
    let rencana = 0;
    for (const row of rows) {
      rencana += getMonthAmount(row, bulan, draft);
    }
    return {
      bulan,
      nama_bulan: REVENUE_MONTH_NAMES[bulan],
      rencana,
    };
  });
}

export function RevenueDistribusiBulananCrud({
  activeCategory = "",
}: RevenueDistribusiBulananCrudProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<RevenueMonthlyPlanRow[]>([]);
  const [summary, setSummary] = useState<RevenueMonthlyPlanSummary | null>(null);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<MonthlyDraft>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("rekap");
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
      const result = await fetchRevenueMonthlyPlans(
        budgetYearId,
        activeCategory || undefined
      );
      setRows(result.rows);
      setSummary(result.summary);
      setReady(result.ready);
      setDraft({});
      setDirtyKeys(new Set());
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat distribusi bulanan.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, activeCategory]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const recapRows = useMemo(() => buildRecapRows(rows, draft), [rows, draft]);

  const rowTotals = useMemo(() => {
    return rows.map((row) => {
      let total = 0;
      for (const bulan of REVENUE_MONTHS) {
        total += getMonthAmount(row, bulan, draft);
      }
      return { row, total, selisih: total - row.rencana_tahunan };
    });
  }, [rows, draft]);

  const kpiTotals = useMemo(() => {
    const distribusi = rowTotals.reduce((s, r) => s + r.total, 0);
    const rencana = rows.reduce((s, r) => s + r.rencana_tahunan, 0);
    return { distribusi, rencana, selisih: distribusi - rencana };
  }, [rowTotals, rows]);

  const patchMonth = (categoryId: string, bulan: number, value: string) => {
    const key = draftKey(categoryId, bulan);
    setDraft((prev) => ({ ...prev, [key]: value.replace(/[^\d]/g, "") }));
    setDirtyKeys((prev) => new Set(prev).add(key));
  };

  const handleSave = async () => {
    if (!budgetYearId || dirtyKeys.size === 0) return;
    setSaving(true);
    setMessage(null);
    try {
      const items = Array.from(dirtyKeys).map((key) => {
        const separatorIndex = key.lastIndexOf("__");
        const categoryId = key.slice(0, separatorIndex);
        const bulan = Number(key.slice(separatorIndex + 2));
        return {
          category_id: categoryId,
          bulan,
          plan_amount: parseRevenueTargetInput(draft[key] ?? "0"),
        };
      });
      const result = await saveRevenueMonthlyPlansBulk(budgetYearId, items);
      setRows(result.rows);
      setSummary(result.summary);
      setReady(result.ready);
      setDraft({});
      setDirtyKeys(new Set());
      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan distribusi.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat distribusi bulanan...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Distribusi bulanan dikunci per tahun anggaran. Pilih tahun di bar atas."
        className="mt-3"
      />
    );
  }

  if (!ready) {
    return (
      <EmptyState
        title="Rencana pendapatan belum diisi"
        description="Lengkapi Input Rencana per kategori terlebih dahulu sebelum mendistribusikan ke bulan."
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
              {
                label: "Rencana Tahunan",
                value: `Rp ${formatRevenueTargetAmount(kpiTotals.rencana)}`,
                tone: "muted",
              },
              {
                label: "Total Distribusi",
                value: `Rp ${formatRevenueTargetAmount(kpiTotals.distribusi)}`,
                tone: "plan",
              },
              {
                label: "Selisih",
                value: `Rp ${formatRevenueTargetAmount(kpiTotals.selisih)}`,
                tone: kpiTotals.selisih === 0 ? "muted" : "default",
              },
            ]}
          />
        }
      >
        <div className="flex flex-wrap items-end gap-2">
          <ToolbarSegmented<ViewMode>
            value={viewMode}
            onChange={setViewMode}
            options={[
              {
                value: "rekap",
                label: "Rekapitulasi",
                shortLabel: "Rekap",
                icon: <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.25} />,
                hint: "Ringkasan agregat per bulan",
              },
              {
                value: "detail",
                label: "Detail Kategori",
                shortLabel: "Detail",
                icon: <List className="h-3.5 w-3.5" strokeWidth={2.25} />,
                hint: "Input distribusi per kategori BLU",
              },
            ]}
          />
          {viewMode === "detail" && dirtyKeys.size > 0 && (
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="h-[30px] px-2.5 text-[11px]"
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              {saving ? "..." : `Simpan (${dirtyKeys.size})`}
            </Button>
          )}
        </div>
        <p className="text-[10px] text-slate-400 lg:ml-auto">
          Distribusi tahun {budgetYear.tahun}
          {budgetYear.nama ? ` · ${budgetYear.nama}` : ""}
        </p>
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

      {viewMode === "rekap" ? (
        <div
          className={cardClassName({
            variant: "default",
            className: cn("!p-0", tableGridShellClassName),
          })}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Rekapitulasi Bulanan</h3>
              <p className="text-[10px] text-slate-500">Januari — Desember</p>
            </div>
            <TableLegend items={[{ color: "bg-emerald-500", label: "Rencana" }]} />
          </div>
          <Table embedded>
            <THead>
              <TR>
                <TH className="w-14">Bln</TH>
                <TH className="text-right">Rencana (Rp)</TH>
              </TR>
            </THead>
            <TBody>
              {recapRows.map((row) => (
                <TR key={row.bulan}>
                  <TD className="font-semibold text-slate-700">{row.nama_bulan}</TD>
                  <TD className="text-right tabular-nums font-medium text-[#0d6e63]">
                    {row.rencana > 0 ? formatRevenueTargetAmount(row.rencana) : "—"}
                  </TD>
                </TR>
              ))}
              <TR className="bg-slate-50/80 font-semibold">
                <TD className="text-[11px]">Total</TD>
                <TD className="text-right tabular-nums text-[#0d6e63]">
                  {formatRevenueTargetAmount(kpiTotals.distribusi)}
                </TD>
              </TR>
            </TBody>
          </Table>
        </div>
      ) : (
        <div
          className={cardClassName({
            variant: "default",
            className: cn("!p-0 overflow-x-auto", tableGridShellClassName),
          })}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-800">Detail per Kategori</span>
              <TableLegend items={[{ color: "bg-emerald-400", label: "Rencana bulanan" }]} />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleSave()}
              disabled={saving || dirtyKeys.size === 0}
              className="h-7 text-[11px]"
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              Simpan
            </Button>
          </div>
          <table className="min-w-[1100px] w-full border-collapse text-xs">
            <thead>
              <tr className={tableGridHeaderClassName}>
                <th className="sticky left-0 z-10 min-w-[3rem] bg-gradient-to-b from-sky-500 to-sky-600 px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Kode
                </th>
                <th className="sticky left-[3rem] z-10 min-w-[12rem] bg-gradient-to-b from-sky-500 to-sky-600 px-2.5 py-2 text-left text-[11px] font-semibold text-white">
                  Kategori
                </th>
                <th className="min-w-[6rem] px-2 py-2 text-right text-[11px] font-semibold">
                  Rencana
                </th>
                {REVENUE_MONTHS.map((bulan) => (
                  <th
                    key={bulan}
                    className="min-w-[5.5rem] px-1 py-2 text-center text-[11px] font-semibold"
                  >
                    {REVENUE_MONTH_NAMES[bulan]}
                  </th>
                ))}
                <th className="min-w-[5.5rem] px-2 py-2 text-right text-[11px] font-semibold">
                  Σ
                </th>
                <th className="min-w-[5rem] px-2 py-2 text-right text-[11px] font-semibold">
                  Selisih
                </th>
              </tr>
            </thead>
            <tbody>
              {rowTotals.map(({ row, total, selisih }, rowIdx) => (
                <tr
                  key={row.category_id}
                  className={cn(
                    "border-b border-slate-100",
                    rowIdx % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                  )}
                >
                  <td className="sticky left-0 z-[1] bg-inherit px-2 py-1 font-mono text-[10px] text-slate-500">
                    {row.kode}
                  </td>
                  <td className="sticky left-[3rem] z-[1] bg-inherit px-2.5 py-1 text-[11px] font-medium text-slate-700">
                    {row.label}
                  </td>
                  <td className="px-2 py-1 text-right align-top tabular-nums text-[11px] font-medium text-slate-600">
                    {formatRevenueTargetAmount(row.rencana_tahunan)}
                  </td>
                  {REVENUE_MONTHS.map((bulan) => (
                    <td key={bulan} className="px-0.5 py-1 align-top">
                      <Input
                        value={getMonthDisplay(row, bulan, draft)}
                        onChange={(e) => patchMonth(row.category_id, bulan, e.target.value)}
                        className="h-7 border-slate-200/90 px-1 text-right text-[10px] tabular-nums shadow-none focus:ring-1"
                        placeholder="0"
                        disabled={saving}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1 text-right align-top tabular-nums text-[11px] font-semibold text-[#0d6e63]">
                    {formatRevenueTargetAmount(total)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-1 text-right align-top tabular-nums text-[11px]",
                      selisih === 0
                        ? "text-slate-400"
                        : selisih > 0
                          ? "font-medium text-emerald-700"
                          : "font-medium text-amber-700"
                    )}
                  >
                    {formatRevenueTargetAmount(selisih)}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50/80 font-semibold">
                <td colSpan={2} className="px-2.5 py-2 text-[11px]">
                  Total
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-[11px] text-slate-700">
                  {formatRevenueTargetAmount(kpiTotals.rencana)}
                </td>
                {REVENUE_MONTHS.map((bulan) => {
                  const monthTotal = recapRows.find((r) => r.bulan === bulan)?.rencana ?? 0;
                  return (
                    <td
                      key={bulan}
                      className="px-1 py-2 text-right tabular-nums text-[10px] text-slate-600"
                    >
                      {monthTotal > 0 ? formatRevenueTargetAmount(monthTotal) : "—"}
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-right tabular-nums text-[11px] text-[#0d6e63]">
                  {formatRevenueTargetAmount(kpiTotals.distribusi)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-[11px] text-slate-700">
                  {formatRevenueTargetAmount(kpiTotals.selisih)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
