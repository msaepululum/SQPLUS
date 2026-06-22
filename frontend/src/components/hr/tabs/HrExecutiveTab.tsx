"use client";

import { useEffect, useState } from "react";
import { HrInsightPanel, HrSourceNote } from "@/components/hr/HrInsightPanel";
import { StatCard } from "@/components/cards/StatCard";
import { Card, cardClassName } from "@/components/ui/Card";
import { getHrDashboard } from "@/services/hr";
import type { HrDashboard as HrDashboardData } from "@/types/hr";
import { formatHrNumber } from "@/types/hr";
import { Loader2 } from "lucide-react";

export function HrExecutiveTab() {
  const [data, setData] = useState<HrDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHrDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat ringkasan pimpinan...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Pegawai"
          value={data ? formatHrNumber(data.total_employees) : "—"}
          hint="Payroll SIMRS"
        />
        <StatCard
          label="Kehadiran Hari Ini"
          value={
            data?.attendance_rate_today != null
              ? `${data.attendance_rate_today}%`
              : formatHrNumber(data?.present_today ?? 0)
          }
          hint="HRIS"
        />
        <StatCard label="Cuti Berjalan" value={data?.cuti_berjalan ?? "—"} />
        <StatCard
          label="Lembur Bulan Ini"
          value={data?.lembur_bulan_ini.label ?? "—"}
          hint="HRIS"
        />
      </div>

      <div className={cardClassName({ variant: "default", className: "!p-4" })}>
        <HrInsightPanel data={data} loading={loading} />
      </div>

      <HrSourceNote data={data} />
    </div>
  );
}
