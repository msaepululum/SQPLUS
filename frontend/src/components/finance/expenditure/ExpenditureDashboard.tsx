"use client";

import { BelanjaDashboard } from "@/components/finance/dashboard/belanja/BelanjaDashboard";
import { PageFrame } from "@/components/layout/PageFrame";

export function ExpenditureDashboard() {
  return (
    <PageFrame
      title="Dashboard Belanja"
      description="Ringkasan pagu, realisasi, komitmen, dan status proses belanja rumah sakit"
    >
      <BelanjaDashboard />
    </PageFrame>
  );
}
