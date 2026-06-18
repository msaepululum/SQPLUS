import { INCOME_BREAKDOWN, formatRupiahFull } from "@/constants/finance-dashboard";
import { cardClassName } from "@/components/ui/Card";

export function IncomeBreakdownTable() {
  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Rincian Penerimaan per Bulan</h3>

      <div className="mt-3 sq-scroll overflow-x-auto">
        <table className="w-full min-w-[24rem] text-[0.6875rem]">
          <thead>
            <tr className="bg-[#0d9488] text-white">
              <th className="px-2 py-1.5 text-left font-semibold">Bulan</th>
              <th className="px-2 py-1.5 text-right font-semibold">Pend. Jasa Layanan</th>
              <th className="px-2 py-1.5 text-right font-semibold">Pend. APBN</th>
              <th className="px-2 py-1.5 text-right font-semibold">Pend. Lain-lain</th>
              <th className="px-2 py-1.5 text-right font-semibold">Total Penerimaan</th>
            </tr>
          </thead>
          <tbody>
            {INCOME_BREAKDOWN.map((row, i) => {
              const total = row.jasaLayanan + row.apbn + row.lainLain;
              return (
                <tr key={row.month} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/80"}>
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
        </table>
      </div>

      <button
        type="button"
        className="mt-3 text-xs font-medium text-[#3b82f6] hover:underline"
      >
        Lihat Selengkapnya →
      </button>
    </div>
  );
}
