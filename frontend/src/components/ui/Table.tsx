import { cn } from "@/lib/cn";

export function Table({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-sq-border bg-white dark:border-slate-800 dark:bg-slate-900 sq-scroll">
      <table className={cn("w-full min-w-[36rem] border-collapse text-xs", className)}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-sq-slate dark:bg-slate-800/60 dark:text-slate-400">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-sq-border dark:divide-slate-800">
      {children}
    </tbody>
  );
}

export function TR({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50", className)}>
      {children}
    </tr>
  );
}

export function TH({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <th className={cn("whitespace-nowrap px-4 py-2.5 font-semibold", className)}>
      {children}
    </th>
  );
}

export function TD({
  className,
  children,
  colSpan,
}: {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <td className={cn("px-4 py-2.5 text-sq-dark dark:text-slate-200", className)} colSpan={colSpan}>
      {children}
    </td>
  );
}
