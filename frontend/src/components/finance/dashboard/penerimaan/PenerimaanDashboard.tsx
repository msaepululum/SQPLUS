"use client";

import { useState } from "react";
import { PenerimaanBottomSection } from "@/components/finance/dashboard/penerimaan/PenerimaanBottomSection";
import {
  PenerimaanIncomeBreakdown,
  PenerimaanServiceBar,
  PenerimaanSourceDonut,
} from "@/components/finance/dashboard/penerimaan/PenerimaanDetails";
import {
  PenerimaanSourceStackChart,
  PenerimaanTrendChart,
} from "@/components/finance/dashboard/penerimaan/PenerimaanCharts";
import { PenerimaanFiltersBar } from "@/components/finance/dashboard/penerimaan/PenerimaanFilters";
import { PenerimaanIncomeBySourceTable } from "@/components/finance/dashboard/penerimaan/PenerimaanIncomeBySourceTable";
import { PenerimaanKpis } from "@/components/finance/dashboard/penerimaan/PenerimaanKpis";
import { PenerimaanMonthlyTable } from "@/components/finance/dashboard/penerimaan/PenerimaanMonthlyTable";
import {
  DEFAULT_PENERIMAAN_FILTERS,
  hasActivePenerimaanFilters,
  type PenerimaanFilters,
} from "@/constants/penerimaan-data";

export function PenerimaanDashboard() {
  const [filters, setFilters] = useState<PenerimaanFilters>(DEFAULT_PENERIMAAN_FILTERS);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-slate-500">
          Ringkasan pendapatan, performa, dan pencapaian target keuangan rumah sakit.
        </p>
      </div>

      <PenerimaanFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_PENERIMAAN_FILTERS)}
      />

      {hasActivePenerimaanFilters(filters) && (
        <p className="rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2 text-xs text-teal-800">
          Filter aktif — data ditampilkan sesuai pilihan filter. Reset untuk melihat seluruh data.
        </p>
      )}

      <PenerimaanKpis />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <PenerimaanTrendChart />
        <PenerimaanSourceStackChart />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-5 space-y-3">
          <PenerimaanIncomeBySourceTable filters={filters} />
          <PenerimaanMonthlyTable filters={filters} />
        </div>
        <div className="xl:col-span-3 space-y-3">
          <PenerimaanIncomeBreakdown />
          <PenerimaanSourceDonut />
        </div>
        <div className="xl:col-span-4">
          <PenerimaanServiceBar />
        </div>
      </div>

      <PenerimaanBottomSection />
    </div>
  );
}
