import { Boxes, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  BarChartVertical,
  DonutChart,
  SectionLink,
  TrendText,
} from "@/components/beranda/BerandaCharts";
import {
  ASSET_ALERTS,
  ASSET_COMPOSITION,
  ASSET_MINI,
  INVENTORY_BARS,
} from "@/constants/beranda";
import {
  tableBodyStripedClassName,
  tableHeadCellCompactClassName,
  tableHeadRowClassName,
  tableShellClassName,
} from "@/components/ui/tableStyles";

const PRIORITY_BADGE = {
  Tinggi: "danger" as const,
  Sedang: "warning" as const,
  Rendah: "draft" as const,
};

export function InsightAsset() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-sq-border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-sq-border px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Boxes className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3 className="text-sm font-semibold text-sq-dark dark:text-white">
            Insight Asset / Supply Chain
          </h3>
        </div>
        <SectionLink href="/supply-chain">Lihat Detail</SectionLink>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          {ASSET_MINI.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-sq-border bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <p className="text-[10px] text-sq-slate">{m.label}</p>
              <p className="text-xs font-bold text-sq-dark dark:text-white">{m.value}</p>
              <TrendText value={m.trend} dir={m.dir} />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="shrink-0">
            <DonutChart
              segments={ASSET_COMPOSITION}
              centerLabel="2.382"
              centerSub="Aset"
              size={90}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {ASSET_COMPOSITION.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-sq-slate">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-semibold text-sq-dark dark:text-slate-200">
                  {s.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-medium text-sq-slate">
            Nilai Persediaan (6 Bulan Terakhir)
          </p>
          <BarChartVertical
            months={INVENTORY_BARS.months}
            values={INVENTORY_BARS.values}
            max={25}
          />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-sq-slate">
            Alert Asset & Persediaan
          </p>
          <div className={tableShellClassName}>
            <table className="w-full min-w-[14rem] text-[10px]">
              <thead>
                <tr className={tableHeadRowClassName}>
                  <th className={`${tableHeadCellCompactClassName} text-left`}>Jenis</th>
                  <th className={`${tableHeadCellCompactClassName} text-left`}>Deskripsi</th>
                  <th className={`${tableHeadCellCompactClassName} text-left`}>Prioritas</th>
                  <th className={`${tableHeadCellCompactClassName} text-right`}>Jml</th>
                </tr>
              </thead>
              <tbody className={tableBodyStripedClassName}>
                {ASSET_ALERTS.map((a) => (
                  <tr key={a.deskripsi}>
                    <td className="py-1.5 text-sq-dark dark:text-slate-200">{a.jenis}</td>
                    <td className="py-1.5 text-sq-slate">{a.deskripsi}</td>
                    <td className="py-1.5">
                      <Badge variant={PRIORITY_BADGE[a.prioritas]}>{a.prioritas}</Badge>
                    </td>
                    <td className="py-1.5 text-right font-semibold">{a.jumlah}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-auto text-center">
          <SectionLink href="/supply-chain">
            Lihat Semua Alert <ChevronRight className="inline h-3 w-3" />
          </SectionLink>
        </div>
      </div>
    </div>
  );
}
