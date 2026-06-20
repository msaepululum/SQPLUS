import { cn } from "@/lib/cn";

import {
  CASH_FLOW_SUMMARY,
  EXPENSE_REALIZATION_TABLE,
  EXPENSE_TOTAL,
  MONTHLY_REVENUE_TABLE,
  REVENUE_BY_SERVICE,
  REVENUE_BY_SERVICE_TOTAL,
  REVENUE_COMPOSITION,
  UNIT_EXPENSE_BARS,
} from "@/constants/main-summary-data";
import { cardClassName } from "@/components/ui/Card";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellCompactClassName,
  tableHeadRowClassName,
  tableStripeRowClassName, } from "@/components/ui/tableStyles";

function DetailCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cardClassName({ variant: "default", className: `!p-3.5 ${className ?? ""}` })}>
      <h3 className="text-xs font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[0.5625rem] text-slate-400">{subtitle}</p>}
      {children}
    </div>
  );
}

export function RevenueCompositionCard() {
  let offset = 0;
  const circles = REVENUE_COMPOSITION.map((s) => {
    const c = (
      <circle
        key={s.label}
        r="16"
        cx="20"
        cy="20"
        fill="transparent"
        stroke={s.color}
        strokeWidth="8"
        strokeDasharray={`${s.pct} ${100 - s.pct}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 20 20)"
      />
    );
    offset += s.pct;
    return c;
  });

  return (
    <DetailCard title="Komposisi Pendapatan" subtitle="(dalam Juta Rupiah)">
      <div className="mt-2 flex flex-col items-center gap-3">
        <div className="relative">
          <svg viewBox="0 0 40 40" className="h-24 w-24">
            {circles}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[0.625rem] font-bold text-slate-900">Rp 189,60 M</span>
            <span className="text-[0.5rem] text-slate-400">Total Pendapatan</span>
          </div>
        </div>
        <ul className="w-full space-y-1">
          {REVENUE_COMPOSITION.map((s) => (
            <li key={s.label} className="flex items-center justify-between text-[0.5625rem]">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="text-slate-600">{s.label}</span>
              </div>
              <span className="font-semibold text-slate-800">{s.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </DetailCard>
  );
}

export function UnitExpenseBarChart() {
  const max = 50;
  return (
    <DetailCard title="Realisasi Belanja per Unit (Top 7)" subtitle="(dalam Juta Rupiah)">
      <ul className="mt-3 space-y-2">
        {UNIT_EXPENSE_BARS.map((row) => (
          <li key={row.label}>
            <div className="mb-0.5 flex justify-between text-[0.5625rem]">
              <span className="text-slate-600">{row.label}</span>
              <span className="font-semibold text-slate-800">{row.value.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}

export function MonthlyRevenueTable() {
  return (
    <DetailCard title="Rekap Pendapatan Bulanan" subtitle="(dalam Juta Rupiah)">
      <div className={cn("mt-2", tableShellClassName)}>
        <table className="w-full min-w-[16rem] text-[0.5625rem]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellCompactClassName} text-left`}>Bulan</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Target</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Realisasi</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Selisih</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Growth</th>
              <th className={`${tableHeadCellCompactClassName} text-center`}>Status</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {MONTHLY_REVENUE_TABLE.map((row) => (
              <tr key={row.bulan}>
                <td className="py-1 font-medium text-slate-700">{row.bulan}</td>
                <td className="py-1 text-right text-slate-600">{row.target}</td>
                <td className="py-1 text-right text-slate-600">{row.realisasi}</td>
                <td className="py-1 text-right text-red-500">{row.selisih}</td>
                <td className="py-1 text-right text-slate-600">{row.growth}</td>
                <td className="py-1 text-center">
                  {row.status === "above" ? (
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title="Di atas Target" />
                  ) : (
                    <span className="inline-block h-0 w-0 border-x-4 border-b-[7px] border-x-transparent border-b-amber-500" title="Di bawah Target" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DetailCard>
  );
}

export function ExpenseRealizationTable() {
  return (
    <DetailCard title="Ringkasan Realisasi Belanja" subtitle="(dalam Juta Rupiah)">
      <div className={cn("mt-2", tableShellClassName)}>
        <table className="w-full min-w-[20rem] text-[0.5625rem]">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellCompactClassName} text-left`}>Kode</th>
              <th className={`${tableHeadCellCompactClassName} text-left`}>Kelompok Belanja</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Pagu</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Realisasi</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Sisa</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>%</th>
              <th className={`${tableHeadCellCompactClassName} text-right`}>Menunggu</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {EXPENSE_REALIZATION_TABLE.map((row) => (
              <tr key={row.kode}>
                <td className="px-1.5 py-1 text-slate-500">{row.kode}</td>
                <td className="px-1.5 py-1 font-medium text-slate-700">{row.kelompok}</td>
                <td className="px-1.5 py-1 text-right text-slate-600">{row.pagu}</td>
                <td className="px-1.5 py-1 text-right text-slate-600">{row.realisasi}</td>
                <td className="px-1.5 py-1 text-right text-slate-600">{row.sisa}</td>
                <td className="px-1.5 py-1 text-right font-medium text-blue-600">{row.pct}</td>
                <td className="px-1.5 py-1 text-right text-slate-600">{row.menunggu}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-sky-200 bg-sky-50 font-bold">
              <td className="px-1.5 py-1.5" colSpan={2}>Total</td>
              <td className="px-1.5 py-1.5 text-right">{EXPENSE_TOTAL.pagu}</td>
              <td className="px-1.5 py-1.5 text-right">{EXPENSE_TOTAL.realisasi}</td>
              <td className="px-1.5 py-1.5 text-right">{EXPENSE_TOTAL.sisa}</td>
              <td className="px-1.5 py-1.5 text-right text-blue-600">{EXPENSE_TOTAL.pct}</td>
              <td className="px-1.5 py-1.5 text-right">{EXPENSE_TOTAL.menunggu}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </DetailCard>
  );
}

export function SideSummaryTables() {
  return (
    <div className="flex flex-col gap-3">
      <DetailCard title="Ringkasan Cash Flow" subtitle="(dalam Juta Rupiah)">
        <table className="mt-2 w-full text-[0.5625rem]">
          <tbody>
            {CASH_FLOW_SUMMARY.map((row, i) => (
              <tr
                key={row.label}
                className={tableStripeRowClassName(
                  i,
                  row.highlight ? "border-t-2 border-sky-200 bg-sky-50 font-semibold" : undefined
                )}
              >
                <td className={`py-1 ${row.highlight ? "font-semibold text-sky-700" : "text-slate-600"}`}>{row.label}</td>
                <td className={`py-1 text-right font-semibold ${row.highlight ? "text-sky-700" : "text-slate-800"}`}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DetailCard>

      <DetailCard title="Pendapatan per Layanan" subtitle="(dalam Juta Rupiah)">
        <table className="mt-2 w-full text-[0.5625rem]">
          <tbody className={tableBodyStripedClassName}>
            {REVENUE_BY_SERVICE.map((row) => (
              <tr key={row.layanan}>
                <td className="py-1 text-slate-600">{row.layanan}</td>
                <td className="py-1 text-right font-medium text-slate-800">{row.value}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-sky-200 bg-sky-50 font-bold">
              <td className="pt-1.5 text-slate-800">Total</td>
              <td className="pt-1.5 text-right text-slate-900">{REVENUE_BY_SERVICE_TOTAL}</td>
            </tr>
          </tfoot>
        </table>
      </DetailCard>
    </div>
  );
}
