import {
  LAPORAN_ALERTS,
  LAPORAN_CASHFLOW_INSIGHTS,
} from "@/constants/laporan-keuangan-data";
import { cardClassName } from "@/components/ui/Card";
import { AlertTriangle, Info } from "lucide-react";

const ALERT_ICONS = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const ALERT_COLORS = {
  critical: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

export function LaporanKeuanganSidebar() {
  return (
    <div className="space-y-3">
      <div className={cardClassName({ variant: "default" })}>
        <h3 className="text-sm font-semibold text-slate-800">Cashflow Insight</h3>
        <ul className="mt-3 space-y-2">
          {LAPORAN_CASHFLOW_INSIGHTS.map((text) => (
            <li key={text} className="flex gap-2 text-xs leading-relaxed text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className={cardClassName({ variant: "default" })}>
        <h3 className="text-sm font-semibold text-slate-800">Alert Keuangan</h3>
        <ul className="mt-3 space-y-2">
          {LAPORAN_ALERTS.map((alert) => {
            const Icon = ALERT_ICONS[alert.level];
            return (
              <li key={alert.text} className="flex gap-2 text-xs leading-snug text-slate-600">
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${ALERT_COLORS[alert.level]}`} />
                {alert.text}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
