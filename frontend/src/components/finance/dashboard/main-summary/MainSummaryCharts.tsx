import {
  BUDGET_GROUP_BARS,
  CASH_IN_OUT,
  MONTHLY_TREND,
} from "@/constants/main-summary-data";
import { cardClassName } from "@/components/ui/Card";

const BLUE = "#3b82f6";
const TEAL = "#14b8a6";
const ORANGE = "#f97316";
const GREY = "#94a3b8";
const DARK_BLUE = "#1e40af";
const LIGHT_GREY = "#cbd5e1";

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className={cardClassName({ variant: "default", className: "!p-3.5" })}>
      <h3 className="text-xs font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[0.5625rem] text-slate-400">{subtitle}</p>}
      {children}
    </div>
  );
}

export function MonthlyTrendChart() {
  const { months, pendapatan, belanja, target, highlightIndex, highlightPendapatan, highlightBelanja } =
    MONTHLY_TREND;
  const max = 250;
  const w = 360;
  const h = 200;
  const pad = { top: 20, right: 12, bottom: 24, left: 28 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const toX = (i: number) => pad.left + (i / (months.length - 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / max) * chartH;
  const line = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  return (
    <ChartCard title="Tren Pendapatan vs Belanja Bulanan" subtitle="(dalam Juta Rupiah)">
      <div className="mb-2 flex flex-wrap gap-2 text-[0.5625rem] text-slate-500">
        <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-blue-500" /> Pendapatan</span>
        <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-[#14b8a6]" /> Belanja</span>
        <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t border-dashed border-slate-400" /> Target Pendapatan</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {[0, 50, 100, 150, 200, 250].map((v) => (
          <g key={v}>
            <line x1={pad.left} y1={toY(v)} x2={w - pad.right} y2={toY(v)} stroke="#f1f5f9" />
            <text x={pad.left - 4} y={toY(v) + 3} textAnchor="end" className="fill-slate-400 text-[7px]">{v}</text>
          </g>
        ))}
        <path d={line(target)} fill="none" stroke={GREY} strokeWidth="1.5" strokeDasharray="4 3" />
        <path d={line(pendapatan)} fill="none" stroke={BLUE} strokeWidth="2" />
        <path d={line(belanja)} fill="none" stroke={TEAL} strokeWidth="2" />
        {pendapatan.map((v, i) => (
          <circle key={`p${i}`} cx={toX(i)} cy={toY(v)} r="2.5" fill={BLUE} />
        ))}
        {belanja.map((v, i) => (
          <circle key={`b${i}`} cx={toX(i)} cy={toY(v)} r="2.5" fill={TEAL} />
        ))}
        {months.map((m, i) => (
          <text key={m} x={toX(i)} y={h - 6} textAnchor="middle" className="fill-slate-500 text-[6px]">{m}</text>
        ))}
        <rect x={toX(highlightIndex) - 8} y={pad.top} width={16} height={chartH} fill={BLUE} fillOpacity={0.06} rx={2} />
        <text x={toX(highlightIndex)} y={toY(pendapatan[highlightIndex]) - 6} textAnchor="middle" className="fill-blue-600 text-[7px] font-bold">{highlightPendapatan}</text>
        <text x={toX(highlightIndex)} y={toY(belanja[highlightIndex]) + 12} textAnchor="middle" className="fill-[#0d9488] text-[7px] font-bold">{highlightBelanja}</text>
      </svg>
    </ChartCard>
  );
}

export function BudgetGroupBarChart() {
  const max = 130;
  const barH = 14;
  const gap = 28;

  return (
    <ChartCard title="Pagu, Realisasi, dan Sisa per Kelompok Belanja" subtitle="(dalam Juta Rupiah)">
      <div className="mb-3 flex flex-wrap gap-2 text-[0.5625rem] text-slate-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2.5 rounded-sm bg-blue-800" /> Pagu</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2.5 rounded-sm bg-[#14b8a6]" /> Realisasi</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2.5 rounded-sm bg-slate-300" /> Sisa</span>
      </div>
      <svg viewBox={`0 0 360 ${BUDGET_GROUP_BARS.length * gap + 10}`} className="w-full">
        {BUDGET_GROUP_BARS.map((row, i) => {
          const y = i * gap + 8;
          const scale = (v: number) => (v / max) * 280;
          return (
            <g key={row.label}>
              <text x={0} y={y + 10} className="fill-slate-600 text-[7px]">{row.label}</text>
              <rect x={80} y={y} width={scale(row.pagu)} height={barH} fill={DARK_BLUE} rx={2} />
              <rect x={80} y={y} width={scale(row.realisasi)} height={barH} fill={TEAL} rx={2} fillOpacity={0.85} />
              <rect x={80 + scale(row.realisasi)} y={y} width={scale(row.sisa)} height={barH} fill={LIGHT_GREY} rx={2} />
              <text x={80 + scale(row.pagu) + 4} y={y + 10} className="fill-slate-500 text-[6px]">{row.pagu.toFixed(2).replace(".", ",")}</text>
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}

export function CashInOutChart() {
  const { months, masuk, keluar, cashFlow, highlightIndex, highlightValue } = CASH_IN_OUT;
  const max = 200;
  const w = 360;
  const h = 200;
  const pad = { top: 16, right: 12, bottom: 24, left: 28 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const groupW = chartW / months.length;
  const barW = groupW * 0.22;
  const toY = (v: number) => pad.top + chartH - (v / max) * chartH;
  const groupCenter = (i: number) => pad.left + i * groupW + groupW / 2;
  const line = cashFlow.map((v, i) => `${i === 0 ? "M" : "L"}${groupCenter(i)},${toY(v * 8)}`).join(" ");

  return (
    <ChartCard title="Arus Kas Masuk vs Keluar" subtitle="(dalam Juta Rupiah)">
      <div className="mb-2 flex flex-wrap gap-2 text-[0.5625rem] text-slate-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-500" /> Kas Masuk</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-orange-400" /> Kas Keluar</span>
        <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-[#14b8a6]" /> Cash Flow Bersih</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {months.map((m, i) => {
          const cx = groupCenter(i);
          const inH = chartH - (toY(masuk[i]) - pad.top);
          const outH = chartH - (toY(keluar[i]) - pad.top);
          return (
            <g key={m}>
              <rect x={cx - barW - 1} y={toY(masuk[i])} width={barW} height={inH} fill={BLUE} rx={1} />
              <rect x={cx + 1} y={toY(keluar[i])} width={barW} height={outH} fill={ORANGE} rx={1} />
              <text x={cx} y={h - 6} textAnchor="middle" className="fill-slate-500 text-[6px]">{m}</text>
            </g>
          );
        })}
        <path d={line} fill="none" stroke={TEAL} strokeWidth="2" />
        {cashFlow.map((v, i) => (
          <circle key={i} cx={groupCenter(i)} cy={toY(v * 8)} r="3" fill="white" stroke={TEAL} strokeWidth="2" />
        ))}
        <text x={groupCenter(highlightIndex)} y={toY(cashFlow[highlightIndex] * 8) - 8} textAnchor="middle" className="fill-[#0d9488] text-[7px] font-bold">{highlightValue}</text>
      </svg>
    </ChartCard>
  );
}
