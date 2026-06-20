"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RevenueCategoryFilter } from "@/components/finance/revenue/RevenueCategoryFilter";
import { RevenueCategoryList } from "@/components/finance/revenue/RevenueCategoryList";
import { RevenueSectionTabs } from "@/components/finance/revenue/RevenueSectionTabs";
import { RevenueSetupTargetCrud } from "@/components/finance/revenue/RevenueSetupTargetCrud";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import type { RevenueModuleConfig } from "@/constants/revenue-pages";
import {
  getRevenueCategory,
  resolveRevenueCategoryId,
  type RevenueCategoryId,
} from "@/constants/revenue-categories";

const CATEGORY_TABS = new Set([
  "input-rencana",
  "distribusi-bulanan",
  "input-manual",
  "rekap-harian",
  "rekap-bulanan",
  "per-kategori",
]);

const YEAR_SCOPED_SLUGS = new Set(["perencanaan-pendapatan"]);

type RevenueModulePageProps = {
  config: RevenueModuleConfig;
  initialTab?: string;
  initialCategory?: string;
};

export function RevenueModulePage({
  config,
  initialTab,
  initialCategory,
}: RevenueModulePageProps) {
  const isYearScoped = YEAR_SCOPED_SLUGS.has(config.slug);

  const inner = (
    <RevenueModulePageInner
      config={config}
      initialTab={initialTab}
      initialCategory={initialCategory}
      isYearScoped={isYearScoped}
    />
  );

  if (!isYearScoped) {
    return inner;
  }

  return (
    <BudgetYearScopeProvider>
      {inner}
    </BudgetYearScopeProvider>
  );
}

function RevenueModulePageInner({
  config,
  initialTab,
  initialCategory,
  isYearScoped,
}: RevenueModulePageProps & { isYearScoped: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const categoryFromUrl = searchParams.get("kategori");
  const defaultTab =
    config.sections.find((s) => s.id === (initialTab ?? tabFromUrl))?.id ??
    config.sections[0]?.id ??
    "";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activeCategory, setActiveCategory] = useState<RevenueCategoryId | "">(
    resolveRevenueCategoryId(initialCategory ?? categoryFromUrl)
  );

  useEffect(() => {
    const next =
      config.sections.find((s) => s.id === tabFromUrl)?.id ?? config.sections[0]?.id;
    if (next) setActiveTab(next);
  }, [tabFromUrl, config.sections]);

  useEffect(() => {
    if (categoryFromUrl) setActiveCategory(resolveRevenueCategoryId(categoryFromUrl));
  }, [categoryFromUrl]);

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

  const showCategoryFilter = activeSection ? CATEGORY_TABS.has(activeSection.id) : false;
  const showCategoryTable =
    activeSection &&
    ["input-rencana", "distribusi-bulanan", "per-kategori"].includes(activeSection.id);

  const tabContent =
    activeSection?.id === "setup-target" ? (
      <RevenueSetupTargetCrud />
    ) : activeSection ? (
      <div className="mt-3 space-y-3">
        <Card variant="dashed" className="py-6 text-center sm:py-8">
          <CardTitle className="text-base sm:text-lg">
            {sectionLabels[activeSection.labelKey]}
          </CardTitle>
          <CardDescription className="mt-2">{activeSection.description}</CardDescription>
          {activeCategory && (
            <p className="mt-3 text-xs text-slate-500">
              Filter kategori:{" "}
              <strong className="text-slate-700">
                {t(getRevenueCategory(activeCategory).labelKey)}
              </strong>
            </p>
          )}
          <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
        </Card>
        {showCategoryTable && (
          <RevenueCategoryList
            showValueColumns={
              activeSection.id === "input-rencana" ||
              activeSection.id === "distribusi-bulanan" ||
              activeSection.id === "per-kategori"
            }
          />
        )}
      </div>
    ) : null;

  const tabsRow = (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <div className="min-w-0 flex-1">
        {config.sections.length > 1 && (
          <RevenueSectionTabs
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

  const filtersRow = showCategoryFilter ? (
    <div className="mt-2">
      <RevenueCategoryFilter value={activeCategory} onChange={setActiveCategory} />
    </div>
  ) : null;

  return (
    <PageFrame title={config.title} description={config.subtitle}>
      {isYearScoped ? (
        <>
          {tabsRow}
          {filtersRow}
          <BudgetYearScopedContent>{tabContent}</BudgetYearScopedContent>
        </>
      ) : (
        <>
          {config.sections.length > 1 && (
            <RevenueSectionTabs
              sections={config.sections}
              labels={sectionLabels}
              activeId={activeTab}
              onChange={handleTabChange}
            />
          )}
          {filtersRow}
          {tabContent}
        </>
      )}
    </PageFrame>
  );
}
