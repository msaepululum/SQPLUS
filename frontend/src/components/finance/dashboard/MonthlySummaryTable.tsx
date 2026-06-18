import {
  DASHBOARD_SUMMARY,
  MONTHLY_INCOME_EXPENSE,
  calcSurplus,
  calcSurplusPct,
  formatPercent,
  formatRupiahFull,
} from "@/constants/finance-dashboard";
import { cardClassName } from "@/components/ui/Card";

export function MonthlySummaryTable() {
  return (
    <div className={cardClassName({ variant: "default", className: "flex h-full flex-col" })}>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        Penerimaan dan Belanja per Bulan
      </h3>

      <div className="sq-scroll -mx-1 flex-1 overflow-auto px-1">
        <table className="w-full min-w-[28rem] text-[0.6875rem]">
          <thead>
            <tr className="bg-[#0d9488] text-white">
              <th className="px-2.5 py-2 text-left font-semibold">Bulan</th>
              <th className="px-2.5 py-2 text-right font-semibold">Penerimaan (Rp)</th>
              <th className="px-2.5 py-2 text-right font-semibold">Belanja (Rp)</th>
              <th className="px-2.5 py-2 text-right font-semibold">Surplus/(Defisit) (Rp)</th>
              <th className="px-2.5 py-2 text-right font-semibold">% Surplus</th>
            </tr>
          </thead>
          <tbody>
            {MONTHLY_INCOME_EXPENSE.map((row, i) => {
              const surplus = calcSurplus(row.penerimaan, row.belanja);
              const surplusPct = calcSurplusPct(row.penerimaan, row.belanja);
              const isNegative = surplus < 0;
              return (
                <tr
                  key={row.month}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
                >
                  <td className="px-2.5 py-1.5 font-medium text-slate-700">{row.month}</td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums text-slate-700">
                    {formatRupiahFull(row.penerimaan)}
                  </td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums text-slate-700">
                    {formatRupiahFull(row.belanja)}
                  </td>
                  <td
                    className={`px-2.5 py-1.5 text-right font-medium tabular-nums ${
                      isNegative ? "text-red-500" : "text-[#22c55e]"
                    }`}
                  >
                    {isNegative ? "-" : ""}
                    {formatRupiahFull(Math.abs(surplus))}
                  </td>
                  <td
                    className={`px-2.5 py-1.5 text-right font-medium tabular-nums ${
                      isNegative ? "text-red-500" : "text-[#22c55e]"
                    }`}
                  >
                    {formatPercent(surplusPct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#0d9488]/20 bg-[#0d9488]/10 font-bold">
              <td className="px-2.5 py-2 text-[#0d9488]">TOTAL</td>
              <td className="px-2.5 py-2 text-right tabular-nums text-[#0d9488]">
                {formatRupiahFull(DASHBOARD_SUMMARY.totalPenerimaan)}
              </td>
              <td className="px-2.5 py-2 text-right tabular-nums text-[#3b82f6]">
                {formatRupiahFull(DASHBOARD_SUMMARY.totalBelanja)}
              </td>
              <td className="px-2.5 py-2 text-right tabular-nums text-[#0d9488]">
                {formatRupiahFull(DASHBOARD_SUMMARY.surplus)}
              </td>
              <td className="px-2.5 py-2 text-right tabular-nums text-[#0d9488]">
                {formatPercent(DASHBOARD_SUMMARY.surplusPct)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
