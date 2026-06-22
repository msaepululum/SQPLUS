"use client";

import { cn } from "@/lib/cn";
import type { ExpenditureTrackingStep } from "@/constants/expenditure-process";
import { Check, Circle, X } from "lucide-react";

function stepDotClass(state: ExpenditureTrackingStep["state"]) {
  if (state === "done") return "bg-emerald-500 text-white";
  if (state === "current") return "bg-sky-500 text-white ring-2 ring-sky-200";
  if (state === "rejected") return "bg-red-500 text-white";
  if (state === "cancelled") return "bg-zinc-400 text-white";
  return "bg-slate-200 text-slate-400";
}

export function ExpenditureAjuTrackingInline({ steps }: { steps: ExpenditureTrackingStep[] }) {
  return (
    <div className="flex min-w-[12rem] items-center gap-0.5">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <span
            title={step.label}
            className={cn(
              "inline-flex h-2 w-2 shrink-0 rounded-full",
              step.state === "done"
                ? "bg-emerald-500"
                : step.state === "current"
                  ? "bg-sky-500"
                  : step.state === "rejected"
                    ? "bg-red-500"
                    : step.state === "cancelled"
                      ? "bg-zinc-400"
                      : "bg-slate-200"
            )}
          />
          {index < steps.length - 1 && (
            <span
              className={cn(
                "mx-0.5 h-px w-2",
                step.state === "done" ? "bg-emerald-300" : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function ExpenditureAjuTrackingPanel({
  steps,
  noPengajuan,
}: {
  steps: ExpenditureTrackingStep[];
  noPengajuan: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <p className="text-[11px] font-semibold text-slate-700">Tracking Proses — {noPengajuan}</p>
      <ol className="mt-3 space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-2">
            <span
              className={cn(
                "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                stepDotClass(step.state)
              )}
            >
              {step.state === "done" ? (
                <Check className="h-3 w-3" />
              ) : step.state === "rejected" || step.state === "cancelled" ? (
                <X className="h-3 w-3" />
              ) : (
                <Circle className="h-2.5 w-2.5 fill-current" />
              )}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[11px] font-medium",
                  step.state === "current" ? "text-sky-700" : "text-slate-700"
                )}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-slate-400">
                {step.state === "done" && "Selesai"}
                {step.state === "current" && "Sedang berjalan"}
                {step.state === "pending" && "Menunggu"}
                {step.state === "rejected" && "Ditolak"}
                {step.state === "cancelled" && "Dibatalkan"}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
