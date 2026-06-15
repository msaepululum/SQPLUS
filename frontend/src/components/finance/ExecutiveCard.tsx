import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type ExecutiveCardProps = {
  title: string;
  value: string;
  subtitle: string;
  detail?: string;
  status: "success" | "warning" | "info" | "danger";
  progress: number;
};

const STATUS_STYLES = {
  success: {
    badge: "border-emerald-200/70 bg-emerald-50/90 text-emerald-700",
    dot: "bg-emerald-500",
    bar: "from-emerald-400 via-emerald-500 to-emerald-600",
    bg: "from-emerald-50/80 via-white to-white",
    ring: "ring-emerald-100/60",
    value: "text-emerald-700",
  },
  warning: {
    badge: "border-amber-200/70 bg-amber-50/90 text-amber-700",
    dot: "bg-amber-500",
    bar: "from-amber-400 via-amber-500 to-amber-600",
    bg: "from-amber-50/80 via-white to-white",
    ring: "ring-amber-100/60",
    value: "text-amber-700",
  },
  info: {
    badge: "border-sky-200/70 bg-sky-50/90 text-sky-700",
    dot: "bg-sky-500",
    bar: "from-sky-400 via-sky-500 to-sky-600",
    bg: "from-sky-50/80 via-white to-white",
    ring: "ring-sky-100/60",
    value: "text-sky-700",
  },
  danger: {
    badge: "border-red-200/70 bg-red-50/90 text-red-700",
    dot: "bg-red-500",
    bar: "from-red-400 via-red-500 to-red-600",
    bg: "from-red-50/80 via-white to-white",
    ring: "ring-red-100/60",
    value: "text-red-700",
  },
};

export function ExecutiveCard({
  title,
  value,
  subtitle,
  detail,
  status,
  progress,
}: ExecutiveCardProps) {
  const styles = STATUS_STYLES[status];
  const clamped = Math.min(progress, 100);

  return (
    <Card
      variant="elevated"
      className={cn(
        "relative overflow-hidden bg-gradient-to-br ring-1",
        styles.bg,
        styles.ring
      )}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/40 blur-2xl" />

      <div className="relative flex items-start justify-between gap-2">
        <p className="text-[0.8125rem] font-medium leading-snug text-slate-600">{title}</p>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium shadow-sm ${styles.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          {subtitle}
        </span>
      </div>

      <p
        className={`relative mt-3 text-xl font-semibold leading-tight tracking-tight tabular-nums ${styles.value}`}
      >
        {value}
      </p>
      {detail && (
        <p className="relative mt-1.5 text-[0.8125rem] leading-snug text-slate-500">{detail}</p>
      )}

      <div className="relative mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Capaian
          </span>
          <span className="text-[0.8125rem] font-semibold text-slate-700 tabular-nums">
            {clamped}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100/90 ring-1 ring-slate-200/50">
          <div
            className={`relative h-full rounded-full bg-gradient-to-r shadow-sm transition-all duration-500 ${styles.bar}`}
            style={{ width: `${clamped}%` }}
          >
            <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white/30 to-transparent" />
          </div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </Card>
  );
}
