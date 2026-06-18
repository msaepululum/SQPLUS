import { MONTHLY_INCOME_EXPENSE } from "@/constants/finance-dashboard";
import { cardClassName } from "@/components/ui/Card";

const TEAL = "#0d9488";
const BLUE = "#3b82f6";
const MAX_Y = 160;

export function IncomeExpenseChart() {
  const months = MONTHLY_INCOME_EXPENSE.map((d) => d.month);
  const penerimaan = MONTHLY_INCOME_EXPENSE.map((d) => d.penerimaan / 1_000_000_000);
  const belanja = MONTHLY_INCOME_EXPENSE.map((d) => d.belanja / 1_000_000_000);

  const w = 640;
  const h = 300;
  const pad = { top: 20, right: 16, bottom: 36, left: 44 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const groupW = chartW / months.length;
  const barW = groupW * 0.28;
  const gap = groupW * 0.06;

  const toY = (v: number) => pad.top + chartH - (v / MAX_Y) * chartH;
  const groupCenter = (i: number) => pad.left + i * groupW + groupW / 2;

  const trendLine = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${groupCenter(i)},${toY(v)}`).join(" ");

  const yTicks = [0, 40, 80, 120, 160];

  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">
        Penerimaan vs Belanja per Bulan (Jan – Des 2024)
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3 rounded-sm" style={{ background: TEAL }} />
          Penerimaan (Rp Miliar)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3 rounded-sm" style={{ background: BLUE }} />
          Belanja (Rp Miliar)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: TEAL }} />
          Trend Penerimaan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: BLUE }} />
          Trend Belanja
        </span>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img" aria-label="Grafik penerimaan vs belanja">
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              y1={toY(v)}
              x2={w - pad.right}
              y2={toY(v)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text
              x={pad.left - 8}
              y={toY(v) + 3}
              textAnchor="end"
              className="fill-slate-400 text-[9px]"
            >
              {v}
            </text>
          </g>
        ))}

        <text
          x={12}
          y={pad.top + chartH / 2}
          textAnchor="middle"
          transform={`rotate(-90, 12, ${pad.top + chartH / 2})`}
          className="fill-slate-400 text-[9px]"
        >
          Rp Miliar
        </text>

        {months.map((m, i) => {
          const cx = groupCenter(i);
          const penH = chartH - (toY(penerimaan[i]) - pad.top);
          const belH = chartH - (toY(belanja[i]) - pad.top);
          return (
            <g key={m}>
              <rect
                x={cx - barW - gap / 2}
                y={toY(penerimaan[i])}
                width={barW}
                height={penH}
                fill={TEAL}
                rx={2}
              />
              <rect
                x={cx + gap / 2}
                y={toY(belanja[i])}
                width={barW}
                height={belH}
                fill={BLUE}
                rx={2}
              />
              <text
                x={cx}
                y={h - 10}
                textAnchor="middle"
                className="fill-slate-500 text-[8px]"
              >
                {m}
              </text>
            </g>
          );
        })}

        <path
          d={trendLine(penerimaan)}
          fill="none"
          stroke={TEAL}
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        <path
          d={trendLine(belanja)}
          fill="none"
          stroke={BLUE}
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
