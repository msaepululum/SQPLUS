import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-3 space-y-1", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-sq-dark dark:text-slate-100 sm:text-xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-sq-slate">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
