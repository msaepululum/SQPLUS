import {
  PENERIMAAN_SOURCE_COLORS,
  PENERIMAAN_SOURCE_STACK,
  PENERIMAAN_TREND_DATA,
} from "@/constants/penerimaan-data";
import { cardClassName } from "@/components/ui/Card";

export function PenerimaanTrendChart() {
  const data = PENERIMAAN_TREND_DATA;
  const max = 22;
  const w = 560;
  const h = 240;
  const pad = { top: 24, right: 16, bottom: 32, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const toX = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / max) * chartH;

  const linePath = (key: "realisasi2025" | "target2025" | "realisasi2024") =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d[key])}`)
      .join(" ");

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">
        Tren Pendapatan Bulanan (Jan – Des 2025)
      </h3>
      <div className="mt-2 flex flex-wrap gap-3 text-[0.625rem] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-teal-500" /> Realisasi 2025
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t border-dashed border-emerald-500" /> Target 2025
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t border-dashed border-slate-400" /> Realisasi 2024
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img">
        {[0, 5, 10, 15, 20].map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              y1={toY(v)}
              x2={w - pad.right}
              y2={toY(v)}
              stroke="#f1f5f9"
            />
            <text x={pad.left - 6} y={toY(v) + 3} textAnchor="end" className="fill-slate-400 text-[8px]">
              {v}
            </text>
          </g>
        ))}
        <path d={linePath("realisasi2024")} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d={linePath("target2025")} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d={linePath("realisasi2025")} fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
        {data.map((d, i) =>
          d.realisasi2025 > 0 ? (
            <circle key={d.month} cx={toX(i)} cy={toY(d.realisasi2025)} r="3.5" fill="#14b8a6" />
          ) : null
        )}
        {data.map((d, i) => (
          <text key={d.month} x={toX(i)} y={h - 10} textAnchor="middle" className="fill-slate-500 text-[8px]">
            {d.month}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function PenerimaanSourceStackChart() {
  const data = PENERIMAAN_SOURCE_STACK;
  const max = 22;
  const w = 560;
  const h = 240;
  const pad = { top: 24, right: 16, bottom: 32, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const barW = chartW / data.length - 4;

  const sources = [
    { key: "bpjs" as const, label: "BPJS", color: PENERIMAAN_SOURCE_COLORS.bpjs },
    { key: "tunai" as const, label: "Tunai", color: PENERIMAAN_SOURCE_COLORS.tunai },
    { key: "asuransi" as const, label: "Asuransi", color: PENERIMAAN_SOURCE_COLORS.asuransi },
    { key: "kerjaSama" as const, label: "Kerja Sama", color: PENERIMAAN_SOURCE_COLORS.kerjaSama },
    { key: "lainnya" as const, label: "Lainnya", color: PENERIMAAN_SOURCE_COLORS.lainnya },
  ];

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">
        Komposisi Pendapatan Bulanan per Sumber
      </h3>
      <div className="mt-2 flex flex-wrap gap-2 text-[0.625rem] text-slate-500">
        {sources.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img">
        {[0, 5, 10, 15, 20].map((v) => (
          <line
            key={v}
            x1={pad.left}
            y1={pad.top + chartH - (v / max) * chartH}
            x2={w - pad.right}
            y2={pad.top + chartH - (v / max) * chartH}
            stroke="#f1f5f9"
          />
        ))}
        {data.map((row, i) => {
          const x = pad.left + i * (chartW / data.length) + 2;
          let yBottom = pad.top + chartH;
          const total = sources.reduce((sum, s) => sum + row[s.key], 0);
          if (total === 0) {
            return (
              <g key={row.month}>
                <rect x={x} y={yBottom - 2} width={barW} height={2} fill="#e2e8f0" rx={1} />
                <text x={x + barW / 2} y={h - 10} textAnchor="middle" className="fill-slate-500 text-[8px]">
                  {row.month}
                </text>
              </g>
            );
          }
          return (
            <g key={row.month}>
              {sources.map((s) => {
                const segH = (row[s.key] / max) * chartH;
                yBottom -= segH;
                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={yBottom}
                    width={barW}
                    height={segH}
                    fill={s.color}
                  />
                );
              })}
              <text x={x + barW / 2} y={h - 10} textAnchor="middle" className="fill-slate-500 text-[8px]">
                {row.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
