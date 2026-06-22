import type {
  CashBankDashboardComposition,
  CashBankDashboardTrendPoint,
} from "@/types/cash-bank-dashboard";
import {
  DASHBOARD_COMPOSITION_COLORS,
  formatDashboardAmount,
} from "@/types/cash-bank-dashboard";
import { cardClassName } from "@/components/ui/Card";

export function KasBankTrendChart({
  trend,
  periodeLabel,
}: {
  trend: CashBankDashboardTrendPoint[];
  periodeLabel: string;
}) {
  if (trend.length === 0) {
    return (
      <div className={cardClassName({ variant: "default" })}>
        <h3 className="text-sm font-semibold text-slate-800">Tren Arus Kas (BKU)</h3>
        <p className="mt-4 text-xs text-slate-400">Belum ada data tren.</p>
      </div>
    );
  }

  const maxVal = Math.max(
    ...trend.flatMap((d) => [d.masuk, d.keluar, Math.abs(d.saldo)]),
    1
  );
  const w = 560;
  const h = 240;
  const pad = { top: 24, right: 16, bottom: 32, left: 48 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const toX = (i: number) => pad.left + (i / Math.max(trend.length - 1, 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / maxVal) * chartH;
  const line = (key: "masuk" | "keluar" | "saldo") =>
    trend.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(Math.abs(d[key]))}`).join(" ");

  return (
    <div className={cardClassName({ variant: "default" })}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Tren Arus Kas (BKU)</h3>
        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
          {periodeLabel} bln
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-emerald-500" /> Masuk</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-red-500" /> Keluar</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-blue-500" /> Saldo kumulatif</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1={pad.left}
            y1={pad.top + chartH * (1 - pct)}
            x2={w - pad.right}
            y2={pad.top + chartH * (1 - pct)}
            stroke="#f1f5f9"
          />
        ))}
        <path d={line("masuk")} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <path d={line("keluar")} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <path d={line("saldo")} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        {trend.map((d, i) => (
          <text key={d.month} x={toX(i)} y={h - 10} textAnchor="middle" className="fill-slate-500 text-[8px]">
            {d.month}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function KasBankCashInDonut({
  composition,
  total,
}: {
  composition: CashBankDashboardComposition[];
  total: number;
}) {
  let offset = 0;
  const circles = composition.map((s, i) => {
    const pct = s.pct ?? 0;
    const el = (
      <circle
        key={s.label}
        r="18"
        cx="22"
        cy="22"
        fill="transparent"
        stroke={DASHBOARD_COMPOSITION_COLORS[i % DASHBOARD_COMPOSITION_COLORS.length]}
        strokeWidth="9"
        strokeDasharray={`${pct} ${100 - pct}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 22 22)"
      />
    );
    offset += pct;
    return el;
  });

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Komposisi Kas Masuk (BKU)</h3>
      {composition.length === 0 ? (
        <p className="mt-4 text-xs text-slate-400">Belum ada penerimaan.</p>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative shrink-0">
            <svg viewBox="0 0 44 44" className="h-28 w-28">{circles}</svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-900">{formatDashboardAmount(total, true)}</span>
              <span className="text-[9px] text-slate-400">Total</span>
            </div>
          </div>
          <ul className="w-full space-y-1.5">
            {composition.map((s, i) => (
              <li key={s.label} className="flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: DASHBOARD_COMPOSITION_COLORS[i % DASHBOARD_COMPOSITION_COLORS.length] }}
                  />
                  <span className="text-slate-600">{s.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold tabular-nums text-slate-800">{s.pct?.toFixed(1)}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function KasBankExpenseBar({
  composition,
}: {
  composition: CashBankDashboardComposition[];
}) {
  const max = Math.max(...composition.map((d) => d.amount), 1);

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Pengeluaran per Kelompok (BKUD)</h3>
      {composition.length === 0 ? (
        <p className="mt-4 text-xs text-slate-400">Belum ada data pengeluaran.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {composition.map((item) => (
            <li key={item.label}>
              <div className="mb-0.5 flex justify-between text-[11px]">
                <span className="truncate text-slate-600">{item.label}</span>
                <span className="ml-2 shrink-0 font-semibold tabular-nums text-slate-800">
                  {formatDashboardAmount(item.amount, true)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-red-400"
                  style={{ width: `${(item.amount / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
