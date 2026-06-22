"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  REVENUE_CATEGORIES,
  type RevenueCategoryId,
} from "@/constants/revenue-categories";
import { fetchRevenueRecapHarian } from "@/services/revenueCollectService";
import type { RevenueRecapHarianRow } from "@/types/revenue-collect";
import { formatRevenueTargetAmount } from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2 } from "lucide-react";

type RevenueRekapHarianCrudProps = {
  activeCategory?: RevenueCategoryId | "";
};

export function RevenueRekapHarianCrud({ activeCategory = "" }: RevenueRekapHarianCrudProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<RevenueRecapHarianRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tanggalFrom, setTanggalFrom] = useState("");
  const [tanggalTo, setTanggalTo] = useState("");

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
      const result = await fetchRevenueRecapHarian(budgetYearId, {
        tanggal_from: tanggalFrom || undefined,
        tanggal_to: tanggalTo || undefined,
        category_id: activeCategory || undefined,
      });
      setRows(result.rows);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, tanggalFrom, tanggalTo, activeCategory]);

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
        Memuat rekap harian...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Rekap harian dikunci per tahun anggaran."
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
              { label: "Hari", value: String(rows.length), tone: "muted" },
              {
                label: "Total Realisasi",
                value: `Rp ${formatRevenueTargetAmount(grandTotal)}`,
                tone: "plan",
              },
            ]}
          />
        }
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-[10px] text-slate-500">
            Dari
            <Input
              type="date"
              value={tanggalFrom}
              onChange={(e) => setTanggalFrom(e.target.value)}
              className="mt-1 h-8 text-xs"
            />
          </label>
          <label className="text-[10px] text-slate-500">
            Sampai
            <Input
              type="date"
              value={tanggalTo}
              onChange={(e) => setTanggalTo(e.target.value)}
              className="mt-1 h-8 text-xs"
            />
          </label>
        </div>
      </ToolbarShell>

      <div
        className={cardClassName({
          variant: "default",
          className: cn("!p-0 overflow-x-auto", tableGridShellClassName),
        })}
      >
        <div className="border-b border-slate-100 px-3 py-2">
          <h3 className="text-xs font-semibold text-slate-800">Rekap Harian per Kategori BLU</h3>
          <p className="text-[10px] text-slate-400">Tahun {budgetYear.tahun}</p>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH className="sticky left-0 z-10 bg-white">Tanggal</TH>
              {categories.map((c) => (
                <TH key={c.id} className="min-w-[5.5rem] text-right text-[10px]">
                  {c.kode}
                </TH>
              ))}
              <TH className="text-right">Total</TH>
            </TR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TR>
                <TD colSpan={categories.length + 2} className="py-8 text-center text-xs text-slate-400">
                  Belum ada realisasi pada periode ini
                </TD>
              </TR>
            ) : (
              rows.map((row) => (
                <TR key={row.tanggal}>
                  <TD className="sticky left-0 z-[1] bg-inherit text-[11px] font-medium tabular-nums">
                    {row.tanggal}
                  </TD>
                  {categories.map((c) => {
                    const item = row.categories.find((x) => x.category_id === c.id);
                    return (
                      <TD key={c.id} className="text-right tabular-nums text-[11px] text-slate-700">
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
              ))
            )}
            {rows.length > 0 && (
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
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
