type FinanceTopBarProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function FinanceTopBar({ title, subtitle, actions }: FinanceTopBarProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate-500">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
