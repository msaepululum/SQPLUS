import Link from "next/link";

const EXPORT_ACTIONS = (
  <>
    <button
      type="button"
      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[0.8125rem] font-medium text-red-700 hover:bg-red-100 sm:flex-none"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      Export PDF
    </button>
    <button
      type="button"
      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[0.8125rem] font-medium text-emerald-700 hover:bg-emerald-100 sm:flex-none"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export Excel
    </button>
  </>
);

export function RevenueDetailHeader() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="px-4 pt-3 sm:px-6 sm:pt-4">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <Link href="/finance" className="hover:text-sky-600">
            Keuangan
          </Link>
          <span>/</span>
          <Link href="/finance" className="hover:text-sky-600">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Total Pendapatan</span>
        </nav>
      </div>

      <div className="flex flex-col gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Detail Total Pendapatan
          </h1>
          <p className="mt-0.5 max-w-2xl text-[0.8125rem] leading-snug text-slate-500">
            Rincian pendapatan rumah sakit berdasarkan sumber, layanan, poli, dan dokter.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
          {EXPORT_ACTIONS}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {[
            { icon: "🩺", label: "Unit Layanan", value: "Semua Unit" },
            { icon: "👨‍⚕️", label: "Dokter", value: "Semua Dokter" },
            { icon: "💳", label: "Jenis Pembayar", value: "Semua Jenis" },
          ].map((f) => (
            <div key={f.label} className="flex shrink-0 items-center gap-2">
              <span className="text-sm">{f.icon}</span>
              <select className="min-w-[8.5rem] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-sky-300 focus:outline-none sm:text-sm">
                <option>{f.value}</option>
              </select>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 sm:ml-auto sm:w-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Reset Filter
        </button>
      </div>
    </div>
  );
}
