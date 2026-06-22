"use client";

import { useState } from "react";
import { FinanceDashboardTabs } from "@/components/finance/dashboard/FinanceDashboardTabs";
import { MainSummaryDashboard } from "@/components/finance/dashboard/main-summary/MainSummaryDashboard";
import { BelanjaDashboard } from "@/components/finance/dashboard/belanja/BelanjaDashboard";
import { KasBankDashboard } from "@/components/finance/dashboard/kas-bank/KasBankDashboard";
import { LaporanKeuanganDashboard } from "@/components/finance/dashboard/laporan-keuangan/LaporanKeuanganDashboard";
import { HutangPiutangDashboard } from "@/components/finance/receivables-payables/HutangPiutangDashboard";
import { PenerimaanDashboard } from "@/components/finance/dashboard/penerimaan/PenerimaanDashboard";
import { FINANCE_DASHBOARD_TABS } from "@/constants/finance-dashboard";

function TabPlaceholder({ tabId }: { tabId: number }) {
  const label = FINANCE_DASHBOARD_TABS.find((t) => t.id === tabId)?.label ?? `Tab ${tabId}`;
  return (
    <div className="flex min-h-[20rem] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
      <p className="text-sm text-slate-400">
        Rincian <strong className="font-medium text-slate-500">{label}</strong> akan ditambahkan pada fase berikutnya.
      </p>
    </div>
  );
}

export function IncomeExpenseDashboard() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="space-y-4">
      <FinanceDashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 1 && <MainSummaryDashboard />}

      {activeTab === 2 && <PenerimaanDashboard />}

      {activeTab === 3 && <BelanjaDashboard />}

      {activeTab === 4 && <HutangPiutangDashboard />}

      {activeTab === 5 && <KasBankDashboard />}

      {activeTab === 6 && <LaporanKeuanganDashboard />}

      {activeTab > 6 && <TabPlaceholder tabId={activeTab} />}
    </div>
  );
}
