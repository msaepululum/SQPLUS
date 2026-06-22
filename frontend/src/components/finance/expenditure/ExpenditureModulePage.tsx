"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExpenditureJenisFilter } from "@/components/finance/expenditure/ExpenditureJenisFilter";
import { ExpenditurePengajuanCrud } from "@/components/finance/expenditure/ExpenditurePengajuanCrud";
import { ExpenditureAjuProgressDashboard } from "@/components/finance/expenditure/ExpenditureAjuProgressDashboard";
import { ExpenditureProgressBelanjaShortcut } from "@/components/finance/expenditure/ExpenditureProgressBelanjaShortcut";
import { ExpenditureSectionTabs } from "@/components/finance/expenditure/ExpenditureSectionTabs";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  BudgetYearToolbarFilter,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import type { ExpenditureModuleConfig } from "@/constants/expenditure-pages";
import type { ExpenditureProgressBelanjaContext } from "@/constants/expenditure-progress";
import {
  getExpenditureJenis,
  resolveExpenditureJenisId,
  type ExpenditureJenisId,
} from "@/constants/expenditure-categories";

const JENIS_FILTER_TABS = new Set(["per-jenis-belanja"]);

const YEAR_SCOPED_SLUGS = new Set(["proses-belanja", "analisis", "monitoring-riwayat"]);

const PROGRESS_SHORTCUT_CONTEXT: Record<string, ExpenditureProgressBelanjaContext> = {
  "proses-belanja": "proses-belanja",
  "monitoring-riwayat": "monitoring",
};

type ExpenditureModulePageProps = {
  config: ExpenditureModuleConfig;
  initialTab?: string;
  initialJenis?: string;
};

export function ExpenditureModulePage({
  config,
  initialTab,
  initialJenis,
}: ExpenditureModulePageProps) {
  const isYearScoped = YEAR_SCOPED_SLUGS.has(config.slug);

  const inner = (
    <ExpenditureModulePageInner
      config={config}
      initialTab={initialTab}
      initialJenis={initialJenis}
      isYearScoped={isYearScoped}
    />
  );

  if (!isYearScoped) {
    return inner;
  }

  return <BudgetYearScopeProvider>{inner}</BudgetYearScopeProvider>;
}

function ExpenditurePlaceholderSection({
  title,
  description,
  activeJenis,
  jenisLabel,
  showProgressShortcut,
  progressContext,
}: {
  title: string;
  description: string;
  activeJenis?: ExpenditureJenisId | "";
  jenisLabel?: string;
  showProgressShortcut?: boolean;
  progressContext?: ExpenditureProgressBelanjaContext;
}) {
  return (
    <div className="mt-3 space-y-3">
      {showProgressShortcut && progressContext && (
        <ExpenditureProgressBelanjaShortcut context={progressContext} />
      )}
      <Card variant="dashed" className="py-6 text-center sm:py-8">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
        {activeJenis && jenisLabel && (
          <p className="mt-3 text-xs text-slate-500">
            Filter jenis: <strong className="text-slate-700">{jenisLabel}</strong>
          </p>
        )}
        <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
      </Card>
    </div>
  );
}

function ExpenditureModulePageInner({
  config,
  initialTab,
  initialJenis,
  isYearScoped,
}: ExpenditureModulePageProps & { isYearScoped: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const jenisFromUrl = searchParams.get("jenis");
  const defaultTab =
    config.sections.find((s) => s.id === (initialTab ?? tabFromUrl))?.id ??
    config.sections[0]?.id ??
    "";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activeJenis, setActiveJenis] = useState<ExpenditureJenisId | "">(
    resolveExpenditureJenisId(initialJenis ?? jenisFromUrl)
  );

  useEffect(() => {
    const next =
      config.sections.find((s) => s.id === tabFromUrl)?.id ?? config.sections[0]?.id;
    if (next) setActiveTab(next);
  }, [tabFromUrl, config.sections]);

  useEffect(() => {
    if (jenisFromUrl) setActiveJenis(resolveExpenditureJenisId(jenisFromUrl));
  }, [jenisFromUrl]);

  const handleTabChange = useCallback(
    (id: string) => {
      setActiveTab(id);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleJenisChange = useCallback(
    (jenis: ExpenditureJenisId | "") => {
      setActiveJenis(jenis);
      const params = new URLSearchParams(searchParams.toString());
      if (jenis) {
        params.set("jenis", jenis);
      } else {
        params.delete("jenis");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const sectionLabels = Object.fromEntries(
    config.sections.map((section) => [section.labelKey, t(section.labelKey)])
  );

  const activeSection =
    config.sections.find((section) => section.id === activeTab) ?? config.sections[0];

  const showJenisFilter = activeSection ? JENIS_FILTER_TABS.has(activeSection.id) : false;
  const progressContext = PROGRESS_SHORTCUT_CONTEXT[config.slug];
  const showProgressShortcut = Boolean(
    progressContext &&
      activeSection &&
      activeSection.id !== "progres-belanja" &&
      (config.slug === "proses-belanja" || config.slug === "monitoring-riwayat")
  );

  const tabContent = activeSection ? (
    activeSection.id === "pengajuan" ? (
      <div className="mt-3 space-y-3">
        {showProgressShortcut && progressContext && (
          <ExpenditureProgressBelanjaShortcut context={progressContext} compact />
        )}
        <ExpenditurePengajuanCrud />
      </div>
    ) : activeSection.id === "progres-belanja" ? (
      <div className="mt-3">
        <ExpenditureAjuProgressDashboard />
      </div>
    ) : (
      <ExpenditurePlaceholderSection
        title={sectionLabels[activeSection.labelKey]}
        description={activeSection.description}
        activeJenis={activeJenis}
        jenisLabel={activeJenis ? t(getExpenditureJenis(activeJenis).labelKey) : undefined}
        showProgressShortcut={showProgressShortcut}
        progressContext={progressContext}
      />
    )
  ) : null;

  const tabsRow = (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <div className="min-w-0 flex-1">
        {config.sections.length > 1 && (
          <ExpenditureSectionTabs
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

  const analisisFilterRow =
    config.slug === "analisis" ? (
      <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-slate-200/80 bg-slate-50/40 px-2.5 py-2">
        <BudgetYearToolbarFilter />
        {showJenisFilter && (
          <ExpenditureJenisFilter value={activeJenis} onChange={handleJenisChange} />
        )}
      </div>
    ) : null;

  const jenisFilterRow =
    config.slug !== "analisis" && showJenisFilter ? (
      <div className="mt-2">
        <ExpenditureJenisFilter value={activeJenis} onChange={handleJenisChange} />
      </div>
    ) : null;

  return (
    <PageFrame title={config.title} description={config.subtitle}>
      {isYearScoped ? (
        <>
          {tabsRow}
          {analisisFilterRow}
          {jenisFilterRow}
          <BudgetYearScopedContent>{tabContent}</BudgetYearScopedContent>
        </>
      ) : (
        <>
          {config.sections.length > 1 && (
            <ExpenditureSectionTabs
              sections={config.sections}
              labels={sectionLabels}
              activeId={activeTab}
              onChange={handleTabChange}
            />
          )}
          {jenisFilterRow}
          {tabContent}
        </>
      )}
    </PageFrame>
  );
}
