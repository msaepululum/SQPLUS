import { PIUTANG_AGING_BUCKETS, PIUTANG_STATUS_BADGES } from "@/constants/piutang-data";
import { cardClassName } from "@/components/ui/Card";

export function PiutangAgingSection() {
  return (
    <div className={cardClassName({ variant: "default" })}>
      <h3 className="text-sm font-semibold text-slate-800">Umur Piutang (Aging Report)</h3>
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {PIUTANG_AGING_BUCKETS.map((bucket) => {
          const badge = PIUTANG_STATUS_BADGES[bucket.statusKey];
          return (
            <div
              key={bucket.label}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30"
            >
              <p className="text-[0.625rem] font-medium text-slate-500">{bucket.label}</p>
              <p className="mt-1 text-base font-bold text-slate-900">Rp {bucket.amount.toFixed(1)} M</p>
              <p className="text-[0.625rem] text-slate-400">{bucket.pct.toFixed(1)}% dari total</p>
              {badge && (
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[0.5625rem] font-semibold ${badge.className}`}>
                  {badge.label}
                </span>
              )}
              <p className="mt-1 text-[0.5625rem] font-medium text-amber-600">{bucket.trend}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
