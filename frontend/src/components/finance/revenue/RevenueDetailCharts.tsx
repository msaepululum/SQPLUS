import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

export function RevenueSourceDonut() {
  const segments = [
    { label: "BPJS", pct: 56.8, amount: "Rp 72,9 M", color: "#3b82f6" },
    { label: "Tunai", pct: 24.7, amount: "Rp 31,7 M", color: "#14b8a6" },
    { label: "Asuransi", pct: 9.0, amount: "Rp 11,6 M", color: "#f97316" },
    { label: "Lainnya", pct: 9.5, amount: "Rp 12,2 M", color: "#94a3b8" },
  ];

  let offset = 0;
  const circles = segments.map((s) => {
    const c = (
      <circle
        key={s.label}
        r="18"
        cx="22"
        cy="22"
        fill="transparent"
        stroke={s.color}
        strokeWidth="9"
        strokeDasharray={`${s.pct} ${100 - s.pct}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 22 22)"
      />
    );
    offset += s.pct;
    return c;
  });

  return (
    <Card variant="elevated">
      <CardTitle>Komposisi Pendapatan Berdasarkan Sumber</CardTitle>
      <div className="mt-3 flex flex-col items-center gap-6 sm:mt-4 sm:flex-row">
        <div className="relative shrink-0">
          <svg viewBox="0 0 44 44" className="h-36 w-36">
            {circles}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-slate-900">128,4M</span>
            <span className="text-[10px] text-slate-400">Total</span>
          </div>
        </div>
        <ul className="w-full space-y-3">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
                <span className="text-sm text-slate-600">{s.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{s.pct}%</p>
                <p className="text-xs text-slate-400">{s.amount}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function RevenueServiceBar() {
  const data = [
    { label: "Rawat Jalan", value: 64.7 },
    { label: "Rawat Inap", value: 49.8 },
    { label: "IGD", value: 13.9 },
    { label: "Penunjang", value: 8.0 },
  ];
  const max = 70;

  return (
    <Card variant="elevated">
      <CardTitle>Pendapatan Berdasarkan Layanan</CardTitle>
      <CardDescription>Dalam miliar rupiah</CardDescription>
      <div className="mt-4 flex items-end justify-between gap-2 sm:mt-6 sm:gap-4" style={{ height: 160 }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">{d.value}</span>
            <div
              className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-teal-600 to-teal-400"
              style={{ height: `${(d.value / max) * 130}px` }}
            />
            <span className="text-center text-[10px] leading-tight text-slate-500">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RevenueTrendLine() {
  const months = ["Des", "Jan", "Feb", "Mar", "Apr", "Mei"];
  const values = [98, 105, 112, 118, 114, 128.4];
  const max = 140;
  const w = 400;
  const h = 180;
  const pad = { top: 20, right: 16, bottom: 28, left: 36 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const toX = (i: number) => pad.left + (i / (months.length - 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / max) * chartH;

  const line = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`)
    .join(" ");

  return (
    <Card variant="elevated">
      <CardTitle>Trend Total Pendapatan</CardTitle>
      <CardDescription>Perkembangan 6 bulan terakhir</CardDescription>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full">
        {[0, 35, 70, 105, 140].map((v) => (
          <line
            key={v}
            x1={pad.left}
            y1={toY(v)}
            x2={w - pad.right}
            y2={toY(v)}
            stroke="#f1f5f9"
          />
        ))}
        <path d={line} fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
        {values.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill="#14b8a6" />
        ))}
        {months.map((m, i) => (
          <text key={m} x={toX(i)} y={h - 8} textAnchor="middle" className="fill-slate-500 text-[9px]">
            {m}
          </text>
        ))}
      </svg>
    </Card>
  );
}
