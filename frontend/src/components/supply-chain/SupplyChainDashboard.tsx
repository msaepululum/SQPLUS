"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  CheckSquare,
  ClipboardList,
  Database,
  Loader2,
  Package,
  PackageCheck,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";
import {
  BarChartVertical,
  DonutChart,
} from "@/components/beranda/BerandaCharts";
import { PageFrame } from "@/components/layout/PageFrame";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { SUPPLY_CHAIN_SUB_NAV } from "@/constants/supply-chain-navigation";
import { fetchSupplyChainDashboard } from "@/services/supplyChainService";
import {
  formatAssetAmount,
  type SupplyChainDashboard,
} from "@/types/supply-chain";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  tableBodyStripedClassName,
  tableHeadCellCompactClassName,
  tableHeadRowClassName,
  tableShellClassName,
} from "@/components/ui/tableStyles";

const MODULE_ICONS: Record<string, LucideIcon> = {
  "/supply-chain/master-barang": Database,
  "/supply-chain/gudang-stok": Warehouse,
  "/supply-chain/permintaan-barang": ClipboardList,
  "/supply-chain/distribusi-barang": Truck,
  "/supply-chain/penerimaan-barang": PackageCheck,
  "/supply-chain/stock-opname": Package,
  "/supply-chain/batch-expired": Boxes,
  "/supply-chain/asset-management": Boxes,
  "/supply-chain/maintenance-kalibrasi": Wrench,
  "/supply-chain/mutasi-disposal": Trash2,
  "/supply-chain/monitoring": BarChart3,
  "/supply-chain/approval": CheckSquare,
  "/supply-chain/laporan": BarChart3,
  "/supply-chain/pengaturan": Settings,
};

const PRIORITY_BADGE = {
  Tinggi: "danger" as const,
  Sedang: "warning" as const,
  Rendah: "draft" as const,
};

