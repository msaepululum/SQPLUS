import type { CashBankDashboardKpis } from "@/types/cash-bank-dashboard";
import { formatDashboardAmount } from "@/types/cash-bank-dashboard";
import { cardClassName } from "@/components/ui/Card";

type KasBankKpisProps = {
  kpis: CashBankDashboardKpis;
  loading?: boolean;
};

export function KasBankKpis({ kpis, loading }: KasBankKpisProps) {
  const items = [
    {
      label: "Kas Masuk (BKU)",
      value: formatDashboardAmount(kpis.total_masuk, true),
      sub: `${kpis.jumlah_transaksi} baris BKU`,
      iconBg: "bg-emerald-600",
      icon: "📥",
    },
    {
      label: "Kas Keluar (BKU)",
      value: formatDashboardAmount(kpis.total_keluar, true),
      sub: "SIMARTDB.BKUH",
      iconBg: "bg-red-500",
      icon: "📤",
    },
    {
      label: "Saldo Neto",
      value: formatDashboardAmount(kpis.saldo_netto, true),
      sub: "Masuk − Keluar",
      iconBg: "bg-blue-600",
      icon: "💰",
    },
    {
      label: "Posting ke ACC",
      value: `${kpis.rekon_acc_pct}%`,
      sub: `${kpis.posted_ke_acc} / ${kpis.jumlah_transaksi} terhubung jurnal`,
      iconBg: "bg-teal-600",
      icon: "✅",
    },
    {
      label: "Belum Posting ACC",
      value: String(kpis.belum_posting_acc),
      sub: "BKU tanpa cnojurnal",
      iconBg: "bg-amber-500",
      icon: "⏳",
    },
    {
      label: "Jurnal ACC2026",
      value: String(kpis.acc_jurnal_count),
      sub: formatDashboardAmount(kpis.acc_jurnal_total, true),
      iconBg: "bg-slate-600",
      icon: "📒",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-6">
      {items.map((kpi) => (
        <div
          key={kpi.label}
          className={cardClassName({
            variant: "default",
            className: `!p-2.5 ${loading ? "opacity-70" : ""}`,
          })}
        >
          <div className="flex items-start justify-between gap-1.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${kpi.iconBg}`}>
              {kpi.icon}
            </div>
          </div>
          <p className="mt-1.5 text-[10px] font-medium leading-tight text-slate-500">{kpi.label}</p>
          <p className="mt-0.5 text-sm font-bold leading-tight text-slate-900">{kpi.value}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">{kpi.sub}</p>
        </div>
      ))}
    </div>
  );
}
