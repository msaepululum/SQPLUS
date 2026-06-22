"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { fetchSupplyChainMonitoring } from "@/services/supplyChainService";
import type { SupplyChainMonitoring } from "@/types/supply-chain";
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

export function SupplyChainMonitoringView() {
  const [data, setData] = useState<SupplyChainMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSupplyChainMonitoring()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat monitoring."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Memuat monitoring...
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card variant="dashed" className="py-8 text-center">
        <CardTitle className="text-base">Monitoring tidak tersedia</CardTitle>
        <CardDescription className="mt-2">{error ?? "Data kosong"}</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card variant="default" className="!p-4">
        <CardTitle className="text-base">Alert Asset & Persediaan</CardTitle>
        <CardDescription className="mt-1">
          Aggregasi dari ASSET_MANAJEMEN & SIMARTDB — real-time read-only
        </CardDescription>
        <div className={`mt-3 ${tableShellClassName}`}>
          <table className="w-full min-w-[20rem] text-xs">
            <thead>
              <tr className={tableHeadRowClassName}>
                <th className={`${tableHeadCellCompactClassName} text-left`}>Jenis</th>
                <th className={`${tableHeadCellCompactClassName} text-left`}>Deskripsi</th>
                <th className={`${tableHeadCellCompactClassName} text-left`}>Prioritas</th>
                <th className={`${tableHeadCellCompactClassName} text-right`}>Jml</th>
                <th className={`${tableHeadCellCompactClassName} text-right`} />
              </tr>
            </thead>
            <tbody className={tableBodyStripedClassName}>
              {data.alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Tidak ada alert aktif
                  </td>
                </tr>
              ) : (
                data.alerts.map((a) => (
                  <tr key={a.deskripsi}>
                    <td className="py-2 text-slate-800">{a.jenis}</td>
                    <td className="py-2 text-slate-600">{a.deskripsi}</td>
                    <td className="py-2">
                      <Badge variant={PRIORITY_BADGE[a.prioritas]}>{a.prioritas}</Badge>
                    </td>
                    <td className="py-2 text-right font-semibold">{a.jumlah}</td>
                    <td className="py-2 text-right">
                      <Link href={a.href} className="text-[#0d6e63] hover:underline">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card variant="default" className="!p-4">
          <CardTitle className="text-sm">Inventaris BMD per Kondisi</CardTitle>
          <CardDescription className="text-xs">ASSET_MANAJEMEN.Inventaris</CardDescription>
          <ul className="mt-3 space-y-1.5">
            {data.summary.inventaris_by_kondisi.map((item) => (
              <li key={item.label} className="flex justify-between text-xs">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-semibold tabular-nums">{item.count.toLocaleString("id-ID")}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="default" className="!p-4">
          <CardTitle className="text-sm">Stok SIMART per Klasifikasi</CardTitle>
          <CardDescription className="text-xs">SIMARTDB.INVENT (top 8)</CardDescription>
          <ul className="mt-3 space-y-1.5">
            {data.summary.invent_by_klasifikasi.map((item) => (
              <li key={item.label} className="flex justify-between text-xs">
                <span className="truncate text-slate-600">{item.label}</span>
                <span className="ml-2 shrink-0 font-semibold tabular-nums">
                  {item.count.toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
