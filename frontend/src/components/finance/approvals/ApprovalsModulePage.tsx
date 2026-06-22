"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ApprovalJenisFilter } from "@/components/finance/approvals/ApprovalJenisFilter";
import { ApprovalsSectionTabs } from "@/components/finance/approvals/ApprovalsSectionTabs";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  BudgetYearToolbarFilter,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import {
  getApprovalJenis,
  resolveApprovalJenisId,
  type ApprovalJenisId,
} from "@/constants/approval-categories";
import type { ApprovalsModuleConfig } from "@/constants/approvals-pages";

const YEAR_SCOPED_SLUGS = new Set(["anggaran", "transaksi", "riwayat-delegasi"]);

type ApprovalsModulePageProps = {
  config: ApprovalsModuleConfig;
  initialTab?: string;
  initialJenis?: string;
};

export function ApprovalsModulePage({
  config,
  initialTab,
  initialJenis,
}: ApprovalsModulePageProps) {
  const isYearScoped = YEAR_SCOPED_SLUGS.has(config.slug);

  const inner = (
    <ApprovalsModulePageInner
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

function ApprovalsModulePageInner({
  config,
  initialTab,
  initialJenis,
  isYearScoped,
}: ApprovalsModulePageProps & { isYearScoped: boolean }) {
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
  const [activeJenis, setActiveJenis] = useState<ApprovalJenisId | "">(
    resolveApprovalJenisId(initialJenis ?? jenisFromUrl)
  );

  useEffect(() => {
    const next =
      config.sections.find((s) => s.id === tabFromUrl)?.id ?? config.sections[0]?.id;
    if (next) setActiveTab(next);
  }, [tabFromUrl, config.sections]);

  useEffect(() => {
    if (jenisFromUrl) setActiveJenis(resolveApprovalJenisId(jenisFromUrl));
  }, [jenisFromUrl]);

  const syncUrl = useCallback(
    (patch: { tab?: string; jenis?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (patch.tab !== undefined) params.set("tab", patch.tab);
      if (patch.jenis !== undefined) {
        if (patch.jenis) params.set("jenis", patch.jenis);
        else params.delete("jenis");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleTabChange = useCallback(
    (id: string) => {
      setActiveTab(id);
      syncUrl({ tab: id });
    },
    [syncUrl]
  );

  const handleJenisChange = useCallback(
    (jenis: ApprovalJenisId | "") => {
      setActiveJenis(jenis);
      syncUrl({ jenis });
    },
    [syncUrl]
  );

  const sectionLabels = Object.fromEntries(
    config.sections.map((section) => [section.labelKey, t(section.labelKey)])
  );

  const activeSection =
    config.sections.find((section) => section.id === activeTab) ?? config.sections[0];

  const showJenisFilter = config.slug === "anggaran" || config.slug === "transaksi";

  const tabContent = activeSection ? (
    <div className="mt-3 space-y-3">
      <Card variant="dashed" className="py-6 text-center sm:py-8">
        <CardTitle className="text-base sm:text-lg">
          {sectionLabels[activeSection.labelKey]}
        </CardTitle>
        <CardDescription className="mt-2">{activeSection.description}</CardDescription>
        {activeJenis && (
          <p className="mt-3 text-xs text-slate-500">
            Filter jenis:{" "}
            <strong className="text-slate-700">{t(getApprovalJenis(activeJenis).labelKey)}</strong>
          </p>
        )}
        <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
      </Card>
    </div>
  ) : null;

  const tabsRow = (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <div className="min-w-0 flex-1">
        {config.sections.length > 1 && (
          <ApprovalsSectionTabs
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
      {showJenisFilter && (
        <ApprovalJenisFilter value={activeJenis} onChange={handleJenisChange} />
      )}
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
            <ApprovalsSectionTabs
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
