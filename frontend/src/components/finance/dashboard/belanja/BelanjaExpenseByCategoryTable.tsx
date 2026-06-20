"use client";

import { cn } from "@/lib/cn";

import { useMemo, useState } from "react";
import { EXPENSE_BREAKDOWN, formatRupiahFull } from "@/constants/finance-dashboard";
import type { BelanjaFilters } from "@/constants/belanja-data";
import { cardClassName } from "@/components/ui/Card";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellCompactClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

const PREVIEW_ROWS = 3;

type BelanjaExpenseByCategoryTableProps = {
  filters: BelanjaFilters;
};

export function BelanjaExpenseByCategoryTable({ filters }: BelanjaExpenseByCategoryTableProps) {
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    if (filters.bulan !== "all") {
      return EXPENSE_BREAKDOWN.filter((r) => r.month === filters.bulan);
    }
    return expanded ? EXPENSE_BREAKDOWN : EXPENSE_BREAKDOWN.slice(0, PREVIEW_ROWS);
  }, [filters.bulan, expanded]);

  const showToggle = filters.bulan === "all" && EXPENSE_BREAKDOWN.length > PREVIEW_ROWS;

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Rincian Belanja per Bulan</h3>
      <p className="mt-0.5 text-[0.625rem] text-slate-400">
        Pemecahan kategori: pegawai, barang, dan modal
      </p>
      <div className={cn("mt-3", tableShellClassName)}>
        <table className="w-full min-w-[28rem] text-[0.6875rem]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellCompactClassName} text-left`}>Bulan</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Belanja Pegawai</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Belanja Barang</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Belanja Modal</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Total Belanja</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {rows.map((row) => {
              const total = row.pegawai + row.barang + row.modal;
              return (
                <tr key={row.month}>
                  <td className="px-2 py-1.5 font-medium text-slate-700">{row.month}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">{formatRupiahFull(row.pegawai)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">{formatRupiahFull(row.barang)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">{formatRupiahFull(row.modal)}</td>
                  <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-slate-800">{formatRupiahFull(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showToggle && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-3 text-xs font-medium text-[#3b82f6] hover:underline">
          {expanded ? "Tampilkan lebih sedikit ←" : "Lihat Selengkapnya →"}
        </button>
      )}
    </div>
  );
}
