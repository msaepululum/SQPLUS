"use client";

import { useState } from "react";
import { PiutangAgingSection } from "@/components/finance/dashboard/piutang/PiutangAgingSection";
import { PiutangSidebar, PiutangSummaryTable } from "@/components/finance/dashboard/piutang/PiutangBottomSection";
import {
  PiutangCompositionDonut,
  PiutangServiceBar,
  PiutangTrendChart,
} from "@/components/finance/dashboard/piutang/PiutangCharts";
import { PiutangFiltersBar } from "@/components/finance/dashboard/piutang/PiutangFilters";
import { PiutangKpis } from "@/components/finance/dashboard/piutang/PiutangKpis";
import {
  DEFAULT_PIUTANG_FILTERS,
  hasActivePiutangFilters,
  type PiutangFilters,
} from "@/constants/piutang-data";

export function PiutangDashboard() {
  const [filters, setFilters] = useState<PiutangFilters>(DEFAULT_PIUTANG_FILTERS);

  return (
    <div className="space-y-3">
      <PiutangFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_PIUTANG_FILTERS)}
      />

      {hasActivePiutangFilters(filters) && (
        <p className="rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2 text-xs text-violet-800">
          Filter aktif — data ditampilkan sesuai pilihan filter. Reset untuk melihat seluruh data.
        </p>
      )}

      <PiutangKpis />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <PiutangTrendChart filters={filters} />
        <PiutangCompositionDonut />
        <PiutangServiceBar filters={filters} />
      </div>

      <PiutangAgingSection />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <PiutangSummaryTable filters={filters} />
        </div>
        <div className="xl:col-span-4">
          <PiutangSidebar />
        </div>
      </div>
    </div>
  );
}
