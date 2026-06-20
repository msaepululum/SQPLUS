import { cn } from "@/lib/cn";

import {
  filterMonthlyRows,
  PENERIMAAN_MONTHLY_ROWS,
  type PenerimaanFilters,
} from "@/constants/penerimaan-data";
import { cardClassName } from "@/components/ui/Card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellMdClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

type PenerimaanMonthlyTableProps = {
  filters: PenerimaanFilters;
};

export function PenerimaanMonthlyTable({ filters }: PenerimaanMonthlyTableProps) {
  const rows = filterMonthlyRows(PENERIMAAN_MONTHLY_ROWS, filters);

  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-800">
          Rekap Pendapatan Per Bulan (Tahun {filters.tahun})
        </h3>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full min-w-[42rem] text-xs">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellMdClassName} text-left`}>Bulan</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Target (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Realisasi (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Selisih (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Pertumbuhan YoY</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Pencapaian %</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>Status</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {rows.map((row) => (
              <tr key={row.month}>
                <td className="px-3 py-2 font-medium text-slate-800">{row.month}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                  {row.target > 0 ? row.target.toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-800">
                  {row.realisasi > 0 ? row.realisasi.toFixed(2) : "—"}
                </td>
                <td
                  className={`px-3 py-2 text-right tabular-nums font-medium ${
                    row.selisih > 0 ? "text-emerald-600" : row.selisih < 0 ? "text-red-500" : "text-slate-400"
                  }`}
                >
                  {row.realisasi > 0 ? row.selisih.toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                  {row.yoyGrowth > 0 ? `${row.yoyGrowth.toFixed(2)}%` : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                  {row.pencapaian > 0 ? `${row.pencapaian.toFixed(2)}%` : "—"}
                </td>
                <td className="px-3 py-2">
                  {row.realisasi === 0 ? (
                    <span className="text-slate-400">—</span>
                  ) : row.achieved ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Tercapai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Belum Tercapai
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
