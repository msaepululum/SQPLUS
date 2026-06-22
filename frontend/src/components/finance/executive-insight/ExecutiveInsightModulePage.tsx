"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExecutiveInsightSectionContent } from "@/components/finance/executive-insight/ExecutiveInsightSectionContent";
import { ExecutiveInsightSectionTabs } from "@/components/finance/executive-insight/ExecutiveInsightSectionTabs";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  BudgetYearToolbarFilter,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import type { ExecutiveInsightModuleConfig } from "@/constants/executive-insight-pages";

const YEAR_SCOPED_SLUGS = new Set([
  "kinerja-keuangan",
  "anggaran-pagu",
  "hutang-likuiditas",
  "operasional-klinis",
]);

type ExecutiveInsightModulePageProps = {
  config: ExecutiveInsightModuleConfig;
  initialTab?: string;
};

export function ExecutiveInsightModulePage({
  config,
  initialTab,
}: ExecutiveInsightModulePageProps) {
  const isYearScoped = YEAR_SCOPED_SLUGS.has(config.slug);

  const inner = (
    <ExecutiveInsightModulePageInner
      config={config}
      initialTab={initialTab}
      isYearScoped={isYearScoped}
    />
  );

  if (!isYearScoped) {
    return inner;
  }

  return <BudgetYearScopeProvider>{inner}</BudgetYearScopeProvider>;
}

function ExecutiveInsightModulePageInner({
  config,
  initialTab,
  isYearScoped,
}: ExecutiveInsightModulePageProps & { isYearScoped: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const defaultTab =
    config.sections.find((s) => s.id === (initialTab ?? tabFromUrl))?.id ??
    config.sections[0]?.id ??
    "";

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const next =
      config.sections.find((s) => s.id === tabFromUrl)?.id ?? config.sections[0]?.id;
    if (next) setActiveTab(next);
  }, [tabFromUrl, config.sections]);

  const handleTabChange = useCallback(
    (id: string) => {
      setActiveTab(id);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const sectionLabels = Object.fromEntries(
    config.sections.map((section) => [section.labelKey, t(section.labelKey)])
  );

  const activeSection =
    config.sections.find((section) => section.id === activeTab) ?? config.sections[0];

  const tabContent = activeSection ? (
    <div className="mt-3">
      <ExecutiveInsightSectionContent sectionId={activeSection.id} />
    </div>
  ) : null;

  const tabsRow = (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <div className="min-w-0 flex-1">
        {config.sections.length > 1 && (
          <ExecutiveInsightSectionTabs
            sections={config.sections}
            labels={sectionLabels}
            activeId={activeTab}
            onChange={handleTabChange}
          />
        )}
      </div>
      {isYearScoped && <BudgetYearScopeBar compact className="lg:mb-0.5" />}
    </div>
  );

  const filterRow = isYearScoped ? (
    <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-slate-200/80 bg-slate-50/40 px-2.5 py-2">
      <BudgetYearToolbarFilter />
    </div>
  ) : null;

  return (
    <PageFrame title={config.title} description={config.subtitle}>
      {isYearScoped ? (
        <>
          {tabsRow}
          {filterRow}
          <BudgetYearScopedContent>{tabContent}</BudgetYearScopedContent>
        </>
      ) : (
        <>
          {config.sections.length > 1 && (
            <ExecutiveInsightSectionTabs
              sections={config.sections}
              labels={sectionLabels}
              activeId={activeTab}
              onChange={handleTabChange}
            />
          )}
          {tabContent}
        </>
      )}
    </PageFrame>
  );
}
