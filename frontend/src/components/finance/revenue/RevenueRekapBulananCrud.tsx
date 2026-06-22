"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  REVENUE_CATEGORIES,
  type RevenueCategoryId,
} from "@/constants/revenue-categories";
import { fetchRevenueRecapBulanan } from "@/services/revenueCollectService";
import { REVENUE_MONTH_NAMES } from "@/types/revenue-plan";
import type { RevenueRecapBulananRow } from "@/types/revenue-collect";
import { formatRevenueTargetAmount } from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2 } from "lucide-react";

type RevenueRekapBulananCrudProps = {
  activeCategory?: RevenueCategoryId | "";
};

export function RevenueRekapBulananCrud({ activeCategory = "" }: RevenueRekapBulananCrudProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<RevenueRecapBulananRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState("");

  const categories = useMemo(() => {
    if (activeCategory) {
      return REVENUE_CATEGORIES.filter((c) => c.id === activeCategory);
    }
    return REVENUE_CATEGORIES;
  }, [activeCategory]);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRevenueRecapBulanan(budgetYearId, {
        bulan: bulan ? Number(bulan) : undefined,
        category_id: activeCategory || undefined,
      });
      setRows(result.rows);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan, activeCategory]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const cat of categories) totals[cat.id] = 0;
    for (const row of rows) {
      for (const c of row.categories) {
        if (c.category_id in totals) totals[c.category_id] += c.amount;
      }
    }
    return totals;
  }, [rows, categories]);

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat rekap bulanan...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Rekap bulanan dikunci per tahun anggaran."
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
                label: "Total Realisasi",
                value: `Rp ${formatRevenueTargetAmount(grandTotal)}`,
                tone: "plan",
              },
            ]}
          />
        }
      >
        <label className="text-[10px] text-slate-500">
          Filter Bulan
          <Select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="mt-1 h-8 w-32 text-xs"
          >
            <option value="">Semua</option>
            {REVENUE_MONTH_NAMES.slice(1).map((nama, idx) => (
              <option key={nama} value={String(idx + 1)}>
                {nama}
              </option>
            ))}
          </Select>
        </label>
      </ToolbarShell>

      <div
        className={cardClassName({
          variant: "default",
          className: cn("!p-0 overflow-x-auto", tableGridShellClassName),
        })}
      >
        <div className="border-b border-slate-100 px-3 py-2">
          <h3 className="text-xs font-semibold text-slate-800">Rekap Bulanan per Kategori BLU</h3>
          <p className="text-[10px] text-slate-400">Tahun {budgetYear.tahun}</p>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH className="sticky left-0 z-10 bg-white">Bulan</TH>
              {categories.map((c) => (
                <TH key={c.id} className="min-w-[5.5rem] text-right text-[10px]">
                  {c.kode}
                </TH>
              ))}
              <TH className="text-right">Total</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.bulan}>
                <TD className="sticky left-0 z-[1] bg-inherit text-[11px] font-semibold">
                  {row.nama_bulan}
                </TD>
                {categories.map((c) => {
                  const item = row.categories.find((x) => x.category_id === c.id);
                  return (
                    <TD key={c.id} className="text-right tabular-nums text-[11px]">
                      {item && item.amount > 0
                        ? formatRevenueTargetAmount(item.amount)
                        : "—"}
                    </TD>
                  );
                })}
                <TD className="text-right tabular-nums text-[11px] font-semibold text-[#0d6e63]">
                  {formatRevenueTargetAmount(row.total)}
                </TD>
              </TR>
            ))}
            <TR className="bg-slate-50/80 font-semibold">
              <TD className="sticky left-0 z-[1] bg-inherit text-[11px]">Total</TD>
              {categories.map((c) => (
                <TD key={c.id} className="text-right tabular-nums text-[11px]">
                  {formatRevenueTargetAmount(categoryTotals[c.id] ?? 0)}
                </TD>
              ))}
              <TD className="text-right tabular-nums text-[11px] text-[#0d6e63]">
                {formatRevenueTargetAmount(grandTotal)}
              </TD>
            </TR>
          </TBody>
        </Table>
      </div>
    </div>
  );
}
