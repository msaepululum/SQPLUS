"use client";

import { PageFrame } from "@/components/layout/PageFrame";

const EXPORT_ACTIONS = (
  <>
    <button
      type="button"
      className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 sm:flex-none"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      Export PDF
    </button>
    <button
      type="button"
      className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 sm:flex-none"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export Excel
    </button>
  </>
);

export function RevenueDetailHeader() {
  return (
    <div className="space-y-3">
      <PageFrame
        title="Dashboard Pendapatan"
        description="Ringkasan pendapatan rumah sakit — sumber, layanan, poli, dan tren harian."
        actions={EXPORT_ACTIONS}
      />

      <div className="flex flex-col gap-2 rounded-lg border border-sq-border bg-slate-50/80 px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {[
            { icon: "🩺", label: "Unit Layanan", value: "Semua Unit" },
            { icon: "👨‍⚕️", label: "Dokter", value: "Semua Dokter" },
            { icon: "💳", label: "Jenis Pembayar", value: "Semua Jenis" },
          ].map((f) => (
            <div key={f.label} className="flex shrink-0 items-center gap-1.5">
              <span className="text-sm">{f.icon}</span>
              <select className="min-w-[8rem] rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-sky-300 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
                <option>{f.value}</option>
              </select>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 sm:ml-auto sm:w-auto dark:border-slate-700 dark:bg-slate-950"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Reset Filter
        </button>
      </div>
    </div>
  );
}
