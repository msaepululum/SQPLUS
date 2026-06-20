"use client";

import { useState } from "react";
import {
  KasBankCashInDonut,
  KasBankExpenseBar,
  KasBankTrendChart,
} from "@/components/finance/dashboard/kas-bank/KasBankCharts";
import { KasBankFiltersBar } from "@/components/finance/dashboard/kas-bank/KasBankFilters";
import { KasBankFlowTable } from "@/components/finance/dashboard/kas-bank/KasBankFlowTable";
import { KasBankKpis } from "@/components/finance/dashboard/kas-bank/KasBankKpis";
import {
  KasBankAccountSummary,
  KasBankActions,
  KasBankProjection,
  KasBankRekonStatus,
} from "@/components/finance/dashboard/kas-bank/KasBankMiddleSection";
import {
  DEFAULT_KAS_BANK_FILTERS,
  hasActiveKasBankFilters,
  type KasBankFilters,
} from "@/constants/kas-bank-data";

export function KasBankDashboard() {
  const [filters, setFilters] = useState<KasBankFilters>(DEFAULT_KAS_BANK_FILTERS);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Ringkasan arus kas, saldo rekening bank, rekonsiliasi, dan proyeksi cashflow rumah sakit.
      </p>

      <KasBankFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_KAS_BANK_FILTERS)}
      />

      {hasActiveKasBankFilters(filters) && (
        <p className="rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2 text-xs text-teal-800">
          Filter aktif — data ditampilkan sesuai pilihan filter. Reset untuk melihat seluruh data.
        </p>
      )}

      <KasBankKpis />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <KasBankTrendChart filters={filters} />
        <KasBankCashInDonut />
        <KasBankExpenseBar filters={filters} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KasBankAccountSummary filters={filters} />
        <KasBankRekonStatus filters={filters} />
        <KasBankActions />
        <KasBankProjection />
      </div>

      <KasBankFlowTable filters={filters} />
    </div>
  );
}
