"use client";

import Link from "next/link";
import { Boxes, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  BarChartVertical,
  DonutChart,
  InsightCardShell,
  SectionLink,
  TrendText,
} from "@/components/beranda/BerandaCharts";
import type { SupplyChainDashboard } from "@/types/supply-chain";
import { formatAssetAmount } from "@/types/supply-chain";
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

type InsightAssetProps = {
  data: SupplyChainDashboard | null;
  loading?: boolean;
};

export function InsightAsset({ data, loading }: InsightAssetProps) {
  const composition =
    data?.composition.map((s) => ({
      label: s.label,
      pct: s.pct,
      color: s.color,
    })) ?? [];

  const trendMonths = data?.perolehan_trend.map((t) => String(t.year)) ?? [];
  const trendValues =
    data?.perolehan_trend.map((t) =>
      Number((t.value / 1_000_000_000).toFixed(1))
    ) ?? [];
  const trendMax = Math.ceil(Math.max(...trendValues, 1) * 1.1);

  const miniStats = data
    ? [
        {
          label: "Nilai Persediaan",
          value: formatAssetAmount(data.inventory.nilai_persediaan_hpp, true),
          trend: `${data.inventory.item_aktif.toLocaleString("id-ID")} item`,
          dir: "up" as const,
        },
        {
          label: "Stok Kritis",
          value: data.inventory.stok_kritis.toLocaleString("id-ID"),
          trend: "di bawah minimum",
          dir: data.inventory.stok_kritis > 0 ? ("down" as const) : ("up" as const),
        },
        {
          label: "Nilai Buku BMD",
          value: formatAssetAmount(data.financial.nilai_buku_bmd, true),
          trend: `${data.financial.nilai_buku_pct}% buku`,
          dir: "up" as const,
        },
        {
          label: "Mutasi Pending",
          value: data.operational.mutasi_pending.toLocaleString("id-ID"),
          trend: `${data.operational.disposal_pending} disposal`,
          dir: data.operational.mutasi_pending > 0 ? ("down" as const) : ("neutral" as const),
        },
      ]
    : [];

  return (
    <InsightCardShell
      icon={<Boxes className="h-4 w-4 text-teal-600" strokeWidth={2} />}
      iconBg="bg-teal-50"
      title="Insight Asset / Supply Chain"
      href="/supply-chain"
    >
      {loading && !data ? (
        <div className="flex flex-1 items-center justify-center gap-2 py-8 text-sm text-sq-slate">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat data aset & persediaan...
        </div>
      ) : !data ? (
        <p className="py-6 text-center text-sm text-sq-slate">
          Gagal memuat data supply chain.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {miniStats.map((m) => (
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

          {composition.length > 0 && (
            <div className="flex gap-3">
              <div className="shrink-0">
                <DonutChart
                  segments={composition}
                  centerLabel={formatAssetAmount(data.financial.nilai_perolehan_bmd, true)}
                  centerSub="Perolehan"
                  size={90}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                {data.composition.slice(0, 5).map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-[10px]">
                    <span className="flex min-w-0 items-center gap-1.5 text-sq-slate">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                      <span className="truncate">{s.label}</span>
                    </span>
                    <span className="ml-1 shrink-0 font-semibold text-sq-dark dark:text-slate-200">
                      {s.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trendMonths.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-medium text-sq-slate">
                Perolehan BMD per Tahun (Miliar Rp)
              </p>
              <BarChartVertical months={trendMonths} values={trendValues} max={trendMax} />
            </div>
          )}

          {data.alerts.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium text-sq-slate">Alert Operasional</p>
              <div className={tableShellClassName}>
                <table className="w-full min-w-[14rem] text-[10px]">
                  <thead>
                    <tr className={tableHeadRowClassName}>
                      <th className={`${tableHeadCellCompactClassName} text-left`}>Jenis</th>
                      <th className={`${tableHeadCellCompactClassName} text-left`}>Deskripsi</th>
                      <th className={`${tableHeadCellCompactClassName} text-left`}>Prioritas</th>
                    </tr>
                  </thead>
                  <tbody className={tableBodyStripedClassName}>
                    {data.alerts.slice(0, 4).map((a) => (
                      <tr key={a.deskripsi}>
                        <td className="py-1.5 text-sq-dark dark:text-slate-200">{a.jenis}</td>
                        <td className="py-1.5 text-sq-slate">
                          <Link href={a.href} className="hover:text-sq-blue hover:underline">
                            {a.deskripsi}
                          </Link>
                        </td>
                        <td className="py-1.5">
                          <Badge variant={PRIORITY_BADGE[a.prioritas]}>{a.prioritas}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-auto text-center">
            <SectionLink href="/supply-chain/monitoring">
              Monitoring Lengkap <ChevronRight className="inline h-3 w-3" />
            </SectionLink>
          </div>
        </>
      )}
    </InsightCardShell>
  );
}
