import {
  LAPORAN_PAGU,
  LAPORAN_PENDAPATAN_COMPOSITION,
  LAPORAN_TREND_DATA,
} from "@/constants/laporan-keuangan-data";
import { cardClassName } from "@/components/ui/Card";

export function LaporanTrendChart() {
  const data = LAPORAN_TREND_DATA;
  const max = 22;
  const w = 640;
  const h = 260;
  const pad = { top: 24, right: 16, bottom: 32, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const toX = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / max) * chartH;
  const line = (key: "pendapatan" | "belanja" | "cashflow") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d[key])}`).join(" ");

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Tren Pendapatan, Belanja & Cashflow</h3>
      <div className="mt-2 flex flex-wrap gap-3 text-[0.625rem] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-blue-500" /> Pendapatan</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-red-500" /> Belanja</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-teal-500" /> Cashflow</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img">
        {[0, 5, 10, 15, 20].map((v) => (
          <line key={v} x1={pad.left} y1={toY(v)} x2={w - pad.right} y2={toY(v)} stroke="#f1f5f9" />
        ))}
        <path d={line("pendapatan")} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        <path d={line("belanja")} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <path d={line("cashflow")} fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
        {data.map((d, i) => (
          <text key={d.month} x={toX(i)} y={h - 10} textAnchor="middle" className="fill-slate-500 text-[8px]">{d.month}</text>
        ))}
      </svg>
    </div>
  );
}

export function LaporanPaguDonut() {
  const { pagu, realisasi, sisa, pct } = LAPORAN_PAGU;
  const realisasiPct = pct;
  const sisaPct = 100 - pct;

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Realisasi vs Pagu</h3>
      <div className="mt-3 flex flex-col items-center gap-4">
        <div className="relative">
          <svg viewBox="0 0 44 44" className="h-32 w-32">
            <circle r="18" cx="22" cy="22" fill="transparent" stroke="#e2e8f0" strokeWidth="9" />
            <circle r="18" cx="22" cy="22" fill="transparent" stroke="#3b82f6" strokeWidth="9"
              strokeDasharray={`${realisasiPct} ${100 - realisasiPct}`} strokeDashoffset={0} transform="rotate(-90 22 22)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-slate-900">Realisasi {pct}%</span>
            <span className="text-[10px] text-slate-400">Rp {realisasi.toFixed(0)},00 M</span>
          </div>
        </div>
        <ul className="w-full space-y-1.5 text-[0.6875rem]">
          <li className="flex justify-between"><span className="text-slate-600">Pagu</span><span className="font-semibold">Rp {pagu.toFixed(0)},00 M (100%)</span></li>
          <li className="flex justify-between"><span className="text-slate-600">Realisasi</span><span className="font-semibold text-blue-600">Rp {realisasi.toFixed(0)},00 M ({realisasiPct}%)</span></li>
          <li className="flex justify-between"><span className="text-slate-600">Sisa</span><span className="font-semibold text-emerald-600">Rp {sisa.toFixed(0)},00 M ({sisaPct}%)</span></li>
        </ul>
      </div>
    </div>
  );
}

export function LaporanPendapatanPie() {
  let offset = 0;
  const circles = LAPORAN_PENDAPATAN_COMPOSITION.map((s) => {
    const el = (
      <circle key={s.label} r="18" cx="22" cy="22" fill="transparent" stroke={s.color} strokeWidth="9"
        strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeDashoffset={-offset} transform="rotate(-90 22 22)" />
    );
    offset += s.pct;
    return el;
  });

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Komposisi Pendapatan</h3>
      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
        <svg viewBox="0 0 44 44" className="h-28 w-28 shrink-0">{circles}</svg>
        <ul className="w-full space-y-2">
          {LAPORAN_PENDAPATAN_COMPOSITION.map((s) => (
            <li key={s.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-slate-600">{s.label}</span>
              </div>
              <span className="font-semibold text-slate-800">{s.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
