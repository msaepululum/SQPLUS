"use client";

import { CARD_SHADOW } from "@/components/ui/Card";
import { tableBodyStripedClassName, tableShellClassName } from "@/components/ui/tableStyles";
import { cn } from "@/lib/cn";
import type { AiToolOutput } from "@/types/ai.types";

const TOOL_LABELS: Record<string, string> = {
  "finance.dashboard_summary": "Dashboard Keuangan",
  "finance.revenue_summary": "Ringkasan Pendapatan",
  "finance.expense_realization": "Realisasi Belanja",
  "finance.cashflow_summary": "Arus Kas",
  "hr.employee_summary": "Ringkasan SDM",
  "procurement.request_summary": "Ringkasan PR",
  "supply_chain.stock_critical": "Stok Kritis",
  "approval.my_pending_approvals": "Approval Pending",
  "report.executive_summary": "Ringkasan Eksekutif",
};

type AiResultCardProps = {
  toolName: string;
  output: AiToolOutput;
  className?: string;
};

export function AiResultCard({ toolName, output, className }: AiResultCardProps) {
  if (output.error) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800",
          className
        )}
      >
        {output.message ?? "Data tidak tersedia."}
      </div>
    );
  }

  const title = TOOL_LABELS[toolName] ?? toolName;

  return (
    <div
      className={cn(
        "rounded-2xl border border-sq-border bg-white p-4 dark:border-slate-700 dark:bg-slate-800",
        CARD_SHADOW,
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-sq-teal">
        {title}
      </p>
      {output.summary && (
        <p className="mt-1 text-sm font-medium text-sq-dark dark:text-slate-100">
          {output.summary}
        </p>
      )}

      {output.metrics && output.metrics.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {output.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl bg-sq-bg px-3 py-2 dark:bg-slate-900"
            >
              <p className="text-[11px] text-sq-slate">{m.label}</p>
              <p className="text-sm font-semibold text-sq-navy dark:text-slate-100">
                {m.value}
              </p>
              {m.change && (
                <p className="text-[10px] text-sq-teal">{m.change}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {output.items && output.items.length > 0 && (
        <div className={tableShellClassName}>
          <table className="w-full text-left text-xs">
            <tbody className={tableBodyStripedClassName}>
              {output.items.map((item, idx) => (
                <tr key={idx}>
                  {Object.entries(item).map(([key, val]) => (
                    <td key={key} className="py-1.5 pr-3 text-sq-slate">
                      <span className="font-medium text-sq-dark dark:text-slate-200">
                        {String(val)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
