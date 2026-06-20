"use client";

import { cn } from "@/lib/cn";

import { useMemo, useState } from "react";
import { INCOME_BREAKDOWN, formatRupiahFull } from "@/constants/finance-dashboard";
import type { PenerimaanFilters } from "@/constants/penerimaan-data";
import { cardClassName } from "@/components/ui/Card";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellCompactClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

const PREVIEW_ROWS = 3;

type PenerimaanIncomeBySourceTableProps = {
  filters: PenerimaanFilters;
};

export function PenerimaanIncomeBySourceTable({ filters }: PenerimaanIncomeBySourceTableProps) {
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    if (filters.bulan !== "all") {
      return INCOME_BREAKDOWN.filter((r) => r.month === filters.bulan);
    }
    return expanded ? INCOME_BREAKDOWN : INCOME_BREAKDOWN.slice(0, PREVIEW_ROWS);
  }, [filters.bulan, expanded]);

  const showToggle = filters.bulan === "all" && INCOME_BREAKDOWN.length > PREVIEW_ROWS;

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Rincian Penerimaan per Bulan</h3>
      <p className="mt-0.5 text-[0.625rem] text-slate-400">
        Pemecahan sumber: jasa layanan, APBN, dan pendapatan lain-lain
      </p>

      <div className={cn("mt-3", tableShellClassName)}>
        <table className="w-full min-w-[28rem] text-[0.6875rem]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellCompactClassName} text-left`}>Bulan</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Pend. Jasa Layanan</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Pend. APBN</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Pend. Lain-lain</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Total Penerimaan</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {rows.map((row) => {
              const total = row.jasaLayanan + row.apbn + row.lainLain;
              return (
                <tr key={row.month}>
                  <td className="px-2 py-1.5 font-medium text-slate-700">{row.month}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">
                    {formatRupiahFull(row.jasaLayanan)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">
                    {formatRupiahFull(row.apbn)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">
                    {formatRupiahFull(row.lainLain)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-slate-800">
                    {formatRupiahFull(total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {rows.length > 1 && (
            <tfoot>
              <tr className="border-t-2 border-sky-200 bg-sky-50 font-semibold">
                <td className="px-2 py-1.5 text-slate-800">Total</td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-800">
                  {formatRupiahFull(rows.reduce((s, r) => s + r.jasaLayanan, 0))}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-800">
                  {formatRupiahFull(rows.reduce((s, r) => s + r.apbn, 0))}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-800">
                  {formatRupiahFull(rows.reduce((s, r) => s + r.lainLain, 0))}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-900">
                  {formatRupiahFull(
                    rows.reduce((s, r) => s + r.jasaLayanan + r.apbn + r.lainLain, 0)
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs font-medium text-[#3b82f6] hover:underline"
        >
          {expanded ? "Tampilkan lebih sedikit ←" : "Lihat Selengkapnya →"}
        </button>
      )}
    </div>
  );
}
