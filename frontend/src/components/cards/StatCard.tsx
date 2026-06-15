import { Card, CardDescription } from "@/components/ui/Card";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card variant="elevated">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 sm:text-2xl">
        {value}
      </p>
      {hint && <CardDescription className="mt-1.5">{hint}</CardDescription>}
    </Card>
  );
}
