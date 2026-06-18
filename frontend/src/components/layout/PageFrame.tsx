"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import type { Crumb } from "@/components/layout/Breadcrumbs";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { buildPageBreadcrumbs } from "@/lib/page-breadcrumbs";
import { usePathname } from "next/navigation";

type PageFrameProps = {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageFrame({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className,
}: PageFrameProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const crumbs = breadcrumbs ?? buildPageBreadcrumbs(pathname, t);

  return (
    <div className={className}>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={crumbs}
        actions={actions}
      />
      {children}
    </div>
  );
}
