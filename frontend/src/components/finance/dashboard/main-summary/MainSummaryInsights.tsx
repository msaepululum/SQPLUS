import { AlertTriangle, Banknote, Shield, TrendingUp } from "lucide-react";
import { EXECUTIVE_INSIGHTS } from "@/constants/main-summary-data";
import { cardClassName } from "@/components/ui/Card";

const INSIGHT_ICONS = {
  trend: TrendingUp,
  warning: AlertTriangle,
  shield: Shield,
  cash: Banknote,
  alert: AlertTriangle,
} as const;

export function MainSummaryInsights() {
  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Insight untuk Pimpinan</h3>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-5">
        {EXECUTIVE_INSIGHTS.map((item) => {
          const Icon = INSIGHT_ICONS[item.icon];
          return (
            <div
              key={item.text}
              className={`flex items-start gap-2 rounded-lg border px-2.5 py-2.5 ${item.bg} ${item.border}`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${item.color}`} />
              <p className={`text-[0.625rem] leading-relaxed ${item.color}`}>{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
