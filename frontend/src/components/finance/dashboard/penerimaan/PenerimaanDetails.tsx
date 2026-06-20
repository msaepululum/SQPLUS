import { cn } from "@/lib/cn";

import {
  PENERIMAAN_INCOME_CATEGORIES,
  PENERIMAAN_SERVICE_REVENUE,
  PENERIMAAN_SOURCE_COMPOSITION,
} from "@/constants/penerimaan-data";
import { cardClassName } from "@/components/ui/Card";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellMdClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

export function PenerimaanIncomeBreakdown() {
  const total = PENERIMAAN_INCOME_CATEGORIES.reduce((s, r) => s + r.amount, 0);

  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-800">
          Rincian Total Pemasukan (Tahun Berjalan)
        </h3>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full text-xs">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellMdClassName} text-left`}>Kategori</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Nilai (M)</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>%</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {PENERIMAAN_INCOME_CATEGORIES.map((row) => (
              <tr key={row.label}>
                <td className="px-3 py-2 text-slate-700">{row.label}</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-800">
                  {row.amount.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-500">
                  {row.pct.toFixed(2)}%
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-sky-200 bg-sky-50 font-semibold">
              <td className="px-3 py-2 text-slate-800">Total</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-900">
                {total.toFixed(2)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-600">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PenerimaanSourceDonut() {
  let offset = 0;
  const circles = PENERIMAAN_SOURCE_COMPOSITION.map((s) => {
    const el = (
      <circle
        key={s.label}
        r="18"
        cx="22"
        cy="22"
        fill="transparent"
        stroke={s.color}
        strokeWidth="9"
        strokeDasharray={`${s.pct} ${100 - s.pct}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 22 22)"
      />
    );
    offset += s.pct;
    return el;
  });

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">
        Komposisi Sumber Pendapatan (Tahun Berjalan)
      </h3>
      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative shrink-0">
          <svg viewBox="0 0 44 44" className="h-28 w-28">
            {circles}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-slate-900">189,6M</span>
            <span className="text-[9px] text-slate-400">Total</span>
          </div>
        </div>
        <ul className="w-full space-y-2">
          {PENERIMAAN_SOURCE_COMPOSITION.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-slate-600">{s.label}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-800">{s.pct.toFixed(2)}%</span>
                <span className="ml-1.5 text-slate-400">Rp {s.amount.toFixed(1)} M</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PenerimaanServiceBar() {
  const max = Math.max(...PENERIMAAN_SERVICE_REVENUE.map((d) => d.value));

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">
        Pendapatan per Layanan (Tahun Berjalan)
      </h3>
      <p className="mt-0.5 text-[0.625rem] text-slate-400">Dalam miliar rupiah</p>
      <ul className="mt-4 space-y-3">
        {PENERIMAAN_SERVICE_REVENUE.map((d) => (
          <li key={d.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-600">{d.label}</span>
              <span className="font-semibold tabular-nums text-slate-800">{d.value.toFixed(1)} M</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
