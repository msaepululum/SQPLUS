"use client";

import { HutangPiutangDashboard } from "@/components/finance/receivables-payables/HutangPiutangDashboard";
import { PageFrame } from "@/components/layout/PageFrame";

export function ReceivablesPayablesDashboard() {
  return (
    <PageFrame
      title="Dashboard Hutang Piutang"
      description="Ringkasan hutang & piutang dari jurnal ACC2026 — kewajiban, piutang pelayanan, umur piutang, dan komposisi"
    >
      <HutangPiutangDashboard />
    </PageFrame>
  );
}
