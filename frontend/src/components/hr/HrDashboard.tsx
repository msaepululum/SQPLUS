"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HrInsightPanel, HrSourceNote } from "@/components/hr/HrInsightPanel";
import { StatCard } from "@/components/cards/StatCard";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, CardDescription, CardTitle, cardClassName } from "@/components/ui/Card";
import { HR_DASHBOARD_SHORTCUTS } from "@/constants/hr-navigation";
import { getHrDashboard, getPayrollTaxSummary } from "@/services/hr";
import type { HrDashboard as HrDashboardData, HrPayrollTaxSummary } from "@/types/hr";
import { formatHrCurrency, formatHrNumber } from "@/types/hr";
import { ChevronRight, Loader2 } from "lucide-react";

export function HrDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<HrDashboardData | null>(null);
  const [taxSummary, setTaxSummary] = useState<HrPayrollTaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getHrDashboard(), getPayrollTaxSummary().catch(() => null)])
      .then(([dashboard, tax]) => {
        setData(dashboard);
        setTaxSummary(tax);
      })
      .catch(() => setError("Gagal memuat ringkasan SDM dari Payroll / HRIS."))
      .finally(() => setLoading(false));
  }, []);

  const presentLabel =
    data?.attendance_rate_today != null
      ? `${formatHrNumber(data.present_today)} (${data.attendance_rate_today}%)`
      : data?.present_today != null
        ? formatHrNumber(data.present_today)
        : "—";

  return (
    <PageFrame
      title="Dashboard Personalia"
      description="Ringkasan SDM dari Payroll SIMRS dan HRIS — komposisi pegawai, kehadiran, cuti, lembur, dan payroll"
    >
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {loading && !data ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat dashboard dari Payroll & HRIS...
        </div>
      ) : (
        <>
          <CardGrid cols={4}>
            <StatCard
              label="Karyawan aktif"
              value={data ? formatHrNumber(data.total_employees) : "—"}
              hint={data?.sources.employees === "payroll" ? "Payroll SIMRS" : "SQ+"}
            />
            <StatCard label="Hadir hari ini" value={presentLabel} hint="HRIS" />
            <StatCard
              label="PPh 21 bulan ini"
              value={
                taxSummary
                  ? formatHrCurrency(
                      taxSummary.kpi.total_pph21_all ?? taxSummary.kpi.total_pph21
                    )
                  : "—"
              }
              hint={taxSummary ? `TER · ${taxSummary.period_name}` : "Skema TER"}
            />
            <StatCard
              label="Periode gaji terakhir"
              value={data?.latest_payroll_period?.code ?? "—"}
              hint={data?.latest_payroll_period?.name}
            />
          </CardGrid>

          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
            <div className={cardClassName({ variant: "default", className: "xl:col-span-2 !p-4" })}>
              <HrInsightPanel data={data} loading={loading} />
            </div>

            <div className="space-y-3">
              <div className={cardClassName({ variant: "default", className: "!p-4" })}>
                <CardTitle className="text-sm">Lembur Bulan Ini</CardTitle>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                  {data?.lembur_bulan_ini.label ?? "—"}
                </p>
                <CardDescription className="mt-1">Sumber HRIS</CardDescription>
              </div>
              {taxSummary && (
                <Link href="/hr/payroll/proses?tab=perhitungan-pajak">
                  <div
                    className={cardClassName({
                      variant: "default",
                      className: "!p-4 transition-shadow hover:shadow-md",
                    })}
                  >
                    <CardTitle className="text-sm">Pajak Gaji (TER)</CardTitle>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-red-600">
                      {formatHrCurrency(
                        taxSummary.kpi.total_pph21_all ?? taxSummary.kpi.total_pph21
                      )}
                    </p>
                    <CardDescription className="mt-1">
                      {taxSummary.kpi.jumlah_pegawai} pegawai · terhubung Keuangan
                    </CardDescription>
                  </div>
                </Link>
              )}
              <HrSourceNote data={data} />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {HR_DASHBOARD_SHORTCUTS.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cardClassName({
                    variant: "default",
                    className: "group h-full transition-shadow hover:shadow-md",
                  })}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm group-hover:text-[#0d6e63]">
                        {t(item.labelKey)}
                      </CardTitle>
                      <CardDescription className="mt-1.5 text-xs">Buka menu</CardDescription>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0d6e63]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </PageFrame>
  );
}

function CardGrid({
  cols,
  children,
}: {
  cols: number;
  children: React.ReactNode;
}) {
  const colClass =
    cols === 4
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2";

  return <div className={`grid gap-3 ${colClass}`}>{children}</div>;
}
