"use client";

import { useState } from "react";
import { FinanceDashboardTabs } from "@/components/finance/dashboard/FinanceDashboardTabs";
import { MainSummaryDashboard } from "@/components/finance/dashboard/main-summary/MainSummaryDashboard";
import { IncomeExpenseChart } from "@/components/finance/dashboard/IncomeExpenseChart";
import { IncomeBreakdownTable } from "@/components/finance/dashboard/IncomeBreakdownTable";
import { ExpenseBreakdownTable } from "@/components/finance/dashboard/ExpenseBreakdownTable";
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

      {activeTab === 2 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <IncomeExpenseChart />
          </div>
          <div className="xl:col-span-5">
            <IncomeBreakdownTable />
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <IncomeExpenseChart />
          </div>
          <div className="xl:col-span-5">
            <ExpenseBreakdownTable />
          </div>
        </div>
      )}

      {activeTab > 3 && <TabPlaceholder tabId={activeTab} />}
    </div>
  );
}
