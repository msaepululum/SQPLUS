"use client";

import { KasBankDashboard } from "@/components/finance/dashboard/kas-bank/KasBankDashboard";
import { PageFrame } from "@/components/layout/PageFrame";

export function CashBankDashboard() {
  return (
    <PageFrame
      title="Dashboard Kas"
      description="Ringkasan BKU (SIMARTDB) dan rekonsiliasi ke jurnal ACC2026 — arus kas operasional rumah sakit"
    >
      <KasBankDashboard />
    </PageFrame>
  );
}