function formatAsOf(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function SupplyChainDashboard() {
  const { t } = useTranslation();
  const modules = SUPPLY_CHAIN_SUB_NAV.filter((item) => item.href !== "/supply-chain");
  const [dashboard, setDashboard] = useState<SupplyChainDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchSupplyChainDashboard()
      .then(setDashboard)
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  const trendChart = useMemo(() => {
    if (!dashboard?.perolehan_trend.length) return null;
    const maxVal = Math.max(...dashboard.perolehan_trend.map((t) => t.value));
    const scale = maxVal > 0 ? maxVal / 1_000_000_000 : 1;
    return {
      months: dashboard.perolehan_trend.map((t) => String(t.year)),
      values: dashboard.perolehan_trend.map((t) =>
        Number((t.value / 1_000_000_000 / (scale / (maxVal / 1_000_000_000 || 1))).toFixed(1))
      ),
      raw: dashboard.perolehan_trend,
      max: Math.ceil(Math.max(...dashboard.perolehan_trend.map((t) => t.value / 1_000_000_000)) * 1.1),
    };
  }, [dashboard?.perolehan_trend]);

  const compositionDonut = useMemo(
    () =>
      dashboard?.composition.map((c) => ({
        label: c.label,
        pct: c.pct,
        color: c.color,
      })) ?? [],
    [dashboard?.composition]
  );

  return (
    <PageFrame
      title="Dashboard Asset / Supply Chain"
      description="Data real dari ASSET_MANAJEMEN & SIMARTDB — nilai BMD, estimasi penyusutan, dan persediaan"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Menghitung nilai aset & estimasi penyusutan...
        </div>
      ) : !dashboard ? (
        <div className={cardClassName({ variant: "dashed", className: "py-10 text-center text-sm text-slate-500" })}>
          Gagal memuat dashboard. Pastikan backend terhubung ke ASSET_MANAJEMEN.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Sumber: {dashboard.financial.source} · {dashboard.inventory.source}
            </span>
            <span>Diperbarui: {formatAsOf(dashboard.as_of)}</span>
          </div>

          {/* Nilai BMD & Penyusutan */}
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-6">
            {[
              {
                label: "Nilai Perolehan BMD",
                value: formatAssetAmount(dashboard.financial.nilai_perolehan_bmd),
                sub: `${dashboard.financial.item_bmd_aktif.toLocaleString("id-ID")} item aktif`,
                icon: "🏛️",
                bg: "bg-teal-600",
                href: "/supply-chain/asset-management?tab=register-bmd",
              },
              {
                label: "Nilai Buku BMD",
                value: formatAssetAmount(dashboard.financial.nilai_buku_bmd),
                sub: `${dashboard.financial.nilai_buku_pct}% dari perolehan`,
                icon: "📘",
                bg: "bg-blue-600",
                href: "/supply-chain/asset-management?tab=register-bmd",
              },
              {
                label: "Akumulasi Penyusutan",
                value: formatAssetAmount(dashboard.financial.akumulasi_penyusutan),
                sub: `${dashboard.financial.penyusutan_pct}% tersusut`,
                icon: "📉",
                bg: "bg-amber-500",
                href: "/supply-chain/laporan?tab=inventaris",
              },
              {
                label: "Estimasi Penyusutan/Tahun",
                value: formatAssetAmount(dashboard.financial.estimasi_penyusutan_tahun_ini),
                sub: `${dashboard.financial.item_dengan_masa_manfaat.toLocaleString("id-ID")} item ber-masa manfaat`,
                icon: "🧮",
                bg: "bg-orange-500",
                href: "/supply-chain/laporan?tab=inventaris",
              },
              {
                label: "Nilai Persediaan (HPP)",
                value: formatAssetAmount(dashboard.inventory.nilai_persediaan_hpp),
                sub: `${dashboard.inventory.item_aktif.toLocaleString("id-ID")} item stok aktif`,
                icon: "📦",
                bg: "bg-emerald-600",
                href: "/supply-chain/gudang-stok?tab=stok-invent",
              },
              {
                label: "Stok Kritis",
                value: dashboard.inventory.stok_kritis.toLocaleString("id-ID"),
                sub: "NQTY1 < NQTYMIN · SIMARTDB",
                icon: "⚠️",
                bg: "bg-red-500",
                href: "/supply-chain/batch-expired?tab=stok-minimum",
              },
            ].map((kpi) => (
              <Link key={kpi.label} href={kpi.href}>
                <div
                  className={cardClassName({
                    variant: "default",
                    className: "group h-full !p-2.5 transition-shadow hover:border-[#0d6e63]/30 hover:shadow-md",
                  })}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${kpi.bg}`}>
                    {kpi.icon}
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium leading-tight text-slate-500">{kpi.label}</p>
                  <p className="mt-0.5 text-sm font-bold leading-tight text-slate-900 group-hover:text-[#0d6e63]">
                    {kpi.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{kpi.sub}</p>
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-2 text-[10px] text-slate-400">{dashboard.depreciation_note}</p>

          {/* Operasional */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { label: "Register BMD", value: dashboard.operational.register_bmd },
              { label: "Belum Verifikasi", value: dashboard.operational.belum_verifikasi },
              { label: "Master SIMART", value: dashboard.inventory.master_barang },
              { label: "Kode Permen", value: dashboard.operational.kode_permen },
              { label: "Ruangan", value: dashboard.operational.ruangan },
              { label: "Mutasi Pending", value: dashboard.operational.mutasi_pending },
              { label: "Disposal Draft", value: dashboard.operational.disposal_pending },
            ].map((item) => (
              <div key={item.label} className={cardClassName({ variant: "default", className: "!p-2.5 text-center" })}>
                <p className="text-[10px] text-slate-500">{item.label}</p>
                <p className="text-base font-bold text-slate-900">{item.value.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className={cardClassName({ variant: "default", className: "!p-4" })}>
              <h3 className="text-sm font-semibold text-slate-900">Komposisi Nilai BMD</h3>
              <p className="text-[10px] text-slate-500">Per kelompok Permen · ASSET_MANAJEMEN</p>
              {compositionDonut.length > 0 ? (
                <div className="mt-3 flex gap-4">
                  <DonutChart
                    segments={compositionDonut}
                    centerLabel={formatAssetAmount(dashboard.financial.nilai_perolehan_bmd)}
                    centerSub="Perolehan"
                    size={100}
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {dashboard.composition.map((s) => (
                      <div key={s.label} className="flex items-center justify-between text-[11px]">
                        <span className="flex min-w-0 items-center gap-1.5 text-slate-600">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                          <span className="truncate">{s.label}</span>
                        </span>
                        <span className="ml-2 shrink-0 font-semibold tabular-nums text-slate-800">
                          {s.pct}% · {formatAssetAmount(s.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400">Data komposisi tidak tersedia</p>
              )}
            </div>

            <div className={cardClassName({ variant: "default", className: "!p-4" })}>
              <h3 className="text-sm font-semibold text-slate-900">Perolehan BMD per Tahun</h3>
              <p className="text-[10px] text-slate-500">Nilai perolehan (Miliar Rp) · 8 tahun terakhir</p>
              {trendChart ? (
                <>
                  <div className="mt-3">
                    <BarChartVertical
                      months={trendChart.months}
                      values={trendChart.raw.map((t) => Number((t.value / 1_000_000_000).toFixed(1)))}
                      max={trendChart.max}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {trendChart.raw.map((t) => (
                      <span key={t.year} className="text-[10px] text-slate-500">
                        {t.year}: {t.count} item · {formatAssetAmount(t.value)}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-xs text-slate-400">Data tren tidak tersedia</p>
              )}
            </div>
          </div>

          {/* Penyusutan summary card */}
          <div className={cardClassName({ variant: "default", className: "mt-3 !p-4" })}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Ringkasan Penyusutan BMD</h3>
                <p className="text-xs text-slate-500">Perhitungan estimasi dari data Inventaris + masa manfaat Permen</p>
              </div>
              <Link href="/supply-chain/laporan?tab=inventaris" className="text-xs text-[#0d6e63] hover:underline">
                Lihat laporan →
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
                  Nilai Perolehan
                </div>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatAssetAmount(dashboard.financial.nilai_perolehan_bmd, false)}
                </p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
                  Akumulasi Penyusutan ({dashboard.financial.penyusutan_pct}%)
                </div>
                <p className="mt-1 text-lg font-bold text-amber-800">
                  {formatAssetAmount(dashboard.financial.akumulasi_penyusutan, false)}
                </p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Boxes className="h-3.5 w-3.5 text-blue-600" />
                  Nilai Buku ({dashboard.financial.nilai_buku_pct}%)
                </div>
                <p className="mt-1 text-lg font-bold text-blue-800">
                  {formatAssetAmount(dashboard.financial.nilai_buku_bmd, false)}
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                style={{ width: `${Math.min(dashboard.financial.penyusutan_pct, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">
              Estimasi beban penyusutan tahun berjalan:{" "}
              <strong>{formatAssetAmount(dashboard.financial.estimasi_penyusutan_tahun_ini, false)}</strong>
            </p>
          </div>

          {/* Alerts */}
          {dashboard.alerts.length > 0 && (
            <div className={`mt-3 ${cardClassName({ variant: "default", className: "!p-4" })}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Alert Operasional</h3>
                <Link href="/supply-chain/monitoring" className="text-xs text-[#0d6e63] hover:underline">
                  Monitoring lengkap →
                </Link>
              </div>
              <div className={`mt-2 ${tableShellClassName}`}>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className={tableHeadRowClassName}>
                      <th className={`${tableHeadCellCompactClassName} text-left`}>Jenis</th>
                      <th className={`${tableHeadCellCompactClassName} text-left`}>Deskripsi</th>
                      <th className={`${tableHeadCellCompactClassName} text-left`}>Prioritas</th>
                      <th className={`${tableHeadCellCompactClassName} text-right`}>Jml</th>
                    </tr>
                  </thead>
                  <tbody className={tableBodyStripedClassName}>
                    {dashboard.alerts.map((a) => (
                      <tr key={a.deskripsi}>
                        <td className="py-1.5">{a.jenis}</td>
                        <td className="py-1.5 text-slate-600">{a.deskripsi}</td>
                        <td className="py-1.5">
                          <Badge variant={PRIORITY_BADGE[a.prioritas]}>{a.prioritas}</Badge>
                        </td>
                        <td className="py-1.5 text-right font-semibold">{a.jumlah.toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <div className={`mt-3 ${cardClassName({ variant: "default", className: "!p-4" })}`}>
        <h2 className="text-base font-semibold text-slate-900">Modul Asset / Supply Chain</h2>
        <p className="mt-1 text-xs text-slate-500">
          Inventori, aset tetap BMD, distribusi, stock opname, dan logistik.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((item) => {
          const Icon = MODULE_ICONS[item.href] ?? Boxes;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cardClassName({
                  variant: "default",
                  className:
                    "group flex items-center gap-3 !p-3 transition-shadow hover:border-[#0d6e63]/30 hover:shadow-md",
                })}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0d6e63]/10 text-[#0d6e63]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 group-hover:text-[#0d6e63]">
                    {t(item.labelKey)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#0d6e63]" />
              </div>
            </Link>
          );
        })}
      </div>
    </PageFrame>
  );
}
