import { cn } from "@/lib/cn";

import {
  PENERIMAAN_INSIGHTS,
  PENERIMAAN_TARGET_SUMMARY,
  PENERIMAAN_TOP_DOCTORS,
  PENERIMAAN_TOP_POLI,
} from "@/constants/penerimaan-data";
import { cardClassName } from "@/components/ui/Card";
import { Lightbulb, Target } from "lucide-react";
import { tableShellClassName, tableBodyStripedClassName,
  tableHeadCellMdClassName,
  tableHeadRowClassName, } from "@/components/ui/tableStyles";

export function PenerimaanTopPoli() {
  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">
        Top Poli dengan Pendapatan Tertinggi
      </h3>
      <ul className="mt-3 space-y-3">
        {PENERIMAAN_TOP_POLI.map((p, i) => (
          <li key={p.name}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700">
                  {i + 1}
                </span>
                <span className="truncate font-medium text-slate-700">{p.name}</span>
              </div>
              <span className="shrink-0 font-semibold text-slate-900">{p.amount}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-500"
                style={{ width: `${p.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PenerimaanTopDoctors() {
  return (
    <div className={cardClassName({ variant: "default", className: "overflow-hidden !p-0" })}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-800">
          Top Dokter dengan Pendapatan Tertinggi
        </h3>
      </div>
      <div className={tableShellClassName}>
        <table className="w-full min-w-[20rem] text-xs">
          <thead>
            <tr className={tableHeadRowClassName}>
              <th className={`${tableHeadCellMdClassName} text-left`}>#</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>Dokter</th>
              <th className={`${tableHeadCellMdClassName} text-left`}>Poli</th>
              <th className={`${tableHeadCellMdClassName} text-right`}>Pendapatan</th>
            </tr>
          </thead>
          <tbody className={tableBodyStripedClassName}>
            {PENERIMAAN_TOP_DOCTORS.map((d) => (
              <tr key={d.rank}>
                <td className="px-3 py-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700">
                    {d.rank}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium text-slate-800">{d.name}</td>
                <td className="px-3 py-2 text-slate-600">{d.poli}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-900">{d.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PenerimaanInsights() {
  return (
    <div className={cardClassName({ variant: "default" })}>
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-800">Insight untuk Pimpinan</h3>
      </div>
      <ul className="mt-3 space-y-2.5">
        {PENERIMAAN_INSIGHTS.map((text) => (
          <li key={text} className="flex gap-2 text-xs leading-relaxed text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PenerimaanTargetSummary() {
  const { targetTahunan, realisasi, pencapaian, sisaTarget, rataRataBulanan } =
    PENERIMAAN_TARGET_SUMMARY;

  return (
    <div className={cardClassName({ variant: "default" })}>
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-rose-500" />
        <h3 className="text-sm font-semibold text-slate-800">Ringkasan Target</h3>
      </div>
      <dl className="mt-3 space-y-2.5 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Target Tahunan</dt>
          <dd className="font-semibold text-slate-800">Rp {targetTahunan.toFixed(2)} M</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Realisasi s.d. Mei</dt>
          <dd className="font-semibold text-slate-800">Rp {realisasi.toFixed(2)} M</dd>
        </div>
        <div>
          <div className="mb-1 flex justify-between gap-2">
            <dt className="text-slate-500">Pencapaian</dt>
            <dd className="font-semibold text-emerald-600">{pencapaian.toFixed(1)}%</dd>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              style={{ width: `${pencapaian}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Sisa Target</dt>
          <dd className="font-semibold text-amber-600">Rp {sisaTarget.toFixed(2)} M</dd>
        </div>
        <div className="flex justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
          <dt className="text-slate-500">Rata-rata Pencapaian / Bulan</dt>
          <dd className="font-semibold text-slate-800">{rataRataBulanan.toFixed(2)}%</dd>
        </div>
      </dl>
    </div>
  );
}

export function PenerimaanBottomSection() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <PenerimaanTopPoli />
      <PenerimaanTopDoctors />
      <PenerimaanInsights />
      <PenerimaanTargetSummary />
    </div>
  );
}
