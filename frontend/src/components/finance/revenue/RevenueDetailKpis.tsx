import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { CardGrid } from "@/components/ui/CardGrid";
import { cn } from "@/lib/cn";

const KPIS = [
  {
    label: "Total Pendapatan",
    value: "Rp 128,4 M",
    trend: "12,6% vs Apr 2025",
    iconBg: "bg-teal-50 text-teal-600",
    border: "border-teal-100",
    icon: "📈",
  },
  {
    label: "Pendapatan BPJS",
    value: "Rp 72,9 M",
    trend: "10,1% vs Apr 2025",
    iconBg: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
    icon: "🛡️",
  },
  {
    label: "Billing Tunai",
    value: "Rp 31,7 M",
    trend: "15,2% vs Apr 2025",
    iconBg: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
    icon: "💵",
  },
  {
    label: "Pendapatan Rawat Jalan",
    value: "Rp 64,7 M",
    trend: "11,8% vs Apr 2025",
    iconBg: "bg-orange-50 text-orange-600",
    border: "border-orange-100",
    icon: "🩺",
  },
  {
    label: "Pendapatan Rawat Inap",
    value: "Rp 49,8 M",
    trend: "9,7% vs Apr 2025",
    iconBg: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
    icon: "🛏️",
  },
  {
    label: "Pendapatan IGD",
    value: "Rp 13,9 M",
    trend: "14,3% vs Apr 2025",
    iconBg: "bg-red-50 text-red-600",
    border: "border-red-100",
    icon: "🚑",
  },
];

export function RevenueDetailKpis() {
  return (
    <CardGrid cols={6}>
      {KPIS.map((k) => (
        <Card key={k.label} variant="elevated" className={cn(k.border)}>
          <div className="flex items-start justify-between gap-2">
            <div className={cn("rounded-lg p-2 text-base", k.iconBg)}>{k.icon}</div>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              ↑ {k.trend}
            </span>
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            {k.label}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{k.value}</p>
        </Card>
      ))}
    </CardGrid>
  );
}
