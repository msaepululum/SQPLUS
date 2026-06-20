"use client";

import { useState } from "react";
import {
  LaporanPaguDonut,
  LaporanPendapatanPie,
  LaporanTrendChart,
} from "@/components/finance/dashboard/laporan-keuangan/LaporanKeuanganCharts";
import { LaporanKeuanganFiltersBar } from "@/components/finance/dashboard/laporan-keuangan/LaporanKeuanganFilters";
import { LaporanKeuanganKpis } from "@/components/finance/dashboard/laporan-keuangan/LaporanKeuanganKpis";
import { LaporanKeuanganSidebar } from "@/components/finance/dashboard/laporan-keuangan/LaporanKeuanganSidebar";
import {
  LaporanBelanjaTable,
  LaporanHutangPiutangTable,
  LaporanPendapatanTable,
} from "@/components/finance/dashboard/laporan-keuangan/LaporanKeuanganTables";
import {
  DEFAULT_LAPORAN_KEUANGAN_FILTERS,
  hasActiveLaporanFilters,
  type LaporanKeuanganFilters,
} from "@/constants/laporan-keuangan-data";

export function LaporanKeuanganDashboard() {
  const [filters, setFilters] = useState<LaporanKeuanganFilters>(DEFAULT_LAPORAN_KEUANGAN_FILTERS);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Laporan keuangan komprehensif: pendapatan, belanja, cashflow, pagu, hutang, dan piutang.
      </p>

      <LaporanKeuanganFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_LAPORAN_KEUANGAN_FILTERS)}
      />

      {hasActiveLaporanFilters(filters) && (
        <p className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs text-indigo-800">
          Filter aktif — data ditampilkan sesuai pilihan filter. Reset untuk melihat seluruh data.
        </p>
      )}

      <LaporanKeuanganKpis />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <LaporanTrendChart />
        </div>
        <div className="xl:col-span-3">
          <LaporanPaguDonut />
        </div>
        <div className="xl:col-span-3">
          <LaporanPendapatanPie />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <LaporanPendapatanTable filters={filters} />
            <LaporanBelanjaTable />
            <LaporanHutangPiutangTable />
          </div>
        </div>
        <div className="xl:col-span-4">
          <LaporanKeuanganSidebar />
        </div>
      </div>
    </div>
  );
}
