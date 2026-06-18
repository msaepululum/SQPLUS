import {
  Banknote,
  Briefcase,
  FileText,
  Hourglass,
  PieChart,
  ShoppingCart,
  Target,
  Wallet,
} from "lucide-react";
import { MAIN_SUMMARY_KPIS } from "@/constants/main-summary-data";
import { cardClassName } from "@/components/ui/Card";

const ICONS = {
  wallet: Wallet,
  cart: ShoppingCart,
  briefcase: Briefcase,
  banknote: Banknote,
  target: Target,
  pie: PieChart,
  file: FileText,
  hourglass: Hourglass,
} as const;

export function MainSummaryKpis() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 2xl:grid-cols-8">
      {MAIN_SUMMARY_KPIS.map((kpi) => {
        const Icon = ICONS[kpi.icon];
        return (
          <div key={kpi.label} className={cardClassName({ variant: "default", className: "!p-3" })}>
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-white ${kpi.iconBg}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-[0.625rem] font-medium leading-tight text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-sm font-bold leading-tight text-slate-900">{kpi.value}</p>
            <p
              className={`mt-1 text-[0.5625rem] font-semibold ${
                kpi.trendPositive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {kpi.trend}
            </p>
          </div>
        );
      })}
    </div>
  );
}
