"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchAccTutupBuku } from "@/services/accountingService";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

export function AccountingTutupBukuTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAccTutupBuku>> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchAccTutupBuku());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat status tutup buku...
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState title="Gagal memuat data" description="Tidak dapat mengambil status tutup buku dari ACC2026." />
    );
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <p className="text-xs text-slate-500">Periode Tertutup</p>
          <p className="text-xl font-semibold text-slate-800">{data.summary.closed_count}</p>
        </div>
        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <p className="text-xs text-slate-500">Periode Terbuka</p>
          <p className="text-xl font-semibold text-emerald-700">{data.summary.open_count}</p>
        </div>
        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <p className="text-xs text-slate-500">Bulan Aktif</p>
          <p className="text-xl font-semibold text-slate-800">
            {data.summary.current_open_month
              ? data.periode_status.find((m) => m.bulan === data.summary.current_open_month)?.label ??
                data.summary.current_open_month
              : "—"}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-slate-800">Status Periode (TABBULAN)</h3>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
          {data.periode_status.map((m) => (
            <div
              key={m.bulan}
              className={cn(
                "rounded-lg border px-2 py-2 text-center text-xs",
                m.closed
                  ? "border-slate-200 bg-slate-100 text-slate-500"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              )}
            >
              <p className="font-medium">{m.label.slice(0, 3)}</p>
              <Badge variant={m.closed ? "draft" : "success"} className="mt-1">
                {m.closed ? "Tutup" : "Buka"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {data.history.length > 0 && (
        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-slate-800">Riwayat Penutupan (CLOSEBLN)</h3>
          <div className={tableGridShellClassName}>
            <Table>
              <THead>
                <TR>
                  <TH>No</TH>
                  <TH>Tahun</TH>
                  <TH>Bulan</TH>
                  <TH>Unit</TH>
                  <TH>Tanggal</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {data.history.map((r) => (
                  <TR key={r.no_close}>
                    <TD className="font-mono text-xs">{r.no_close}</TD>
                    <TD>{r.tahun}</TD>
                    <TD>{r.bulan}</TD>
                    <TD>{r.unit || "—"}</TD>
                    <TD>{r.tanggal_close ?? "—"}</TD>
                    <TD>
                      <Badge variant={r.valid ? "success" : "warning"}>
                        {r.valid ? "Valid" : "Draft"}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400">Sumber: {data.source}</p>
    </div>
  );
}
