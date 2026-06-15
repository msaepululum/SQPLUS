import Link from "next/link";
import { cardClassName } from "@/components/ui/Card";

type Tone = "emerald" | "orange" | "sky" | "violet" | "slate" | "amber";

type MetricCardProps = {
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  trendNeutral?: boolean;
  icon: React.ReactNode;
  tone?: Tone;
  highlight?: boolean;
  href?: string;
};

const TONE_STYLES: Record<
  Tone,
  {
    icon: string;
    glow: string;
    accent: string;
    border: string;
    highlightBorder: string;
  }
> = {
  emerald: {
    icon: "bg-gradient-to-br from-emerald-50 to-emerald-100/80 text-emerald-600 ring-emerald-100",
    glow: "from-emerald-400/10 via-emerald-300/5 to-transparent",
    accent: "bg-emerald-500",
    border: "border-emerald-100/80",
    highlightBorder: "border-emerald-200",
  },
  orange: {
    icon: "bg-gradient-to-br from-orange-50 to-orange-100/80 text-orange-600 ring-orange-100",
    glow: "from-orange-400/10 via-orange-300/5 to-transparent",
    accent: "bg-orange-500",
    border: "border-orange-100/80",
    highlightBorder: "border-orange-200",
  },
  sky: {
    icon: "bg-gradient-to-br from-sky-50 to-sky-100/80 text-sky-600 ring-sky-100",
    glow: "from-sky-400/10 via-sky-300/5 to-transparent",
    accent: "bg-sky-500",
    border: "border-sky-100/80",
    highlightBorder: "border-sky-200",
  },
  violet: {
    icon: "bg-gradient-to-br from-violet-50 to-violet-100/80 text-violet-600 ring-violet-100",
    glow: "from-violet-400/10 via-violet-300/5 to-transparent",
    accent: "bg-violet-500",
    border: "border-violet-100/80",
    highlightBorder: "border-violet-200",
  },
  slate: {
    icon: "bg-gradient-to-br from-slate-50 to-slate-100/80 text-slate-600 ring-slate-200/60",
    glow: "from-slate-400/8 via-slate-300/4 to-transparent",
    accent: "bg-slate-400",
    border: "border-slate-200/80",
    highlightBorder: "border-slate-300",
  },
  amber: {
    icon: "bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-600 ring-amber-100",
    glow: "from-amber-400/10 via-amber-300/5 to-transparent",
    accent: "bg-amber-500",
    border: "border-amber-100/80",
    highlightBorder: "border-amber-200",
  },
};

function TrendBadge({
  trend,
  trendUp,
  trendNeutral,
}: {
  trend: string;
  trendUp: boolean;
  trendNeutral?: boolean;
}) {
  if (trendNeutral) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {trend}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm ${
        trendUp
          ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-700"
          : "border-red-200/80 bg-red-50/90 text-red-600"
      }`}
    >
      {trendUp ? (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 2.5 9.5 7H2.5L6 2.5z" />
        </svg>
      ) : (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 9.5 2.5 5h7L6 9.5z" />
        </svg>
      )}
      {trend}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  subValue,
  trend,
  trendUp = true,
  trendNeutral = false,
  icon,
  tone = "sky",
  highlight = false,
  href,
}: MetricCardProps) {
  const styles = TONE_STYLES[tone];

  const content = (
    <>
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${styles.glow}`}
      />
      <div className={`absolute left-0 top-4 h-9 w-1 rounded-r-full ${styles.accent} opacity-80`} />

      <div className="relative pl-3">
        <div className="flex items-start justify-between gap-2">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 shadow-sm ${styles.icon}`}
          >
            {icon}
          </div>
          {trend && (
            <div className="max-w-[55%] shrink-0">
              <TrendBadge trend={trend} trendUp={trendUp} trendNeutral={trendNeutral} />
            </div>
          )}
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-xl font-semibold leading-tight tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
        {subValue && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] leading-snug text-slate-500">
            <span className={`h-1 w-1 rounded-full ${styles.accent} opacity-60`} />
            {subValue}
          </p>
        )}
        {href && (
          <p className="mt-3 flex items-center gap-1 text-[0.8125rem] font-medium text-sky-600 transition group-hover:gap-1.5">
            Lihat detail
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </p>
        )}
      </div>
    </>
  );

  const className = cardClassName({
    variant: href ? "interactive" : "elevated",
    className: highlight ? `${styles.highlightBorder} ring-1 ring-inset ring-white` : styles.border,
  });

  if (href) {
    return (
      <Link href={href} className={`group relative overflow-hidden ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={`group relative overflow-hidden ${className}`}>{content}</div>;
}
