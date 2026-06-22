"use client";

import Link from "next/link";
import { ChevronRight, ClipboardList, Loader2, ShoppingCart } from "lucide-react";
import {
  BarChartVertical,
  InsightCardShell,
  SectionLink,
} from "@/components/beranda/BerandaCharts";
import type { ProcurementDashboard } from "@/types/procurement";
import { cn } from "@/lib/cn";

const KPI_ITEMS = [
  {
    key: "aju_antrian" as const,
    label: "AJU Antrian",
    href: "/procurement/permintaan",
    tone: "border-sky-100 bg-sky-50/80 text-sky-900",
  },
  {
    key: "negosiasi_aktif" as const,
    label: "Negosiasi Aktif",
    href: "/procurement/negosiasi",
    tone: "border-violet-100 bg-violet-50/80 text-violet-900",
  },
  {
    key: "po_aktif" as const,
    label: "PO Aktif",
    href: "/procurement/po-spk-kontrak",
    tone: "border-amber-100 bg-amber-50/80 text-amber-900",
  },
  {
    key: "penerimaan" as const,
    label: "Penerimaan",
    href: "/procurement/penerimaan",
    tone: "border-teal-100 bg-teal-50/80 text-teal-900",
  },
  {
    key: "aju_close" as const,
    label: "AJU Close",
    href: "/procurement/permintaan?tab=tracking",
    tone: "border-emerald-100 bg-emerald-50/80 text-emerald-900",
  },
  {
    key: "belum_tukar_faktur" as const,
    label: "Belum Tukar Faktur",
    href: "/finance/payments/belum-proses-tagihan",
    tone: "border-orange-100 bg-orange-50/80 text-orange-900",
  },
];

type InsightProcurementProps = {
  data: ProcurementDashboard | null;
  loading?: boolean;
  tahun?: number;
};

export function InsightProcurement({ data, loading, tahun }: InsightProcurementProps) {
  const CHART_LABELS: Record<(typeof KPI_ITEMS)[number]["key"], string> = {
    aju_antrian: "Antrian",
    negosiasi_aktif: "Nego",
    po_aktif: "PO",
    penerimaan: "Terima",
    aju_close: "Close",
    belum_tukar_faktur: "Faktur",
  };

  const chartData = data
    ? KPI_ITEMS.map((item) => ({
        key: item.key,
        label: CHART_LABELS[item.key],
        value: data.kpi[item.key],
      }))
    : [];
  const chartMax = Math.max(...chartData.map((d) => d.value), 1) * 1.15;

  return (
    <InsightCardShell
      icon={<ShoppingCart className="h-4 w-4 text-orange-600" strokeWidth={2} />}
      iconBg="bg-orange-50"
      title="Insight Pengadaan"
      href="/procurement"
    >
      {loading && !data ? (
        <div className="flex flex-1 items-center justify-center gap-2 py-8 text-sm text-sq-slate">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat data pengadaan...
        </div>
      ) : !data ? (
        <p className="py-6 text-center text-sm text-sq-slate">
          Gagal memuat data pengadaan.
        </p>
      ) : (
        <>
          <p className="text-[11px] text-sq-slate">
            Siklus pengadaan {tahun ?? data.tahun} — FINANCE.aju → POH → INBELIH
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {KPI_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "rounded-lg border p-2.5 transition hover:shadow-md",
                  item.tone
                )}
              >
                <p className="text-[10px] font-medium opacity-80">{item.label}</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums">{data.kpi[item.key]}</p>
              </Link>
            ))}
          </div>

          {chartData.some((d) => d.value > 0) && (
            <div>
              <p className="mb-1 text-[11px] font-medium text-sq-slate">
                Volume per Tahap
              </p>
              <BarChartVertical
                months={chartData.map((d) => d.label)}
                values={chartData.map((d) => d.value)}
                max={chartMax}
                color="#F97316"
              />
            </div>
          )}

          <div className="mt-auto flex items-start gap-2 rounded-lg border border-orange-100 bg-orange-50/80 px-3 py-2.5 dark:border-orange-900/30 dark:bg-orange-500/10">
            <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" strokeWidth={2} />
            <p className="text-[11px] leading-relaxed text-orange-900 dark:text-orange-200">
              {data.kpi.aju_antrian > 0
                ? `${data.kpi.aju_antrian} AJU disetujui menunggu proses pengadaan.`
                : "Tidak ada antrian AJU — semua permintaan sudah diproses atau dalam tahap berikutnya."}
              {data.kpi.belum_tukar_faktur > 0 &&
                ` ${data.kpi.belum_tukar_faktur} penerimaan belum tukar faktur.`}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-center">
            <SectionLink href="/procurement/monitoring">
              Monitoring <ChevronRight className="inline h-3 w-3" />
            </SectionLink>
            <SectionLink href="/procurement/vendor">
              Vendor <ChevronRight className="inline h-3 w-3" />
            </SectionLink>
          </div>
        </>
      )}
    </InsightCardShell>
  );
}
