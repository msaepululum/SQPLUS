"use client";

import { FINANCE_DASHBOARD_TABS } from "@/constants/finance-dashboard";

type FinanceDashboardTabsProps = {
  activeTab: number;
  onTabChange?: (tabId: number) => void;
};

export function FinanceDashboardTabs({ activeTab, onTabChange }: FinanceDashboardTabsProps) {
  return (
    <div className="overflow-x-auto rounded-lg bg-slate-100 p-1 sq-scroll">
      <div className="flex min-w-max gap-0.5">
        {FINANCE_DASHBOARD_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors sm:px-3.5 sm:text-[0.8125rem] ${
                isActive
                  ? "bg-[#0d6e63] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-800"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[0.6875rem] font-bold ${
                  isActive ? "bg-white/25 text-white" : "text-slate-400"
                }`}
              >
                {tab.id}
              </span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
