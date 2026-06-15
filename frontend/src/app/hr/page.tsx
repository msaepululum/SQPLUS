"use client";

import { StatCard } from "@/components/cards/StatCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { getHrDashboard } from "@/services/hr";
import type { HrDashboard } from "@/types/hr";
import { useEffect, useState } from "react";

export default function HrDashboardPage() {
  const [data, setData] = useState<HrDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHrDashboard()
      .then(setData)
      .catch(() => setError("Gagal memuat ringkasan SDM."));
  }, []);

  return (
    <>
      <PageHeader
        title="Personalia"
        description="Ringkasan SDM, kehadiran, cuti, dan penggajian."
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <CardGrid cols={4}>
        <StatCard
          label="Karyawan aktif"
          value={data?.total_employees ?? "—"}
        />
        <StatCard
          label="Hadir hari ini"
          value={data?.present_today ?? "—"}
        />
        <StatCard
          label="Cuti menunggu"
          value={data?.pending_leave_requests ?? "—"}
        />
        <StatCard
          label="Periode gaji terakhir"
          value={data?.latest_payroll_period?.code ?? "—"}
          hint={data?.latest_payroll_period?.name}
        />
      </CardGrid>
    </>
  );
}
