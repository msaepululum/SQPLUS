import { cn } from "@/lib/cn";

import {
  BELANJA_KODE_SUMMARY,
  BELANJA_PROCESS_STATUS,
  BELANJA_UNIT_REALISASI,
} from "@/constants/belanja-data";
import { cardClassName } from "@/components/ui/Card";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellCompactLgClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

export function BelanjaUnitBar() {
  const max = Math.max(...BELANJA_UNIT_REALISASI.map((d) => d.value));
  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Realisasi Belanja per Unit Kerja (YTD)</h3>
      <ul className="mt-4 space-y-2.5">
        {BELANJA_UNIT_REALISASI.map((d) => (
          <li key={d.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="truncate text-slate-600">{d.label}</span>
              <span className="ml-2 shrink-0 font-semibold tabular-nums text-slate-800">{d.value.toFixed(1)} M</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BelanjaKodeSummaryTable() {
  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Ringkasan per Kode Belanja</h3>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full min-w-[32rem] text-[0.6875rem]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellCompactLgClassName} text-left`}>Kode</th>
              <th className={`${tableHeadCellCompactLgClassName} text-left`}>Nama Belanja</th>
              <th className={`${tableHeadCellCompactLgClassName} text-right`}>Pagu (M)</th>
              <th className={`${tableHeadCellCompactLgClassName} text-right`}>Realisasi (M)</th>
              <th className={`${tableHeadCellCompactLgClassName} text-right`}>Sisa (M)</th>
              <th className={`${tableHeadCellCompactLgClassName} text-right`}>% Serap</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {BELANJA_KODE_SUMMARY.map((row) => (
              <tr key={row.kode}>
                <td className="px-2 py-2 font-mono text-slate-600">{row.kode}</td>
                <td className="px-2 py-2 text-slate-700">{row.nama}</td>
                <td className="px-2 py-2 text-right tabular-nums">{row.pagu.toFixed(1)}</td>
                <td className="px-2 py-2 text-right tabular-nums font-medium">{row.realisasi.toFixed(1)}</td>
                <td className="px-2 py-2 text-right tabular-nums text-emerald-600">{row.sisa.toFixed(1)}</td>
                <td className="px-2 py-2 text-right tabular-nums font-semibold">{row.serap.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BelanjaProcessStatus() {
  const max = Math.max(...BELANJA_PROCESS_STATUS.map((s) => s.count));
  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Status Proses Belanja</h3>
      <ul className="mt-4 space-y-2.5">
        {BELANJA_PROCESS_STATUS.map((s) => (
          <li key={s.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-slate-600">{s.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.count / max) * 100}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-800">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
