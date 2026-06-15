import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="elevated">
      <CardHeader className="mb-0 sm:mb-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
      </CardHeader>
      <div className="mt-3 sm:mt-4">{children}</div>
    </Card>
  );
}

export function RevenueTrendChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei"];
  const revenue = [95, 102, 110, 118, 128];
  const expense = [78, 82, 88, 90, 94];
  const max = 140;
  const w = 400;
  const h = 180;
  const pad = { top: 16, right: 16, bottom: 28, left: 36 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const toX = (i: number) => pad.left + (i / (months.length - 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / max) * chartH;

  const line = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  const area = (data: number[]) => {
    const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" L ");
    return `M${toX(0)},${toY(0)} L ${pts} L ${toX(data.length - 1)},${toY(0)} Z`;
  };

  return (
    <ChartCard title="Trend Pendapatan vs Belanja" subtitle="Dalam miliar rupiah (Jan–Mei 2025)">
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-sm bg-sky-500" /> Pendapatan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-sm bg-orange-400" /> Belanja
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full">
        {[0, 35, 70, 105, 140].map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              y1={toY(v)}
              x2={w - pad.right}
              y2={toY(v)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text x={pad.left - 6} y={toY(v) + 3} textAnchor="end" className="fill-slate-400 text-[8px]">
              {v}
            </text>
          </g>
        ))}
        <path d={area(revenue)} fill="#0ea5e9" fillOpacity="0.08" />
        <path d={line(revenue)} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <path d={line(expense)} fill="none" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 3" />
        {revenue.map((v, i) => (
          <circle key={`r${i}`} cx={toX(i)} cy={toY(v)} r="3.5" fill="#0ea5e9" />
        ))}
        {months.map((m, i) => (
          <text key={m} x={toX(i)} y={h - 8} textAnchor="middle" className="fill-slate-500 text-[9px]">
            {m}
          </text>
        ))}
      </svg>
    </ChartCard>
  );
}

export function RevenueCompositionChart() {
  const segments = [
    { label: "BPJS", pct: 42, amount: "Rp 53,9 M", color: "#0ea5e9" },
    { label: "Tunai", pct: 28, amount: "Rp 36,0 M", color: "#10b981" },
    { label: "Asuransi", pct: 22, amount: "Rp 28,2 M", color: "#8b5cf6" },
    { label: "Lainnya", pct: 8, amount: "Rp 10,3 M", color: "#94a3b8" },
  ];

  let offset = 0;
  const circles = segments.map((s) => {
    const circle = (
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
    return circle;
  });

  return (
    <ChartCard title="Komposisi Pendapatan" subtitle="Per sumber pembayaran — Mei 2025">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative">
          <svg viewBox="0 0 44 44" className="h-36 w-36">
            {circles}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-semibold text-slate-900">128,4M</span>
            <span className="text-[10px] text-slate-400">Total</span>
          </div>
        </div>
        <ul className="w-full space-y-3">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
                <span className="text-sm text-slate-600">{s.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{s.pct}%</p>
                <p className="text-xs text-slate-400">{s.amount}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}

export function CashFlowChart() {
  const weeks = ["M1", "M2", "M3", "M4", "M5"];
  const data = [
    { in: 42, out: 35 },
    { in: 48, out: 38 },
    { in: 45, out: 40 },
    { in: 52, out: 42 },
    { in: 55, out: 44 },
  ];
  const max = 60;

  return (
    <ChartCard title="Arus Kas Masuk vs Keluar" subtitle="Mingguan — Mei 2025 (miliar rupiah)">
      <div className="flex items-end justify-between gap-3" style={{ height: 140 }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end justify-center gap-1" style={{ height: 120 }}>
              <div
                className="w-4 rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400"
                style={{ height: `${(d.in / max) * 100}%` }}
                title={`Masuk: ${d.in}`}
              />
              <div
                className="w-4 rounded-t-md bg-gradient-to-t from-red-400 to-red-300"
                style={{ height: `${(d.out / max) * 100}%` }}
                title={`Keluar: ${d.out}`}
              />
            </div>
            <span className="text-[10px] text-slate-400">{weeks[i]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-emerald-500" /> Kas Masuk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-red-400" /> Kas Keluar
        </span>
      </div>
      <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs text-emerald-700">
        Surplus kas bulan ini: <strong>Rp 11,2 M</strong> (+18,4% vs Apr)
      </p>
    </ChartCard>
  );
}

export function SpendingCategoryChart() {
  const categories = [
    { name: "SDM", pct: 38, amount: "Rp 35,8 M", color: "bg-indigo-500" },
    { name: "Jasa Medis", pct: 28, amount: "Rp 26,4 M", color: "bg-violet-500" },
    { name: "Obat & BMHP", pct: 18, amount: "Rp 17,0 M", color: "bg-sky-500" },
    { name: "Operasional", pct: 10, amount: "Rp 9,4 M", color: "bg-teal-500" },
    { name: "Lainnya", pct: 6, amount: "Rp 5,6 M", color: "bg-slate-400" },
  ];

  return (
    <ChartCard title="Realisasi Belanja per Kategori" subtitle="Total belanja Rp 94,2 M — Mei 2025">
      <ul className="space-y-4">
        {categories.map((c) => (
          <li key={c.name}>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">{c.name}</span>
              <div className="text-right">
                <span className="font-semibold text-slate-900">{c.pct}%</span>
                <span className="ml-2 text-xs text-slate-400">{c.amount}</span>
              </div>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${c.color}`}
                style={{ width: `${c.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
