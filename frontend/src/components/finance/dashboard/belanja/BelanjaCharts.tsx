import {
  BELANJA_CATEGORY_COMPOSITION,
  BELANJA_SOURCE_COLORS,
  BELANJA_SOURCE_STACK,
  BELANJA_TREND_DATA,
} from "@/constants/belanja-data";
import { cardClassName } from "@/components/ui/Card";

export function BelanjaTrendChart() {
  const data = BELANJA_TREND_DATA;
  const max = 22;
  const w = 560;
  const h = 240;
  const pad = { top: 24, right: 16, bottom: 32, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const toX = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / max) * chartH;
  const line = (key: "pagu" | "realisasi" | "komitmen") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d[key])}`).join(" ");

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Tren Pagu vs Realisasi vs Komitmen per Bulan</h3>
      <div className="mt-2 flex flex-wrap gap-3 text-[0.625rem] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t border-dashed border-slate-400" /> Pagu</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-blue-500" /> Realisasi</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-violet-500" /> Komitmen</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img">
        {[0, 5, 10, 15, 20].map((v) => (
          <line key={v} x1={pad.left} y1={toY(v)} x2={w - pad.right} y2={toY(v)} stroke="#f1f5f9" />
        ))}
        <path d={line("pagu")} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d={line("komitmen")} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
        <path d={line("realisasi")} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        {data.map((d, i) => (
          <text key={d.month} x={toX(i)} y={h - 10} textAnchor="middle" className="fill-slate-500 text-[8px]">{d.month}</text>
        ))}
      </svg>
    </div>
  );
}

export function BelanjaSourceStackChart() {
  const data = BELANJA_SOURCE_STACK;
  const max = 22;
  const w = 560;
  const h = 240;
  const pad = { top: 24, right: 16, bottom: 32, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const barW = chartW / data.length - 4;
  const sources = [
    { key: "rm" as const, label: "RM", color: BELANJA_SOURCE_COLORS.rm },
    { key: "blu" as const, label: "BLU", color: BELANJA_SOURCE_COLORS.blu },
    { key: "hibah" as const, label: "Hibah", color: BELANJA_SOURCE_COLORS.hibah },
    { key: "lainnya" as const, label: "Lainnya", color: BELANJA_SOURCE_COLORS.lainnya },
  ];

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Realisasi Belanja per Sumber Dana (Rp Miliar)</h3>
      <div className="mt-2 flex flex-wrap gap-2 text-[0.625rem] text-slate-500">
        {sources.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />{s.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img">
        {data.map((row, i) => {
          const x = pad.left + i * (chartW / data.length) + 2;
          let yBottom = pad.top + chartH;
          const total = sources.reduce((s, src) => s + row[src.key], 0);
          if (total === 0) {
            return (
              <g key={row.month}>
                <rect x={x} y={yBottom - 2} width={barW} height={2} fill="#e2e8f0" rx={1} />
                <text x={x + barW / 2} y={h - 10} textAnchor="middle" className="fill-slate-500 text-[8px]">{row.month}</text>
              </g>
            );
          }
          return (
            <g key={row.month}>
              {sources.map((s) => {
                const segH = (row[s.key] / max) * chartH;
                yBottom -= segH;
                return <rect key={s.key} x={x} y={yBottom} width={barW} height={segH} fill={s.color} />;
              })}
              <text x={x + barW / 2} y={h - 10} textAnchor="middle" className="fill-slate-500 text-[8px]">{row.month}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function BelanjaCategoryDonut() {
  let offset = 0;
  const circles = BELANJA_CATEGORY_COMPOSITION.map((s) => {
    const el = (
      <circle key={s.label} r="18" cx="22" cy="22" fill="transparent" stroke={s.color} strokeWidth="9"
        strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeDashoffset={-offset} transform="rotate(-90 22 22)" />
    );
    offset += s.pct;
    return el;
  });

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Komposisi Belanja per Kategori (YTD)</h3>
      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative shrink-0">
          <svg viewBox="0 0 44 44" className="h-28 w-28">{circles}</svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-slate-900">108,8M</span>
            <span className="text-[9px] text-slate-400">Realisasi</span>
          </div>
        </div>
        <ul className="w-full space-y-1.5">
          {BELANJA_CATEGORY_COMPOSITION.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-2 text-[0.6875rem]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                <span className="text-slate-600">{s.label}</span>
              </div>
              <span className="font-semibold text-slate-800">{s.pct.toFixed(2)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
