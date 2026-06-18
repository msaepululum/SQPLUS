import { BarChart3, TrendingDown, Wallet } from "lucide-react";
import {
  DASHBOARD_SUMMARY,
  formatRupiahFull,
  formatRupiahMiliar,
} from "@/constants/finance-dashboard";
import { cardClassName } from "@/components/ui/Card";

export function IncomeExpenseKpis() {
  const { totalPenerimaan, totalBelanja, surplus, surplusPct, avgPenerimaan, avgBelanja } =
    DASHBOARD_SUMMARY;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={<BarChart3 className="h-5 w-5" />}
        iconBg="bg-[#0d9488]"
        label="Total Penerimaan 2024"
        value={`Rp ${formatRupiahFull(totalPenerimaan)}`}
        valueColor="text-[#0d9488]"
        footer={`rata-rata / bln ${formatRupiahMiliar(avgPenerimaan * 1_000_000_000)}`}
      />
      <KpiCard
        icon={<TrendingDown className="h-5 w-5" />}
        iconBg="bg-[#3b82f6]"
        label="Total Belanja 2024"
        value={`Rp ${formatRupiahFull(totalBelanja)}`}
        valueColor="text-[#3b82f6]"
        footer={`rata-rata / bln ${formatRupiahMiliar(avgBelanja * 1_000_000_000)}`}
      />
      <KpiCard
        icon={<Wallet className="h-5 w-5" />}
        iconBg="bg-[#22c55e]"
        label="Surplus (Penerimaan - Belanja)"
        value={`Rp ${formatRupiahFull(surplus)}`}
        valueColor="text-[#22c55e]"
        footer={`${surplusPct.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% dari total penerimaan`}
      />
      <div className={cardClassName({ variant: "default", className: "flex flex-col justify-center" })}>
        <p className="text-xs font-medium text-slate-500">Rata-rata per Bulan</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[0.6875rem] text-slate-400">Penerimaan</p>
            <p className="mt-0.5 text-lg font-bold text-[#0d9488]">
              {formatRupiahMiliar(avgPenerimaan * 1_000_000_000)}
            </p>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="flex-1">
            <p className="text-[0.6875rem] text-slate-400">Belanja</p>
            <p className="mt-0.5 text-lg font-bold text-[#3b82f6]">
              {formatRupiahMiliar(avgBelanja * 1_000_000_000)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  iconBg,
  label,
  value,
  valueColor,
  footer,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  valueColor: string;
  footer: string;
}) {
  return (
    <div className={cardClassName({ variant: "default" })}>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${iconBg}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className={`mt-1 text-base font-bold leading-tight tabular-nums sm:text-lg ${valueColor}`}>
            {value}
          </p>
          <p className="mt-1.5 text-[0.6875rem] text-slate-400">{footer}</p>
        </div>
      </div>
    </div>
  );
}
