import {
  PIUTANG_COMPOSITION,
  PIUTANG_UNIT_OPTIONS,
  getPiutangTrendData,
  PIUTANG_SERVICE_ROWS,
  type PiutangFilters,
} from "@/constants/piutang-data";
import { cardClassName } from "@/components/ui/Card";

export function PiutangTrendChart({ filters }: { filters: PiutangFilters }) {
  const data = getPiutangTrendData(filters.periodeTren);
  const max = 110;
  const w = 560;
  const h = 240;
  const pad = { top: 24, right: 16, bottom: 32, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const toX = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / max) * chartH;
  const line = (key: "total" | "penagihan") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d[key])}`).join(" ");

  return (
    <div className={cardClassName({ variant: "default" })}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Tren Piutang 12 Bulan</h3>
        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[0.625rem] text-slate-500">
          {filters.periodeTren} Bulan Terakhir
        </span>
      </div>
      <div className="mt-2 flex gap-3 text-[0.625rem] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-blue-500" /> Total Piutang</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-emerald-500" /> Penagihan</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img">
        {[0, 25, 50, 75, 100].map((v) => (
          <line key={v} x1={pad.left} y1={toY(v)} x2={w - pad.right} y2={toY(v)} stroke="#f1f5f9" />
        ))}
        <path d={line("total")} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        <path d={line("penagihan")} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        {data.map((d, i) => (
          <text key={d.month} x={toX(i)} y={h - 10} textAnchor="middle" className="fill-slate-500 text-[8px]">{d.month}</text>
        ))}
      </svg>
    </div>
  );
}

export function PiutangCompositionDonut() {
  let offset = 0;
  const circles = PIUTANG_COMPOSITION.map((s) => {
    const el = (
      <circle key={s.label} r="18" cx="22" cy="22" fill="transparent" stroke={s.color} strokeWidth="9"
        strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeDashoffset={-offset} transform="rotate(-90 22 22)" />
    );
    offset += s.pct;
    return el;
  });

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Komposisi Piutang</h3>
      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative shrink-0">
          <svg viewBox="0 0 44 44" className="h-28 w-28">{circles}</svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-slate-900">102,8M</span>
            <span className="text-[9px] text-slate-400">Total</span>
          </div>
        </div>
        <ul className="w-full space-y-1.5">
          {PIUTANG_COMPOSITION.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-2 text-[0.6875rem]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                <span className="text-slate-600">{s.label}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-800">{s.pct.toFixed(1)}%</span>
                <span className="ml-1 text-slate-400">Rp {s.amount.toFixed(1)} M</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PiutangServiceBar({ filters }: { filters: PiutangFilters }) {
  const max = Math.max(...PIUTANG_SERVICE_ROWS.map((d) => d.value));
  const unitLabel = PIUTANG_UNIT_OPTIONS.find((o) => o.value === filters.unitLayanan)?.label ?? "Semua Unit";

  return (
    <div className={cardClassName({ variant: "default" })}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Piutang per Layanan</h3>
        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[0.625rem] text-slate-500">{unitLabel}</span>
      </div>
      <ul className="mt-4 space-y-3">
        {PIUTANG_SERVICE_ROWS.map((d) => (
          <li key={d.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-600">{d.label}</span>
              <span className="font-semibold tabular-nums text-slate-800">
                Rp {d.value.toFixed(1)} M <span className="font-normal text-slate-400">({d.pct.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
