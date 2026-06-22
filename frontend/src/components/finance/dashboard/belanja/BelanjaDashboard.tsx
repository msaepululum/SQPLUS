"use client";

import { useState } from "react";
import { BelanjaBottomKpis } from "@/components/finance/dashboard/belanja/BelanjaBottomKpis";
import {
  BelanjaCategoryDonut,
  BelanjaSourceStackChart,
  BelanjaTrendChart,
} from "@/components/finance/dashboard/belanja/BelanjaCharts";
import { BelanjaExpenseByCategoryTable } from "@/components/finance/dashboard/belanja/BelanjaExpenseByCategoryTable";
import { BelanjaFiltersBar } from "@/components/finance/dashboard/belanja/BelanjaFilters";
import { BelanjaKpis } from "@/components/finance/dashboard/belanja/BelanjaKpis";
import {
  BelanjaKodeSummaryTable,
  BelanjaProcessStatus,
  BelanjaUnitBar,
} from "@/components/finance/dashboard/belanja/BelanjaMiddleSection";
import { BelanjaTransactionsSection } from "@/components/finance/dashboard/belanja/BelanjaTransactionsSection";
import {
  DEFAULT_BELANJA_FILTERS,
  hasActiveBelanjaFilters,
  type BelanjaFilters,
} from "@/constants/belanja-data";

export function BelanjaDashboard() {
  const [filters, setFilters] = useState<BelanjaFilters>(DEFAULT_BELANJA_FILTERS);

  return (
    <div className="space-y-3">
      <BelanjaFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_BELANJA_FILTERS)}
      />

      {hasActiveBelanjaFilters(filters) && (
        <p className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-800">
          Filter aktif — data ditampilkan sesuai pilihan filter. Reset untuk melihat seluruh data.
        </p>
      )}

      <BelanjaKpis />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <BelanjaTrendChart />
        <BelanjaSourceStackChart />
        <BelanjaCategoryDonut />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <BelanjaUnitBar />
        </div>
        <div className="xl:col-span-6">
          <BelanjaKodeSummaryTable />
        </div>
        <div className="xl:col-span-3">
          <BelanjaProcessStatus />
        </div>
      </div>

      <BelanjaExpenseByCategoryTable filters={filters} />

      <BelanjaTransactionsSection filters={filters} />

      <BelanjaBottomKpis />
    </div>
  );
}
